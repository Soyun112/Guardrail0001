import { Navigate, useNavigate } from "react-router-dom";
import { ApprovedAiPanel } from "../components/ApprovedAiPanel";
import { VerdictBadge } from "../components/VerdictBadge";
import { useSession } from "../lib/session";

export default function DecomposePage() {
  const navigate = useNavigate();
  const { projectInput, goal, tasks, source } = useSession();

  if (!tasks.length) return <Navigate to="/project" replace />;

  const ordered = [...tasks].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
      <section>
        <p className="font-display text-sm font-bold text-accent/50">02</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
          업무도출
        </h1>
        <p className="mt-3 text-sm text-ink-700/75">
          <span className="font-medium text-ink-900">{projectInput}</span>
          {goal ? ` · ${goal}` : ""}
        </p>
        <p className="mt-1 text-xs text-ink-700/50">
          출처: {source === "preset" ? "프리셋(하드코딩)" : source || "API"}
        </p>

        <ul className="mt-8 space-y-3">
          {ordered.map((task) => (
            <li
              key={task.id}
              className="flex flex-wrap items-center justify-between gap-3 border border-ink-200 bg-white px-4 py-3"
            >
              <div>
                <p className="text-xs text-ink-700/45">#{task.order_index}</p>
                <p className="text-sm font-semibold text-ink-900">{task.name}</p>
              </div>
              <VerdictBadge verdict={task.verdict} />
            </li>
          ))}
        </ul>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/project")}
            className="rounded-md border border-ink-200 bg-white px-4 py-2.5 text-sm"
          >
            이전
          </button>
          <button
            type="button"
            onClick={() => navigate("/verdict")}
            className="rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            다음: 판정
          </button>
        </div>
      </section>
      <ApprovedAiPanel />
    </div>
  );
}
