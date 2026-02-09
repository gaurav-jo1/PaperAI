import os
import shutil
import tempfile
import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from db.user_files import UserFiles
from db.pinecone_client import index, pc
from settings.settings import api_settings
from sqlalchemy.exc import IntegrityError
from db.database import AsyncSessionLocal

user_id = "2c117f72-d92f-4b2e-a290-563842bcf65c"


def _sync_copy_file(src_file, dest_path):
    """Copy uploaded file to temp location (BLOCKING I/O)"""
    with open(dest_path, "wb") as dest:
        shutil.copyfileobj(src_file, dest)


def _sync_load_pdf(path):
    """Load PDF and extract pages (BLOCKING I/O)"""
    loader = PyMuPDFLoader(path)
    return loader.load()


def _sync_split_documents(documents):
    """Split documents into chunks (CPU-BOUND)"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        add_start_index=True,
    )
    return text_splitter.split_documents(documents)


def _sync_upsert(records, namespace):
    """Upload to Pinecone (BLOCKING I/O)"""
    index.upsert(vectors=records, namespace=namespace)


async def insert_postgres_db(file_name, user_file, db: AsyncSession):

    try:
        db.add(user_file)
        await db.commit()
        print(f"Successfully inserted {file_name} to database")
    except IntegrityError:
        await db.rollback()
        print(f"{file_name} - File already exists (duplicate key)")
    except Exception as e:
        await db.rollback()
        print(f"ERROR inserting {file_name}: {type(e).__name__}: {e}")
        raise


async def insert_vector_db(documents, file_name, user_file):

    all_splits = await asyncio.to_thread(_sync_split_documents, documents)

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
                        "file_id": str(user_file.file_id),
                        "user_id": str(user_file.user_id),
                        "page": chunk.metadata["page"],
                        "number_of_pages": len(documents),
                        "start_index": chunk.metadata["start_index"],
                    },
                }
            )

        await asyncio.to_thread(
            _sync_upsert,
            records,
            api_settings.PINECONE_NAMESPACE,
        )

    print(f"Uploaded {file_name} to Pinecone")


async def process_file_upload(file: UploadFile):

    file_name = (file.filename.split(".")[0]).strip()

    async with AsyncSessionLocal() as db:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_path = tmp_file.name

        try:
            await asyncio.to_thread(_sync_copy_file, file.file, tmp_path)

            documents = await asyncio.to_thread(_sync_load_pdf, tmp_path)

            user_file = UserFiles(
                file_name=file_name,
                user_id=user_id,
                number_of_pages=len(documents),
            )

            await insert_postgres_db(file_name, user_file, db)

            await insert_vector_db(documents, file_name, user_file)

        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
