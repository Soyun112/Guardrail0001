import { useSession } from "../lib/session";

export function ApprovedAiPanel() {
  const { approvedAi } = useSession();

  return (
    <aside className="h-fit border border-ink-200/90 bg-white/90 p-5 lg:sticky lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-700/50">
        승인 AI 리스트
      </p>
      <ul className="mt-4 space-y-2">
        {(approvedAi.length ? approvedAi : ["Gemini", "Copilot"]).map((name) => (
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
        회사 승인 목록은 고정입니다. 업무 가이드·추천 AI는 이 범위 안에서만
        제시됩니다.
      </p>
    </aside>
  );
}
