import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ApprovedAiPanel } from "../components/ApprovedAiPanel";
import { VerdictBadge } from "../components/VerdictBadge";
import { postGuide } from "../lib/api";
import { useSession } from "../lib/session";

export default function GuidePage() {
  const navigate = useNavigate();
  const { projectInput, tasks, guides, setGuides } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tasks.length || guides.length) return;
    let cancelled = false;
    (async () => {
      setBusy(true);
      setError(null);
      try {
        const data = await postGuide(projectInput, tasks);
        if (!cancelled) setGuides(data.guides);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "가이드 로드 실패");
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tasks, guides.length, projectInput, setGuides]);

  if (!tasks.length) return <Navigate to="/project" replace />;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
      <section>
        <p className="font-display text-sm font-bold text-accent/50">04</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
          가이드
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ink-700/75">
          승인 AI(Gemini · Copilot) 안에서 업무별로 무엇을 어떻게 쓸지
          안내합니다.
        </p>

        {busy ? (
          <p className="mt-8 text-sm text-ink-700/60">가이드 불러오는 중…</p>
        ) : null}
        {error ? (
          <p className="mt-4 border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-signal-red">
            {error}
          </p>
        ) : null}

        <div className="mt-8 grid gap-4">
          {guides.map((g) => (
            <article
              key={g.task_id}
              className="border border-ink-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-ink-900">
                  {g.task_name}
                </h2>
                <VerdictBadge verdict={g.verdict} />
              </div>
              <p className="mt-3 text-sm font-medium text-accent-dark">
                {g.recommended_ai} · {g.guide}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-700/75">
                {g.how}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/verdict")}
            className="rounded-md border border-ink-200 bg-white px-4 py-2.5 text-sm"
          >
            이전
          </button>
          <button
            type="button"
            onClick={() => navigate("/assign")}
            className="rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            다음: 분배
          </button>
        </div>
      </section>
      <ApprovedAiPanel />
    </div>
  );
}
