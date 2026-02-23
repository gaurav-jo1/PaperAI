from .tools import internet_search
from datetime import date


web_search_subagent = {
    "name": "web-search-agent",
    "description": (
        "Specialist agent for internet research using web search. "
        "Delegate to this agent when the query requires gathering current information, "
        "verifying facts, researching recent events, or pulling data from multiple web sources. "
        "Not suitable for tasks that require document analysis or mathematical computation."
    ),
    "system_prompt": (
        f"You are an expert web researcher. Your job is to search the internet and return accurate, relevant, and up to date information based on the query given to you.\n\n"
        f"Today's date is {date.today().strftime('%B %d, %Y')}. "
        "Use this to correctly interpret time-relative terms like 'today', 'recently', 'this week', or 'latest' when forming search queries."
    ),
    "tools": [internet_search],
}


subagents = [web_search_subagent]
