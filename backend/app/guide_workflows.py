"""Rich preset workflow guides for the demo project."""

from __future__ import annotations

# Full workflow guides keyed by preset task id.
PRESET_GUIDE_WORKFLOWS: dict[str, dict] = {
    "task-1": {
        "summary": "공개 동향을 AI로 수집·요약한 뒤 인사이트만 사람이 훑는다",
        "steps": [
            {
                "order": 1,
                "title": "경쟁·트렌드 검색",
                "tool": "Perplexity",
                "instruction": "최근 30일 기준 경쟁사 3곳의 SNS·광고 캠페인을 검색하고 출처 URL을 남긴다.",
                "prompt_example": "여름 신제품 SNS 캠페인 기준으로 경쟁사 3곳의 최근 30일 캠페인·톤·채널을 표로 정리하고 출처 URL을 붙여줘.",
            },
            {
                "order": 2,
                "title": "인사이트 요약",
                "tool": "Gemini",
                "instruction": "1단계 검색 결과를 붙여 넣고 핵심 인사이트 5개와 ‘우리 캠페인에 쓸 수 있는 기회’ 3개를 뽑는다.",
                "prompt_example": "아래 조사 노트를 바탕으로 핵심 인사이트 5개, 위험 신호 2개, 우리 브랜드가 바로 쓸 기회 3개를 한국어로 요약해줘.\n\n[조사 노트 붙여넣기]",
            },
            {
                "order": 3,
                "title": "공유용 1페이지 정리",
                "tool": "Gemini",
                "instruction": "팀 공유용으로 ‘한 줄 결론 + 근거 3개 + 다음에 할 일’ 형식으로 다시 쓴다.",
                "prompt_example": "위 요약을 팀 슬랙에 올릴 1페이지 브리프로 다시 써줘. 형식: 결론 / 근거 3 / Next action.",
            },
        ],
        "human_checkpoint": "🟢 AI 주도 — 사람은 사실 왜곡·출처 누락만 빠르게 확인하면 충분합니다.",
        "caution": "수치·점유율은 출처 없는 추정치일 수 있으니 링크를 꼭 남기세요.",
    },
    "task-2": {
        "summary": "AI가 콘셉트 후보를 만들고, 방향 확정은 사람이 한다",
        "steps": [
            {
                "order": 1,
                "title": "콘셉트 후보 생성",
                "tool": "Claude",
                "instruction": "타깃·채널·톤을 넣고 콘텐츠 콘셉트 5안을 뽑는다.",
                "prompt_example": "타깃 20–30대, 채널 Instagram·TikTok, 톤은 상쾌·실용. 여름 신제품 SNS 콘텐츠 콘셉트 5안을 표로(콘셉트명/훅/포맷/CTA) 제안해줘.",
            },
            {
                "order": 2,
                "title": "채널별 캘린더 초안",
                "tool": "Gemini",
                "instruction": "선정한 상위 2안을 붙여 2주 포스팅 캘린더 초안을 만든다.",
                "prompt_example": "아래 콘셉트 2안을 기준으로 2주 포스팅 캘린더를 만들어줘. 요일/채널/포맷/핵심 메시지 컬럼으로.\n\n[콘셉트 붙여넣기]",
            },
            {
                "order": 3,
                "title": "사람 확정",
                "tool": "사람",
                "instruction": "브랜드 톤·금지 표현·일정 가능 여부를 보고 최종 콘셉트 1안과 캘린더를 확정한다.",
                "prompt_example": "",
            },
        ],
        "human_checkpoint": "🟡 협업 — AI 초안(1~2단계)까지, 콘셉트·일정 확정(3단계)부터 사람.",
        "caution": "AI가 만든 CTA·해시태그가 브랜드 가이드와 충돌할 수 있으니 확정 전 꼭 대조하세요.",
    },
    "task-3": {
        "summary": "채널별 카피 초안을 AI로 뽑고 톤만 사람이 검수한다",
        "steps": [
            {
                "order": 1,
                "title": "카피 다안 생성",
                "tool": "Claude",
                "instruction": "확정 콘셉트·금칙어를 넣고 채널별 카피 3안씩 생성한다.",
                "prompt_example": "콘셉트: [확정안]. 금지어: [목록]. Instagram 피드·릴스·스토리용 카피를 각 3안, 길이 제한 지켜서 써줘.",
            },
            {
                "order": 2,
                "title": "A/B 변형",
                "tool": "Gemini",
                "instruction": "가장 좋은 1안을 골라 훅만 바꾼 A/B 변형 2개를 만든다.",
                "prompt_example": "아래 카피의 훅만 바꿔 A/B 테스트용 2안을 만들어줘. 본문 가치 제안은 유지.\n\n[카피]",
            },
            {
                "order": 3,
                "title": "톤 검수",
                "tool": "사람",
                "instruction": "과장 광고·사실 확인이 필요한 표현을 고치고 최종본을 고른다.",
                "prompt_example": "",
            },
        ],
        "human_checkpoint": "🟢 AI 주도 — 초안·변형은 AI, 사람은 과장·금지어만 최종 체크.",
        "caution": "할인율·성능 주장은 근거 없으면 넣지 마세요.",
    },
    "task-4": {
        "summary": "레퍼런스·보드를 AI로 모으고 시안 방향은 사람이 고른다",
        "steps": [
            {
                "order": 1,
                "title": "무드 키워드·레퍼런스",
                "tool": "Gemini",
                "instruction": "브랜드 톤에 맞는 비주얼 키워드 10개와 레퍼런스 설명 5개를 만든다.",
                "prompt_example": "여름 신제품, 상쾌·미니멀 톤으로 비주얼 무드 키워드 10개와 ‘이런 컷’ 레퍼런스 설명 5개를 적어줘.",
            },
            {
                "order": 2,
                "title": "보드·시안 스케치",
                "tool": "Canva",
                "instruction": "키워드를 바탕으로 썸네일·스토리 템플릿 시안 2~3개를 만든다. Canva가 없으면 Gemini로 레이아웃 스펙만 작성.",
                "prompt_example": "1080x1080 피드용으로 상단 훅 문구 / 중앙 제품 / 하단 CTA 레이아웃 스펙을 적어줘.",
            },
            {
                "order": 3,
                "title": "방향 확정",
                "tool": "사람",
                "instruction": "브랜드 가이드·저작권(레퍼런스 이미지)을 확인하고 최종 비주얼 방향을 고른다.",
                "prompt_example": "",
            },
        ],
        "human_checkpoint": "🟡 협업 — 레퍼런스·시안 초안은 AI, 최종 톤·시안 선택은 사람.",
        "caution": "레퍼런스 이미지를 그대로 쓰지 말고, 영감 수준으로만 활용하세요.",
    },
    "task-5": {
        "summary": "AI는 시나리오 참고만, 예산 결정은 사람이 한다",
        "steps": [
            {
                "order": 1,
                "title": "배분 시나리오 참고",
                "tool": "Copilot",
                "instruction": "총예산·채널 후보를 넣고 보수/기본/공격 3안 배분 표를 받는다. (실행 입력 금지)",
                "prompt_example": "총예산 1,000만 원. 채널 IG·TikTok·검색광고. 보수/기본/공격 3안 배분표(금액·비중·가정)를 만들어줘. 실제 집행은 하지 마.",
            },
            {
                "order": 2,
                "title": "리스크 체크리스트",
                "tool": "Gemini",
                "instruction": "각 안의 리스크·가드레일(일일 상한, 중단 조건)을 체크리스트로 뽑는다.",
                "prompt_example": "아래 배분안마다 리스크 3개와 ‘즉시 중단 조건’ 2개를 체크리스트로 정리해줘.\n\n[배분표]",
            },
            {
                "order": 3,
                "title": "최종 의사결정",
                "tool": "사람",
                "instruction": "재무·성과 책임을 지는 사람이 최종 금액을 확정하고 광고 계정에 직접 입력한다.",
                "prompt_example": "",
            },
        ],
        "human_checkpoint": "🔴 사람 주도 — AI는 참고 시나리오만. 금액 확정·광고 계정 입력은 사람만.",
        "caution": "AI가 제안한 금액을 그대로 광고 매니저에 넣지 마세요. 승인 없는 자동 입찰 변경도 금지.",
    },
    "task-6": {
        "summary": "리포트 골격은 AI, 수치 해석·결론은 사람이 확정한다",
        "steps": [
            {
                "order": 1,
                "title": "지표 표 정리",
                "tool": "Copilot",
                "instruction": "원본 수치(CSV/시트)를 붙여 채널별 표와 전주 대비 증감을 정리한다.",
                "prompt_example": "아래 성과 데이터를 채널별 표로 정리하고 WoW 증감%를 계산해줘. 추측 수치는 넣지 마.\n\n[데이터]",
            },
            {
                "order": 2,
                "title": "인사이트 초안",
                "tool": "Claude",
                "instruction": "표를 바탕으로 ‘잘된 점/개선점/가설’ 초안을 받는다.",
                "prompt_example": "이 표만 근거로 잘된 점 3, 개선점 3, 다음 주 실험 가설 2를 써줘. 표에 없는 숫자는 만들지 마.",
            },
            {
                "order": 3,
                "title": "수치 검증·결론",
                "tool": "사람",
                "instruction": "원본 대시보드와 숫자를 대조하고 경영/클라이언트에 낼 결론을 확정한다.",
                "prompt_example": "",
            },
        ],
        "human_checkpoint": "🟡 협업 — 표·초안은 AI, 숫자 검증과 최종 결론은 사람.",
        "caution": "AI가 없는 지표를 채워 넣지 않게 ‘추측 금지’를 프롬프트에 명시하세요.",
    },
}


def build_rich_guide_from_preset(task: dict) -> dict | None:
    wf = PRESET_GUIDE_WORKFLOWS.get(task.get("id") or "")
    if not wf:
        return None
    return {
        "task_id": task["id"],
        "task_name": task["name"],
        "verdict": task["verdict"],
        "recommended_ai": task.get("recommended_ai") or "Gemini",
        "summary": wf["summary"],
        "guide": wf["summary"],
        "how": " → ".join(
            f"{s['order']}. [{s['tool']}] {s['title']}" for s in wf["steps"]
        ),
        "steps": wf["steps"],
        "human_checkpoint": wf["human_checkpoint"],
        "caution": wf["caution"],
        "recommended_ai_note": None,
    }
