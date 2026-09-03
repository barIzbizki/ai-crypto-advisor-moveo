from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = (
        "postgresql+psycopg://postgres:postgres@localhost:5432/ai_crypto_advisor"
    )
    environment: str = "local"
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:5173"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_cors_origins(cls, value: str | list[str]) -> list[str]:
        origins = (
            [origin.strip() for origin in value.split(",") if origin.strip()]
            if isinstance(value, str)
            else value
        )
        for origin in origins:
            if not origin.startswith(("http://", "https://")):
                raise ValueError(
                    f"Invalid CORS origin {origin!r}: must start with http:// or https://"
                )
        return origins


settings = Settings()
