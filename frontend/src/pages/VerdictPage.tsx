import { Navigate, useNavigate } from "react-router-dom";
import { VerdictBadge } from "../components/VerdictBadge";
import { WorkflowDiagram } from "../components/WorkflowDiagram";
import { useSession } from "../lib/session";

function Axis({
  label,
  value,
}: {
  label: string;
  value: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] ${
        value
          ? "border-ink-300 bg-ink-100 text-ink-800"
          : "border-ink-200 bg-white text-ink-700/50"
      }`}
    >
      <span className={value ? "text-accent-dark" : ""}>{value ? "Y" : "N"}</span>
      {label}
    </span>
  );
}

export default function VerdictPage() {
  const navigate = useNavigate();
  const { tasks } = useSession();

  if (!tasks.length) return <Navigate to="/project" replace />;

  const ordered = [...tasks].sort((a, b) => a.order_index - b.order_index);

  return (
    <section>
      <p className="font-display text-sm font-bold text-accent/50">03</p>
      <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
        판정
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-ink-700/75">
        3축: 정확성 치명도 · 되돌릴 수 있나 · 판단·책임 필요 여부. 워크플로
        순서를 한눈에 보고, 🔴/🟡는 원인유형을 함께 확인하세요.
      </p>

      <div className="mt-8 border border-ink-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/50">
          워크플로 순서도
        </p>
        <div className="mt-3">
          <WorkflowDiagram tasks={tasks} />
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {ordered.map((task) => (
          <article key={task.id} className="border border-ink-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-ink-700/45">#{task.order_index}</p>
                <h2 className="text-base font-semibold text-ink-900">{task.name}</h2>
              </div>
              <VerdictBadge verdict={task.verdict} />
            </div>

            <p className="mt-3 text-sm leading-relaxed text-ink-700/75">
              {task.reason?.summary}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Axis
                label="정확성 치명"
                value={!!task.reason?.accuracy_critical}
              />
              <Axis label="되돌릴 수 있음" value={!!task.reason?.reversible} />
              <Axis
                label="판단·책임 필요"
                value={!!task.reason?.judgment_required}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-4 border-t border-ink-100 pt-3 text-xs text-ink-700/70">
              {task.cause_type ? (
                <p>
                  원인유형:{" "}
                  <span className="font-semibold text-ink-900">{task.cause_type}</span>
                </p>
              ) : (
                <p>원인유형: —</p>
              )}
              <p>
                추천 AI:{" "}
                <span className="font-semibold text-accent-dark">
                  {task.recommended_ai}
                </span>
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => navigate("/decompose")}
          className="rounded-md border border-ink-200 bg-white px-4 py-2.5 text-sm"
        >
          이전
        </button>
        <button
          type="button"
          onClick={() => navigate("/guide")}
          className="rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          다음: 가이드
        </button>
      </div>
    </section>
  );
}
