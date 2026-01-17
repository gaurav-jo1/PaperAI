from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from settings.settings import api_settings

DATABASE_URL = (
    f"postgresql+psycopg2://{api_settings.POSTGRES_USER}:"
    f"{api_settings.POSTGRES_PASSWORD}@"
    f"{api_settings.POSTGRES_HOST}:"
    f"{api_settings.POSTGRES_PORT}/"
    f"{api_settings.POSTGRES_DB}"
)

engine = create_engine(
    DATABASE_URL,
    echo=False,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()
