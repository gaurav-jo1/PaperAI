from fastapi import APIRouter
from schemas.chat import ChatRequest, ResearchRequest, ExecuteRequest
from services.chat_agent import agent_app
from services.research_agent import research_plan, research_app
from fastapi import status
router = APIRouter()

@router.post("/")
async def chat(data: ChatRequest):
    result = agent_app.invoke({
        "messages": data.message,
        "knowledge_files": data.knowledge_files,
    })
    return {"message": result["messages"]}

@router.post("/research/plan", status_code=status.HTTP_201_CREATED)
async def create_research_plan(data: ResearchRequest):
    try:
        plan = research_plan(data.message)

        return {
            "message": plan
        }

    except ValueError as e:
        print(f"Bad input: {e}")
    except Exception as e:
        print(f"Something went wrong: {e}")

@router.post("/research/execute")
async def execute_research(data: ExecuteRequest):
    try:
        research_response = research_app(data.plan)

        return {"message": research_response }

    except ValueError as e:
        return {"message": e }
    except Exception as e:
        {"message": e }
