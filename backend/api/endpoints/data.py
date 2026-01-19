import os
import shutil
import tempfile
from sqlalchemy.orm import Session
from pinecone import Pinecone
from fastapi import APIRouter, UploadFile, File, Depends
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from db.user_files import UserFiles
import uuid
from db.database import SessionLocal
from settings.settings import api_settings

pc = Pinecone(api_key=api_settings.PINECONE_API_KEY)

index = pc.Index(
    api_settings.PINECONE_INDEX_NAME,
    host=api_settings.PINECONE_INDEX_HOST,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


router = APIRouter()

user_id = "2c117f72-d92f-4b2e-a290-563842bcf65c"


@router.post("/upload")
async def upload_data(
    db: Session = Depends(get_db), files: list[UploadFile] = File(...)
):
    for i, file in enumerate(files):
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        try:
            loader = PyMuPDFLoader(tmp_path)
            documents = loader.load()

            file_name = (file.filename.split(".")[0]).strip()

            user_files = UserFiles(
                file_name=file_name,
                user_id=user_id,
                file_id=uuid.uuid4(),
                number_of_pages=len(documents),
            )

            try:
                db.add(user_files)
                db.commit()
            except Exception as _:
                db.rollback()
                print(f"{i}- {file.filename} - File already exists")
                continue

            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                add_start_index=True,
            )

            all_splits = text_splitter.split_documents(documents)

            records = []
            for chunk in all_splits:
                records.append(
                    {
                        "id": str(uuid.uuid4()),
                        "text": chunk.page_content,
                        "file_name": file_name,
                        "file_id": str(user_files.file_id),
                        "user_id": str(user_files.user_id),
                        "page": chunk.metadata["page"],
                        "number_of_pages": len(documents),
                        "start_index": chunk.metadata["start_index"],
                    }
                )

            for i in range(0, len(records), 50):
                index.upsert_records(
                    namespace=api_settings.PINECONE_NAMESPACE,
                    records=records[i : i + 50],
                )

            print(f"Uploaded {file.filename} to Pinecone")
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

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


# @router.delete("/files")
# async def delete_files(
#     file_id: str,
#     db: Session = Depends(get_db),
# ):
#     db.query(UserFiles).filter(UserFiles.file_id == file_id).delete()
#     db.commit()
#     return {"message": "File deleted successfully"}
