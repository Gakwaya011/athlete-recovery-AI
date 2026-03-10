from fastapi import APIRouter
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.agent import agent

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    reply, profile_confirmed = agent.chat(
        [{"role": m.role, "content": m.content} for m in request.messages]
    )
    return ChatResponse(reply=reply, profile_confirmed=profile_confirmed)