import logging
import os
from typing import Optional

import httpx
from fastapi import HTTPException

from app.core.config import settings

logger = logging.getLogger(__name__)

DEFAULT_SUNO_ENDPOINT = "https://api.sunoapi.org/api/v1/generate"
SUNO_MODEL_VERSION = "chirp-v3-5"


def get_clean_suno_api_key(explicit_key: Optional[str] = None) -> str:
    """
    Securely extracts and sanitizes the Suno API key from the environment
    or configuration, ensuring that:
    - Any leading/trailing spaces or tabs are stripped.
    - Surrounding single or double quotes are stripped.
    - Any accidental 'Bearer ' prefix in the environment variable is stripped
      so the header will always be formatted strictly as 'Bearer <KEY>'.
    """
    raw_key = (
        explicit_key
        or os.environ.get("SUNO_API_KEY")
        or getattr(settings, "SUNO_API_KEY", "")
    )
    if not raw_key:
        return ""

    clean_key = str(raw_key).strip().strip("'\"")
    if clean_key.lower().startswith("bearer "):
        clean_key = clean_key[7:].strip()
    return clean_key


def get_suno_api_endpoint() -> str:
    """
    Resolves the Suno API endpoint from the environment or settings,
    defaulting to the standard Suno API endpoint.
    """
    endpoint = (
        os.environ.get("SUNO_API_ENDPOINT")
        or getattr(settings, "SUNO_API_ENDPOINT", "")
        or DEFAULT_SUNO_ENDPOINT
    )
    return str(endpoint).strip().strip("'\"")


async def generate_melody(
    audio_url: str,
    prompt: str,
    api_key: Optional[str] = None,
    lyrics: Optional[str] = None,
    bpm: Optional[int] = None,
    musical_key: Optional[str] = None,
    mastered: bool = True,
) -> str:
    """
    Calls the Suno API to generate a fully orchestrated musical track
    conditioned on input audio reference and the user's musical style prompt.

    Headers are strictly formatted as:
      Authorization: Bearer <YOUR_SUNO_API_KEY>
      Content-Type: application/json
    """
    # 1. Pull and sanitize the SUNO_API_KEY securely from environment / settings
    clean_key = get_clean_suno_api_key(api_key)

    if not clean_key:
        logger.error("Suno API Key is missing from both parameters and environment variables.")
        raise HTTPException(
            status_code=500,
            detail="Suno API Error: SUNO_API_KEY is not configured in backend environment or .env file.",
        )

    endpoint = get_suno_api_endpoint()
    user_style_prompt = prompt.strip() if prompt else "Modern Arabic Pop"

    # 2. Format headers strictly as required by Suno API wrappers
    headers = {
        "Authorization": f"Bearer {clean_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    payload = {
        "prompt": user_style_prompt,
        "mv": SUNO_MODEL_VERSION,
        "input_audio": audio_url,
        "make_instrumental": False if lyrics else True,
        "lyrics": lyrics or "",
    }

    # Safe log masking (never log full secret key)
    masked_key = f"{clean_key[:6]}...{clean_key[-4:]}" if len(clean_key) > 10 else "***"
    logger.info(
        "Dispatching Suno API request to '%s' with Authorization: Bearer %s (prompt: '%s')",
        endpoint,
        masked_key,
        user_style_prompt,
    )

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(endpoint, headers=headers, json=payload)
    except httpx.TimeoutException:
        logger.error("Suno API timed out after 120 seconds.")
        raise HTTPException(
            status_code=500,
            detail="Suno API Error: Request timed out after 120 seconds.",
        )
    except Exception as exc:
        logger.error("Suno API connection error: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=f"Suno API Error (Connection): {str(exc)}",
        )

    # 3. Handle HTTP level errors
    if response.status_code != 200:
        logger.error("Suno API returned HTTP %d: %s", response.status_code, response.text)
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

    # 4. Check for payload-level error codes (e.g. {"code": 401, "msg": "Unauthorized"})
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
