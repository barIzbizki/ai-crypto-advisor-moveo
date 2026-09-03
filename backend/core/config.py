import os


class Settings:
    database_url: str = os.environ.get(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@localhost:5432/ai_crypto_advisor",
    )


settings = Settings()
