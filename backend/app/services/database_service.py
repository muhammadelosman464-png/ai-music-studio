import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

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
    lyrics: Optional[str] = None,
    price_tag: Optional[str] = None,
    bpm: Optional[int] = None,
    musical_key: Optional[str] = None,
    drums_url: Optional[str] = None,
    bass_url: Optional[str] = None,
) -> dict:
    """
    Insert track metadata into the ``produced_tracks`` Supabase table.
    """
    record: Dict[str, Any] = {
        "id": track_id,
        "prompt": prompt,
        "raw_audio_url": raw_audio_url,
        "full_track_url": full_track_url,
        "vocals_url": vocals_url,
        "instrumental_url": instrumental_url,
        "created_at": datetime.now(tz=timezone.utc).isoformat(),
    }

    # Add optional V2 fields if present
    if lyrics:
        record["lyrics"] = lyrics
    if price_tag:
        record["price_tag"] = price_tag
    if bpm is not None:
        record["bpm"] = bpm
    if musical_key:
        record["musical_key"] = musical_key
    if drums_url:
        record["drums_url"] = drums_url
    if bass_url:
        record["bass_url"] = bass_url

    logger.info("Saving track metadata to Supabase. track_id=%s", track_id)

    if not supabase_client:
        logger.warning("Supabase client is not available. Skipping DB persistence.")
        return record

    try:
        response = supabase_client.table(TABLE_NAME).insert(record).execute()
        inserted = response.data[0] if response.data else record
        logger.info("Track metadata saved successfully. track_id=%s", track_id)
        return inserted
    except Exception as exc:
        # If new columns don't exist yet in user's DB schema, fallback to base columns
        logger.warning("Insert with V2 columns failed (%s). Retrying with base columns.", exc)
        base_record = {
            "id": track_id,
            "prompt": prompt,
            "raw_audio_url": raw_audio_url,
            "full_track_url": full_track_url,
            "vocals_url": vocals_url,
            "instrumental_url": instrumental_url,
            "created_at": record["created_at"],
        }
        try:
            fallback_res = supabase_client.table(TABLE_NAME).insert(base_record).execute()
            return fallback_res.data[0] if fallback_res.data else base_record
        except Exception as e2:
            logger.error("Base record insert failed: %s", e2)
            return base_record


async def get_recent_tracks(limit: int = 20) -> List[dict]:
    """
    Fetch the most recently produced tracks for the Cloud Studio Library.
    """
    if not supabase_client:
        logger.warning("Supabase client not available for get_recent_tracks.")
        return []

    try:
        response = (
            supabase_client.table(TABLE_NAME)
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return response.data or []
    except Exception as exc:
        logger.error("Failed to query recent tracks from Supabase: %s", exc)
        return []
