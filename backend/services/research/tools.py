from tavily import TavilyClient
from settings.settings import api_settings
from typing import Literal

tavily_client = TavilyClient(api_settings.TAVILY_API_KEY)


def internet_search(
    query: str,
    max_results: int = 5,
    topic: Literal["general", "news", "finance"] = "general",
    include_raw_content: bool = False,
):
    """
    Search the internet for information using Tavily.

    Use this when you need current, real-world information such as recent events,
    facts, articles, or data that may not be in a static knowledge base.

    Args:
        query: The search query. Be specific and descriptive for better results.
        max_results: Number of results to return. Use 3-5 for focused lookups,
                     up to 10 for broad research.
        topic: Category of search.
               - "general" for broad web search
               - "news" for recent news articles and events
               - "finance" for stock prices, earnings, market data
        include_raw_content: If True, returns full page content instead of snippets.
                             Use only when deep reading of a source is needed.
    """
    return tavily_client.search(
        query,
        max_results=max_results,
        include_raw_content=include_raw_content,
        topic=topic,
    )
