from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from db.dependencies import get_db
from services.file_service import process_file_upload, user_id
from db.user_files import UserFiles
from db.pinecone_client import index
from settings.settings import api_settings
import asyncio

router = APIRouter()


@router.post("/upload")
async def upload_data(files: list[UploadFile] = File(...)):

    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    try:
        await asyncio.gather(
            *(process_file_upload(file) for file in files), return_exceptions=True
        )

        return {"message": "Files uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/files")
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
