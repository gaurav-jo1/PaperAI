from pinecone import Pinecone
from settings.settings import api_settings

pc = Pinecone(api_key=api_settings.PINECONE_API_KEY)

index = pc.Index(
    api_settings.PINECONE_INDEX_NAME,
    host=api_settings.PINECONE_INDEX_HOST,
)
