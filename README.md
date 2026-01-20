# PaperAI

PaperAI is a powerful multi-file RAG (Retrieval-Augmented Generation) system designed to provide intelligent answers based on your own collection of documents. It allows users to organize files into folders and selectively use them as a knowledge base for LLM-powered insights.

## 🚀 Features

- **Multi-File RAG**: Upload and index multiple PDF documents simultaneously.
- **Folder-Based Organization**: Organize your knowledge base into logical folders like _Cases_, _Books_, _Research_, etc.
- **Selective Knowledge**: Choose specific files or entire folders to provide context for the LLM.
- **Seamless Integration**: Uses Pinecone for efficient vector search and Llama-3.1 for high-quality responses.

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (TypeScript, Tailwind CSS)
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Vector Database**: [Pinecone](https://www.pinecone.io/)
- **Database**: PostgreSQL
- **Orchestration**: LangChain/LangGraph
- **LLM**: meta-llama/Llama-3.1-8B-Instruct
- **Model Hub**: Hugging Face
- **Infrastructure**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
