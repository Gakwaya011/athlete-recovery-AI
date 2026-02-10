from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()  # Load the .env file

# Get the URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Create the engine
# check_same_thread=False is ONLY for SQLite. Since we are using Postgres, we remove it.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()