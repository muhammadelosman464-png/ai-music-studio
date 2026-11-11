from pydantic import BaseModel


class ProduceResponse(BaseModel):
    """Response returned after the full AI music production pipeline completes."""

    track_id: str
    full_track_url: str
    vocals_url: str
    instrumental_url: str
    prompt: str
    created_at: str


class ErrorResponse(BaseModel):
    """Standard error response body."""

    detail: str
    step: str
