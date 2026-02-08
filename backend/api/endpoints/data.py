from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from db.dependencies import get_db
from services.file_service import process_file_upload, user_id
from db.user_files import UserFiles

router = APIRouter()


@router.post("/upload")
async def upload_data(
    db: Session = Depends(get_db), files: list[UploadFile] = File(...)
):
    for file in files:
        await process_file_upload(file, db)

    return {"message": "Files uploaded successfully"}


@router.get("/files")
async def get_files(db: Session = Depends(get_db)):
    files = db.query(UserFiles).filter(UserFiles.user_id == user_id).all()
    return files


@router.delete("/files")
async def delete_files(db: Session = Depends(get_db)):
    db.query(UserFiles).filter(UserFiles.user_id == user_id).delete()
    db.commit()
    return {"message": "Files deleted successfully"}
