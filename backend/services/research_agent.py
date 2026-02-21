from deepagents import create_deep_agent
from tavily import TavilyClient
from settings.settings import api_settings
from typing import Literal

# from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI


tavily_client = TavilyClient(api_settings.TAVILY_API_KEY)


def internet_search(
    query: str,
    max_results: int = 5,
    topic: Literal["general", "news", "finance"] = "finance",
    include_raw_content: bool = False,
):
    """Run a web search"""
    return tavily_client.search(
        query,
        max_results=max_results,
        include_raw_content=include_raw_content,
        topic=topic,
    )


def research_app(user_query: str):

    research_instructions = """
    You are an expert researcher. Your job is to conduct thorough research and then write a polished report.

    You have access to an internet search tool as your primary means of gathering information.

    ## `internet_search`

    Use this to run an internet search for a given query. You can specify the max number of results to return, the topic, and whether raw content should be included.
    """

    llm = ChatGoogleGenerativeAI(
        model="gemini-3-flash-preview",
        api_key=api_settings.GEMINI_API_KEY,
        temperature=0.7,
    )

    agent = create_deep_agent(
        model=llm, tools=[internet_search], system_prompt=research_instructions
    )

    response = agent.invoke({"messages": [{"role": "user", "content": user_query}]})

    return response["messages"][-1].content
