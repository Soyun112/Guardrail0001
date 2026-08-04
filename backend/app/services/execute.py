from __future__ import annotations

from app.gemini_client import generate_text
from app.presets import PRESET_TASKS


def execute_task(task_id: str, task_name: str, project_input: str) -> dict:
    preset = next((t for t in PRESET_TASKS if t["id"] == task_id), None)
    name = task_name or (preset["name"] if preset else task_id)
    project = project_input or "여름 신제품 SNS 캠페인"

    if preset and preset["verdict"] != "green":
        return {
            "ok": False,
            "task_id": task_id,
            "task_name": name,
            "detail": "🟢 AI 주도 업무만 실행할 수 있습니다.",
            "stages": [],
        }

    plan_prompt = f"""프로젝트: {project}
업무: {name}
이 업무를 Gemini로 수행하는 짧은 실행 계획(3~5단계 불릿)을 한국어로 작성하라."""
    plan = generate_text(plan_prompt)

    exec_prompt = f"""프로젝트: {project}
업무: {name}
계획:
{plan}

위 계획에 따라 실제 결과물 초안을 한국어로 작성하라.
시장조사면 경쟁사/트렌드 요약, 카피면 SNS 카피 3안을 포함하라."""
    result_text = generate_text(exec_prompt)

    return {
        "ok": True,
        "task_id": task_id,
        "task_name": name,
        "stages": [
            {"key": "plan", "label": "계획", "content": plan},
            {"key": "execute", "label": "실행 중", "content": "Gemini로 결과물 생성 완료"},
            {"key": "result", "label": "결과", "content": result_text},
        ],
    }
