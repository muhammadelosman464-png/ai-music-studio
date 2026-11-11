import asyncio
import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.config import settings
from app.models.schemas import ProduceResponse
from app.services import (
    database_service,
    replicate_service,
    storage_service,
    suno_service,
)

logger = logging.getLogger(__name__)

router = APIRouter()

RAW_AUDIO_BUCKET = "studio-raw-audio"
MASTER_TRACKS_BUCKET = "studio-master-tracks"


@router.post("/produce", response_model=ProduceResponse)
async def produce_track(
    audio: UploadFile = File(..., description="Raw audio file uploaded by the user (mp3/wav/etc.)"),
    prompt: str = Form(..., description="Text prompt describing the desired style/mood of the track"),
) -> ProduceResponse:
    """
    Full AI music production pipeline:

    1. Upload raw audio to Supabase Storage.
    2. Concurrently:
       a. Generate a melody via the Suno API (conditioned on the raw audio).
       b. Apply RVC voice conversion to the raw audio via Replicate.
    3. Separate the generated song into stems (vocals / drums / bass / other)
       using Meta HTDemucs on Replicate.
    4. Upload the transformed vocal track to Supabase Storage.
    5. Persist all metadata to the ``produced_tracks`` Supabase table.
    6. Return a ``ProduceResponse`` with all asset URLs.
    """
    track_id = str(uuid.uuid4())
    logger.info("=== Starting production pipeline. track_id=%s ===", track_id)

    # ------------------------------------------------------------------
    # Step 1 — Read uploaded bytes and store raw audio
    # ------------------------------------------------------------------
    try:
        audio_bytes = await audio.read()
        content_type = audio.content_type or "audio/mpeg"
        raw_path = f"raw/{track_id}/{audio.filename or 'upload.mp3'}"

        logger.info("Step 1: Uploading raw audio (%d bytes) to bucket '%s'.", len(audio_bytes), RAW_AUDIO_BUCKET)
        raw_audio_url = await storage_service.upload_audio(
            bucket=RAW_AUDIO_BUCKET,
            path=raw_path,
            data=audio_bytes,
            content_type=content_type,
        )
        logger.info("Step 1 complete. raw_audio_url=%s", raw_audio_url)
    except Exception as exc:
        logger.exception("Pipeline failed at Step 1 (raw audio upload).")
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline failed at step 1 (raw audio upload): {exc}",
        )

    # ------------------------------------------------------------------
    # Step 2 — Concurrent: melody generation + voice conversion
    # ------------------------------------------------------------------
    try:
        logger.info(
            "Step 2: Running Suno melody generation and RVC voice conversion concurrently."
        )
        generated_song_url, transformed_voice_url = await asyncio.gather(
            suno_service.generate_melody(raw_audio_url, prompt, settings.SUNO_API_KEY),
            replicate_service.transform_voice_rvc(raw_audio_url, settings.REPLICATE_API_TOKEN),
        )
        logger.info(
            "Step 2 complete. generated_song_url=%s | transformed_voice_url=%s",
            generated_song_url,
            transformed_voice_url,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Pipeline failed at Step 2 (melody generation / voice conversion).")
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline failed at step 2 (melody generation / voice conversion): {exc}",
        )

    # ------------------------------------------------------------------
    # Step 3 — Stem separation on the generated song
    # ------------------------------------------------------------------
    try:
        logger.info("Step 3: Separating stems from generated song via HTDemucs.")
        stems: dict = await replicate_service.separate_stems_htdemucs(
            generated_song_url, settings.REPLICATE_API_TOKEN
        )
        logger.info("Step 3 complete. Stems received: %s", list(stems.keys()))
    except Exception as exc:
        logger.exception("Pipeline failed at Step 3 (stem separation).")
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline failed at step 3 (stem separation): {exc}",
        )

    # ------------------------------------------------------------------
    # Step 4 — Derive final asset URLs from stems
    # ------------------------------------------------------------------
    # Use the demucs "other" stem as the instrumental proxy (contains melody
    # instruments without vocals).  If not present, fall back to the full
    # generated song.  Use the RVC-converted audio as the final vocals track.
    instrumental_url: str = stems.get("other", generated_song_url)
    final_vocals_url: str = stems.get("vocals", transformed_voice_url)

    # ------------------------------------------------------------------
    # Step 5 — Upload the transformed voice to Supabase Storage
    # ------------------------------------------------------------------
    try:
        logger.info("Step 5: Uploading transformed voice track to Supabase Storage.")

        # Fetch the transformed voice bytes so we can store our own copy.
        import httpx as _httpx  # local import to avoid circular issues

        async with _httpx.AsyncClient(timeout=120.0) as client:
            voice_response = await client.get(transformed_voice_url)
            voice_response.raise_for_status()
            voice_bytes = voice_response.content

        voice_path = f"vocals/{track_id}/vocals.mp3"
        stored_vocals_url = await storage_service.upload_audio(
            bucket=MASTER_TRACKS_BUCKET,
            path=voice_path,
            data=voice_bytes,
            content_type="audio/mpeg",
        )
        # Prefer our stored copy; fall back to external Replicate URL.
        final_vocals_url = stored_vocals_url or final_vocals_url
        logger.info("Step 5 complete. stored_vocals_url=%s", final_vocals_url)
    except Exception as exc:
        # Non-fatal: log warning and continue with the Replicate URL.
        logger.warning(
            "Step 5 (vocal upload to Supabase) failed (%s). "
            "Falling back to Replicate-hosted URL.",
            exc,
        )

    # ------------------------------------------------------------------
    # Step 6 — Persist metadata to Supabase DB
    # ------------------------------------------------------------------
    try:
        logger.info("Step 6: Saving track metadata to database. track_id=%s", track_id)
        await database_service.save_track_metadata(
            track_id=track_id,
            prompt=prompt,
            raw_audio_url=raw_audio_url,
            full_track_url=generated_song_url,
            vocals_url=final_vocals_url,
            instrumental_url=instrumental_url,
        )
        logger.info("Step 6 complete. Metadata persisted.")
    except Exception as exc:
        logger.exception("Pipeline failed at Step 6 (database save).")
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline failed at step 6 (database save): {exc}",
        )

    # ------------------------------------------------------------------
    # Step 7 — Return response
    # ------------------------------------------------------------------
    created_at = datetime.now(tz=timezone.utc).isoformat()
    logger.info("=== Production pipeline complete. track_id=%s ===", track_id)

    return ProduceResponse(
        track_id=track_id,
        full_track_url=generated_song_url,
        vocals_url=final_vocals_url,
        instrumental_url=instrumental_url,
        prompt=prompt,
        created_at=created_at,
    )
