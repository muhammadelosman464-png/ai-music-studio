import asyncio
import logging
import os
from typing import Dict, Any

from fastapi import HTTPException
import replicate

logger = logging.getLogger(__name__)


async def transform_voice_rvc(
    audio_url: str,
    api_token: str,
    rvc_model: str = "Squidward",
    pitch_change: str = "no-change",
) -> str:
    """
    Transform raw vocals using an RVC (Retrieval-based Voice Conversion) model
    hosted on Replicate.
    Raises HTTPException(500) if Replicate fails or token is invalid.
    """
    if not api_token:
        raise HTTPException(
            status_code=500,
            detail="Replicate API Error: REPLICATE_API_TOKEN is not configured in backend/.env",
        )

    os.environ["REPLICATE_API_TOKEN"] = api_token

    logger.info("Starting RVC voice transformation for audio: %s (model=%s, pitch=%s)", audio_url, rvc_model, pitch_change)

    loop = asyncio.get_event_loop()
    try:
        output = await loop.run_in_executor(
            None,
            lambda: replicate.run(
                "zsxkib/realistic-voice-cloning:0a9c7c558af4c0f20667c1bd1260ce32a2879944a0b9e44e1398660c077b1550",
                input={
                    "protect": 0.33,
                    "rvc_model": rvc_model or "Squidward",
                    "index_rate": 0.75,
                    "input_audio": audio_url,
                    "pitch_change": pitch_change or "no-change",
                    "rms_mix_rate": 0.25,
                    "filter_radius": 3,
                    "output_format": "mp3",
                    "reverb_room_size": 0.15,
                    "reverb_wet_level": 0.1,
                    "reverb_dry_level": 0.9,
                    "crepe_hop_length": 128,
                    "pitch_change_all": 0,
                    "reverb_damp_level": 0.7,
                    "reverb_freeze_mode": 0,
                    "pitch_detection_algorithm": "rmvpe",
                },
            ),
        )
        result_url: str = output[0] if isinstance(output, list) else str(output)
        logger.info("RVC voice transformation complete. Output URL: %s", result_url)
        return result_url
    except Exception as exc:
        logger.error("Replicate RVC call failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=f"Replicate API Error (Voice Transformation): {str(exc)}",
        )


async def separate_stems_htdemucs(audio_url: str, api_token: str) -> dict:
    """
    Separate an audio track into 4 individual stems using Meta's HTDemucs model
    on Replicate.
    Raises HTTPException(500) if Replicate fails or token is invalid.
    """
    if not api_token:
        raise HTTPException(
            status_code=500,
            detail="Replicate API Error: REPLICATE_API_TOKEN is not configured in backend/.env",
        )

    os.environ["REPLICATE_API_TOKEN"] = api_token

    logger.info("Starting HTDemucs stem separation for audio: %s", audio_url)

    loop = asyncio.get_event_loop()
    try:
        output = await loop.run_in_executor(
            None,
            lambda: replicate.run(
                "cjwbw/demucs:25a173108cff36ef9f80f854c162d01df9e6528be175794b81158fa03836d953",
                input={
                    "audio": audio_url,
                    "model": "htdemucs",
                    "stem": None,
                    "clip_mode": "rescale",
                    "shifts": 1,
                    "overlap": 0.25,
                    "mp3": True,
                    "mp3_bitrate": 320,
                    "float32": False,
                    "output_format": "mp3",
                },
            ),
        )
        if isinstance(output, dict):
            logger.info("HTDemucs stem separation complete. Stems: %s", list(output.keys()))
            return output
        raise ValueError(f"Unexpected Replicate output format: {output}")
    except Exception as exc:
        logger.error("Replicate Demucs call failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=f"Replicate API Error (Stem Separation): {str(exc)}",
        )
