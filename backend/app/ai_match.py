"""Match task intent to an approved AI tool."""

from __future__ import annotations

# Preferred tools per work style (first match in approved list wins).
ROLE_PREFERENCE: dict[str, list[str]] = {
    "research": ["Perplexity", "Gemini", "ChatGPT", "Claude", "Copilot"],
    "writing": ["Claude", "ChatGPT", "Gemini", "Copilot"],
    "analysis": ["Claude", "Gemini", "Copilot", "ChatGPT", "Perplexity"],
    "office": ["Copilot", "Claude", "Gemini", "ChatGPT"],
    "design": ["Canva", "Gemini", "Copilot", "ChatGPT"],
    "agent": ["Manus", "Genspark", "Gemini", "ChatGPT", "Claude"],
    "general": ["Gemini", "ChatGPT", "Claude", "Copilot"],
}

ROLE_KEYWORDS: list[tuple[str, tuple[str, ...]]] = [
    ("research", ("조사", "리서치", "검색", "트렌드", "경쟁", "시장", "동향")),
    ("design", ("디자인", "비주얼", "시안", "크리에이티브", "에셋", "썸네일")),
    ("office", ("예산", "엑셀", "문서", "보고서", "슬라이드", "ppt", "스프레드시트")),
    ("agent", ("자동화", "일괄", "파이프라인", "대량")),
    ("analysis", ("분석", "성과", "리포트", "지표", "대시보드", "데이터")),
    ("writing", ("카피", "문구", "글", "콘텐츠 기획", "기획", "전략", "시나리오")),
]


def _normalize(name: str) -> str:
    return "".join(ch for ch in name.lower() if ch.isalnum())


def _find_approved(candidate: str, approved: list[str]) -> str | None:
    want = _normalize(candidate)
    for item in approved:
        got = _normalize(item)
        if want == got or want in got or got in want:
            return item
    return None


def infer_role(task_name: str) -> str:
    text = task_name or ""
    for role, keywords in ROLE_KEYWORDS:
        if any(k.lower() in text.lower() for k in keywords):
            return role
    return "general"


def pick_approved_ai(
    task_name: str,
    preferred: str | None,
    approved: list[str],
) -> tuple[str, str | None]:
    """Return (chosen_ai, substitution_note)."""
    if not approved:
        return preferred or "Gemini", None

    if preferred:
        hit = _find_approved(preferred, approved)
        if hit:
            return hit, None

    role = infer_role(task_name)
    for candidate in ROLE_PREFERENCE.get(role, ROLE_PREFERENCE["general"]):
        hit = _find_approved(candidate, approved)
        if hit:
            if preferred and _normalize(preferred) != _normalize(hit):
                return hit, f"승인된 {hit}로 대체 (원 추천: {preferred})"
            return hit, None

    return approved[0], (
        f"승인된 {approved[0]}로 대체"
        if preferred and preferred not in approved
        else None
    )
