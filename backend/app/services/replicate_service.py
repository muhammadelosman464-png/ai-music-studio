import asyncio
import logging
import os

import replicate

logger = logging.getLogger(__name__)


async def transform_voice_rvc(audio_url: str, api_token: str) -> str:
    """
    Transform raw vocals using an RVC (Retrieval-based Voice Conversion) model
    hosted on Replicate.

    The model applies voice conversion so the uploaded audio takes on the
    tonal characteristics of the target voice (default: "Squidward" for demo
    purposes — swap ``rvc_model`` for a production voice as needed).

    Args:
        audio_url: Publicly accessible URL of the audio whose voice should be
                   converted.
        api_token: Replicate API token (from REPLICATE_API_TOKEN in .env).

    Returns:
        URL (str) of the voice-converted MP3 file on Replicate's CDN.

    Raises:
        Exception: Propagates any error raised by the Replicate client.
    """
    os.environ["REPLICATE_API_TOKEN"] = api_token

    logger.info("Starting RVC voice transformation for audio: %s", audio_url)

    # replicate.run is synchronous; run it in a thread-pool to avoid blocking
    # the event loop.
    loop = asyncio.get_event_loop()
    output = await loop.run_in_executor(
        None,
        lambda: replicate.run(
            "zsxkib/realistic-voice-cloning:0a9c7c558af4c0f20667c1bd1260ce32a2879944a0b9e44e1398660c077b1550",
            input={
                "protect": 0.33,
                "rvc_model": "Squidward",
                "index_rate": 0.75,
                "input_audio": audio_url,
                "pitch_change": "no-change",
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

    # Replicate may return a list of output URLs or a single URL string.
    result_url: str = output[0] if isinstance(output, list) else str(output)
    logger.info("RVC voice transformation complete. Output URL: %s", result_url)
    return result_url


async def separate_stems_htdemucs(audio_url: str, api_token: str) -> dict:
    """
    Separate an audio track into individual stems using Meta's HTDemucs model
    on Replicate.

    Stems produced: vocals, drums, bass, other.

    Args:
        audio_url: Publicly accessible URL of the audio to separate.
        api_token: Replicate API token (from REPLICATE_API_TOKEN in .env).

    Returns:
        dict mapping stem names to their CDN URLs, e.g.:
        ``{"vocals": "...", "drums": "...", "bass": "...", "other": "..."}``.

    Raises:
        Exception: Propagates any error raised by the Replicate client.
    """
    os.environ["REPLICATE_API_TOKEN"] = api_token

    logger.info("Starting HTDemucs stem separation for audio: %s", audio_url)

    loop = asyncio.get_event_loop()
    output = await loop.run_in_executor(
        None,
        lambda: replicate.run(
            "cjwbw/demucs:25a173108cff36ef9f80f854c162d01df9e6528be175794b81158fa03836d953",
            input={
                "audio": audio_url,
                "model": "htdemucs",
                "stem": None,       # separate all stems
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

    # output is a dict: {"vocals": url, "drums": url, "bass": url, "other": url}
    logger.info("HTDemucs stem separation complete. Stems: %s", list(output.keys()))
    return output
