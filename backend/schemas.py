from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Any
from datetime import datetime


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=4)


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    code: str
    avatar: Optional[str] = ""
    created_at: Optional[datetime] = None
    books_read: int = 0
    total_reading_time: int = 0
    reading_streak: int = 0
    last_read_date: Optional[datetime] = None


class AuthResponse(BaseModel):
    user: UserResponse
    token: str


class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None


class BookChapter(BaseModel):
    id: str
    title: str
    pages: list[str]


class BookResponse(BaseModel):
    id: str
    title: str
    author: str
    category: str
    description: Optional[str] = ""
    content: Optional[str] = ""
    chapters: Optional[list[Any]] = []
    progress: float = 0.0
    isFavorite: bool = False
    added_at: Optional[datetime] = None
    last_read: Optional[datetime] = None
    total_pages: int = 0
    word_count: int = 0
    tags: Optional[list[str]] = []


class BookListResponse(BaseModel):
    books: list[BookResponse]
    total: int
    page: int
    limit: int


class ProgressUpdate(BaseModel):
    chapter_index: int = 0
    page_index: int = 0
    progress: float = 0.0


class ProgressResponse(BaseModel):
    id: Optional[int] = None
    user_id: str
    book_id: str
    chapter_index: int = 0
    page_index: int = 0
    progress: float = 0.0
    updated_at: Optional[datetime] = None


class CategoryCount(BaseModel):
    category: str
    count: int


class AgentInfo(BaseModel):
    name: str
    status: str
    model: str
    description: Optional[str] = ""


class AgentLog(BaseModel):
    agent: str
    message: str
    timestamp: Optional[datetime] = None


class ReadingStats(BaseModel):
    total_books: int = 0
    total_pages: int = 0
    total_reading_time: int = 0
    reading_streak: int = 0
    books_read: int = 0
