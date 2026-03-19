from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints.chat import router as chat_router
from app.api.v1.endpoints.auth import router as auth_router
from app.db.session import engine
from app.db.base_class import Base

# Import all models so Base knows about them and creates tables
from app.db.models import User, ChatSession, ChatMessage, CaloriePrediction

# Create all tables on startup safely
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables verified.")
except Exception as e:
    print(f"⚠️ Database connection warning during startup: {e}")

app = FastAPI(title="nutri_athlete AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",                 # For your local testing
        "http://localhost:3000",                 # If your local uses port 3000
        "https://athlete-recovery-ai.vercel.app" # The EXACT Vercel URL
    ],
    allow_credentials=True,                      # THIS fixes the login/chat tokens!
    allow_methods=["*"],                         
    allow_headers=["*"],                         
)

app.include_router(chat_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/")
def root():
    return {"status": "nutri_athlete AI is running 🏋️"}