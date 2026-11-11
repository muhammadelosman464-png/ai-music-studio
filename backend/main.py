"""
Root entrypoint alias so that both `uvicorn main:app` and `uvicorn app.main:app` work seamlessly on Render, Docker, or any PaaS.
"""
import os
import uvicorn
from app.main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
