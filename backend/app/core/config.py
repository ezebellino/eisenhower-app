from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()


def get_required_env(key: str) -> str:
    value = os.getenv(key)
    if value is None or value == "":
        raise RuntimeError(f"Environment variable '{key}' is required but not set")
    return value


class Settings(BaseModel):
    # App
    app_name: str = os.getenv("APP_NAME", "EisenhowerApp")
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Security
    secret_key: str = get_required_env("SECRET_KEY")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

    # Database
    database_url: str = get_required_env("DATABASE_URL")

    # CORS
    allowed_origins: list[str] = os.getenv("ALLOWED_ORIGINS", "").split(",")


settings = Settings()
