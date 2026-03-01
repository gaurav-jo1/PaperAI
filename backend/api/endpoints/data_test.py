import os
import tempfile
from pathlib import Path
from fastapi.responses import JSONResponse
from docling.document_converter import DocumentConverter
from langchain_community.document_loaders import PyMuPDFLoader
from fastapi import APIRouter, File, UploadFile, HTTPException, status


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

@router.post("/new")
async def data_upload_file_new(file: UploadFile = File(...)):

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    suffix = os.path.splitext(file.filename)[-1]

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        result = converter.convert(tmp_path)
        doc = result.document

        return JSONResponse(content={
            "filename": file.filename,
            "markdown": doc.export_to_markdown(),       # Full markdown text
            "num_pages": len(doc.pages),
            "tables": [
                table.export_to_dataframe().to_dict()   # Tables as dicts
                for table in doc.tables
            ] if doc.tables else [],
        }, status_code=status.HTTP_200_OK)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        os.unlink(tmp_path)

