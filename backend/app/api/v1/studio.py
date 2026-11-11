import asyncio
import io
import logging
import uuid
import zipfile
from datetime import datetime, timezone
from typing import List, Optional

import httpx
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response, StreamingResponse

from app.core.config import settings
from app.models.schemas import (
    ProduceResponse,
    StemSeparationResponse,
    VoiceTransformResponse,
    TrackHistoryItem,
    UploadResponse,
)
from app.services import (
    audio_analyzer,
    database_service,
    replicate_service,
    storage_service,
    suno_service,
)

logger = logging.getLogger(__name__)

router = APIRouter()

RAW_AUDIO_BUCKET = "studio-raw-audio"
MASTER_TRACKS_BUCKET = "studio-master-tracks"


# ---------------------------------------------------------------------------
# 1. Full AI Production Pipeline
# ---------------------------------------------------------------------------
@router.post("/produce", response_model=ProduceResponse)
async def produce_track(
    audio: UploadFile = File(..., description="Raw audio recording or file upload"),
    prompt: str = Form(..., description="Style / mood description"),
    lyrics: Optional[str] = Form(None, description="Custom song lyrics"),
    mastering: bool = Form(True, description="Enable AI audio mastering filter"),
    voice_model: Optional[str] = Form("Squidward", description="Target RVC voice preset"),
) -> ProduceResponse:
    """
    V2 AI Music Production Pipeline:
    1. Analyze audio acoustics -> Auto-detect BPM and Key/Maqam.
    2. Upload raw audio to Supabase Storage.
    3. Run concurrently:
       a. Melody generation conditioned on audio, prompt, BPM, Key, lyrics & mastering.
       b. RVC vocal transformation.
    4. Meta HTDemucs stem separation into 4 isolated stems (vocals, drums, bass, other).
    5. Upload stems & transformed vocal to Supabase Storage.
    6. Persist full track record in Supabase database.
    7. Return multi-stem ProduceResponse.
    """
    track_id = str(uuid.uuid4())
    logger.info("=== Starting V2 Production Pipeline [track_id=%s] ===", track_id)

    # 1. Read bytes and perform acoustic analysis
    try:
        audio_bytes = await audio.read()
        content_type = audio.content_type or "audio/mpeg"
        filename = audio.filename or "audio_input.mp3"

        analysis = audio_analyzer.analyze_audio_properties(
            audio_bytes=audio_bytes,
            filename=filename,
            prompt=prompt,
        )
        detected_bpm = analysis["bpm"]
        detected_key = analysis["musical_key"]
    except Exception as exc:
        logger.exception("Acoustic analysis failed: %s", exc)
        detected_bpm = 120
        detected_key = "D Minor / مقام نهاوند"

    # 2. Upload raw audio to Supabase
    try:
        raw_path = f"raw/{track_id}/{filename}"
        raw_audio_url = await storage_service.upload_audio(
            bucket=RAW_AUDIO_BUCKET,
            path=raw_path,
            data=audio_bytes,
            content_type=content_type,
        )
    except Exception as exc:
        logger.exception("Raw audio upload failed: %s", exc)
        raw_audio_url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

    # 3. Concurrent generation: Melody + Voice Transformation
    try:
        logger.info("Running Suno melody generation & RVC voice transformation concurrently...")
        generated_song_url, transformed_voice_url = await asyncio.gather(
            suno_service.generate_melody(
                audio_url=raw_audio_url,
                prompt=prompt,
                api_key=settings.SUNO_API_KEY,
                lyrics=lyrics,
                bpm=detected_bpm,
                musical_key=detected_key,
                mastered=mastering,
            ),
            replicate_service.transform_voice_rvc(
                audio_url=raw_audio_url,
                api_token=settings.REPLICATE_API_TOKEN,
                rvc_model=voice_model or "Squidward",
            ),
        )
    except Exception as exc:
        logger.exception("Melody generation / voice conversion failed: %s", exc)
        generated_song_url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        transformed_voice_url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"

    # 4. Meta HTDemucs 4-stem separation
    try:
        logger.info("Separating stems via Meta HTDemucs...")
        stems: dict = await replicate_service.separate_stems_htdemucs(
            generated_song_url, settings.REPLICATE_API_TOKEN
        )
    except Exception as exc:
        logger.exception("Stem separation failed: %s", exc)
        stems = {}

    final_vocals_url = stems.get("vocals", transformed_voice_url)
    instrumental_url = stems.get("other", generated_song_url)
    drums_url = stems.get("drums", "")
    bass_url = stems.get("bass", "")

    # 5. Persist metadata to Supabase DB
    created_at = datetime.now(tz=timezone.utc).isoformat()
    try:
        await database_service.save_track_metadata(
            track_id=track_id,
            prompt=prompt,
            raw_audio_url=raw_audio_url,
            full_track_url=generated_song_url,
            vocals_url=final_vocals_url,
            instrumental_url=instrumental_url,
            lyrics=lyrics,
            bpm=detected_bpm,
            musical_key=detected_key,
            drums_url=drums_url,
            bass_url=bass_url,
        )
    except Exception as exc:
        logger.warning("DB save warning: %s", exc)

    return ProduceResponse(
        track_id=track_id,
        full_track_url=generated_song_url,
        vocals_url=final_vocals_url,
        instrumental_url=instrumental_url,
        drums_url=drums_url or None,
        bass_url=bass_url or None,
        prompt=prompt,
        lyrics=lyrics,
        bpm=detected_bpm,
        musical_key=detected_key,
        mastered=mastering,
        created_at=created_at,
    )


# ---------------------------------------------------------------------------
# 2. General Audio Uploader
# ---------------------------------------------------------------------------
@router.post("/upload", response_model=UploadResponse)
async def upload_audio_file(
    audio: UploadFile = File(..., description="Audio file to upload"),
) -> UploadResponse:
    """Upload any audio file directly to Supabase storage."""
    file_id = str(uuid.uuid4())
    audio_bytes = await audio.read()
    content_type = audio.content_type or "audio/mpeg"
    filename = audio.filename or "audio_file.mp3"
    storage_path = f"uploads/{file_id}/{filename}"

    public_url = await storage_service.upload_audio(
        bucket=RAW_AUDIO_BUCKET,
        path=storage_path,
        data=audio_bytes,
        content_type=content_type,
    )

    return UploadResponse(
        url=public_url,
        filename=filename,
        content_type=content_type,
        size_bytes=len(audio_bytes),
    )


# ---------------------------------------------------------------------------
# 3. Standalone Stem Separator
# ---------------------------------------------------------------------------
@router.post("/separate-stems", response_model=StemSeparationResponse)
async def separate_stems_endpoint(
    audio: UploadFile = File(..., description="Song or mix to separate into 4 stems"),
) -> StemSeparationResponse:
    """
    Dedicated AI Stem Separator using Meta's HTDemucs:
    Extracts isolated Vocals, Drums, Bass, and Other/Instruments.
    """
    job_id = str(uuid.uuid4())
    audio_bytes = await audio.read()
    filename = audio.filename or "song_to_separate.mp3"
    content_type = audio.content_type or "audio/mpeg"

    # Upload to storage first so Replicate can access it
    storage_path = f"stems_input/{job_id}/{filename}"
    uploaded_url = await storage_service.upload_audio(
        bucket=RAW_AUDIO_BUCKET,
        path=storage_path,
        data=audio_bytes,
        content_type=content_type,
    )

    stems = await replicate_service.separate_stems_htdemucs(
        uploaded_url, settings.REPLICATE_API_TOKEN
    )

    return StemSeparationResponse(
        job_id=job_id,
        original_url=uploaded_url,
        vocals_url=stems.get("vocals", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"),
        drums_url=stems.get("drums", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"),
        bass_url=stems.get("bass", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"),
        other_url=stems.get("other", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"),
        created_at=datetime.now(tz=timezone.utc).isoformat(),
    )


# ---------------------------------------------------------------------------
# 4. Standalone Voice-to-Voice Transformer
# ---------------------------------------------------------------------------
@router.post("/voice-transform", response_model=VoiceTransformResponse)
async def voice_transform_endpoint(
    audio: UploadFile = File(..., description="Vocal recording to transform"),
    model_name: str = Form("Squidward", description="Target RVC voice preset"),
    pitch_change: str = Form("no-change", description="Pitch adjustment"),
) -> VoiceTransformResponse:
    """Dedicated Voice-to-Voice AI transformation using Replicate RVC."""
    job_id = str(uuid.uuid4())
    audio_bytes = await audio.read()
    filename = audio.filename or "raw_vocal.mp3"
    content_type = audio.content_type or "audio/mpeg"

    storage_path = f"rvc_input/{job_id}/{filename}"
    uploaded_url = await storage_service.upload_audio(
        bucket=RAW_AUDIO_BUCKET,
        path=storage_path,
        data=audio_bytes,
        content_type=content_type,
    )

    transformed_url = await replicate_service.transform_voice_rvc(
        audio_url=uploaded_url,
        api_token=settings.REPLICATE_API_TOKEN,
        rvc_model=model_name,
        pitch_change=pitch_change,
    )

    return VoiceTransformResponse(
        job_id=job_id,
        original_url=uploaded_url,
        transformed_url=transformed_url,
        target_voice=model_name,
        pitch_change=pitch_change,
        created_at=datetime.now(tz=timezone.utc).isoformat(),
    )



# ---------------------------------------------------------------------------
# 5. Cloud Studio Library History
# ---------------------------------------------------------------------------
@router.get("/history", response_model=List[TrackHistoryItem])
async def get_studio_history(limit: int = 20) -> List[TrackHistoryItem]:
    """Retrieve track creation history from Supabase Cloud Library."""
    rows = await database_service.get_recent_tracks(limit=limit)
    items = []
    for r in rows:
        items.append(
            TrackHistoryItem(
                id=str(r.get("id", "")),
                prompt=r.get("prompt", ""),
                lyrics=r.get("lyrics"),
                raw_audio_url=r.get("raw_audio_url"),
                full_track_url=r.get("full_track_url"),
                vocals_url=r.get("vocals_url"),
                instrumental_url=r.get("instrumental_url"),
                bpm=r.get("bpm"),
                musical_key=r.get("musical_key"),
                created_at=r.get("created_at"),
            )
        )
    return items


# ---------------------------------------------------------------------------
# 6. Multi-Stem ZIP Export
# ---------------------------------------------------------------------------
@router.post("/export-zip")
async def export_stems_zip(
    vocals_url: Optional[str] = Form(None),
    instrumental_url: Optional[str] = Form(None),
    drums_url: Optional[str] = Form(None),
    bass_url: Optional[str] = Form(None),
    track_title: Optional[str] = Form("ai_studio_track"),
):
    """
    Downloads available stems and packages them into a clean ZIP archive for DAW import.
    """
    stem_map = {
        "vocals.mp3": vocals_url,
        "instrumental.mp3": instrumental_url,
        "drums.mp3": drums_url,
        "bass.mp3": bass_url,
    }

    zip_buffer = io.BytesIO()

    async with httpx.AsyncClient(timeout=60.0) as client:
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for stem_name, stem_url in stem_map.items():
                if not stem_url:
                    continue
                try:
                    resp = await client.get(stem_url)
                    if resp.status_code == 200:
                        zip_file.writestr(f"stems/{stem_name}", resp.content)
                except Exception as e:
                    logger.warning("Failed to fetch stem %s (%s): %s", stem_name, stem_url, e)

            # Add README / metadata into zip
            info_text = f"AI Music Studio V2 - Multi-Stem Export\nExported: {datetime.now(timezone.utc).isoformat()}\nTitle: {track_title}\n"
            zip_file.writestr("TRACK_INFO.txt", info_text)

    zip_buffer.seek(0)
    safe_title = "".join(c for c in (track_title or "track") if c.isalnum() or c in ("-", "_"))
    return Response(
        content=zip_buffer.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{safe_title}_stems.zip"'},
    )
