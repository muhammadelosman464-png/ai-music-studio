import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import studio
from app.core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)

app = FastAPI(
    title="AI Music Studio API",
    version="1.0.0",
    description=(
        "Backend API for the Ultimate AI Music Production Studio. "
        "Orchestrates Suno melody generation, Replicate RVC voice conversion, "
        "HTDemucs stem separation, and Supabase storage/database."
    ),
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(studio.router, prefix="/api/v1/studio", tags=["studio"])


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["health"])
async def health() -> dict:
    """Liveness probe — returns 200 when the server is running."""
    return {"status": "ok", "service": "AI Music Studio API"}
