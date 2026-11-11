from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables / .env file.
    All fields are required unless a default is provided.
    """

    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    REPLICATE_API_TOKEN: str
    SUNO_API_KEY: str
    SECONDARY_AI_KEY: str
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
