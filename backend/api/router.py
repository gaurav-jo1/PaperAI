from fastapi import APIRouter
from api.endpoints import chat, data_v1, data_v2

api_router = APIRouter()
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(data_v1.router, prefix="/v1/data", tags=["Data V1"])
api_router.include_router(data_v2.router, prefix="/v2/data", tags=["Data V2"])
