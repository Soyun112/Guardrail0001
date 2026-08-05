from __future__ import annotations

from fastapi import HTTPException

from app.gemini_client import generate_text, is_quota_error
from app.presets import PRESET_TASKS


def _fallback_stages(task_name: str, project: str, reason: str) -> list[dict]:
    return [
        {
            "key": "plan",
            "label": "계획",
            "content": (
                f"· 프로젝트 목표 재확인: {project}\n"
                f"· 업무 범위 정리: {task_name}\n"
                "· 참고 자료·키워드 수집\n"
                "· 초안 작성 → 팀 리뷰 → 확정"
            ),
        },
        {
            "key": "execute",
            "label": "실행 중",
            "content": reason,
        },
        {
            "key": "result",
            "label": "결과",
            "content": (
                f"[데모 결과물 · {task_name}]\n\n"
                f"프로젝트: {project}\n\n"
                "1) 핵심 메시지\n"
                "   - 한 줄 포지셔닝: 타깃이 바로 이해할 가치 제안\n"
                "   - 톤앤매너: 신뢰감 + 실행력\n\n"
                "2) 실행 초안\n"
                "   - 채널/산출물 목록을 먼저 고정\n"
                "   - 1차 초안 → 검토 체크리스트 → 최종본\n\n"
                "3) 다음 액션\n"
                "   - 담당자 확정 후 마감일·검수 기준 공유\n"
                "   - Gemini 할당량이 회복되면 다시 실행해 실제 초안을 받을 수 있습니다."
            ),
        },
    ]


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

    prompt = f"""당신은 팀 업무 실행 도우미다. 아래 업무를 Gemini로 수행한 결과를 한국어로 작성하라.

프로젝트: {project}
업무: {name}

반드시 다음 두 섹션만, 아래 구분자로 출력하라.

<<<PLAN>>>
(3~5개 불릿의 짧은 실행 계획)

<<<RESULT>>>
(실제 결과물 초안. 시장조사면 경쟁사/트렌드 요약, 전략이면 핵심 메시지·채널 안, 카피면 SNS 카피 3안 포함)
"""

    try:
        raw = generate_text(prompt)
        plan = raw
        result_text = raw
        if "<<<PLAN>>>" in raw and "<<<RESULT>>>" in raw:
            after_plan = raw.split("<<<PLAN>>>", 1)[1]
            plan_part, result_part = after_plan.split("<<<RESULT>>>", 1)
            plan = plan_part.strip()
            result_text = result_part.strip()
        return {
            "ok": True,
            "task_id": task_id,
            "task_name": name,
            "source": "gemini",
            "stages": [
                {"key": "plan", "label": "계획", "content": plan},
                {
                    "key": "execute",
                    "label": "실행 중",
                    "content": "Gemini로 결과물 생성 완료",
                },
                {"key": "result", "label": "결과", "content": result_text},
            ],
        }
    except HTTPException as exc:
        detail = str(exc.detail)
        reason = (
            "Gemini 무료 할당량을 잠시 초과해 데모 결과로 대체했습니다. "
            "약 40초 뒤 다시 시도하면 실제 생성을 받을 수 있습니다."
            if is_quota_error(detail)
            else f"Gemini 호출에 실패해 데모 결과로 대체했습니다. ({detail})"
        )
        return {
            "ok": True,
            "task_id": task_id,
            "task_name": name,
            "source": "fallback",
            "detail": reason,
            "stages": _fallback_stages(name, project, reason),
        }
    except Exception as exc:  # noqa: BLE001
        reason = f"일시 오류로 데모 결과로 대체했습니다. ({exc})"
        return {
            "ok": True,
            "task_id": task_id,
            "task_name": name,
            "source": "fallback",
            "detail": reason,
            "stages": _fallback_stages(name, project, reason),
        }
