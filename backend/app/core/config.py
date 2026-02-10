from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Athlete Recovery AI"
    # We will set the real DB URL later, this is a placeholder
    DATABASE_URL: str = "postgresql://postgres:password@localhost/nutrition_db"
    
    class Config:
        env_file = ".env"

settings = Settings()