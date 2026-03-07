from huggingface_hub import InferenceClient
from settings.settings import api_settings

client = InferenceClient(api_key=api_settings.HF_TOKEN)
