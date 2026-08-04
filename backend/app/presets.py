"""Hardcoded demo presets for Grow&Co digital marketing scenario."""

from __future__ import annotations

APPROVED_AI = ["Gemini", "Copilot"]

COMPANY = {
    "id": "growandco",
    "name": "그로우앤코",
    "industry": "디지털 마케팅",
}

PRESET_PROJECT_NAME = "여름 신제품 SNS 캠페인"

MEMBERS = [
    {
        "id": "A",
        "name": "팀원 A",
        "traits": ["꼼꼼", "분석형"],
        "blurb": "데이터·근거를 챙기는 타입",
    },
    {
        "id": "B",
        "name": "팀원 B",
        "traits": ["창의", "기획형"],
        "blurb": "아이디어와 스토리를 만드는 타입",
    },
    {
        "id": "C",
        "name": "팀원 C",
        "traits": ["빠름", "실행형"],
        "blurb": "빠르게 결과물을 밀어내는 타입",
    },
]

# order_index follows workflow: 조사 → 기획 → 카피 → 디자인 → (실행) → 성과분석
PRESET_TASKS: list[dict] = [
    {
        "id": "task-1",
        "name": "시장·경쟁사 조사",
        "verdict": "green",
        "reason": {
            "accuracy_critical": False,
            "reversible": True,
            "judgment_required": False,
            "summary": "공개 동향 요약이라 정확성 치명도가 낮고 되돌리기 쉬움",
        },
        "cause_type": None,
        "recommended_ai": "Gemini",
        "guide": "Gemini로 최신 동향 요약",
        "order_index": 1,
    },
    {
        "id": "task-2",
        "name": "콘텐츠 기획",
        "verdict": "amber",
        "reason": {
            "accuracy_critical": False,
            "reversible": True,
            "judgment_required": True,
            "summary": "방향 확정에 브랜드 판단이 필요해 사람 검토가 필수",
        },
        "cause_type": "모델 한계형",
        "recommended_ai": "Gemini",
        "guide": "AI 초안 → 사람이 기획 확정",
        "order_index": 2,
    },
    {
        "id": "task-3",
        "name": "카피라이팅",
        "verdict": "green",
        "reason": {
            "accuracy_critical": False,
            "reversible": True,
            "judgment_required": False,
            "summary": "초안 생성이 핵심이며 사람이 가볍게 확인하면 충분",
        },
        "cause_type": None,
        "recommended_ai": "Gemini",
        "guide": "Gemini로 카피 초안 생성",
        "order_index": 3,
    },
    {
        "id": "task-4",
        "name": "비주얼/디자인 방향",
        "verdict": "amber",
        "reason": {
            "accuracy_critical": False,
            "reversible": True,
            "judgment_required": True,
            "summary": "미감·브랜드 톤은 사람 결정이 필요하고 AI는 참고안 수준",
        },
        "cause_type": "도구 연동형",
        "recommended_ai": "Copilot",
        "guide": "AI 참고안 → 사람 결정",
        "order_index": 4,
    },
    {
        "id": "task-5",
        "name": "광고 예산 배분",
        "verdict": "red",
        "reason": {
            "accuracy_critical": True,
            "reversible": False,
            "judgment_required": True,
            "summary": "비용·책임 리스크가 커서 사람이 주도해야 함",
        },
        "cause_type": "정확도 리스크형",
        "recommended_ai": "Gemini",
        "guide": "사람 판단 (책임·리스크)",
        "order_index": 5,
    },
    {
        "id": "task-6",
        "name": "성과 분석 리포트",
        "verdict": "amber",
        "reason": {
            "accuracy_critical": True,
            "reversible": True,
            "judgment_required": True,
            "summary": "수치 해석 오류 위험이 있어 AI 초안 후 사람 검토 필요",
        },
        "cause_type": "데이터 부족형",
        "recommended_ai": "Copilot",
        "guide": "AI 초안, 수치 검토는 사람",
        "order_index": 6,
    },
]


def is_preset_project(raw_input: str) -> bool:
    text = (raw_input or "").strip()
    if not text:
        return False
    if text == PRESET_PROJECT_NAME:
        return True
    # tolerate partial / whitespace variants for demo reliability
    compact = "".join(text.split())
    preset_compact = "".join(PRESET_PROJECT_NAME.split())
    return (
        compact == preset_compact
        or "여름신제품" in compact
        or "신제품SNS캠페인" in compact
    )


def get_preset_decompose_response(raw_input: str) -> dict:
    return {
        "source": "preset",
        "company": COMPANY,
        "project": {
            "raw_input": raw_input.strip() or PRESET_PROJECT_NAME,
            "goal": "여름 신제품 SNS 인지·전환 캠페인 운영",
        },
        "approved_ai": APPROVED_AI,
        "members": MEMBERS,
        "tasks": PRESET_TASKS,
        "workflow_order": [t["id"] for t in sorted(PRESET_TASKS, key=lambda x: x["order_index"])],
    }


def get_preset_guides(task_ids: list[str] | None = None) -> list[dict]:
    selected = PRESET_TASKS
    if task_ids:
        id_set = set(task_ids)
        selected = [t for t in PRESET_TASKS if t["id"] in id_set]
    return [
        {
            "task_id": t["id"],
            "task_name": t["name"],
            "verdict": t["verdict"],
            "recommended_ai": t["recommended_ai"],
            "guide": t["guide"],
            "how": _how_detail(t),
        }
        for t in selected
    ]


def _how_detail(task: dict) -> str:
    ai = task["recommended_ai"]
    if task["verdict"] == "green":
        return f"{ai}로 초안/요약을 생성하고, 팀원은 사실·톤만 빠르게 확인합니다."
    if task["verdict"] == "amber":
        return f"{ai}로 초안을 만든 뒤, 사람이 반드시 검토·확정합니다."
    return f"사람이 판단을 주도하고, 필요 시 {ai}로 참고 자료만 수집합니다."
