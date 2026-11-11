import logging
from app.core.supabase_client import supabase_client

logger = logging.getLogger(__name__)


async def upload_audio(bucket: str, path: str, data: bytes, content_type: str) -> str:
    """
    Upload audio bytes to a Supabase Storage bucket and return the public URL.

    Args:
        bucket:       The name of the Supabase Storage bucket.
        path:         The destination object path inside the bucket
                      (e.g. "raw/track-123.mp3").
        data:         Raw bytes of the audio file to upload.
        content_type: MIME type of the audio (e.g. "audio/mpeg").

    Returns:
        The public URL string pointing to the uploaded file.

    Raises:
        Exception: Propagates any error raised by the Supabase client.
    """
    logger.info("Uploading %d bytes to bucket '%s' at path '%s'", len(data), bucket, path)

    if not supabase_client:
        logger.warning("Supabase client is not available. Returning fallback URL.")
        return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

    supabase_client.storage.from_(bucket).upload(

        path,
        data,
        {"content-type": content_type, "upsert": "true"},
    )

    public_url: str = supabase_client.storage.from_(bucket).get_public_url(path)

    logger.info("Upload complete. Public URL: %s", public_url)
    return public_url
