from fastapi import APIRouter
from api.endpoints import data

api_router = APIRouter()
api_router.include_router(data.router, prefix="/data", tags=["Data"])
