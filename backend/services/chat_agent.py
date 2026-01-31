from langgraph.graph import StateGraph, START, END
from typing import TypedDict, List
from db.pinecone_client import index, pc
from services.llm_client import client
from settings.settings import api_settings


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

    # Convert the query into a dense vector
    dense_query_embedding = pc.inference.embed(
        model="llama-text-embed-v2",
        inputs=last_query,
        parameters={"input_type": "query", "truncate": "END"},
    )

    # Convert the query into a sparse vector
    sparse_query_embedding = pc.inference.embed(
        model="pinecone-sparse-english-v0",
        inputs=last_query,
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
    vector_db_response = [match["metadata"]["text"] for match in matches]

    system_prompt = f"""You are an intelligent assistant designed to answer questions based on retrieved document chunks from a vector database.

        ## Your Task

        You will receive:
        1. **User Query**: The question or request from the user
        2. **Retrieved Context**: Up to {len(vector_db_response)} relevant chunks from a hybrid search (combining semantic and keyword matching)
        3. **Source Information**: File names and metadata for each chunk

        ## Response Guidelines

        ### Content Accuracy
        - **Answer ONLY based on the provided SOURCE DATA below**
        - If the answer is not found in the retrieved chunks, clearly state: "I cannot find this information in the provided documents."
        - Do NOT use your general knowledge to supplement answers
        - If the context is insufficient or ambiguous, acknowledge the limitation

        ### Citation and Sources
        - **Always cite your sources** by referencing the exact file name(s) where you found the information
        - Use format: `According to [filename]...` or `As mentioned in [filename]...`
        - When information comes from multiple files, cite all relevant sources
        - Only cite files that are explicitly named in the SOURCE DATA

        ### Response Formatting
        Use markdown extensively for clarity:
        - **Bold** important terms, key findings, or critical information
        - Use `numbered lists` for sequential steps or ranked items
        - Use `bullet points` for non-sequential information
        - Use `> blockquotes` for direct excerpts from documents
        - Use `### Headers` to organize longer responses into sections
        - Use `code blocks` when referring to technical terms, commands, or data

        ### Response Structure
        1. **Direct Answer**: Start with a clear, concise answer to the user's question
        2. **Supporting Details**: Provide relevant context and elaboration from the retrieved chunks
        3. **Source Attribution**: Clearly indicate which file(s) the information came from

        ### Handling Multiple Files
        When context comes from multiple files:
        - Compare and synthesize information across sources
        - Highlight any contradictions or differences between sources
        - Organize information logically, not just file-by-file

        ### PROHIBITIONS (STRICT)
        1. **No Meta-Commentary**: Do not include notes about what is missing, disclaimers about the sample size, or "Additional Information" sections.
        2. **No Assumptions**: Do not guess the source of the data (e.g., book titles) if it is not explicitly named in the SOURCE DATA.
        3. **No Conversational Filler**: Provide only the direct answer. Do not start with "Based on the data..." or "Here is the info..."
        4. **No External Knowledge**: Do not supplement with information outside the SOURCE DATA below.
        5. **No Speculation**: If information is not in the SOURCE DATA, do not infer or deduce beyond what is explicitly stated.

        ### Best Practices
        - Be concise but comprehensive
        - Maintain a helpful and professional tone
        - If chunks seem fragmented, piece together the narrative logically
        - Prioritize the most relevant chunks if information is redundant

        ---

        ## SOURCE DATA

        {vector_db_response}

        ---

        ## USER QUERY

        {messages}

        ---

        ## YOUR RESPONSE

        Provide your answer below using the formatting guidelines and prohibitions above:"""

    return {"messages": system_prompt}


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

agent_app = workflow.compile()
