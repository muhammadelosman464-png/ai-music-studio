import logging
from typing import Optional

import httpx
from fastapi import HTTPException

logger = logging.getLogger(__name__)

SUNO_API_ENDPOINT = "https://api.sunoapi.org/api/v1/generate"
SUNO_MODEL_VERSION = "chirp-v3-5"


async def generate_melody(
    audio_url: str,
    prompt: str,
    api_key: str,
    lyrics: Optional[str] = None,
    bpm: Optional[int] = None,
    musical_key: Optional[str] = None,
    mastered: bool = True,
) -> str:
    """
    Call the Suno generation API passing the user's exact musical style prompt,
    input audio reference, and optional lyrics.
    Raises HTTPException(500) if the API fails, never returning fake fallback audio.
    """
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Suno API Error: SUNO_API_KEY is not configured in backend/.env",
        )

    # Ensure user's exact style prompt is passed directly without being overwritten or ignored
    user_style_prompt = prompt.strip() if prompt else "Modern Arabic Pop"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "prompt": user_style_prompt,
        "mv": SUNO_MODEL_VERSION,
        "input_audio": audio_url,
        "make_instrumental": False if lyrics else True,
        "lyrics": lyrics or "",
    }

    logger.info("Calling Suno API with user style prompt: '%s' (input_audio=%s)", user_style_prompt, audio_url)

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(SUNO_API_ENDPOINT, headers=headers, json=payload)
    except httpx.TimeoutException:
        logger.error("Suno API timed out after 120 seconds.")
        raise HTTPException(
            status_code=500,
            detail="Suno API Error: Generation timed out after 120 seconds.",
        )
    except Exception as exc:
        logger.error("Suno API network request failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=f"Suno API Error (Connection): {str(exc)}",
        )

    # Check HTTP status
    if response.status_code != 200:
        logger.error("Suno API responded with HTTP %d: %s", response.status_code, response.text)
        raise HTTPException(
            status_code=500,
            detail=f"Suno API Error (HTTP {response.status_code}): {response.text}",
        )

    try:
        data = response.json()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Suno API Error: Invalid non-JSON response from server: {response.text[:200]}",
        )

    # Check for provider-level error codes inside JSON payload (e.g. {"code": 401, "msg": "Unauthorized"})
    if isinstance(data, dict):
        code = data.get("code")
        if code and code != 200:
            error_msg = data.get("msg") or data.get("message") or str(data)
            logger.error("Suno API returned error payload: %s", data)
            raise HTTPException(
                status_code=500,
                detail=f"Suno API Error ({code}): {error_msg}",
            )

        clips = data.get("clips") or data.get("data") or []
        if isinstance(clips, list) and clips:
            song_url: str = clips[0].get("audio_url") or clips[0].get("url") or ""
            if song_url:
                logger.info("Suno generation succeeded. Audio URL: %s", song_url)
                return song_url

    raise HTTPException(
        status_code=500,
        detail=f"Suno API Error: No audio clips returned in response: {data}",
    )
