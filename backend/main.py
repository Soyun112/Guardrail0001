import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import memory_store
from app.config import settings
from app.presets import APPROVED_AI, MEMBERS, PRESET_PROJECT_NAME
from app.schemas import AssignRequest, DecomposeRequest, ExecuteRequest, GuideRequest
from app.services import decompose as decompose_service
from app.services import execute as execute_service
from app.services import guide as guide_service

app = FastAPI(title="Guiderail", version="0.5.0")

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
        "app": "Guiderail",
        "status": "ok",
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "phase": 5,
        "preset_project": PRESET_PROJECT_NAME,
        "approved_ai": APPROVED_AI,
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "gemini": "configured" if settings.GEMINI_API_KEY else "missing",
        "model": settings.GEMINI_MODEL,
    }


@app.get("/meta")
def meta():
    return {
        "company": "그로우앤코",
        "preset_project": PRESET_PROJECT_NAME,
        "approved_ai": APPROVED_AI,
        "members": MEMBERS,
    }


@app.post("/decompose")
def decompose(body: DecomposeRequest):
    return decompose_service.decompose_project(body.project_input, body.approved_ai)


@app.post("/guide")
def guide(body: GuideRequest):
    return guide_service.build_guides(
        body.project_input,
        body.tasks,
        body.approved_ai,
    )


@app.post("/assign")
def assign(body: AssignRequest):
    saved = memory_store.save_assignments(
        body.project_input,
        [a.model_dump() for a in body.assignments],
    )
    return {"ok": True, "stored": "memory", "record": saved}


@app.post("/execute")
def execute(body: ExecuteRequest):
    return execute_service.execute_task(
        body.task_id,
        body.task_name,
        body.project_input,
        body.verdict,
    )


@app.get("/assignments")
def assignments():
    return {"items": memory_store.list_assignments()}


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", settings.PORT))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
