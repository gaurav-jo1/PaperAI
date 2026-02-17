from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class UserFiles(BaseModel):
    id: UUID
    file_name: str
    user_id: UUID
    file_id: UUID
    number_of_pages: int
    created_at: datetime

    class Config:
        populate_by_name = True
        from_attributes = True
