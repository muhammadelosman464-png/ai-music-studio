import logging
from fastapi import HTTPException
from app.core.supabase_client import supabase_client

logger = logging.getLogger(__name__)


async def upload_audio(bucket: str, path: str, data: bytes, content_type: str) -> str:
    """
    Upload audio bytes to a Supabase Storage bucket and return the public URL.
    Raises HTTPException(500) if upload fails or client is not available.
    """
    logger.info("Uploading %d bytes to bucket '%s' at path '%s'", len(data), bucket, path)

    if not supabase_client:
        logger.error("Supabase client is not available for upload.")
        raise HTTPException(
            status_code=500,
            detail="Storage Error: Supabase client is not configured. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        )

    try:
        supabase_client.storage.from_(bucket).upload(
            path,
            data,
            {"content-type": content_type, "upsert": "true"},
        )
        public_url: str = supabase_client.storage.from_(bucket).get_public_url(path)
        logger.info("Upload complete. Public URL: %s", public_url)
        return public_url
    except Exception as exc:
        logger.error("Failed to upload audio to Supabase Storage: %s", exc)
        raise HTTPException(
            status_code=500,
            detail=f"Storage Error: Failed to upload audio to bucket '{bucket}': {str(exc)}",
        )
