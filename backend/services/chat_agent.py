from langgraph.graph import StateGraph, START, END
from typing import TypedDict, List
from db.pinecone_client import index, pc
from services.llm_client import client
from settings.settings import api_settings


class AgentState(TypedDict):
    messages: str
    knowledge_files: List[str]


def retrieve_context(state: AgentState):
    knowledge_files, user_query = state["knowledge_files"], state["messages"]

    if not knowledge_files:
        return {"messages": user_query}

    top_k = len(knowledge_files) * 10

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


    matches = query_response.to_dict()["matches"]

    context_blocks = [
    f"[Source: {match['metadata']['file_name']} | Page: {match['metadata']['page']}]\n{match['metadata']['text']}"
    for match in matches
    ]

    final_context = "\n\n".join(context_blocks)

    SYSTEM_PROMPT = """
        You are an AI assistant designed to answer user questions using only the provided context retrieved from a vector database.

        Core Responsibilities:
        - Carefully read and understand the retrieved context before answering.
        - The context may come from multiple documents. Combine information logically when needed.
        - If multiple documents provide conflicting information, mention the uncertainty.
        - If the answer is not present in the context, say:
        "I could not find this information in the provided documents."

        Strict Rules:
        - Do NOT make up information.
        - Do NOT use outside knowledge unless explicitly allowed.
        - Do NOT assume missing details.
        - Stay grounded in the retrieved context.

        Answer Style:
        - Be clear, concise, and helpful.
        - Structure answers using bullet points or paragraphs when helpful.
        - If relevant, reference document sections (if metadata is available).

        If Context is Empty or Irrelevant:
        - Politely ask the user to rephrase or provide more details.

        Goal:
        Provide accurate, context-grounded answers that help the user understand the information from their uploaded documents.
    """


    user_message = f"""
        CONTEXT:{final_context}

        QUESTION: {user_query}
    """

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },
        {
            "role": "user",
            "content": user_message
        }
    ]

    return {"messages": messages}


def call_model(state: AgentState):
    messages = state["messages"]
    completion = client.chat.completions.create(
        model="meta-llama/Meta-Llama-3-70B-Instruct",
        messages=messages,
    )

    response = completion.choices[0].message.content

    return {"messages": response}


workflow = StateGraph(AgentState)
workflow.add_node("retrieve", retrieve_context)
workflow.add_node("generate", call_model)

workflow.add_edge(START, "retrieve")
workflow.add_edge("retrieve", "generate")
workflow.add_edge("generate", END)

agent_app = workflow.compile()
