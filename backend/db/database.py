from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from settings.settings import api_settings
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession


DATABASE_URL = (
    f"postgresql+psycopg2://{api_settings.POSTGRES_USER}:"
    f"{api_settings.POSTGRES_PASSWORD}@"
    f"{api_settings.POSTGRES_HOST}:"
    f"{api_settings.POSTGRES_PORT}/"
    f"{api_settings.POSTGRES_DB}"
)

DATABASE_URL_ASYNC = (
    f"postgresql+asyncpg://{api_settings.POSTGRES_USER}:"
    f"{api_settings.POSTGRES_PASSWORD}@"
    f"{api_settings.POSTGRES_HOST}:"
    f"{api_settings.POSTGRES_PORT}/"
    f"{api_settings.POSTGRES_DB}"
)


engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=1800,
)

engine_async = create_async_engine(
    DATABASE_URL_ASYNC,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=1800,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

AsyncSessionLocal = async_sessionmaker(
    engine_async, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()
