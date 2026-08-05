import type { TaskItem } from "../lib/types";
import { VERDICT_EMOJI, VERDICT_LABEL } from "../lib/types";

const DOT: Record<TaskItem["verdict"], string> = {
  green: "bg-signal-green",
  amber: "bg-signal-amber",
  red: "bg-signal-red",
};

export function WorkflowDiagram({ tasks }: { tasks: TaskItem[] }) {
  const ordered = [...tasks].sort((a, b) => a.order_index - b.order_index);

  if (!ordered.length) {
    return (
      <p className="text-sm text-ink-700/60">
        업무가 없으면 워크플로를 표시할 수 없습니다.
      </p>
    );
  }

  return (
    <div>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((task, i) => (
          <li
            key={task.id}
            className="relative border border-ink-200 bg-ink-50/50 px-3 py-3"
          >
            <div className="flex items-start gap-2.5">
              <span className="font-display text-sm font-bold tabular-nums text-accent/55">
                {String(task.order_index).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${DOT[task.verdict]}`}
                    aria-hidden
                  />
                  <span className="text-[10px] font-medium text-ink-700/55">
                    {VERDICT_EMOJI[task.verdict]} {VERDICT_LABEL[task.verdict]}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-semibold leading-snug text-ink-900">
                  {task.name}
                </p>
              </div>
            </div>
            {i < ordered.length - 1 ? (
              <p className="mt-2 text-[10px] font-medium text-accent/50 sm:hidden">
                ↓ 다음
              </p>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] text-ink-700/50">
        위에서 아래·왼쪽에서 오른쪽 순서로 진행합니다. (총 {ordered.length}단계)
      </p>
    </div>
  );
}
