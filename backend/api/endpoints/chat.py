from fastapi import APIRouter
from schemas.chat import ChatRequest
from services.chat_agent import agent_app

router = APIRouter()


@router.post("/")
async def chat(data: ChatRequest):
    initial_state = {
        "messages": data.message,
        "knowledge_files": data.knowledge_files,
    }

    result = agent_app.invoke(initial_state)

    return {"message": result["messages"]}
