import asyncio
import os
import tempfile
import uuid
import tiktoken
from pathlib import Path
from fastapi import UploadFile
from docling.document_converter import DocumentConverter
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from db.database import AsyncSessionLocal
from db.pinecone_client import index, pc
from db.user_files import UserFiles
from settings.settings import api_settings

user_id = "2c117f72-d92f-4b2e-a290-563842bcf65c"
converter = DocumentConverter()
enc = tiktoken.get_encoding("cl100k_base")


def count_tokens(text: str) -> int:
    return len(enc.encode(text))

def _sync_upsert(records, namespace):
    """Upload to Pinecone (BLOCKING I/O)"""
    index.upsert(vectors=records, namespace=namespace)


def _embed_dense(batch_texts):
    return pc.inference.embed(
        model="llama-text-embed-v2",
        inputs=batch_texts,
        parameters={"input_type": "passage", "truncate": "END"},
    )


def _embed_sparse(batch_texts):
    return pc.inference.embed(
        model="pinecone-sparse-english-v0",
        inputs=batch_texts,
        parameters={"input_type": "passage", "truncate": "END"},
    )


def _sync_load_pdf(path):
    """Load PDF and extract pages (BLOCKING I/O)"""
    return converter.convert(path)

def _sync_split_documents(documents):
    """Split documents into chunks (CPU-BOUND)"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        add_start_index=True,
    )
    return text_splitter.split_documents(documents)

def _sync_split_texts(texts):
    """Split texts into chunks (CPU-BOUND)"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        add_start_index=True,
    )
    return text_splitter.split_text(texts)


async def insert_postgres_db(file_name, user_file, db: AsyncSession):
    try:
        db.add(user_file)
        await db.commit()
        print(f"Successfully inserted {file_name[:10]} to database")
    except IntegrityError:
        await db.rollback()
        print(f"{file_name} - File already exists (duplicate key)")
    except Exception as e:
        await db.rollback()
        print(f"ERROR inserting {file_name}: {type(e).__name__}: {e}")
        raise


async def insert_vector_db(documents, file_name, user_file):
    all_splits = await asyncio.to_thread(_sync_split_texts, documents)

    BATCH_SIZE = 50

    for i in range(0, len(all_splits), BATCH_SIZE):
        batch_chunks = all_splits[i : i + BATCH_SIZE]
        batch_texts = [chunk.page_content for chunk in batch_chunks]

        dense_embeddings, sparse_embeddings = await asyncio.gather(
            asyncio.to_thread(_embed_dense, batch_texts),
            asyncio.to_thread(_embed_sparse, batch_texts),
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
                    "metadata": {**chunk.metadata, "text": chunk.page_content},
                }
            )

        await asyncio.to_thread(
            _sync_upsert,
            records,
            api_settings.PINECONE_NAMESPACE,
        )

    print(f"Successfully inserted {file_name[:10]} to Vector Database")


async def process_file_upload(file: UploadFile):
    file_name = (file.filename.split(".")[0]).strip()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_path = tmp_file.name

    async with AsyncSessionLocal() as db:
        try:
            content = await file.read()
            await asyncio.to_thread(lambda: Path(tmp_path).write_bytes(content))
            documents = await asyncio.to_thread(_sync_load_pdf, tmp_path)
            document_markdown = documents.document.export_to_markdown()
            token_len = count_tokens(document_markdown)

            user_file = UserFiles(
                file_name=file_name,
                user_id=user_id,
                number_of_pages=len(documents.pages),
                token_count=token_len,
                markdown_content=document_markdown
            )

            await asyncio.gather(
                insert_postgres_db(file_name, user_file, db),
                # insert_vector_db(document_markdown, file_name, user_file),
            )

        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
