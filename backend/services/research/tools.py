from tavily import TavilyClient
from settings.settings import api_settings
from typing import Literal

tavily_client = TavilyClient(api_settings.TAVILY_API_KEY)


def internet_search(
    query: str,
    max_results: int = 5,
    topic: Literal["general", "news", "finance"] = "general",
):
    """
    Search the internet for information using Tavily.

    Use this when you need current, real-world information such as recent events,
    facts, articles, or data that may not be in a static knowledge base.

    Args:
    query: The search query. Be specific and descriptive for better results.
           Example: "Python asyncio event loop best practices 2024"

    max_results: Number of results to return. Use 3-5 for focused lookups,
                 up to 10 for broad research.
                 Example: 3 (for "what is the capital of France"),
                          10 (for "overview of machine learning frameworks")

    topic: Category of search.
           - "general" for broad web search
             Example: topic="general", query="how to center a div in CSS"
           - "news" for recent news articles and events
             Example: topic="news", query="Fed interest rate decision February 2025"
           - "finance" for stock prices, earnings, market data
             Example: topic="finance", query="NVIDIA Q4 2024 earnings per share"
    """
    return tavily_client.search(
        query,
        max_results=int(max_results),
        topic=topic,
    )
