import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApprovedAiPanel } from "../components/ApprovedAiPanel";
import { postDecompose } from "../lib/api";
import { useSession } from "../lib/session";
import { PRESET_PROJECT } from "../lib/types";

export default function ProjectPage() {
  const navigate = useNavigate();
  const {
    projectInput,
    setProjectInput,
    setGoal,
    setTasks,
    setMembers,
    setApprovedAi,
    setAssignments,
    setGuides,
    setSource,
  } = useSession();
  const [draft, setDraft] = useState(projectInput || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runDecompose(input: string) {
    const value = input.trim();
    if (!value) {
      setError("프로젝트 내용을 입력하거나 프리셋을 선택하세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const data = await postDecompose(value);
      setProjectInput(data.project.raw_input);
      setGoal(data.project.goal);
      setTasks(data.tasks);
      setMembers(data.members);
      setApprovedAi(data.approved_ai);
      setSource(data.source);
      setGuides([]);
      const emptyAssign: Record<string, null> = {};
      data.tasks.forEach((t) => {
        emptyAssign[t.id] = null;
      });
      setAssignments(emptyAssign);
      navigate("/decompose");
    } catch (err) {
      setError(err instanceof Error ? err.message : "분해 요청 실패");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void runDecompose(draft);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
      <section>
        <p className="font-display text-sm font-bold text-accent/50">01</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
          프로젝트
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-700/75">
          프리셋으로 바로 데모하거나, 자유롭게 입력하면 Gemini가 업무를 분해합니다.
          그로우앤코 · 디지털 마케팅 시나리오.
        </p>

        <div className="mt-8 space-y-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setDraft(PRESET_PROJECT);
              void runDecompose(PRESET_PROJECT);
            }}
            className="w-full border border-accent/30 bg-accent-soft/60 px-5 py-4 text-left transition hover:border-accent disabled:opacity-60"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark">
              Demo preset
            </p>
            <p className="mt-1 text-base font-semibold text-ink-900">
              {PRESET_PROJECT}
            </p>
            <p className="mt-1 text-xs text-ink-700/60">
              하드코딩 6업무 + 신호등 판정 즉시 반환
            </p>
          </button>

          <form onSubmit={onSubmit} className="border border-ink-200 bg-white p-5">
            <label className="text-sm font-medium text-ink-800" htmlFor="project">
              자유 입력
            </label>
            <textarea
              id="project"
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="예: 신입 온보딩용 콘텐츠 캠페인"
              className="mt-2 w-full resize-y border border-ink-200 bg-ink-50/50 px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={busy}
              className="mt-4 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
            >
              {busy ? "업무 도출 중…" : "업무 도출하기"}
            </button>
          </form>

          {error ? (
            <p className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-signal-red">
              {error}
            </p>
          ) : null}
        </div>
      </section>
      <ApprovedAiPanel />
    </div>
  );
}
