from fastapi import APIRouter
from schemas.chat import ChatRequest, ResearchRequest
from services.chat_agent import agent_app
from services.research_agent import research_plan
from fastapi import status
router = APIRouter()

@router.post("/chat")
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
        # session_id = save_plan_to_db(plan)

        return {
            # "session_id": session_id,
            "plan": plan
        }

    except ValueError as e:
        print(f"Bad input: {e}")
    except Exception as e:
        print(f"Something went wrong: {e}")

# @router.post("/research/execute")
# async def execute_research(data: ExecuteRequest):
#     plan = load_plan_from_db(data.session_id)

#     research_response = research_app(plan)

#     return {"session_id": data.session_id, "message": research_response }