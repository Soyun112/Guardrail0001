# 가드레일 (Guardrail) — Hackathon MVP

팀장이 프로젝트를 입력하면 AI가 업무를 분해·신호등 판정하고, 승인 AI 가이드와 드래그 분배를 돕는 B2B 웹앱.

**LLM**: Google Gemini (`gemini-2.0-flash`)

## 폴더 구조

```
/
├── frontend/     # React + Vite + Tailwind
├── backend/      # FastAPI
├── .env.example
└── README.md
```

## Phase 1 실행

### 사전 요구사항
- Node.js 18+ / npm
- Python 3.12+

### 환경변수

**Phase 1은 키 없이 데모 가능.** 이후 Phase용으로만 준비하면 됩니다.

`backend/.env` (또는 루트 `.env`):
```env
GEMINI_API_KEY=
ALLOWED_ORIGINS=*
PORT=8000
SUPABASE_URL=
SUPABASE_KEY=
```

`frontend/.env`:
```env
VITE_API_URL=http://127.0.0.1:8000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 터미널 1 — 백엔드

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

확인: http://127.0.0.1:8000/health

### 터미널 2 — 프론트

```powershell
cd frontend
npm install
npm run dev
```

확인: http://127.0.0.1:5173/
