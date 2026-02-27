from .tools import internet_search
from datetime import date
from .prompts import WEB_SEARCH_INSTRUCTIONS
from langchain_groq import ChatGroq
from settings.settings import api_settings
from pydantic import BaseModel, Field
from typing import Literal

# web_search_subagent = {
#     "name": "web-search-agent",
#     "description": (
#         "Specialized sub-agent for real-time web research. "
#         "Use when the task requires current information, recent events, "
#         "fact-checking, prices, news, statistics or data not available in model knowledge. "
#         "Not suitable for math, code execution, document analysis or offline reasoning."
#     ),
#     "system_prompt": WEB_SEARCH_INSTRUCTIONS.format(date=date.today().strftime("%B %d, %Y")),
#     "tools": [internet_search],
# }

web_search_subagent = {
    "name": "web_search_agent",
    "description": "specialized sub-agent for real-time web research.",
    "system_prompt": ("You are a fast, accurate web research sub-agent. "
        "Use your search tool(s) immediately when you need current or external information. "
        "Follow tool schemas exactly — never change types or add extra fields. "
        "Return concise, sourced answers. Do not hallucinate."
    ),
    "tools": [internet_search],
}
subagents = [web_search_subagent]
