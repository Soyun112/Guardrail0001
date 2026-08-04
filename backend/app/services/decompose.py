from __future__ import annotations

from app import memory_store
from app.gemini_client import generate_text, parse_json_response
from app.presets import (
    APPROVED_AI,
    COMPANY,
    MEMBERS,
    get_preset_decompose_response,
    is_preset_project,
)


SYSTEM = """당신은 B2B AI 가드레일 어시스턴트다.
프로젝트를 상위 업무 4~8개로 분해하고 각 업무를 green/amber/red로 판정한다.
JSON만 출력한다."""


def decompose_project(project_input: str) -> dict:
    if is_preset_project(project_input):
        result = get_preset_decompose_response(project_input)
        memory_store.save_project(
            result["project"]["raw_input"],
            result["project"]["goal"],
            result["tasks"],
        )
        return result

    prompt = f"""
프로젝트 입력: {project_input}

다음 JSON 스키마로만 답하라:
{{
  "goal": "한 줄 목표",
  "tasks": [
    {{
      "id": "task-1",
      "name": "업무명",
      "verdict": "green|amber|red",
      "reason": {{
        "accuracy_critical": true/false,
        "reversible": true/false,
        "judgment_required": true/false,
        "summary": "한 줄 근거"
      }},
      "cause_type": "데이터 부족형|모델 한계형|정확도 리스크형|도구 연동형|null",
      "recommended_ai": "Gemini|Copilot",
      "guide": "승인 AI 활용 한 줄 가이드",
      "order_index": 1
    }}
  ]
}}

규칙:
- green=AI 주도(사람 확인만), amber=협업(사람 검토 필수), red=사람 주도
- recommended_ai는 Gemini 또는 Copilot만
- amber/red만 cause_type 지정, green은 null
- 업무 4~8개, order_index는 워크플로 순서
"""
    raw = generate_text(prompt, SYSTEM)
    data = parse_json_response(raw)
    tasks = data.get("tasks") or []
    for i, task in enumerate(tasks, start=1):
        task.setdefault("id", f"task-{i}")
        task.setdefault("order_index", i)
        task.setdefault("guide", "")
        task.setdefault("recommended_ai", "Gemini")
        if task.get("verdict") == "green":
            task["cause_type"] = None

    result = {
        "source": "gemini",
        "company": COMPANY,
        "project": {
            "raw_input": project_input.strip(),
            "goal": data.get("goal") or project_input.strip(),
        },
        "approved_ai": APPROVED_AI,
        "members": MEMBERS,
        "tasks": tasks,
        "workflow_order": [
            t["id"] for t in sorted(tasks, key=lambda x: x.get("order_index", 0))
        ],
    }
    memory_store.save_project(
        result["project"]["raw_input"],
        result["project"]["goal"],
        result["tasks"],
    )
    return result
