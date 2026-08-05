import type { GuideItem, TaskItem } from "./types";
import { supabase } from "./supabase";

export async function saveProjectBundle(params: {
  userId: string;
  rawInput: string;
  goal: string;
  tasks: TaskItem[];
  guides?: GuideItem[];
}): Promise<string | null> {
  if (!supabase) return null;

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: params.userId,
      raw_input: params.rawInput,
      goal: params.goal,
    })
    .select("id")
    .single();

  if (projectError || !project) {
    console.error("projects insert failed", projectError);
    return null;
  }

  const guideMap = new Map(
    (params.guides || []).map((g) => [g.task_id, g]),
  );

  const taskRows = params.tasks.map((t) => {
    const g = guideMap.get(t.id);
    return {
      project_id: project.id,
      name: t.name,
      verdict: t.verdict,
      reason: t.reason,
      cause_type: t.cause_type,
      recommended_ai: g?.recommended_ai || t.recommended_ai,
      guide: g?.guide || t.guide || "",
      order_index: t.order_index,
      client_task_id: t.id,
    };
  });

  const { error: tasksError } = await supabase.from("tasks").insert(taskRows);
  if (tasksError) {
    console.error("tasks insert failed", tasksError);
  }

  return project.id as string;
}

export async function saveAssignmentsBundle(params: {
  projectId: string;
  assignments: { task_id: string; member_id: string }[];
  tasks: TaskItem[];
}): Promise<boolean> {
  if (!supabase || !params.projectId) return false;

  const { data: dbTasks, error } = await supabase
    .from("tasks")
    .select("id, client_task_id")
    .eq("project_id", params.projectId);

  if (error || !dbTasks) {
    console.error("tasks lookup failed", error);
    return false;
  }

  const idMap = new Map(
    dbTasks.map((row) => [row.client_task_id as string, row.id as string]),
  );

  const rows = params.assignments
    .map((a) => {
      const taskUuid = idMap.get(a.task_id);
      if (!taskUuid) return null;
      return {
        task_id: taskUuid,
        member_id: a.member_id,
      };
    })
    .filter(
      (row): row is { task_id: string; member_id: string } => row !== null,
    );

  if (!rows.length) return false;

  const { error: assignError } = await supabase
    .from("assignments")
    .insert(rows);
  if (assignError) {
    console.error("assignments insert failed", assignError);
    return false;
  }
  return true;
}
