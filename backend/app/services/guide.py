from __future__ import annotations

import json

from app.ai_match import pick_approved_ai
from app.config import settings
from app.gemini_client import generate_text, parse_json_response
from app.guide_workflows import PRESET_GUIDE_WORKFLOWS, build_rich_guide_from_preset
from app.presets import APPROVED_AI, PRESET_TASKS, is_preset_project


SYSTEM_GUIDE = """당신은 B2B 팀의 AI 업무 가이드 작성자다.
승인된 AI 목록 안에서만 도구를 추천하고, 실무자가 그대로 따라 할 수 있는 단계별 워크플로를 만든다.
반드시 JSON만 출력한다. 코드펜스·설명 문장 금지."""


def _resolve_approved(approved_ai: list[str] | None) -> list[str]:
    cleaned = [a.strip() for a in (approved_ai or []) if a and str(a).strip()]
    return cleaned or list(APPROVED_AI)


def _remap_steps(steps: list[dict], approved: list[str], primary: str) -> list[dict]:
    remapped: list[dict] = []
    for raw in steps or []:
        step = dict(raw)
        tool = str(step.get("tool") or "").strip() or primary
        if tool in ("사람", "Human", "human"):
            step["tool"] = "사람"
        else:
            chosen, _note = pick_approved_ai(tool, tool, approved)
            # If tool was a role hint like "Perplexity", pick_approved may substitute.
            step["tool"] = chosen
        step.setdefault("order", len(remapped) + 1)
        step.setdefault("title", f"{step['order']}단계")
        step.setdefault("instruction", "")
        step.setdefault("prompt_example", "")
        remapped.append(step)
    return remapped


def _finalize_guide(guide: dict, approved: list[str]) -> dict:
    preferred = guide.get("recommended_ai")
    name = guide.get("task_name") or ""
    chosen, note = pick_approved_ai(name, preferred, approved)
    steps = _remap_steps(guide.get("steps") or [], approved, chosen)
    if not steps:
        steps = _default_steps(name, guide.get("verdict") or "amber", chosen)

    summary = (guide.get("summary") or guide.get("guide") or "").strip()
    if not summary and steps:
        summary = steps[0].get("instruction") or f"{chosen}로 초안 후 검토"

    how = guide.get("how") or " → ".join(
        f"{s.get('order', i + 1)}. [{s.get('tool')}] {s.get('title')}"
        for i, s in enumerate(steps)
    )

    human = (guide.get("human_checkpoint") or "").strip()
    if not human:
        human = _default_human_checkpoint(guide.get("verdict") or "amber")

    caution = (guide.get("caution") or "").strip() or "프롬프트에 없는 수치·사실을 AI가 지어내지 않게 하세요."

    # Prefer primary tool = most used non-human tool in steps
    tools = [s["tool"] for s in steps if s.get("tool") and s["tool"] != "사람"]
    if tools:
        chosen = tools[0]
        # keep substitution note if preferred differed
        if preferred and preferred not in approved:
            note = note or f"승인된 {chosen}로 대체"

    return {
        "task_id": guide.get("task_id"),
        "task_name": guide.get("task_name"),
        "verdict": guide.get("verdict"),
        "recommended_ai": chosen,
        "recommended_ai_note": note,
        "summary": summary,
        "guide": summary,
        "how": how,
        "steps": steps,
        "human_checkpoint": human,
        "caution": caution,
    }


def _default_human_checkpoint(verdict: str) -> str:
    if verdict == "green":
        return "🟢 AI 주도 — AI가 초안·조사를 수행하고, 사람은 사실·톤만 확인합니다."
    if verdict == "amber":
        return "🟡 협업 — AI 초안까지, 방향·확정부터는 사람이 개입합니다."
    return "🔴 사람 주도 — 사람이 판단을 이끌고, AI는 참고 자료만 제공합니다."


def _default_steps(task_name: str, verdict: str, ai: str) -> list[dict]:
    steps = [
        {
            "order": 1,
            "title": "맥락 입력",
            "tool": ai,
            "instruction": f"프로젝트 목표와 '{task_name}' 범위를 {ai}에 알려 초안 틀을 받는다.",
            "prompt_example": f"프로젝트 맥락을 반영해 '{task_name}' 실행 초안을 단계와 산출물 중심으로 작성해줘.",
        },
        {
            "order": 2,
            "title": "결과물 구체화",
            "tool": ai,
            "instruction": "1단계 출력을 붙여 넣고 실제 쓸 초안(표·문장·체크리스트)으로 구체화한다.",
            "prompt_example": "아래 초안을 실무 산출물 형태로 다듬어줘. 추측 수치는 넣지 마.\n\n[1단계 결과]",
        },
    ]
    if verdict == "green":
        steps.append(
            {
                "order": 3,
                "title": "빠른 확인",
                "tool": "사람",
                "instruction": "사실·톤만 확인하고 공유한다.",
                "prompt_example": "",
            }
        )
    elif verdict == "amber":
        steps.append(
            {
                "order": 3,
                "title": "사람 검토·확정",
                "tool": "사람",
                "instruction": "방향·브랜드·일정 가능 여부를 검토한 뒤 확정한다.",
                "prompt_example": "",
            }
        )
    else:
        steps = [
            {
                "order": 1,
                "title": "참고 자료만 수집",
                "tool": ai,
                "instruction": f"결정은 사람이 한다. {ai}에는 비교 자료·체크리스트만 요청한다.",
                "prompt_example": f"'{task_name}' 결정에 필요한 체크리스트와 비교 관점만 제안해줘. 최종 결정은 하지 마.",
            },
            {
                "order": 2,
                "title": "사람 의사결정",
                "tool": "사람",
                "instruction": "책임자가 기준을 적용해 최종 결정하고 시스템에 직접 반영한다.",
                "prompt_example": "",
            },
        ]
    return steps


def _guides_from_preset_tasks(tasks: list[dict], approved: list[str]) -> list[dict]:
    out: list[dict] = []
    for t in tasks:
        rich = build_rich_guide_from_preset(t)
        if rich:
            out.append(_finalize_guide(rich, approved))
            continue
        # Unknown id but may match preset name
        match = next((p for p in PRESET_TASKS if p["name"] == t.get("name")), None)
        if match:
            cloned = {**match, "id": t.get("id") or match["id"], "name": t.get("name") or match["name"]}
            rich = build_rich_guide_from_preset(cloned)
            if rich:
                rich["task_id"] = cloned["id"]
                rich["verdict"] = t.get("verdict") or rich["verdict"]
                out.append(_finalize_guide(rich, approved))
                continue
        out.append(
            _finalize_guide(
                {
                    "task_id": t.get("id"),
                    "task_name": t.get("name"),
                    "verdict": t.get("verdict"),
                    "recommended_ai": t.get("recommended_ai"),
                    "summary": t.get("guide") or "",
                    "steps": [],
                },
                approved,
            )
        )
    return out


def _gemini_guides(
    project_input: str,
    tasks: list[dict],
    approved: list[str],
) -> list[dict]:
    slim_tasks = [
        {
            "task_id": t.get("id"),
            "task_name": t.get("name"),
            "verdict": t.get("verdict"),
        }
        for t in tasks
    ]
    allowed = ", ".join(approved)
    prompt = f"""
프로젝트: {project_input}
승인 AI 목록(이 목록 밖 도구 이름 사용 금지. '사람'만 예외): [{allowed}]

업무 목록:
{json.dumps(slim_tasks, ensure_ascii=False)}

각 업무마다 실무 워크플로 가이드를 작성하라.

규칙:
1) recommended_ai와 steps[].tool은 승인 AI 목록 또는 "사람"만 사용.
2) 업무 성격에 맞게 배정:
   - 최신 검색·리서치 → Perplexity 계열(없으면 승인 목록 중 가장 가까운 것)
   - 긴 글·분석·카피 → Claude 계열
   - 범용·멀티모달 → Gemini 계열
   - 오피스 문서 → Copilot 계열
   - 디자인·콘텐츠 → Canva 계열
   - 자율 실행형 큰 작업 → Manus/Genspark 계열
3) 원하는 도구가 승인 목록에 없으면 있는 것으로 대체하고 recommended_ai_note에 "승인된 X로 대체" 명시.
4) steps는 3~5개. 각 step은 이전 결과를 다음에 어떻게 넘기는지(핸드오프)를 instruction에 포함.
5) prompt_example은 사람이 아닌 단계에서 실제로 붙여넣을 문장. 사람 단계는 빈 문자열.
6) human_checkpoint: 🟡/🔴는 "여기까지 AI, 여기부터 사람"을 명확히 적는다.
7) caution: 이 업무에서 AI가 실수하기 쉬운 점.
8) summary: 한 줄 요약(steps와 중복되는 긴 설명 금지).

JSON 스키마:
{{
  "guides": [
    {{
      "task_id": "...",
      "task_name": "...",
      "verdict": "green|amber|red",
      "recommended_ai": "{approved[0]}",
      "recommended_ai_note": null,
      "summary": "한 줄 요약",
      "steps": [
        {{
          "order": 1,
          "title": "단계 제목",
          "tool": "{approved[0]}",
          "instruction": "무엇을 입력하고 결과를 어디에 넘기는지",
          "prompt_example": "실제 프롬프트 예문"
        }}
      ],
      "human_checkpoint": "개입 지점 설명",
      "caution": "주의사항"
    }}
  ]
}}
"""
    raw = generate_text(prompt, system_instruction=SYSTEM_GUIDE)
    data = parse_json_response(raw)
    guides = data.get("guides") or []
    # Align missing task ids from input order
    by_id = {g.get("task_id"): g for g in guides if g.get("task_id")}
    ordered: list[dict] = []
    for t in tasks:
        g = by_id.get(t.get("id"))
        if not g:
            # try match by name
            g = next(
                (x for x in guides if x.get("task_name") == t.get("name")),
                {
                    "task_id": t.get("id"),
                    "task_name": t.get("name"),
                    "verdict": t.get("verdict"),
                    "recommended_ai": t.get("recommended_ai"),
                    "summary": t.get("guide") or "",
                    "steps": [],
                },
            )
            g["task_id"] = t.get("id")
            g["task_name"] = t.get("name")
            g["verdict"] = t.get("verdict") or g.get("verdict")
        ordered.append(_finalize_guide(g, approved))
    return ordered


def build_guides(
    project_input: str,
    tasks: list[dict],
    approved_ai: list[str] | None = None,
) -> dict:
    approved = _resolve_approved(approved_ai)

    if not tasks:
        tasks = list(PRESET_TASKS)

    # Preset demo project → curated workflows (still remapped to approved AI)
    preset_ids = {t["id"] for t in PRESET_TASKS}
    input_ids = {t.get("id") for t in tasks}
    use_preset_wf = is_preset_project(project_input) or (
        input_ids and input_ids.issubset(preset_ids)
    )

    if use_preset_wf and any(t.get("id") in PRESET_GUIDE_WORKFLOWS for t in tasks):
        guides = _guides_from_preset_tasks(tasks, approved)
        return {"source": "preset", "guides": guides, "approved_ai": approved}

    if settings.GEMINI_API_KEY:
        try:
            guides = _gemini_guides(project_input, tasks, approved)
            if guides:
                return {"source": "gemini", "guides": guides, "approved_ai": approved}
        except Exception:
            pass

    guides = _guides_from_preset_tasks(tasks, approved)
    return {"source": "preset_fallback", "guides": guides, "approved_ai": approved}
