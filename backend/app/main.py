import logging
import os
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
cors_origins = [settings.FRONTEND_URL, "http://localhost:3000"]
if "*" not in cors_origins:
    cors_origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(studio.router, prefix="/api/v1/studio", tags=["studio"])


# ---------------------------------------------------------------------------
# Health checks — root / and /health for Render liveness probes
# ---------------------------------------------------------------------------
@app.get("/", tags=["health"])
@app.get("/health", tags=["health"])
async def health() -> dict:
    """Liveness probe — returns 200 when the server is running."""
    return {"status": "ok", "service": "AI Music Studio API"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
