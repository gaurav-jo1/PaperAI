# Crimson

Crimson is a powerful multi-file RAG (Retrieval-Augmented Generation) system designed to provide intelligent answers based on your own collection of documents. It allows users to organize files into folders and selectively use them as a knowledge base for LLM-powered insights.

## 🚀 Features

- **Multi-File RAG**: Upload and index multiple PDF documents simultaneously.
- **Folder-Based Organization**: Organize your knowledge base into logical folders like _Cases_, _Books_, _Research_, etc.
- **Selective Knowledge**: Choose specific files or entire folders to provide context for the LLM.
- **Seamless Integration**: Uses Pinecone for efficient vector search and Google GenAI for high-quality responses.

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (TypeScript, Tailwind CSS)
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Vector Database**: [Pinecone](https://www.pinecone.io/)
- **Database**: PostgreSQL
- **Orchestration**: LangChain
- **LLM**: Google Gemini
- **Infrastructure**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
