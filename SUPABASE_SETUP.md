# Supabase setup checklist (Google OAuth + DB)

## 1) Create project
1. https://supabase.com → New project
2. Copy Project URL + anon public key
3. Put into `frontend/.env`:
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
4. Restart `npm run dev`

## 2) Run SQL schema
1. Supabase → SQL Editor → New query
2. Paste contents of `backend/schema.sql`
3. Run

## 3) Google Cloud OAuth client
1. https://console.cloud.google.com/ → APIs & Services → Credentials
2. Configure OAuth consent screen (External / test users if needed)
3. Create OAuth client ID → Web application
4. Authorized JavaScript origins:
   - http://127.0.0.1:5173
   - http://localhost:5173
   - https://YOUR_VERCEL_DOMAIN
5. Authorized redirect URIs:
   - https://YOUR_PROJECT.supabase.co/auth/v1/callback
6. Copy Client ID + Client Secret

## 4) Enable Google in Supabase
1. Supabase → Authentication → Providers → Google → Enable
2. Paste Client ID / Client Secret
3. Save

## 5) Supabase redirect URLs
Authentication → URL Configuration:
- Site URL: http://127.0.0.1:5173 (local) or Vercel URL (prod)
- Redirect URLs add:
  - http://127.0.0.1:5173/
  - http://localhost:5173/
  - https://YOUR_VERCEL_DOMAIN/

## 6) Verify
1. Open app → Google로 계속하기
2. After login, header shows email
3. Complete flow → Table Editor: projects / tasks / assignments rows appear
4. 로그인 없이 둘러보기 still works without DB writes
