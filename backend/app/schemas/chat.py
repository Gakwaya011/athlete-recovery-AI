from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Message(BaseModel):
    role:    str
    content: str

class ChatRequest(BaseModel):
    messages:   List[Message]
    session_id: Optional[int] = None

class ChatResponse(BaseModel):
    reply:             str
    profile_confirmed: bool  = False
    session_id:        Optional[int] = None

class MessageOut(BaseModel):
    role:       str
    content:    str
    created_at: datetime
    class Config:
        from_attributes = True

class SessionOut(BaseModel):
    id:             int
    title:          Optional[str]
    sport:          Optional[str]
    duration_mins:  Optional[float]
    intensity:      Optional[str]
    goal:           Optional[str]
    weight_kg:      Optional[float]
    carbs_g:        Optional[float]
    protein_g:      Optional[float]
    calories_burned: Optional[float]
    created_at:     datetime
    class Config:
        from_attributes = True

class SessionDetailOut(BaseModel):
    id:             int
    title:          Optional[str]
    sport:          Optional[str]
    duration_mins:  Optional[float]
    intensity:      Optional[str]
    goal:           Optional[str]
    weight_kg:      Optional[float]
    carbs_g:        Optional[float]
    protein_g:      Optional[float]
    calories_burned: Optional[float]
    created_at:     datetime
    messages:       List[MessageOut] = []
    class Config:
        from_attributes = True