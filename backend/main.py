from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import auth_router, books_router, agents_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Xoleric API",
    version="1.0.0",
    description="Xoleric kitob o'qish ilovasi backend API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(books_router.router)
app.include_router(agents_router.router)


@app.get("/")
def root():
    return {
        "name": "Xoleric API",
        "version": "1.0.0",
        "description": "Xoleric kitob o'qish ilovasi backend API",
        "endpoints": {
            "health": "/api/health",
            "auth": "/api/auth/*",
            "books": "/api/books/*",
            "agents": "/api/agents/*",
        },
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "xoleric-api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
