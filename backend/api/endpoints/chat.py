from fastapi import APIRouter
from pinecone import Pinecone
from settings.settings import api_settings
from pydantic import BaseModel
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, List
from huggingface_hub import InferenceClient

router = APIRouter()

client = InferenceClient(api_key=api_settings.HUGGING_FACE_KEY)

pc = Pinecone(api_key=api_settings.PINECONE_API_KEY)

index = pc.Index(
    api_settings.PINECONE_INDEX_NAME,
    host=api_settings.PINECONE_INDEX_HOST,
)


class ChatRequest(BaseModel):
    message: str
    knowledge_files: list[str]


class AgentState(TypedDict):
    messages: str
    knowledge_files: List[str]


def retrieve_context(state: AgentState):
    knowledge_files = state["knowledge_files"]
    messages = state["messages"]

    if not knowledge_files:
        return {"messages": messages}

    last_query = messages
    top_k = len(knowledge_files) * 12

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

    prompt = f"""
    I have provided a collection of reference messages and a dataset below.

    ### SOURCE DATA: {vector_db_response}

    ### TASK: Based strictly on the provided data, answer the following question: {messages}

    ### REQUIREMENTS:
    1. Do not include information that is not present in the SOURCE DATA.
    2. If the data does not contain the answer, reply stating that the information is unavailable.

    ### PROHIBITIONS (STRICT):
    1. **No Meta-Commentary:** Do not include notes about what is missing, disclaimers about the sample size, or "Additional Information" sections.
    2. **No Assumptions:** Do not guess the source of the data (e.g., book titles) if it is not explicitly named in the SOURCE DATA.
    3. **No Conversational Filler:** Provide only the direct answer. Do not start with "Based on the data..." or "Here is the info..."

    ### FORMATTING GUIDELINES:
    1. Use **Markdown** to make the response structured and easy to read.
    2. Use **bolding** for key terms and **bullet points** for lists.
    3. Use **headings** (###) to separate distinct sections of the answer. """

    return {"messages": prompt}


def call_model(state: AgentState):
    messages = state["messages"]
    completion = client.chat.completions.create(
        model="meta-llama/Llama-3.1-8B-Instruct",
        messages=[{"role": "user", "content": messages}],
    )
    response = completion.choices[0].message.content
    return {"messages": response}


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
        "messages": data.message,
        "knowledge_files": data.knowledge_files,
    }

    result = app.invoke(initial_state)

    return {"message": result["messages"]}
