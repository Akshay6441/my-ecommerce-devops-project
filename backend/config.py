"""Centralised settings — all config lives here, loaded from .env"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    database_url: str = "postgresql://user:password@localhost:5432/mydatabase"

    # JWT
    secret_key: str = "change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days

    # Stripe
    stripe_secret_key: str = "sk_test_placeholder"
    stripe_webhook_secret: str = "whsec_placeholder"
    stripe_publishable_key: str = "pk_test_placeholder"

    # App
    app_env: str = "development"
    allowed_origins: str = "http://localhost,http://localhost:3000"

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = Settings()
