from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.endpoints import calories

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0"
)

# CORS Configuration (Allows React/Vite to talk to FastAPI)
origins = [
    "http://localhost:5173",  # Vite Localhost
    "http://localhost:3000",  # React Default
    # Add your Render Frontend URL here later (e.g., https://my-app.onrender.com)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(calories.router, prefix="/api/v1/calories", tags=["calories"])
@app.get("/")
def root():
    return {"message": "System is active", "status": "online"}