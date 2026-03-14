from pydantic import BaseModel
from typing import List


class ChatRequest(BaseModel):
    message: str
    knowledge_files: List[str]
    semantic_search_enabled: bool = False

class ResearchRequest(BaseModel):
    message: str
    knowledge_files: List[str]


class ExecuteRequest(BaseModel):
    plan: str
    knowledge_files: List[str]
