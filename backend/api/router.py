from fastapi import APIRouter
from api.endpoints import data, chat, data_test

api_router = APIRouter()
api_router.include_router(data.router, prefix="/data", tags=["Data"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(data_test.router, prefix="/test", tags=["Test"])
