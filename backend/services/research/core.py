from deepagents import create_deep_agent
from langchain_groq import ChatGroq
from settings.settings import api_settings
from .agents import subagents

from .tools import internet_search

def research_app(user_query: str):


    research_instructions = """You are an expert researcher. Your job is to conduct thorough research and then write a polished report.
    """
    model = ChatGroq(api_key=api_settings.GROK_API_2, model="meta-llama/llama-4-scout-17b-16e-instruct")

    agent = create_deep_agent(
        model=model,
        system_prompt=research_instructions,
        subagents=subagents
    )

    response = agent.invoke(
        {"messages": [{"role": "human", "content": user_query}]}, print_mode="updates"
    )

    return response["messages"][-1].content