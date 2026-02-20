from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from db.dependencies import get_db
from services.file_service import process_file_upload, user_id
from db.user_files import UserFiles
from db.pinecone_client import index
from settings.settings import api_settings
import asyncio
from typing import List
from fastapi import status
from schemas.user_files import UserFiles as UserFilesSchema

router = APIRouter()

MAX_CONCURRENT = 5


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_data_new(files: list[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    semaphore = asyncio.Semaphore(MAX_CONCURRENT)

    async def process_with_semaphore(file):
        async with semaphore:
            return await process_file_upload(file)

    try:
        await asyncio.gather(*(process_with_semaphore(file) for file in files))

        return {"message": "Files uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/files", response_model=List[UserFilesSchema])
async def get_files(db: Session = Depends(get_db)):
    files = db.query(UserFiles).filter(UserFiles.user_id == user_id).all()
    return files


@router.delete("/files")
async def delete_files(db: Session = Depends(get_db)):
    db.query(UserFiles).filter(UserFiles.user_id == user_id).delete()
    db.commit()

    index.delete(
        namespace=api_settings.PINECONE_NAMESPACE, filter={"user_id": {"$eq": user_id}}
    )

    return {"message": "Files deleted successfully"}
