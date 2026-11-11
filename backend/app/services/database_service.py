import logging
from datetime import datetime, timezone

from app.core.supabase_client import supabase_client

logger = logging.getLogger(__name__)

TABLE_NAME = "produced_tracks"


async def save_track_metadata(
    track_id: str,
    prompt: str,
    raw_audio_url: str,
    full_track_url: str,
    vocals_url: str,
    instrumental_url: str,
) -> dict:
    """
    Insert track metadata into the ``produced_tracks`` Supabase table.

    Args:
        track_id:         UUID string that uniquely identifies this track.
        prompt:           The user-supplied text prompt used to generate the track.
        raw_audio_url:    URL of the original uploaded audio in Supabase Storage.
        full_track_url:   URL of the AI-generated full track (Suno output).
        vocals_url:       URL of the voice-converted vocals stem.
        instrumental_url: URL of the non-vocals instrumental stem.

    Returns:
        The inserted row as a dict (as returned by Supabase).

    Raises:
        Exception: Propagates any error raised by the Supabase client.
    """
    record = {
        "id": track_id,
        "prompt": prompt,
        "raw_audio_url": raw_audio_url,
        "full_track_url": full_track_url,
        "vocals_url": vocals_url,
        "instrumental_url": instrumental_url,
        "created_at": datetime.now(tz=timezone.utc).isoformat(),
    }

    logger.info("Saving track metadata to Supabase. track_id=%s", track_id)

    if not supabase_client:
        logger.warning("Supabase client is not available. Skipping DB persistence.")
        return record

    response = supabase_client.table(TABLE_NAME).insert(record).execute()


    inserted = response.data[0] if response.data else record
    logger.info("Track metadata saved successfully. track_id=%s", track_id)
    return inserted
