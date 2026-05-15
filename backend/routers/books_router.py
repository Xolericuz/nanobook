import os
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
from models import Book, ReadingProgress, UserFavorite, User
from auth import get_current_user
from schemas import (
    BookResponse,
    BookListResponse,
    ProgressUpdate,
    ProgressResponse,
    CategoryCount,
    ReadingStats,
)

router = APIRouter(prefix="/api/books", tags=["books"])


def book_to_response(book: Book, user_id: str = None, db: Session = None) -> BookResponse:
    is_fav = False
    progress_val = 0.0
    last_read = None
    if user_id and db:
        fav = db.query(UserFavorite).filter(
            UserFavorite.user_id == user_id, UserFavorite.book_id == book.id
        ).first()
        is_fav = fav is not None
        rp = db.query(ReadingProgress).filter(
            ReadingProgress.user_id == user_id, ReadingProgress.book_id == book.id
        ).first()
        if rp:
            progress_val = rp.progress
    return BookResponse(
        id=book.id,
        title=book.title,
        author=book.author,
        category=book.category,
        description=book.description or "",
        content=book.content or "",
        chapters=book.chapters or [],
        progress=progress_val,
        isFavorite=is_fav,
        added_at=book.added_at,
        last_read=book.last_read,
        total_pages=book.total_pages,
        word_count=book.word_count,
        tags=book.tags or [],
    )


@router.get("", response_model=BookListResponse)
def list_books(
    category: str = Query(None),
    search: str = Query(None),
    sort: str = Query("added"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Book)
    if category:
        query = query.filter(Book.category == category)
    if search:
        query = query.filter(
            or_(
                Book.title.ilike(f"%{search}%"),
                Book.author.ilike(f"%{search}%"),
                Book.description.ilike(f"%{search}%"),
            )
        )
    sort_map = {
        "title": Book.title,
        "author": Book.author,
        "recent": Book.last_read,
        "added": Book.added_at,
    }
    order_col = sort_map.get(sort, Book.added_at)
    if order_col is not None:
        query = query.order_by(order_col.desc())
    total = query.count()
    books = query.offset((page - 1) * limit).limit(limit).all()
    user_id = payload["sub"]
    book_list = [book_to_response(b, user_id, db) for b in books]
    return BookListResponse(books=book_list, total=total, page=page, limit=limit)


@router.get("/favorites", response_model=list[BookResponse])
def get_favorites(
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = payload["sub"]
    favs = (
        db.query(Book)
        .join(UserFavorite, UserFavorite.book_id == Book.id)
        .filter(UserFavorite.user_id == user_id)
        .all()
    )
    return [book_to_response(b, user_id, db) for b in favs]


@router.get("/categories", response_model=list[CategoryCount])
def get_categories(
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from sqlalchemy import func

    rows = db.query(Book.category, func.count(Book.id)).group_by(Book.category).all()
    return [CategoryCount(category=row[0], count=row[1]) for row in rows]


@router.get("/stats", response_model=ReadingStats)
def get_stats(
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = payload["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    total_books = db.query(ReadingProgress).filter(ReadingProgress.user_id == user_id).count()
    total_pages = (
        db.query(db.query(ReadingProgress).filter(ReadingProgress.user_id == user_id).subquery())
        .count()
    )
    rps = db.query(ReadingProgress).filter(ReadingProgress.user_id == user_id).all()
    page_count = 0
    for rp in rps:
        book = db.query(Book).filter(Book.id == rp.book_id).first()
        if book:
            page_count += int(book.total_pages * rp.progress)
    return ReadingStats(
        total_books=total_books,
        total_pages=page_count,
        total_reading_time=user.total_reading_time if user else 0,
        reading_streak=user.reading_streak if user else 0,
        books_read=user.books_read if user else 0,
    )


@router.get("/{book_id}", response_model=BookResponse)
def get_book(
    book_id: str,
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Kitob topilmadi")
    user_id = payload["sub"]
    book.last_read = datetime.now(timezone.utc)
    db.commit()
    return book_to_response(book, user_id, db)


@router.post("/{book_id}/favorite", response_model=BookResponse)
def toggle_favorite(
    book_id: str,
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Kitob topilmadi")
    user_id = payload["sub"]
    fav = (
        db.query(UserFavorite)
        .filter(UserFavorite.user_id == user_id, UserFavorite.book_id == book_id)
        .first()
    )
    if fav:
        db.delete(fav)
    else:
        db.add(UserFavorite(user_id=user_id, book_id=book_id))
    db.commit()
    return book_to_response(book, user_id, db)


@router.put("/{book_id}/progress", response_model=ProgressResponse)
def save_progress(
    book_id: str,
    data: ProgressUpdate,
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Kitob topilmadi")
    user_id = payload["sub"]
    rp = (
        db.query(ReadingProgress)
        .filter(ReadingProgress.user_id == user_id, ReadingProgress.book_id == book_id)
        .first()
    )
    if rp:
        rp.chapter_index = data.chapter_index
        rp.page_index = data.page_index
        rp.progress = data.progress
        rp.updated_at = datetime.now(timezone.utc)
    else:
        rp = ReadingProgress(
            user_id=user_id,
            book_id=book_id,
            chapter_index=data.chapter_index,
            page_index=data.page_index,
            progress=data.progress,
        )
        db.add(rp)
    db.commit()
    db.refresh(rp)
    return ProgressResponse(
        id=rp.id,
        user_id=rp.user_id,
        book_id=rp.book_id,
        chapter_index=rp.chapter_index,
        page_index=rp.page_index,
        progress=rp.progress,
        updated_at=rp.updated_at,
    )


@router.get("/{book_id}/progress", response_model=ProgressResponse)
def get_progress(
    book_id: str,
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = payload["sub"]
    rp = (
        db.query(ReadingProgress)
        .filter(ReadingProgress.user_id == user_id, ReadingProgress.book_id == book_id)
        .first()
    )
    if not rp:
        return ProgressResponse(user_id=user_id, book_id=book_id)
    return ProgressResponse(
        id=rp.id,
        user_id=rp.user_id,
        book_id=rp.book_id,
        chapter_index=rp.chapter_index,
        page_index=rp.page_index,
        progress=rp.progress,
        updated_at=rp.updated_at,
    )


@router.post("/seed", response_model=dict)
def seed_books(
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_count = db.query(Book).count()
    if current_count > 0:
        return {"message": f"Ma'lumotlar bazasida allaqachon {current_count} ta kitob bor", "count": current_count}
    books_paths = [
        os.path.join(os.path.dirname(__file__), "..", "..", "books", "database.json"),
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "books", "database.json"),
        "/home/kali/nanobook/books/database.json",
    ]
    books_path = None
    for p in books_paths:
        if os.path.exists(p):
            books_path = p
            break
    if not books_path:
        raise HTTPException(status_code=404, detail="database.json topilmadi")
    with open(books_path, "r", encoding="utf-8") as f:
        books_data = json.load(f)
    count = 0
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
        count += 1
    db.commit()
    return {"message": f"{count} ta kitob muvaffaqiyatli qo'shildi", "count": count}
