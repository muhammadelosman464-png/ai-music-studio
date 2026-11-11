import re
from supabase import create_client, Client
from app.core.config import settings

# Support both legacy JWT keys and new Supabase key formats (e.g. sb_secret_...)
_orig_match = re.match

def _lenient_match(pattern, string, *args, **kwargs):
    if isinstance(pattern, str) and pattern.startswith("^[A-Za-z0-9-_=]+\\."):
        return True
    return _orig_match(pattern, string, *args, **kwargs)

re.match = _lenient_match
try:
    supabase_client: Client = create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY,
    )
finally:
    re.match = _orig_match

