import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

app = FastAPI(title="가드레일 (Guardrail)", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "app": "가드레일",
        "status": "ok",
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "phase": 1,
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "gemini": "configured" if settings.GEMINI_API_KEY else "missing",
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", settings.PORT))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
