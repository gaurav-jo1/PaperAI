from fastapi import APIRouter
from schemas.chat import ChatRequest
from services.chat_agent import agent_app
from services.research_agent import research_app

router = APIRouter()


@router.post("/")
async def chat(data: ChatRequest):
    if data.research_mode:
        initial_state = {
            "messages": data.message,
            "knowledge_files": data.knowledge_files,
        }

        result = research_app(initial_state["messages"])
        result = result[0]["text"]

    else:
        initial_state = {
            "messages": data.message,
            "knowledge_files": data.knowledge_files,
        }

        result = agent_app.invoke(initial_state)
        result = result["messages"]

    return {"message": result}
