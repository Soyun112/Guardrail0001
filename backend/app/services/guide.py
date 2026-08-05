from __future__ import annotations

from app.config import settings
from app.gemini_client import generate_text, parse_json_response
from app.presets import APPROVED_AI, get_preset_guides


def _resolve_approved(approved_ai: list[str] | None) -> list[str]:
    cleaned = [a.strip() for a in (approved_ai or []) if a and str(a).strip()]
    return cleaned or list(APPROVED_AI)


def _clamp_ai(name: str | None, approved: list[str]) -> str:
    if name and name in approved:
        return name
    return approved[0]


def build_guides(
    project_input: str,
    tasks: list[dict],
    approved_ai: list[str] | None = None,
) -> dict:
    approved = _resolve_approved(approved_ai)

    if not tasks:
        guides = get_preset_guides(None)
        for g in guides:
            g["recommended_ai"] = _clamp_ai(g.get("recommended_ai"), approved)
        return {"source": "preset", "guides": guides, "approved_ai": approved}

    if all(t.get("guide") for t in tasks):
        guides = [
            {
                "task_id": t.get("id"),
                "task_name": t.get("name"),
                "verdict": t.get("verdict"),
                "recommended_ai": _clamp_ai(t.get("recommended_ai"), approved),
                "guide": t.get("guide"),
                "how": t.get("guide"),
            }
            for t in tasks
        ]
        return {"source": "cached", "guides": guides, "approved_ai": approved}

    if settings.GEMINI_API_KEY:
        try:
            allowed = " | ".join(approved)
            prompt = f"""
프로젝트: {project_input}
승인 AI 목록: {approved}
업무 목록(JSON): {tasks}

각 업무에 대해 승인 AI 활용 가이드를 JSON으로만 출력.
recommended_ai는 [{allowed}] 중 하나만.
{{
  "guides": [
    {{
      "task_id": "...",
      "task_name": "...",
      "verdict": "green|amber|red",
      "recommended_ai": "{approved[0]}",
      "guide": "한 줄",
      "how": "2~3문장 활용법"
    }}
  ]
}}
"""
            raw = generate_text(prompt)
            data = parse_json_response(raw)
            guides = data.get("guides") or []
            for g in guides:
                g["recommended_ai"] = _clamp_ai(g.get("recommended_ai"), approved)
            if guides:
                return {"source": "gemini", "guides": guides, "approved_ai": approved}
        except Exception:
            pass

    task_ids = [t.get("id") for t in tasks if t.get("id")]
    guides = get_preset_guides(task_ids)
    for g in guides:
        g["recommended_ai"] = _clamp_ai(g.get("recommended_ai"), approved)
    return {"source": "preset_fallback", "guides": guides, "approved_ai": approved}
