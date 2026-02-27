from fastapi import APIRouter, HTTPException, status
from schemas.chat import ChatRequest, ResearchRequest, ExecuteRequest
from services.chat_agent import agent_app
from services.research_agent import research_app

router = APIRouter()

@router.post("/")
async def chat(data: ChatRequest):
    result = agent_app.invoke({
        "messages": data.message,
        "knowledge_files": data.knowledge_files,
    })
    return {"message": result["messages"]}

@router.post("/research/execute")
async def execute_research(data: ExecuteRequest):
    try:
        return {"message": research_app(data.plan)}
    except ValueError as e:
        print(e)
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))