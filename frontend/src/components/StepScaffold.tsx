import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

const APPROVED_AI = ["Gemini", "Copilot"];

type StepScaffoldProps = {
  step: number;
  title: string;
  summary: string;
  comingIn: string;
  prev?: string;
  next?: string;
  nextLabel?: string;
  children?: ReactNode;
};

export function StepScaffold({
  step,
  title,
  summary,
  comingIn,
  prev,
  next,
  nextLabel = "다음",
  children,
}: StepScaffoldProps) {
  const navigate = useNavigate();

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
      <section className="min-w-0">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-sm font-bold text-accent/50">
            {String(step).padStart(2, "0")}
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900">
            {title}
          </h1>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-700/75">
          {summary}
        </p>

        <div className="mt-8 border border-dashed border-ink-200 bg-white/70 px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-dark">
            Coming in {comingIn}
          </p>
          <div className="mt-4 space-y-3 text-sm text-ink-700/70">
            {children}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {prev ? (
            <button
              type="button"
              onClick={() => navigate(prev)}
              className="rounded-md border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 transition hover:border-accent/40"
            >
              이전
            </button>
          ) : null}
          {next ? (
            <button
              type="button"
              onClick={() => navigate(next)}
              className="rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
            >
              {nextLabel}
            </button>
          ) : null}
        </div>
      </section>

      <aside className="h-fit border border-ink-200/90 bg-white/80 p-5 lg:sticky lg:top-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-700/50">
          승인 AI
        </p>
        <ul className="mt-4 space-y-2">
          {APPROVED_AI.map((name) => (
            <li
              key={name}
              className="flex items-center gap-2 border-b border-ink-100 py-2 text-sm font-medium text-ink-800 last:border-0"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {name}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-ink-700/55">
          회사 승인 목록은 고정입니다. 업무 가이드는 이 범위 안에서만
          제시됩니다.
        </p>
      </aside>
    </div>
  );
}
