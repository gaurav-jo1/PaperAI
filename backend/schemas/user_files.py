from pydantic import BaseModel


class UserFiles(BaseModel):
    file_name: str
    user_id: str
    file_id: str
    number_of_pages: int

    class Config:
        populate_by_name = True
