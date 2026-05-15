import os
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./books.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)


def init_db():
    from models import Base, Book

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Book).count() > 0:
            return
        books_paths = [
            os.path.join(os.path.dirname(__file__), "..", "books", "database.json"),
            os.path.join(os.path.dirname(__file__), "..", "..", "books", "database.json"),
            "/home/kali/nanobook/books/database.json",
        ]
        books_path = None
        for p in books_paths:
            if os.path.exists(p):
                books_path = p
                break
        if not books_path:
            return
        with open(books_path, "r", encoding="utf-8") as f:
            books_data = json.load(f)
        for b in books_data:
            chapters = b.get("chapters", [])
            total_pages = sum(len(ch.get("pages", [])) for ch in chapters)
            content = b.get("content", "")
            chapters_json = []
            for ch in chapters:
                chapters_json.append({
                    "id": ch.get("id", ""),
                    "title": ch.get("title", ""),
                    "pages": ch.get("pages", []),
                })
            book = Book(
                id=b.get("id", ""),
                title=b.get("title", ""),
                author=b.get("author", "Noma'lum"),
                category=b.get("category", "Boshqa"),
                description=b.get("description", ""),
                content=content,
                chapters=chapters_json,
                total_pages=total_pages,
                word_count=len(content.split()) if content else 0,
                tags=b.get("tags", []),
            )
            db.add(book)
        db.commit()
    finally:
        db.close()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
