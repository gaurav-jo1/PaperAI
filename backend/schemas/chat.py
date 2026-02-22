from pydantic import BaseModel
from typing import List


class ChatRequest(BaseModel):
    message: str
    knowledge_files: List[str]

class ResearchRequest(BaseModel):
    message: str
    knowledge_files: List[str]

class ExecuteRequest(BaseModel):
    session_id: str