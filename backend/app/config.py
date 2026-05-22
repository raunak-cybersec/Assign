import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration loaded from environment variables."""

    # Supabase
    SUPABASE_URL: str = os.environ.get('SUPABASE_URL', '')
    SUPABASE_SERVICE_ROLE_KEY: str = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
    SUPABASE_JWT_SECRET: str = os.environ.get('SUPABASE_JWT_SECRET', '')

    # Gmail SMTP
    GMAIL_ADDRESS: str = os.environ.get('GMAIL_ADDRESS', '')
    GMAIL_APP_PASSWORD: str = os.environ.get('GMAIL_APP_PASSWORD', '')

    # Frontend
    FRONTEND_URL: str = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

    # Flask
    SECRET_KEY: str = os.environ.get('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_ENV: str = os.environ.get('FLASK_ENV', 'development')

    @classmethod
    def validate(cls) -> list[str]:
        """Return a list of missing required env vars."""
        required = [
            'SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_KEY',
            'SUPABASE_JWT_SECRET',
        ]
        missing = [var for var in required if not os.environ.get(var)]
        return missing
