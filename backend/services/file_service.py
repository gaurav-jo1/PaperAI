import os
import shutil
import tempfile
import uuid
from sqlalchemy.orm import Session
from fastapi import UploadFile
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from db.user_files import UserFiles
from db.pinecone_client import index, pc
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

        batch_size = 50
        for i in range(0, len(all_splits), batch_size):
            batch_chunks = all_splits[i : i + batch_size]
            batch_texts = [chunk.page_content for chunk in batch_chunks]

            dense_embeddings = pc.inference.embed(
                model="llama-text-embed-v2",
                inputs=batch_texts,
                parameters={"input_type": "passage", "truncate": "END"},
            )

            sparse_embeddings = pc.inference.embed(
                model="pinecone-sparse-english-v0",
                inputs=batch_texts,
                parameters={"input_type": "passage", "truncate": "END"},
            )

            records = []
            for j, chunk in enumerate(batch_chunks):
                records.append(
                    {
                        "id": str(uuid.uuid4()),
                        "values": dense_embeddings[j]["values"],
                        "sparse_values": {
                            "indices": sparse_embeddings[j]["sparse_indices"],
                            "values": sparse_embeddings[j]["sparse_values"],
                        },
                        "metadata": {
                            "text": chunk.page_content,
                            "file_name": file_name,
                            "file_id": str(user_files.file_id),
                            "user_id": str(user_files.user_id),
                            "page": chunk.metadata["page"],
                            "number_of_pages": len(documents),
                            "start_index": chunk.metadata["start_index"],
                        },
                    }
                )

            index.upsert(
                vectors=records,
                namespace=api_settings.PINECONE_NAMESPACE,
            )

        print(f"Uploaded {file.filename} to Pinecone")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
