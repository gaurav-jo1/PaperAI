import os
import tempfile
from pathlib import Path
from docling.document_converter import DocumentConverter
from langchain_community.document_loaders import PyMuPDFLoader
from fastapi import APIRouter, File, UploadFile, HTTPException
import uuid
from langchain_core.documents import Document
from services.file_service import (
    _embed_dense,
    _embed_sparse,
    _sync_upsert,
    _sync_split_texts,
)
import asyncio
from settings.settings import api_settings
from services.file_service import user_id
from db.database import AsyncSessionLocal
from sqlalchemy.exc import IntegrityError
from db.user_files import UserFiles


router = APIRouter()
converter = DocumentConverter()


@router.post("/")
async def data_upload_file(file: UploadFile = File(...)):

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_path = tmp_file.name

        try:
            content = await file.read()
            Path(tmp_path).write_bytes(content)
            loader = PyMuPDFLoader(tmp_path)
            doc = loader.load()
            return doc

        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)


async def parse_doc(file: UploadFile, file_name: str, file_id: str):

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    suffix = os.path.splitext(file.filename)[-1]

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        result = converter.convert(tmp_path)
        doc = result.document

        pages_len = len(doc.pages)

        nodes = []

        # Text
        for text_elem in doc.texts or []:
            all_split = _sync_split_texts(text_elem.text)

            for chunk_text in all_split:
                node = Document(
                    id=str(uuid.uuid4()),
                    page_content=chunk_text,
                    metadata={
                        "element_type": "text",
                        "node_id": str(uuid.uuid4()),
                        "file_id": file_id,
                        "file_name": file_name,
                        "user_id": user_id,
                    },
                )

                nodes.append(node)

        # Table
        for table_elem in doc.tables or []:
            markdown_table = table_elem.export_to_dataframe(doc=doc)

            table_id = str(uuid.uuid4())

            node = Document(
                id=str(uuid.uuid4()),
                page_content=f"{markdown_table}",
                metadata={
                    "element_type": "table",
                    "table_id": table_id,
                    "file_id": file_id,
                    "table_type": "unknown",  # optional: LLM-tag later
                    "node_id": str(uuid.uuid4()),
                    "file_name": file_name,
                    "user_id": user_id,
                },
            )

            nodes.append(node)

        return nodes, pages_len

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        os.unlink(tmp_path)


async def insert_pinecone(nodes, file_name):
    BATCH_SIZE = 50

    for i in range(0, len(nodes), BATCH_SIZE):
        batch_chunks = nodes[i : i + BATCH_SIZE]
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

        _sync_upsert(records, api_settings.PINECONE_NAMESPACE)

    print(f"{file_name} inserted to Pinecone Successfully")


async def insert_postgres(db, user_file, file_name):
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


async def process_file(file: UploadFile):
    async with AsyncSessionLocal() as db:
        file_name, file_id = (file.filename.split(".")[0]).strip(), str(uuid.uuid4())

        # 1. Parse the Document
        nodes, pages_len = await parse_doc(file, file_name, file_id)

        user_file = UserFiles(
            file_name=file_name,
            user_id=user_id,
            number_of_pages=pages_len,
            file_id=file_id,
        )

        # 2. Upload to Pinecone
        await insert_pinecone(nodes, file_name)

        # 3. Upload to Postgres
        await insert_postgres(db, user_file, file_name)

        return nodes
        # 4. Upload to GraphDB


@router.post("/new")
async def data_upload_file_new(files: list[UploadFile] = File(...)):

    for file in files:
        nodes = await process_file(file)

    return nodes
