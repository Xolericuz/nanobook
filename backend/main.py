from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
import json

from models import init_db, get_db, User, ChatHistory
from auth import hash_password, verify_password, create_token, get_current_user
from ollama_client import list_models, chat_stream, generate_stream


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Ollama Server", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- So'rov va javob modellari ---

class RegisterRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str

class ChatRequest(BaseModel):
    model: str
    message: str
    history: list = []


# --- Auth endpointlari ---

@app.post("/api/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if len(req.username) < 3 or len(req.password) < 4:
        raise HTTPException(400, "Username 3 ta, parol 4 ta belgidan kam bo'lmasligi kerak")
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(400, "Bu username band")
    user = User(username=req.username, password_hash=hash_password(req.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_token(user.id, user.username)
    return TokenResponse(access_token=token, username=user.username)


@app.post("/api/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(401, "Username yoki parol noto'g'ri")
    token = create_token(user.id, user.username)
    return TokenResponse(access_token=token, username=user.username)


# --- Ollama modellari ---

@app.get("/api/models")
async def get_models(user=Depends(get_current_user)):
    try:
        models = await list_models()
        return {"models": models}
    except Exception as e:
        raise HTTPException(503, f"Ollama bilan bog'lanib bo'lmadi: {str(e)}")


# --- Chat ---

@app.post("/api/chat")
async def chat(req: ChatRequest, user=Depends(get_current_user)):
    messages = req.history + [{"role": "user", "content": req.message}]

    async def stream():
        full = ""
        async for chunk in chat_stream(req.model, messages):
            full += chunk
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"

        if user:
            db = next(get_db())
            db.add(ChatHistory(user_id=user["id"], model=req.model, role="user", content=req.message))
            db.add(ChatHistory(user_id=user["id"], model=req.model, role="assistant", content=full))
            db.commit()

    return StreamingResponse(stream(), media_type="text/event-stream")


# --- Foydalanuvchi ma'lumotlari ---

@app.get("/api/me")
def get_me(user=Depends(get_current_user)):
    if not user:
        raise HTTPException(401, "Kirilmagan")
    return user


@app.get("/api/history")
def get_history(user=Depends(get_current_user), db: Session = Depends(get_db)):
    if not user:
        raise HTTPException(401, "Kirilmagan")
    rows = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == user["id"])
        .order_by(ChatHistory.created_at.desc())
        .limit(100)
        .all()
    )
    return [
        {"id": r.id, "model": r.model, "role": r.role, "content": r.content[:200], "created_at": r.created_at.isoformat()}
        for r in rows
    ]


# --- Health check ---

@app.get("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
