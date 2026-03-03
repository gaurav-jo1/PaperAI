import os
import tempfile
from pathlib import Path
from docling.document_converter import DocumentConverter
from langchain_community.document_loaders import PyMuPDFLoader
from fastapi import APIRouter, File, UploadFile, HTTPException
import uuid
from langchain_core.documents import Document
from services.file_service import _embed_dense, _embed_sparse, _sync_upsert
import asyncio
from settings.settings import api_settings

router = APIRouter()
converter = DocumentConverter()


@router.post("/")
async def data_upload_file(file: UploadFile = File(...)):

    # file_name = (file.filename.split(".")[0]).strip()

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

async def parse_doc(file: UploadFile, file_name: str):

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    suffix = os.path.splitext(file.filename)[-1]

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        result = converter.convert(tmp_path)
        doc = result.document

        file_id = str(uuid.uuid4())

        nodes = []
        tables_for_postgres = []

        for text_elem in doc.texts or []:
            node = Document(
                page_content=text_elem.text,
                metadata={
                    "element_type": "text",
                    "node_id": str(uuid.uuid4()),
                    "doc_id": file_id,
                    "file_name": file_name,
                }
            )

            nodes.append(node)


        for table_elem in doc.tables or []:
            markdown_table = table_elem.export_to_dataframe(doc=doc)
            df = table_elem.export_to_dataframe(doc=doc)

            table_id = str(uuid.uuid4())

            node = Document(
                page_content=f"{markdown_table}",
                metadata={
                    "element_type": "table",
                    "table_id": table_id,
                    "doc_id": file_id,
                    "table_type": "unknown",  # optional: LLM-tag later
                    "node_id": str(uuid.uuid4()),
                    "file_name": file_name
                }
            )

            nodes.append(node)

            tables_for_postgres.append({
                "table_id": table_id,
                "markdown": markdown_table,
                "dataframe_json": df.to_json(orient="records"),  # or df.to_dict()
            })

        return nodes, tables_for_postgres

    except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    finally:
        os.unlink(tmp_path)

async def insert_pinecone(nodes, file_name):
    BATCH_SIZE = 50

    for i in range(0, len(nodes), BATCH_SIZE):
        batch_chunks = nodes[i: i + BATCH_SIZE]
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
                    "metadata": {
                        **chunk.metadata,
                        "text": chunk.page_content
                    },
                }
            )

        _sync_upsert(records, api_settings.PINECONE_NAMESPACE)

    print(f"{file_name} inserted to Pinecone Successfully")


async def insert_postgres():
    pass

async def process_file(file: UploadFile):
    file_name = (file.filename.split(".")[0]).strip()

    # 1. Parse the Document
    nodes, tables = await parse_doc(file, file_name)

    # 2. Upload to Pinecone
    await insert_pinecone(nodes, file_name)

    # 3. Upload to Postgres
    # await insert_postgres(tables)

    # 4. Upload to GraphDB

@router.post("/new")
async def data_upload_file_new(files: list[UploadFile] = File(...)):

    for file in files:
        await process_file(file)

    return "File Uploaded Succesfully"


        # return {"text": [text.text for text in doc.texts] if doc.texts else "",
        #         "table": [table.export_to_dataframe(doc=doc)
        #          for table in doc.tables] if doc.tables else []}

        # return JSONResponse(content={
        #     "filename": file.filename,
        #     "markdown": doc.export_to_markdown(),       # Full markdown text
        #     "num_pages": len(doc.pages),
        #     "tables": [
        #         table.export_to_dataframe().to_dict()   # Tables as dicts
        #         for table in doc.tables
        #     ] if doc.tables else [],
        # }, status_code=status.HTTP_200_OK)


