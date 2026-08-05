# Guiderail — Hackathon MVP

팀장이 프로젝트를 입력하면 AI가 업무를 분해·신호등 판정하고, 승인 AI 가이드와 스킬 기반 자동 배정(드래그 조정)을 돕는 B2B 웹앱.

**LLM**: Google Gemini (`gemini-2.0-flash`)

## 폴더 구조

```
/
├── frontend/     # React + Vite + Tailwind + @dnd-kit
├── backend/      # FastAPI + Gemini
├── .env.example
└── README.md
```

## 화면 흐름

1. 프로젝트 입력 (프리셋 / 자유입력)
2. 업무도출
3. 신호등 판정 + 워크플로 순서도
4. 승인 AI 활용 가이드
5. 팀장 드래그 분배 (A/B/C)
6. 결과 + 🟢 Gemini 실행(선택)

## 환경변수

`backend/.env`:
```env
GEMINI_API_KEY=your_key
ALLOWED_ORIGINS=*
PORT=8000
```

`frontend/.env`:
```env
VITE_API_URL=http://127.0.0.1:8000
```

> 프리셋「여름 신제품 수영복 SNS 캠페인」은 API 키 없이 동작합니다. 자유입력·실행만 `GEMINI_API_KEY`가 필요합니다.

## 실행

### 백엔드
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 프론트
```powershell
cd frontend
npm install
npm run dev
```

- Front: http://127.0.0.1:5173/
- API docs: http://127.0.0.1:8000/docs
- Health: http://127.0.0.1:8000/health

## API

| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 헬스체크 |
| POST | `/decompose` | 프로젝트 → 업무+판정 (프리셋 우선) |
| POST | `/guide` | 업무별 승인 AI 가이드 |
| POST | `/assign` | 분배 저장 (메모리) |
| POST | `/execute` | 🟢 업무 Gemini 실행 |
