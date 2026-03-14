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
        You are an AI assistant designed to answer user questions using the provided context retrieved from a vector database or complete documents.

        Core Responsibilities:
        - Carefully read and understand the provided context before answering.
        - The context may come from multiple documents. Combine information logically when needed.
        - If multiple documents provide conflicting information, mention the uncertainty.

        Knowledge Source Rules (CRITICAL):
        - If the answer IS found in the provided context:
        → Answer directly using the context. No special label needed.

        - If the answer is NOT found in the provided context BUT you have relevant knowledge from your training data:
        → First, explicitly state: "⚠️ The provided documents do not contain information about this. The following answer is based on my general training knowledge, not your uploaded data."
        → Then provide the answer from your training knowledge.

        - If the answer is NOT found in the provided context AND you have no reliable training knowledge:
        → Clearly state: "❌ No provided data has an answer for this question, and I don't have sufficient knowledge to answer it reliably."

        Strict Rules:
        - Do NOT make up information.
        - Do NOT assume missing details.
        - Always be transparent about where your answer is coming from (provided context vs. general training knowledge).
        - Never silently mix context-grounded answers with training knowledge — always label the source when using training knowledge.

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
        - Politely inform the user that no relevant context was retrieved and ask them to rephrase or re-upload relevant documents.

        Goal:
        Provide accurate, transparent answers that clearly distinguish between information from the user's uploaded documents and general training knowledge, formatted cleanly using Markdown.
"""


def _build_messages(user_query: str, context_blocks: list[str]) -> list[dict]:
    final_context = "\n\n".join(context_blocks)
    user_message = f"""
        CONTEXT:{final_context}

        QUESTION: {user_query}
    """
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]


def _pinecone_search(user_query: str, top_k: int = 10) -> list[str]:
    """Runs a hybrid Pinecone search and returns formatted context blocks."""
    dense = pc.inference.embed(
        model="llama-text-embed-v2",
        inputs=user_query,
        parameters={"input_type": "query", "truncate": "END"},
    )
    sparse = pc.inference.embed(
        model="pinecone-sparse-english-v0",
        inputs=user_query,
        parameters={"input_type": "query", "truncate": "END"},
    )

    for d, s in zip(dense, sparse):
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
        )

    return [
        f"[Source: {m['metadata']['file_name']}]\n{m['metadata']['text']}"
        for m in query_response["matches"]
    ]


async def _fetch_full_context(knowledge_files: list[str]) -> list[str]:
    """Fetches full markdown content for the given file IDs from the DB."""
    file_uuids = [uuid.UUID(f) for f in knowledge_files]
    async with AsyncSessionLocal() as db:
        stmt = select(UserFiles).where(UserFiles.file_id.in_(file_uuids))
        result = await db.execute(stmt)
        user_files = result.scalars().all()

    return [
        f"[Source: {uf.file_name}]\n{uf.markdown_content}"
        for uf in user_files
        if uf.markdown_content
    ]


# ── Graph nodes ──────────────────────────────────────────────────────────────


def retrieve_context(state: AgentState):
    user_query = state["messages"]
    blocks = _pinecone_search(user_query)
    return {"messages": _build_messages(user_query, blocks)}


async def get_full_context(state: AgentState):
    knowledge_files = state.get("knowledge_files", [])
    user_query = state["messages"]
    blocks = await _fetch_full_context(knowledge_files)
    return {"messages": _build_messages(user_query, blocks)}


async def get_full_context_with_retrieval(state: AgentState):
    """Combined: full document content + semantic highlights."""
    knowledge_files = state.get("knowledge_files", [])
    user_query = state["messages"]
    full_blocks = await _fetch_full_context(knowledge_files)
    semantic_blocks = _pinecone_search(user_query)
    return {"messages": _build_messages(user_query, full_blocks + semantic_blocks)}


def route_query(state: AgentState):
    has_files = bool(state.get("knowledge_files"))
    semantic = state.get("semantic_search_enabled", False)

    if semantic and has_files:
        return "get_full_context_with_retrieval"
    elif not semantic and has_files:
        return "get_full_context"
    elif not has_files and semantic:
        return "retrieve"
    else:
        return "generate"


def call_model(state: AgentState):
    messages = state["messages"]
    print(messages)

    if isinstance(messages, str):
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": messages},
        ]

    # Case 1 (no knowledge files) → lightweight 8B model
    # All other cases (retrieve / get_full_context / combined) → 70B model
    has_files = bool(state.get("knowledge_files"))
    model = (
        "meta-llama/Llama-3.3-70B-Instruct"
        if has_files
        else "meta-llama/Llama-3.1-8B-Instruct"
    )

    completion = client.chat.completions.create(
        model=model,
        messages=messages,
    )

    response = completion.choices[0].message.content

    return {"messages": response}


workflow = StateGraph(AgentState)
workflow.add_node("retrieve", retrieve_context)
workflow.add_node("get_full_context", get_full_context)
workflow.add_node("get_full_context_with_retrieval", get_full_context_with_retrieval)
workflow.add_node("generate", call_model)

workflow.add_conditional_edges(
    START,
    route_query,
    {
        "retrieve": "retrieve",  # Semantic search only
        "generate": "generate",  # No files, no semantic search
        "get_full_context": "get_full_context",  # Files only
        "get_full_context_with_retrieval": "get_full_context_with_retrieval",  # Files + semantic search
    },
)

workflow.add_edge("retrieve", "generate")  # Semantic search only
workflow.add_edge("get_full_context", "generate")  # Files only
workflow.add_edge(
    "get_full_context_with_retrieval", "generate"
)  # Files + semantic search
workflow.add_edge("generate", END)

agent_app = workflow.compile()
