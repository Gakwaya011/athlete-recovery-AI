from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str
    database_url: str = ""
    SECRET_KEY:   str

    class Config:
        env_file = ".env"
        extra    = "allow"

settings = Settings()