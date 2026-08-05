import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { VerdictBadge } from "../components/VerdictBadge";
import { postGuide } from "../lib/api";
import { useSession } from "../lib/session";
import { clampRecommendedAi, type GuideItem } from "../lib/types";

function guideSummary(g: GuideItem): string {
  return (g.summary || g.guide || "").trim();
}

function hasWorkflow(g: GuideItem): boolean {
  return Array.isArray(g.steps) && g.steps.length > 0;
}

export default function GuidePage() {
  const navigate = useNavigate();
  const { projectInput, tasks, guides, setGuides, approvedAi } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const loadedKeyRef = useRef<string>("");
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!tasks.length) return;

    const key = `${projectInput}::${tasks.map((t) => t.id).join(",")}::${approvedAi.join("|")}`;
    if (
      guides.length > 0 &&
      guides.every(hasWorkflow) &&
      loadedKeyRef.current === key
    ) {
      setOpenId((prev) => prev ?? guides[0]?.task_id ?? null);
      return;
    }
    if (inFlightRef.current) return;

    let cancelled = false;
    inFlightRef.current = true;
    (async () => {
      setBusy(true);
      setError(null);
      try {
        const data = await postGuide(projectInput, tasks, approvedAi);
        if (cancelled) return;
        const next = data.guides.map((g) => ({
          ...g,
          recommended_ai: clampRecommendedAi(g.recommended_ai, approvedAi),
          summary: g.summary || g.guide,
          steps: g.steps || [],
        }));
        setGuides(next);
        loadedKeyRef.current = key;
        setOpenId(next[0]?.task_id ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "가이드 로드 실패");
        }
      } finally {
        inFlightRef.current = false;
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tasks, guides, projectInput, setGuides, approvedAi]);

  if (!tasks.length) return <Navigate to="/project" replace />;

  return (
    <section className="max-w-3xl">
      <p className="font-display text-sm font-bold text-accent/50">04</p>
      <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
        가이드
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-ink-700/75">
        승인된 AI만 사용해, 업무별로 따라 할 수 있는 단계·프롬프트·사람 개입
        지점을 안내합니다.
      </p>
      <p className="mt-1 text-xs text-ink-700/50">
        승인 AI: {approvedAi.join(" · ") || "없음"}
      </p>

      {busy ? (
        <p className="mt-8 text-sm text-ink-700/60">가이드 불러오는 중…</p>
      ) : null}
      {error ? (
        <p className="mt-4 border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-signal-red">
          {error}
        </p>
      ) : null}

      <div className="mt-8 grid gap-3">
        {guides.map((g) => {
          const open = openId === g.task_id;
          const summary = guideSummary(g);
          const steps = [...(g.steps || [])].sort(
            (a, b) => (a.order || 0) - (b.order || 0),
          );
          return (
            <article key={g.task_id} className="border border-ink-200 bg-white">
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left"
                onClick={() =>
                  setOpenId((prev) => (prev === g.task_id ? null : g.task_id))
                }
                aria-expanded={open}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-ink-900">
                      {g.task_name}
                    </h2>
                    <VerdictBadge verdict={g.verdict} />
                  </div>
                  <p className="mt-2 text-sm font-medium text-accent-dark">
                    사용 AI · {g.recommended_ai}
                    {g.recommended_ai_note ? (
                      <span className="ml-1 font-normal text-ink-700/55">
                        ({g.recommended_ai_note})
                      </span>
                    ) : null}
                  </p>
                  {summary ? (
                    <p className="mt-1 text-sm leading-relaxed text-ink-700/75">
                      {summary}
                    </p>
                  ) : null}
                </div>
                <span className="mt-1 shrink-0 text-xs font-semibold text-ink-700/50">
                  {open ? "접기" : "펼치기"}
                </span>
              </button>

              {open ? (
                <div className="border-t border-ink-100 px-5 py-4">
                  {steps.length ? (
                    <ol className="space-y-4">
                      {steps.map((step) => (
                        <li key={`${g.task_id}-${step.order}-${step.title}`}>
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="font-display text-xs font-bold text-accent/70">
                              {String(step.order).padStart(2, "0")}
                            </span>
                            <p className="text-sm font-semibold text-ink-900">
                              {step.title}
                            </p>
                            <span className="rounded-sm border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10px] font-medium text-ink-700/70">
                              {step.tool}
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm leading-relaxed text-ink-700/80">
                            {step.instruction}
                          </p>
                          {step.prompt_example ? (
                            <pre className="mt-2 whitespace-pre-wrap border border-accent/15 bg-accent-soft/40 px-3 py-2 font-sans text-[12px] leading-relaxed text-ink-800">
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-accent-dark">
                                프롬프트 예시
                              </span>
                              {"\n"}
                              {step.prompt_example}
                            </pre>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-ink-700/70">{g.how}</p>
                  )}

                  {g.human_checkpoint ? (
                    <div className="mt-4 border border-ink-200 bg-ink-50/70 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-700/50">
                        사람 개입 지점
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-800">
                        {g.human_checkpoint}
                      </p>
                    </div>
                  ) : null}

                  {g.caution ? (
                    <div className="mt-3 border border-amber-200/80 bg-amber-50/70 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800/70">
                        주의사항
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-amber-950/80">
                        {g.caution}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
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
  );
}
