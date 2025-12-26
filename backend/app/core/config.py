import os
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()


def get_required_env(key: str) -> str:
    value = os.getenv(key)
    if value is None or value == "":
        raise RuntimeError(f"Environment variable '{key}' is required but not set")
    return value


class Settings(BaseModel):
    app_name: str = os.getenv("APP_NAME", "EisenhowerApp")
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"

    secret_key: str = get_required_env("SECRET_KEY")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

    database_url: str = get_required_env("DATABASE_URL")

    # CORS
    allowed_origins: list[str] = []


# Calculamos allowed_origins afuera para evitar campos "sueltos" sin anotación
_settings = Settings()
_raw = os.getenv("ALLOWED_ORIGINS", "")
_settings.allowed_origins = [o.strip() for o in _raw.split(",") if o.strip()]
settings = _settings
