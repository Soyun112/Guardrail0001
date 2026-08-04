import type { TaskItem } from "../lib/types";
import { VERDICT_EMOJI } from "../lib/types";

export function WorkflowDiagram({ tasks }: { tasks: TaskItem[] }) {
  const ordered = [...tasks].sort((a, b) => a.order_index - b.order_index);

  if (!ordered.length) {
    return (
      <p className="text-sm text-ink-700/60">업무가 없으면 워크플로를 표시할 수 없습니다.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <ol className="flex min-w-max items-center gap-2 py-2">
        {ordered.map((task, i) => (
          <li key={task.id} className="flex items-center gap-2">
            <div className="min-w-[9.5rem] border border-ink-200 bg-white px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-700/45">
                Step {task.order_index}
              </p>
              <p className="mt-1 text-xs font-semibold leading-snug text-ink-900">
                {VERDICT_EMOJI[task.verdict]} {task.name}
              </p>
            </div>
            {i < ordered.length - 1 ? (
              <span className="text-accent/60" aria-hidden>
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
