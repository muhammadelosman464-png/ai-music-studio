import logging
import re
from typing import Optional
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

# Support both legacy JWT keys and new Supabase key formats (e.g. sb_secret_...)
_orig_match = re.match

def _lenient_match(pattern, string, *args, **kwargs):
    if isinstance(pattern, str) and pattern.startswith("^[A-Za-z0-9-_=]+\\."):
        return True
    return _orig_match(pattern, string, *args, **kwargs)

def _create_safe_supabase_client() -> Optional[Client]:
    """
    Initializes the Supabase client safely with fallback error handling,
    preventing the application from crashing on startup if credentials are invalid.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.warning("Supabase credentials not configured. Storage & DB features will be disabled.")
        return None

    re.match = _lenient_match
    try:
        client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
        logger.info("Supabase client initialized successfully.")
        return client
    except Exception as exc:
        logger.error("Failed to initialize Supabase client: %s", exc)
        return None
    finally:
        re.match = _orig_match

supabase_client: Optional[Client] = _create_safe_supabase_client()
