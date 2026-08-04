from __future__ import annotations

from app.config import settings
from app.gemini_client import generate_text, parse_json_response
from app.presets import get_preset_guides


def build_guides(project_input: str, tasks: list[dict]) -> dict:
    """Gemini-first guides. Fallback to preset/cached text if needed."""
    if not tasks:
        return {"source": "preset", "guides": get_preset_guides(None)}

    # Prefer guides already attached from decompose
    if all(t.get("guide") for t in tasks):
        guides = [
            {
                "task_id": t.get("id"),
                "task_name": t.get("name"),
                "verdict": t.get("verdict"),
                "recommended_ai": t.get("recommended_ai", "Gemini"),
                "guide": t.get("guide"),
                "how": t.get("guide"),
            }
            for t in tasks
        ]
        return {"source": "cached", "guides": guides}

    if settings.GEMINI_API_KEY:
        try:
            prompt = f"""
프로젝트: {project_input}
업무 목록(JSON): {tasks}

각 업무에 대해 승인 AI(Gemini 또는 Copilot) 활용 가이드를 JSON으로만 출력:
{{
  "guides": [
    {{
      "task_id": "...",
      "task_name": "...",
      "verdict": "green|amber|red",
      "recommended_ai": "Gemini|Copilot",
      "guide": "한 줄",
      "how": "2~3문장 활용법"
    }}
  ]
}}
"""
            raw = generate_text(prompt)
            data = parse_json_response(raw)
            guides = data.get("guides") or []
            if guides:
                return {"source": "gemini", "guides": guides}
        except Exception:
            pass

    task_ids = [t.get("id") for t in tasks if t.get("id")]
    return {"source": "preset_fallback", "guides": get_preset_guides(task_ids)}
