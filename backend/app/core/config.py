from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str
    database_url: str = ""  # kept for future auth, not used yet

    class Config:
        env_file = ".env"
        extra = "allow"  # allows any extra vars in .env without crashing

settings = Settings()