import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)
    avatar = Column(String, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    books_read = Column(Integer, default=0)
    total_reading_time = Column(Integer, default=0)
    reading_streak = Column(Integer, default=0)
    last_read_date = Column(DateTime, nullable=True)


class Book(Base):
    __tablename__ = "books"
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, default="")
    content = Column(Text, default="")
    chapters = Column(JSON, default=list)
    progress = Column(Float, default=0.0)
    isFavorite = Column(Boolean, default=False)
    added_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_read = Column(DateTime, nullable=True)
    total_pages = Column(Integer, default=0)
    word_count = Column(Integer, default=0)
    tags = Column(JSON, default=list)


class ReadingProgress(Base):
    __tablename__ = "reading_progress"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False)
    book_id = Column(String, nullable=False)
    chapter_index = Column(Integer, default=0)
    page_index = Column(Integer, default=0)
    progress = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class UserFavorite(Base):
    __tablename__ = "user_favorites"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False)
    book_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
