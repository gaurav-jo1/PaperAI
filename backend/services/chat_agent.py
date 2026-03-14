from langgraph.graph import StateGraph, START, END
from typing import TypedDict, List, Any
from db.pinecone_client import index, pc
from services.llm_client import client
from settings.settings import api_settings
import uuid
from sqlalchemy import select
from db.database import AsyncSessionLocal
from db.user_files import UserFiles


class AgentState(TypedDict):
    messages: Any
    knowledge_files: List[str]
    semantic_search_enabled: bool


SYSTEM_PROMPT = """
        You are an AI assistant designed to answer user questions using only the provided context retrieved from a vector database or complete documents.

        Core Responsibilities:
        - Carefully read and understand the provided context before answering.
        - The context may come from multiple documents. Combine information logically when needed.
        - If multiple documents provide conflicting information, mention the uncertainty.
        - If the answer is not present in the context, say:
        "I could not find this information in the provided documents."

        Strict Rules:
        - Do NOT make up information.
        - Do NOT use outside knowledge unless explicitly allowed.
        - Do NOT assume missing details.
        - Stay grounded in the provided context.

        Markdown Response Requirements:
        - ALWAYS generate responses in valid Markdown format.
        - Use Markdown elements when helpful:
        - Headings (##, ###) for sections
        - Bullet points (-) or numbered lists (1.) for structured information
        - Bold (**) for key terms or important notes
        - Code blocks (```) for technical or code-related content
        - Tables when comparing structured data (if relevant)
        - Keep formatting clean and readable.
        - Do NOT include raw HTML unless explicitly requested.

        Answer Style:
        - Be clear, concise, and helpful.
        - Prefer structured Markdown over plain text when it improves clarity.
        - If relevant, reference document sections (if metadata is available).

        If Context is Empty or Irrelevant:
        - Politely ask the user to rephrase or provide more details.

        Goal:
        Provide accurate, context-grounded answers that help the user understand the information from their uploaded documents, formatted clearly using Markdown.
"""


def retrieve_context(state: AgentState):
    knowledge_files = state.get("knowledge_files", [])
    user_query = state["messages"]

    if not knowledge_files:
        return {"messages": user_query}

    top_k = len(knowledge_files) * 20

    dense_query_embedding = pc.inference.embed(
        model="llama-text-embed-v2",
        inputs=user_query,
        parameters={"input_type": "query", "truncate": "END"},
    )

    sparse_query_embedding = pc.inference.embed(
        model="pinecone-sparse-english-v0",
        inputs=user_query,
        parameters={"input_type": "query", "truncate": "END"},
    )

    for d, s in zip(dense_query_embedding, sparse_query_embedding):
        query_response = index.query(
            namespace=api_settings.PINECONE_NAMESPACE,
            top_k=top_k,
            vector=d["values"],
            sparse_vector={
                "indices": s["sparse_indices"],
                "values": s["sparse_values"],
            },
            include_values=False,
            include_metadata=True,
            filter={"file_id": {"$in": knowledge_files}},
        )

    matches = query_response["matches"]

    context_blocks = [
        f"[Source: {match['metadata']['file_name']}]\n{match['metadata']['text']}"
        for match in matches
    ]

    final_context = "\n\n".join(context_blocks)

    user_message = f"""
        CONTEXT:{final_context}

        QUESTION: {user_query}
    """

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    return {"messages": messages}


async def get_full_context(state: AgentState):
    knowledge_files = state.get("knowledge_files", [])
    user_query = state["messages"]

    if not knowledge_files:
        return {"messages": user_query}

    file_uuids = [uuid.UUID(f) for f in knowledge_files]

    async with AsyncSessionLocal() as db:
        stmt = select(UserFiles).where(UserFiles.file_id.in_(file_uuids))
        result = await db.execute(stmt)
        user_files = result.scalars().all()

        context_blocks = [
            f"[Source: {user_file.file_name}]\n{user_file.markdown_content}"
            for user_file in user_files if user_file.markdown_content
        ]

    final_context = "\n\n".join(context_blocks)

    user_message = f"""
        CONTEXT:{final_context}

        QUESTION: {user_query}
    """

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    return {"messages": messages}


def route_query(state: AgentState):
    if not state.get("knowledge_files"):
        return "generate"

    if state.get("semantic_search_enabled"):
        return "retrieve"
    else:
        return "get_full_context"


def call_model(state: AgentState):
    messages = state["messages"]
    print(messages)

    files = state.get("knowledge_files", [])

    if isinstance(messages, str):
        messages = [{"role": "user", "content": messages}]

    if files:
        # meta-llama/Llama-4-Scout-17B-16E-Instruct for 10M Tokens
        # meta-llama/Llama-4-Maverick-17B-128E-Instruct for 1M Tokens

        model = "meta-llama/Llama-3.3-70B-Instruct"
    else:
        model = "meta-llama/Llama-3.1-8B-Instruct"

    completion = client.chat.completions.create(
        model=model,
        messages=messages,
    )

    response = completion.choices[0].message.content

    return {"messages": response}


workflow = StateGraph(AgentState)
workflow.add_node("retrieve", retrieve_context)
workflow.add_node("get_full_context", get_full_context)
workflow.add_node("generate", call_model)

workflow.add_conditional_edges(START, route_query)
workflow.add_edge("retrieve", "generate")
workflow.add_edge("get_full_context", "generate")
workflow.add_edge("generate", END)

agent_app = workflow.compile()
