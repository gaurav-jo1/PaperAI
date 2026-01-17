from db.database import Base
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy import Column, String, Index, UniqueConstraint, Integer, DateTime, func
import uuid


class UserFiles(Base):
    __tablename__ = "user_files"

    id = Column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False
    )
    file_name = Column(String, nullable=False)
    user_id = Column(PG_UUID(as_uuid=True), nullable=False)
    file_id = Column(PG_UUID(as_uuid=True), nullable=False)
    number_of_pages = Column(Integer, nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        Index("idx_user_files_file_id", "file_id"),
        Index("idx_user_files_user_id", "user_id"),
        UniqueConstraint("file_id", "user_id", name="unique_file_id_user_id"),
        UniqueConstraint("file_name", "user_id", name="unique_file_name_user_id"),
    )
