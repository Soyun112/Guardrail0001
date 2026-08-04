import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ApprovedAiPanel } from "../components/ApprovedAiPanel";
import { VerdictBadge } from "../components/VerdictBadge";
import { postExecute } from "../lib/api";
import { useSession } from "../lib/session";

export default function ResultPage() {
  const navigate = useNavigate();
  const { projectInput, tasks, members, assignments, guides, reset } =
    useSession();
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [execError, setExecError] = useState<string | null>(null);
  const [execResult, setExecResult] = useState<{
    task_name: string;
    stages: { key: string; label: string; content: string }[];
  } | null>(null);

  const guideMap = useMemo(() => {
    return new Map(guides.map((g) => [g.task_id, g]));
  }, [guides]);

  const byMember = useMemo(
    () =>
      members.map((m) => ({
        member: m,
        tasks: tasks.filter((t) => assignments[t.id] === m.id),
      })),
    [members, tasks, assignments],
  );

  const unassigned = useMemo(
    () => tasks.filter((t) => !assignments[t.id]),
    [tasks, assignments],
  );

  if (!tasks.length) return <Navigate to="/project" replace />;

  async function runExecute(taskId: string, taskName: string) {
    setExecutingId(taskId);
    setExecError(null);
    setExecResult(null);
    try {
      const data = await postExecute({
        task_id: taskId,
        task_name: taskName,
        project_input: projectInput,
      });
      if (!data.ok) {
        setExecError(data.detail || "실행할 수 없습니다.");
        return;
      }
      setExecResult({ task_name: data.task_name, stages: data.stages });
    } catch (err) {
      setExecError(err instanceof Error ? err.message : "실행 실패");
    } finally {
      setExecutingId(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
      <section>
        <p className="font-display text-sm font-bold text-accent/50">06</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
          결과
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ink-700/75">
          팀원별 맡은 업무 · 활용 가이드 · 쓸 AI를 정리했습니다. 🟢 업무는
          Gemini로 실행해 볼 수 있습니다.
        </p>
        <p className="mt-1 text-xs text-ink-700/50">프로젝트: {projectInput}</p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {byMember.map(({ member, tasks: mt }) => (
            <article
              key={member.id}
              className="border border-ink-200 bg-white p-4"
            >
              <h2 className="text-base font-semibold text-ink-900">
                {member.name}
              </h2>
              <div className="mt-1 flex flex-wrap gap-1">
                {member.traits.map((t) => (
                  <span
                    key={t}
                    className="border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10px] text-ink-700/70"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {mt.length === 0 ? (
                <p className="mt-4 text-xs text-ink-700/50">배정된 업무 없음</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {mt.map((task) => {
                    const g = guideMap.get(task.id);
                    return (
                      <li
                        key={task.id}
                        className="border border-ink-100 bg-ink-50/50 p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-ink-900">
                            {task.name}
                          </p>
                          <VerdictBadge verdict={task.verdict} />
                        </div>
                        <p className="mt-2 text-xs text-ink-700/70">
                          쓸 AI:{" "}
                          <span className="font-semibold text-accent-dark">
                            {g?.recommended_ai || task.recommended_ai}
                          </span>
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-ink-700/70">
                          {g?.guide || task.guide}
                        </p>
                        {task.verdict === "green" ? (
                          <button
                            type="button"
                            disabled={executingId === task.id}
                            onClick={() => void runExecute(task.id, task.name)}
                            className="mt-3 rounded-md border border-accent/40 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-accent-dark hover:bg-accent-soft disabled:opacity-60"
                          >
                            {executingId === task.id
                              ? "실행 중…"
                              : "🟢 Gemini로 실행"}
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </article>
          ))}
        </div>

        {unassigned.length ? (
          <p className="mt-4 text-xs text-ink-700/55">
            미배정: {unassigned.map((t) => t.name).join(", ")}
          </p>
        ) : null}

        {execError ? (
          <p className="mt-4 border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-signal-red">
            {execError}
          </p>
        ) : null}

        {execResult ? (
          <div className="mt-6 border border-ink-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark">
              실행 결과 · {execResult.task_name}
            </p>
            <ol className="mt-4 space-y-4">
              {execResult.stages.map((stage, i) => (
                <li key={stage.key}>
                  <p className="text-xs font-semibold text-ink-700/50">
                    {i + 1}. {stage.label}
                  </p>
                  <pre className="mt-1 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-800">
                    {stage.content}
                  </pre>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/assign")}
            className="rounded-md border border-ink-200 bg-white px-4 py-2.5 text-sm"
          >
            이전
          </button>
          <button
            type="button"
            onClick={() => {
              reset();
              navigate("/project");
            }}
            className="rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            새 프로젝트
          </button>
        </div>
      </section>
      <ApprovedAiPanel />
    </div>
  );
}
