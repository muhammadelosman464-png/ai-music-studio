"""
Root entrypoint alias so that both `uvicorn main:app` and `uvicorn app.main:app` work seamlessly on Render, Docker, or any PaaS.
"""
import os
import sys

# Ensure backend root directory is at the front of sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
