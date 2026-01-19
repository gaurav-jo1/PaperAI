from fastapi import APIRouter
from api.endpoints import data, chat

api_router = APIRouter()
api_router.include_router(data.router, prefix="/data", tags=["Data"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
