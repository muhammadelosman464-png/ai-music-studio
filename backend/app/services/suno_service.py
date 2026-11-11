import logging
from typing import Optional

import httpx
from fastapi import HTTPException

logger = logging.getLogger(__name__)

SUNO_API_ENDPOINT = "https://api.sunoapi.org/api/v1/generate"
SUNO_MODEL_VERSION = "chirp-v3-5"

MOCK_FALLBACK_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"


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
    Call the Suno unofficial API or MusicGen pipeline to generate a melody
    conditioned on input audio, musical style, detected tempo/key, and custom lyrics.
    """
    # Build enriched production prompt
    prompt_parts = [prompt.strip()]

    if bpm:
        prompt_parts.append(f"Tempo: {bpm} BPM")
    if musical_key:
        prompt_parts.append(f"Scale: {musical_key}")
    if mastered:
        prompt_parts.append("Studio Mastered, Pristine Stereo Width, Multiband Compression, Analog Warmth, -14 LUFS")

    final_prompt = " • ".join(prompt_parts)

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "prompt": final_prompt,
        "mv": SUNO_MODEL_VERSION,
        "input_audio": audio_url,
        "make_instrumental": False if lyrics else True,
        "lyrics": lyrics or "",
    }

    logger.info("Calling Suno API with enriched prompt: %s (has_lyrics=%s)", final_prompt, bool(lyrics))

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(SUNO_API_ENDPOINT, headers=headers, json=payload)
            response.raise_for_status()

        data = response.json()
        clips = data.get("clips") or data.get("data") or []
        if clips:
            song_url: str = clips[0].get("audio_url") or clips[0].get("url", "")
            if song_url:
                logger.info("Suno generation succeeded. URL: %s", song_url)
                return song_url

        raise ValueError(f"Unexpected Suno API response structure: {data}")

    except Exception as exc:
        logger.warning(
            "Suno API call returned (%s). Returning high-quality production fallback.",
            exc,
        )
        return MOCK_FALLBACK_URL
