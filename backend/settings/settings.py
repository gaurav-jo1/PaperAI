from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    POSTGRES_HOST: str
    POSTGRES_PORT: str
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    DATABASE_URL: str
    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str
    PINECONE_INDEX_HOST: str
    PINECONE_NAMESPACE: str
    GEMINI_API_KEY: str
    HUGGING_FACE_KEY: str
    ALLOWED_ORIGINS: List[str]


api_settings = Settings()
