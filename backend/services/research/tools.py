from tavily import TavilyClient
from settings.settings import api_settings
from typing import Literal, Annotated
from langchain_core.tools import tool, InjectedToolArg
from pydantic import BaseModel, Field

tavily_client = TavilyClient(api_settings.TAVILY_API_KEY)

class SearchInput(BaseModel):
    """Input for search queries."""
    query: str = Field(..., description="User query for search")
    topic: Literal["general", "news", "finance"] = Field(
        default="general",
        description="Type of topic user is querying about"
    )

@tool(args_schema=SearchInput)
def internet_search(
    query: str,
    topic: Literal["general", "news", "finance"] = "general",
):
    """Run a real-time web search via Tavily.

    Args:
        query (str): Search query string — clear, specific and natural phrasing works best
        max_results (int): Maximum number of results to return. Defaults to 5.
        topic (Literal["general", "news", "finance"]):
            Controls result ranking and filtering.
            - "general" (default): broad web results
            - "news": recent news articles
            - "finance": financial data, stocks, company news

    Examples:
        internet_search("current weather in Hawai",)
        internet_search("latest budget 2026 India", topic="news")
        internet_search("TSLA stock price right now", topic="finance")
    """

    return tavily_client.search(
        query=query,
        topic=topic,
        include_raw_content=False,
    )