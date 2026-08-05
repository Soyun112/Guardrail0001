from __future__ import annotations

from fastapi import HTTPException

from app.gemini_client import generate_text, is_quota_error
from app.presets import PRESET_TASKS


def _fallback_stages(
    task_name: str,
    project: str,
    reason: str,
    *,
    mode: str,
) -> list[dict]:
    if mode == "amber":
        result = (
            f"[협업 초안 · {task_name}]\n\n"
            f"프로젝트: {project}\n\n"
            "1) 바로 쓸 프롬프트\n"
            f"   - '{task_name}' 초안을 표/불릿으로 작성해줘. 추측 수치는 넣지 마.\n\n"
            "2) AI 초안 (데모)\n"
            "   - 핵심 메시지 3개\n"
            "   - 실행 체크리스트 5개\n\n"
            "3) 사람 검증 포인트\n"
            "   - 브랜드 톤 / 사실 확인 / 일정·예산 가능 여부\n"
            "   - 확인 후 최종본으로 확정\n\n"
            f"참고: {reason}"
        )
        execute_label = "협업 초안·프롬프트 준비 완료 (사람 검증 필요)"
    else:
        result = (
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
            f"   - {reason}"
        )
        execute_label = reason

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
            "content": execute_label,
        },
        {
            "key": "result",
            "label": "사람 검증용 초안" if mode == "amber" else "결과",
            "content": result,
        },
    ]


def _prompt_for(mode: str, project: str, name: str) -> str:
    if mode == "amber":
        return f"""당신은 팀 협업 도우미다. 이 업무는 AI+사람 협업(🟡)이다.
AI는 최종 확정하지 말고, 사람이 검증·확정할 수 있게 프롬프트와 초안을 준비하라.

프로젝트: {project}
업무: {name}

반드시 다음 섹션만, 아래 구분자로 한국어 출력.

<<<PLAN>>>
(사람이 따라 할 3~5단계. 어디에 어떤 프롬프트를 넣고, 결과를 어떻게 넘기는지)

<<<RESULT>>>
다음을 모두 포함:
1) 바로 복사해 쓸 프롬프트 예시 2개 (승인 AI에 붙여넣기용)
2) AI가 만들 초안 샘플 (완성본처럼 보이되 상단에 '초안 · 사람 검증 필요' 표시)
3) 사람 검증 체크리스트 4~6개 (톤/사실/리스크/일정 등)
확정 문구·최종 승인 문장은 쓰지 말 것.
"""

    # green — AI-led draft deliverable
    return f"""당신은 팀 업무 실행 도우미다. 이 업무는 AI 주도(🟢)다.
실무에 바로 쓸 결과물 초안을 한국어로 작성하라. (가벼운 사실 확인만 사람이 하면 됨)

프로젝트: {project}
업무: {name}

반드시 다음 두 섹션만, 아래 구분자로 출력하라.

<<<PLAN>>>
(3~5개 불릿의 짧은 실행 계획)

<<<RESULT>>>
(실제 결과물 초안. 시장조사면 경쟁사/트렌드 요약, 전략이면 핵심 메시지·채널 안, 카피면 SNS 카피 3안 포함)
"""


def execute_task(
    task_id: str,
    task_name: str,
    project_input: str,
    verdict: str | None = None,
) -> dict:
    # Gemini-decomposed tasks often reuse ids like task-1; only treat as preset
    # when the name also matches the curated demo task.
    preset = next((t for t in PRESET_TASKS if t["id"] == task_id), None)
    if preset and task_name and preset.get("name") != task_name:
        preset = None

    name = task_name or (preset["name"] if preset else task_id)
    project = project_input or "여름 신제품 SNS 캠페인"
    effective = (verdict or (preset["verdict"] if preset else "green") or "green").lower()

    if effective == "red":
        return {
            "ok": False,
            "task_id": task_id,
            "task_name": name,
            "detail": "🔴 사람 주도 업무는 자동 실행하지 않습니다. 가이드의 참고 자료만 활용하세요.",
            "stages": [],
        }

    if effective not in ("green", "amber"):
        return {
            "ok": False,
            "task_id": task_id,
            "task_name": name,
            "detail": "🟢 AI 주도 또는 🟡 협업 업무만 실행할 수 있습니다.",
            "stages": [],
        }

    mode = "amber" if effective == "amber" else "green"
    prompt = _prompt_for(mode, project, name)

    try:
        raw = generate_text(prompt)
        plan = raw
        result_text = raw
        if "<<<PLAN>>>" in raw and "<<<RESULT>>>" in raw:
            after_plan = raw.split("<<<PLAN>>>", 1)[1]
            plan_part, result_part = after_plan.split("<<<RESULT>>>", 1)
            plan = plan_part.strip()
            result_text = result_part.strip()

        if mode == "amber":
            stages = [
                {"key": "plan", "label": "협업 절차", "content": plan},
                {
                    "key": "execute",
                    "label": "실행 중",
                    "content": "프롬프트·초안 준비 완료 — 사람 검증 후 확정하세요",
                },
                {
                    "key": "result",
                    "label": "사람 검증용 초안",
                    "content": result_text,
                },
            ]
        else:
            stages = [
                {"key": "plan", "label": "계획", "content": plan},
                {
                    "key": "execute",
                    "label": "실행 중",
                    "content": "결과물 초안 생성 완료",
                },
                {"key": "result", "label": "결과", "content": result_text},
            ]

        return {
            "ok": True,
            "task_id": task_id,
            "task_name": name,
            "source": "gemini",
            "mode": mode,
            "stages": stages,
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
            "mode": mode,
            "detail": reason,
            "stages": _fallback_stages(name, project, reason, mode=mode),
        }
    except Exception as exc:  # noqa: BLE001
        reason = f"일시 오류로 데모 결과로 대체했습니다. ({exc})"
        return {
            "ok": True,
            "task_id": task_id,
            "task_name": name,
            "source": "fallback",
            "mode": mode,
            "detail": reason,
            "stages": _fallback_stages(name, project, reason, mode=mode),
        }
