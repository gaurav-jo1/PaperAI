import os
import shutil
import tempfile
import uuid
from sqlalchemy.orm import Session
from fastapi import UploadFile
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from db.user_files import UserFiles
from db.pinecone_client import index
from settings.settings import api_settings

user_id = "2c117f72-d92f-4b2e-a290-563842bcf65c"


async def process_file_upload(file: UploadFile, db: Session):
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
            print(f"{file.filename} - File already exists")
            return

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
