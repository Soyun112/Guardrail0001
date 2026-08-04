from __future__ import annotations

from fastapi import HTTPException

from app import memory_store
from app.config import settings
from app.gemini_client import generate_text, parse_json_response
from app.presets import (
    APPROVED_AI,
    COMPANY,
    MEMBERS,
    get_preset_decompose_response,
)


SYSTEM = """당신은 B2B AI 가드레일 어시스턴트다.
프로젝트를 상위 업무 4~8개로 분해하고 각 업무를 green/amber/red로 판정한다.
신호등 의미:
- green = AI 주도(사람 확인만)
- amber = AI+사람 협업(사람 검토 필수)
- red = 사람 주도(AI는 참고)
판정 3축: 정확성이 치명적인가 / 되돌릴 수 있나 / 판단·책임이 필요한가
원인유형(amber/red만): 데이터 부족형 / 모델 한계형 / 정확도 리스크형 / 도구 연동형
추천 AI는 Gemini 또는 Copilot만.
JSON만 출력한다."""


def _normalize_tasks(tasks: list) -> list:
    normalized = []
    for i, task in enumerate(tasks or [], start=1):
        item = dict(task)
        item.setdefault("id", f"task-{i}")
        item.setdefault("order_index", i)
        item.setdefault("guide", "")
        item.setdefault("recommended_ai", "Gemini")
        reason = item.get("reason") or {}
        if not isinstance(reason, dict):
            reason = {"summary": str(reason)}
        reason.setdefault("accuracy_critical", False)
        reason.setdefault("reversible", True)
        reason.setdefault("judgment_required", False)
        reason.setdefault("summary", "")
        item["reason"] = reason
        if item.get("verdict") == "green":
            item["cause_type"] = None
        normalized.append(item)
    return normalized


def _gemini_decompose(project_input: str) -> dict:
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
        "accuracy_critical": true,
        "reversible": true,
        "judgment_required": false,
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
- 업무 4~8개, order_index는 워크플로 수행 순서
- amber/red만 cause_type 지정, green은 null
- recommended_ai는 Gemini 또는 Copilot만
"""
    raw = generate_text(prompt, SYSTEM)
    data = parse_json_response(raw)
    tasks = _normalize_tasks(data.get("tasks") or [])
    if not tasks:
        raise HTTPException(status_code=502, detail="Gemini가 업무를 반환하지 않았습니다.")

    return {
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


def decompose_project(project_input: str) -> dict:
    """Gemini-first. Preset is fallback only when key missing or Gemini fails."""
    text = (project_input or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="project_input이 비어 있습니다.")

    if settings.GEMINI_API_KEY:
        try:
            result = _gemini_decompose(text)
            memory_store.save_project(
                result["project"]["raw_input"],
                result["project"]["goal"],
                result["tasks"],
            )
            return result
        except HTTPException:
            # fall through to preset for demo resilience
            pass
        except Exception:
            pass

    result = get_preset_decompose_response(text)
    result["source"] = "preset_fallback" if settings.GEMINI_API_KEY else "preset"
    memory_store.save_project(
        result["project"]["raw_input"],
        result["project"]["goal"],
        result["tasks"],
    )
    return result
