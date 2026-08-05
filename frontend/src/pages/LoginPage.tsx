import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Disclaimer } from "../components/Disclaimer";
import { useAuth } from "../lib/auth";

const FLOW = [
  {
    step: "01",
    title: "프로젝트 입력",
    body: "캠페인·목표를 넣으면 상위 업무로 분해를 시작합니다.",
  },
  {
    step: "02",
    title: "신호등 판정",
    body: "업무마다 🟢 AI 주도 · 🟡 협업 · 🔴 사람 주도를 표시합니다.",
  },
  {
    step: "03",
    title: "승인 AI 가이드",
    body: "회사가 허용한 AI 안에서 어떻게 쓸지 업무별로 안내합니다.",
  },
  {
    step: "04",
    title: "팀장 드래그 분배",
    body: "성향을 보고 팀원이 직접 업무를 배정합니다. AI 자동매칭 없음.",
  },
];

const SIGNALS = [
  {
    tone: "green" as const,
    label: "AI 주도",
    meaning: "AI가 초안·조사를 주도하고, 사람은 확인만 합니다.",
  },
  {
    tone: "amber" as const,
    label: "AI + 사람 협업",
    meaning: "AI가 초안을 만들고, 사람의 검토·확정이 필수입니다.",
  },
  {
    tone: "red" as const,
    label: "사람 주도",
    meaning: "책임·리스크가 큰 판단은 사람이 주도하고 AI는 참고만 합니다.",
  },
];

const signalDot: Record<"green" | "amber" | "red", string> = {
  green: "bg-signal-green signal-glow-green",
  amber: "bg-signal-amber signal-glow-amber",
  red: "bg-signal-red signal-glow-red",
};

const PREVIEW_TASKS = [
  { name: "시장·경쟁사 조사", signal: "green" as const },
  { name: "콘텐츠 기획", signal: "amber" as const },
  { name: "카피라이팅", signal: "green" as const },
  { name: "광고 예산 배분", signal: "red" as const },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { enterGuest, isAuthed, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50 text-sm text-ink-700/60">
        불러오는 중…
      </div>
    );
  }

  if (isAuthed) {
    return <Navigate to="/project" replace />;
  }

  function startWithoutLogin() {
    enterGuest();
    navigate("/project");
  }

  function onLogin(e: FormEvent) {
    e.preventDefault();
    const { error } = signIn(email, password);
    if (error) {
      setAuthError(error);
      return;
    }
    navigate("/project");
  }

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-ink-50/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <a href="#top" className="font-display text-xl font-extrabold tracking-tight text-accent-dark">
            가드레일
          </a>
          <nav className="hidden items-center gap-7 text-sm text-ink-700/75 md:flex">
            <a href="#problem" className="transition hover:text-accent-dark">
              문제
            </a>
            <a href="#flow" className="transition hover:text-accent-dark">
              흐름
            </a>
            <a href="#signals" className="transition hover:text-accent-dark">
              신호등
            </a>
            <a href="#start" className="transition hover:text-accent-dark">
              시작
            </a>
          </nav>
          <a
            href="#start"
            className="rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark"
          >
            시작하기
          </a>
        </div>
      </header>

      <section id="top" className="relative min-h-[88vh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="animate-drift absolute -left-24 top-10 h-[28rem] w-[28rem] rounded-full bg-[#9fd9cf]/40 blur-3xl" />
          <div className="animate-drift absolute -right-16 bottom-0 h-[22rem] w-[22rem] rounded-full bg-[#c5d6d0]/70 blur-3xl [animation-delay:2s]" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(15,26,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,26,22,0.04) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-16 md:grid-cols-[1.05fr_0.95fr] md:items-center md:pt-24">
          <div>
            <p className="animate-rise font-display text-5xl font-extrabold tracking-tight text-accent-dark md:text-6xl">
              가드레일
            </p>
            <h1 className="animate-rise-delay mt-5 max-w-xl text-2xl font-semibold leading-snug text-ink-900 md:text-3xl">
              팀장이 AI를 몰라도, 팀에 AI를 배분할 수 있게
            </h1>
            <p className="animate-rise-delay-2 mt-4 max-w-lg text-base leading-relaxed text-ink-700/80">
              프로젝트를 업무로 분해하고 신호등으로 판정한 뒤, 승인된 AI
              가이드와 함께 팀장이 직접 분배합니다.
            </p>
            <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
              <a
                href="#start"
                className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
              >
                로그인하고 시작
              </a>
              <button
                type="button"
                onClick={startWithoutLogin}
                className="rounded-md border border-ink-200 bg-white/70 px-6 py-3 text-sm font-semibold text-ink-800 transition hover:border-accent hover:text-accent-dark"
              >
                로그인 없이 둘러보기
              </button>
            </div>
            <p className="mt-5 text-xs text-ink-700/55">승인 AI · Gemini · Copilot</p>
          </div>

          <div className="hero-stage animate-rise-delay hidden md:block">
            <div className="hero-stack">
              <div className="hero-stack-back" aria-hidden />
              <div className="hero-stack-mid" aria-hidden />
              <div className="hero-card">
                <div className="hero-glass" aria-hidden />
                <div className="relative flex h-full flex-col p-7">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-100/70">
                      Workflow
                    </p>
                    <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[10px] text-teal-50/80 backdrop-blur">
                      Live preview
                    </span>
                  </div>
                  <p className="mt-4 font-display text-xl font-semibold tracking-tight text-white">
                    여름 신제품 SNS 캠페인
                  </p>
                  <p className="mt-1 text-xs text-teal-100/55">신호등 판정 · 승인 AI 가이드</p>

                  <ol className="mt-8 space-y-3.5">
                    {PREVIEW_TASKS.map((item, i) => (
                      <li
                        key={item.name}
                        className="hero-row group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.1]"
                      >
                        <span className="w-5 text-[11px] tabular-nums text-teal-100/45">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`hero-dot h-2.5 w-2.5 rounded-full transition duration-300 ${signalDot[item.signal]} animate-signal`}
                          style={{ animationDelay: `${i * 0.35}s` }}
                        />
                        <span className="text-sm text-teal-50/95">{item.name}</span>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-auto border-t border-white/10 pt-5 text-xs text-teal-100/55">
                    분배는 사람(팀장)의 몫 · AI 자동매칭 없음
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="border-t border-ink-200/80 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">
            Why Guardrail
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-ink-900 md:text-4xl">
            개인에게 AI를 가르치는 대신, 팀 단위로 AI를 배분합니다
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-700/75">
            팀원은 도구를 배우느라 시간을 쓰고, 팀장은 어디까지 AI에 맡겨도
            되는지 판단하기 어렵습니다. 가드레일은 판정·가이드·분배를 한
            흐름으로 묶어 팀장이 의사결정할 수 있게 합니다.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "어디까지 AI인가",
                body: "업무를 🟢🟡🔴로 나눠 책임 경계를 분명히 합니다.",
              },
              {
                title: "승인된 AI만",
                body: "회사 허용 도구(Gemini, Copilot) 안에서만 가이드합니다.",
              },
              {
                title: "사람이 분배",
                body: "팀원이 성향을 보고 드래그로 배정합니다. 자동매칭 없음.",
              },
            ].map((item) => (
              <div key={item.title} className="border-l-2 border-accent/40 pl-5">
                <h3 className="text-base font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700/70">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="flow" className="border-t border-ink-200/80 bg-ink-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-900 md:text-4xl">
            네 단계로 끝나는 팀 AI 배분
          </h2>
          <p className="mt-3 max-w-xl text-sm text-ink-700/70">
            프로젝트 입력부터 분배 결과까지, 팀장이 한 화면 흐름으로 진행합니다.
          </p>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FLOW.map((item) => (
              <li
                key={item.step}
                className="group relative border border-ink-200/90 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/50"
              >
                <span className="font-display text-3xl font-bold text-accent/30 transition group-hover:text-accent">
                  {item.step}
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700/70">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="signals" className="border-t border-ink-200/80 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-dark">
            Verdict framework
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-900 md:text-4xl">
            신호등으로 역할 경계를 고정합니다
          </h2>
          <p className="mt-3 max-w-xl text-sm text-ink-700/70">
            판정 3축: 정확성이 치명적인가 · 되돌릴 수 있나 · 판단·책임이 필요한가
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {SIGNALS.map((s) => (
              <article
                key={s.label}
                className="border border-ink-200/90 bg-ink-50/60 p-6"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${signalDot[s.tone]}`} />
                  <h3 className="text-base font-semibold text-ink-900">{s.label}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-700/75">
                  {s.meaning}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="start"
        className="relative overflow-hidden border-t border-ink-200/80 bg-ink-900 py-20 text-ink-50"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(13,148,136,0.28),transparent_50%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-[1fr_20rem] md:items-end">
          <div className="max-w-xl">
            <p className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              가드레일
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-100/75">
              이메일로 로그인하거나, 로그인 없이 바로 둘러볼 수 있습니다.
            </p>
          </div>

          <form
            onSubmit={onLogin}
            className="space-y-3 border border-white/15 bg-white/5 p-5 backdrop-blur"
          >
            <label className="block text-xs text-ink-100/70">
              이메일
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border border-white/20 bg-ink-900/40 px-3 py-2 text-sm text-white outline-none focus:border-accent"
                placeholder="you@company.com"
                required
              />
            </label>
            <label className="block text-xs text-ink-100/70">
              비밀번호
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border border-white/20 bg-ink-900/40 px-3 py-2 text-sm text-white outline-none focus:border-accent"
                placeholder="비밀번호"
                required
              />
            </label>
            {authError ? (
              <p className="text-xs text-rose-300">{authError}</p>
            ) : null}
            <button
              type="submit"
              className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              로그인
            </button>
            <button
              type="button"
              onClick={startWithoutLogin}
              className="w-full rounded-md border border-white/15 px-4 py-2.5 text-sm text-ink-100/90 hover:border-white/40"
            >
              로그인 없이 둘러보기
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-ink-800 bg-ink-900 px-4 py-10 text-ink-200/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="font-display text-lg font-bold text-ink-50">가드레일</p>
          <p className="text-xs">
            B2B · Gemini · Copilot · 분배는 팀장(사람) 몫
          </p>
        </div>
      </footer>

      <Disclaimer />
    </div>
  );
}
