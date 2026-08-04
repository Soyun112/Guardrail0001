from __future__ import annotations

from app.gemini_client import generate_text, parse_json_response
from app.presets import get_preset_guides, is_preset_project


def build_guides(project_input: str, tasks: list[dict]) -> dict:
    if is_preset_project(project_input) or not tasks:
        task_ids = [t.get("id") for t in tasks if t.get("id")] if tasks else None
        guides = get_preset_guides(task_ids)
        return {"source": "preset", "guides": guides}

    # If all tasks already have guide from decompose, reuse
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
    return {"source": "gemini", "guides": data.get("guides") or []}
