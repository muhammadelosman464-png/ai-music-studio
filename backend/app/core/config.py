import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables or .env file.
    All fields have safe defaults so the server boots reliably in cloud
    environments (such as Render) even before environment variables are configured.
    """

    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    REPLICATE_API_TOKEN: str = ""
    SUNO_API_KEY: str = ""
    SECONDARY_AI_KEY: str = ""
    FRONTEND_URL: str = "*"
    PORT: int = int(os.environ.get("PORT", "8000"))

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
