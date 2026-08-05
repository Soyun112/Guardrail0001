import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { VerdictBadge } from "../components/VerdictBadge";
import { postAssign } from "../lib/api";
import { useAuth } from "../lib/auth";
import { saveAssignmentsBundle, saveProjectBundle } from "../lib/persist";
import { useSession } from "../lib/session";
import type { TaskItem } from "../lib/types";

function TaskCard({
  task,
  dragging,
}: {
  task: TaskItem;
  dragging?: boolean;
}) {
  return (
    <div
      className={`border border-ink-200 bg-white px-3 py-2.5 ${
        dragging ? "opacity-90 shadow-lg" : ""
      }`}
    >
      <p className="text-sm font-semibold text-ink-900">{task.name}</p>
      <div className="mt-2">
        <VerdictBadge verdict={task.verdict} />
      </div>
    </div>
  );
}

function DraggableTask({ task }: { task: TaskItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? "opacity-40" : ""}`}
    >
      <TaskCard task={task} />
    </div>
  );
}

function DropColumn({
  id,
  title,
  traits,
  blurb,
  children,
}: {
  id: string;
  title: string;
  traits: string[];
  blurb: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[14rem] border p-3 transition ${
        isOver ? "border-accent bg-accent-soft/40" : "border-ink-200 bg-white/70"
      }`}
    >
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {traits.map((t) => (
          <span
            key={t}
            className="border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[10px] text-ink-700/70"
          >
            {t}
          </span>
        ))}
      </div>
      <p className="mt-1 text-[11px] text-ink-700/55">{blurb}</p>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

export default function AssignPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    projectInput,
    goal,
    projectId,
    setProjectId,
    tasks,
    guides,
    members,
    assignments,
    assignTask,
    setAssignments,
  } = useSession();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  if (!tasks.length) return <Navigate to="/project" replace />;

  const unassigned = tasks.filter((t) => !assignments[t.id]);
  const activeTask = tasks.find((t) => t.id === activeId) || null;

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const taskId = String(active.id);
    const overId = String(over.id);

    if (overId === "pool") {
      assignTask(taskId, null);
      return;
    }
    if (overId === "A" || overId === "B" || overId === "C") {
      assignTask(taskId, overId);
    }
  }

  async function saveAndContinue() {
    const items = Object.entries(assignments)
      .filter(([, member]) => member)
      .map(([task_id, member_id]) => ({
        task_id,
        member_id: member_id as string,
      }));

    if (!items.length) {
      setError("최소 1개 업무를 팀원에게 배정하세요.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await postAssign(projectInput, items);

      if (user?.id) {
        let pid = projectId;
        if (!pid) {
          pid = await saveProjectBundle({
            userId: user.id,
            rawInput: projectInput,
            goal,
            tasks,
            guides,
          });
          setProjectId(pid);
        }
        if (pid) {
          await saveAssignmentsBundle({
            projectId: pid,
            assignments: items,
            tasks,
          });
        }
      }

      navigate("/result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "분배 저장 실패");
    } finally {
      setBusy(false);
    }
  }

  function autoFillEven() {
    const next: Record<string, "A" | "B" | "C"> = {};
    const order: ("A" | "B" | "C")[] = ["A", "B", "C"];
    tasks.forEach((t, i) => {
      next[t.id] = order[i % 3];
    });
    setAssignments(next);
  }

  return (
    <section>
      <p className="font-display text-sm font-bold text-accent/50">05</p>
      <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink-900">
        분배
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-ink-700/75">
        업무 카드를 팀원 컬럼으로 드래그하세요.{" "}
        <span className="font-semibold text-ink-900">
          분배는 팀장(사람) 몫
        </span>
        입니다. AI 자동매칭은 없습니다.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={autoFillEven}
          className="rounded-md border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-700"
        >
          균등 배정
        </button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <DropColumn
            id="pool"
            title="미배정"
            traits={["대기"]}
            blurb="여기로 되돌릴 수 있습니다"
          >
            {unassigned.map((task) => (
              <DraggableTask key={task.id} task={task} />
            ))}
          </DropColumn>

          {members.map((m) => (
            <DropColumn
              key={m.id}
              id={m.id}
              title={m.name}
              traits={m.traits}
              blurb={m.blurb}
            >
              {tasks
                .filter((t) => assignments[t.id] === m.id)
                .map((task) => (
                  <DraggableTask key={task.id} task={task} />
                ))}
            </DropColumn>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} dragging /> : null}
        </DragOverlay>
      </DndContext>

      {error ? (
        <p className="mt-4 border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-signal-red">
          {error}
        </p>
      ) : null}

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => navigate("/guide")}
          className="rounded-md border border-ink-200 bg-white px-4 py-2.5 text-sm"
        >
          이전
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void saveAndContinue()}
          className="rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {busy ? "저장 중…" : "다음: 결과"}
        </button>
      </div>
    </section>
  );
}
