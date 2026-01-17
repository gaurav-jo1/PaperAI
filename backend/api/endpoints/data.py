from fastapi import APIRouter, File, UploadFile

router = APIRouter()


@router.post("/upload")
async def upload_data(files: list[UploadFile] = File(...)):
    for i, file in enumerate(files):
        print(f"File {i}: {file.filename}")

    return {"message": "Files uploaded successfully"}


# post [files]

# 1. Parse
# 2. Upload it on the database (postgresql)
# 3. Upload it to the vector Database (pinecone)
# 4. Return the file to the user UI

# get - auto call when user logs in
