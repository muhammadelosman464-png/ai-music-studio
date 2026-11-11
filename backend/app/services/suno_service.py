import logging

import httpx
from fastapi import HTTPException

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# MOCK NOTICE
# ---------------------------------------------------------------------------
# Suno does not currently publish an official public REST API.
# The endpoint used below ( https://api.sunoapi.org/api/v1/generate ) is a
# known community-maintained proxy.  When an official API becomes available,
# replace SUNO_API_ENDPOINT, SUNO_MODEL_VERSION, and the request payload
# structure accordingly.
# ---------------------------------------------------------------------------

SUNO_API_ENDPOINT = "https://api.sunoapi.org/api/v1/generate"
SUNO_MODEL_VERSION = "chirp-v3-5"

# Fallback audio served when the real Suno call cannot be completed.
# This keeps the rest of the pipeline functional during development /
# when no valid API key is available.
MOCK_FALLBACK_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"


async def generate_melody(audio_url: str, prompt: str, api_key: str) -> str:
    """
    Call the Suno unofficial API to generate a melody conditioned on input audio.

    NOTE: Suno does not have an official public API.  This function is a clean
    mock that simulates the expected API contract.  Replace the endpoint URL and
    payload structure when an official API becomes available.

    Args:
        audio_url: Publicly accessible URL of the raw uploaded audio that Suno
                   should use as a conditioning reference.
        prompt:    Text description that guides the style/mood of the generated
                   melody (e.g. "upbeat hip-hop with piano chords").
        api_key:   Suno API key (from SUNO_API_KEY in .env).

    Returns:
        URL of the generated audio file returned by the Suno API.
        Falls back to MOCK_FALLBACK_URL if the real request fails, so the
        pipeline can continue in development without a valid key.

    Raises:
        HTTPException(502): Only raised when BOTH the real call AND the fallback
                            logic fail unexpectedly.
    """
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "prompt": prompt,
        "mv": SUNO_MODEL_VERSION,
        "input_audio": audio_url,
        "make_instrumental": False,
    }

    logger.info("Calling Suno API at %s with model %s", SUNO_API_ENDPOINT, SUNO_MODEL_VERSION)

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(SUNO_API_ENDPOINT, headers=headers, json=payload)
            response.raise_for_status()

        data = response.json()

        # The community API typically returns a list of clips; take the first URL.
        clips = data.get("clips") or data.get("data") or []
        if clips:
            song_url: str = clips[0].get("audio_url") or clips[0].get("url", "")
            if song_url:
                logger.info("Suno generation succeeded. URL: %s", song_url)
                return song_url

        # Response parsed but no URL found — treat as a soft failure.
        raise ValueError(f"Unexpected Suno API response structure: {data}")

    except Exception as exc:
        # ------------------------------------------------------------------ #
        # MOCK FALLBACK                                                        #
        # Because Suno has no official API, real calls are expected to fail   #
        # during development.  We log a warning and return a static sample    #
        # so the rest of the pipeline (stem separation, storage, DB) can be   #
        # exercised end-to-end without a valid Suno key.                      #
        #                                                                      #
        # Remove this fallback block and un-comment the HTTPException below   #
        # once a stable official API endpoint is available.                   #
        # ------------------------------------------------------------------ #
        logger.warning(
            "Suno API call failed (%s). Returning mock fallback URL for development. "
            "Replace this behaviour when an official Suno API is available.",
            exc,
        )
        return MOCK_FALLBACK_URL

        # --- Production path (uncomment when real API is stable) ---
        # raise HTTPException(
        #     status_code=502,
        #     detail=f"Suno melody generation failed: {exc}",
        # )
