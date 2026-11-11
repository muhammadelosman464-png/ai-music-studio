from typing import Optional, List, Dict
from pydantic import BaseModel, ConfigDict


class ProduceResponse(BaseModel):
    """Response returned after the full AI music production pipeline completes."""

    track_id: str
    full_track_url: str
    vocals_url: str
    instrumental_url: str
    drums_url: Optional[str] = None
    bass_url: Optional[str] = None
    prompt: str
    lyrics: Optional[str] = None
    bpm: Optional[int] = None
    musical_key: Optional[str] = None
    mastered: bool = True
    created_at: str


class StemSeparationResponse(BaseModel):
    """Response returned when separating any audio track into 4 stems."""

    job_id: str
    original_url: str
    vocals_url: str
    drums_url: str
    bass_url: str
    other_url: str
    created_at: str


class VoiceTransformResponse(BaseModel):
    """Response returned when converting vocal audio via RVC."""

    job_id: str
    original_url: str
    transformed_url: str
    target_voice: str
    pitch_change: str
    created_at: str





class TrackHistoryItem(BaseModel):
    """Metadata item in the cloud studio library."""

    id: str
    prompt: str
    lyrics: Optional[str] = None
    raw_audio_url: Optional[str] = None
    full_track_url: Optional[str] = None
    vocals_url: Optional[str] = None
    instrumental_url: Optional[str] = None
    bpm: Optional[int] = None
    musical_key: Optional[str] = None
    created_at: Optional[str] = None


class UploadResponse(BaseModel):
    """General audio upload response."""

    url: str
    filename: str
    content_type: str
    size_bytes: int


class ErrorResponse(BaseModel):
    """Standard error response body."""

    detail: str
    step: str
