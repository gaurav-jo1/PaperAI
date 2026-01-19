from fastapi import APIRouter
from pinecone import Pinecone
from settings.settings import api_settings
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, List
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage

router = APIRouter()

llm = ChatGoogleGenerativeAI(
    model="gemini-3-flash-preview",
    api_key=api_settings.GEMINI_API_KEY,
    temperature=0.7,
)

pc = Pinecone(api_key=api_settings.PINECONE_API_KEY)

index = pc.Index(
    api_settings.PINECONE_INDEX_NAME,
    host=api_settings.PINECONE_INDEX_HOST,
)


class ChatRequest(BaseModel):
    message: str
    knowledge_files: list[str]


class AgentState(TypedDict):
    messages: List[BaseMessage]
    knowledge_files: List[str]


def retrieve_context(state: AgentState):
    knowledge_files = state["knowledge_files"]
    messages = state["messages"]

    if not knowledge_files:
        return {"messages": messages}

    last_query = messages[-1].content
    top_k = len(knowledge_files) * 20

    retrieved_docs = index.search(
        namespace=api_settings.PINECONE_NAMESPACE,
        query={
            "inputs": {"text": last_query},
            "top_k": top_k,
            "filter": {"file_id": {"$in": knowledge_files}},
        },
        fields=[
            "text",
            "file_name",
            "page",
            "number_of_pages",
            "start_index",
        ],
    )

    vector_db_response = retrieved_docs.to_dict()["result"]["hits"]

    system_content = (
        "You are a helpful assistant. Use the following context in your response:"
        f"\n\n{vector_db_response}"
    )

    return {"messages": [SystemMessage(content=system_content)] + messages}


def call_model(state: AgentState):
    messages = state["messages"]
    response = llm.invoke(messages)
    return {"messages": [response]}


workflow = StateGraph(AgentState)
workflow.add_node("retrieve", retrieve_context)
workflow.add_node("generate", call_model)

workflow.add_edge(START, "retrieve")
workflow.add_edge("retrieve", "generate")
workflow.add_edge("generate", END)

app = workflow.compile()


@router.post("/")
async def chat(data: ChatRequest):
    initial_state = {
        "messages": [HumanMessage(content=data.message)],
        "knowledge_files": data.knowledge_files,
    }

    result = app.invoke(initial_state)

    final_message = result["messages"][-1]

    return {"message": final_message.content}
