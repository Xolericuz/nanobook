import random
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import hash_password, verify_password, create_token, get_current_user
from schemas import RegisterRequest, LoginRequest, AuthResponse, UserResponse, ProfileUpdate

router = APIRouter(prefix="/api/auth", tags=["auth"])


def generate_code() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="Bu username allaqachon band")
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Bu email allaqachon band")
    code = generate_code()
    while db.query(User).filter(User.code == code).first():
        code = generate_code()
    user = User(
        username=req.username,
        email=req.email,
        password_hash=hash_password(req.password),
        code=code,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_token(user.id, user.username)
    user_resp = UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        code=user.code,
        avatar=user.avatar or "",
        created_at=user.created_at,
        books_read=user.books_read,
        total_reading_time=user.total_reading_time,
        reading_streak=user.reading_streak,
        last_read_date=user.last_read_date,
    )
    return AuthResponse(user=user_resp, token=token)


@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri")
    token = create_token(user.id, user.username)
    user_resp = UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        code=user.code,
        avatar=user.avatar or "",
        created_at=user.created_at,
        books_read=user.books_read,
        total_reading_time=user.total_reading_time,
        reading_streak=user.reading_streak,
        last_read_date=user.last_read_date,
    )
    return AuthResponse(user=user_resp, token=token)


@router.get("/me", response_model=UserResponse)
def get_me(payload: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        code=user.code,
        avatar=user.avatar or "",
        created_at=user.created_at,
        books_read=user.books_read,
        total_reading_time=user.total_reading_time,
        reading_streak=user.reading_streak,
        last_read_date=user.last_read_date,
    )


@router.patch("/profile", response_model=UserResponse)
def update_profile(
    data: ProfileUpdate,
    payload: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    if data.username is not None:
        existing = db.query(User).filter(User.username == data.username, User.id != user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Bu username band")
        user.username = data.username
    if data.email is not None:
        existing = db.query(User).filter(User.email == data.email, User.id != user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Bu email band")
        user.email = data.email
    if data.avatar is not None:
        user.avatar = data.avatar
    db.commit()
    db.refresh(user)
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        code=user.code,
        avatar=user.avatar or "",
        created_at=user.created_at,
        books_read=user.books_read,
        total_reading_time=user.total_reading_time,
        reading_streak=user.reading_streak,
        last_read_date=user.last_read_date,
    )
