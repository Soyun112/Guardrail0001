const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || JSON.stringify(body);
    } catch {
      /* ignore */
    }
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return res.json() as Promise<T>;
}

export function getHealth() {
  return request<{ status: string; gemini: string }>("/health");
}

export function postDecompose(project_input: string) {
  return request<{
    source: string;
    company: { name: string };
    project: { raw_input: string; goal: string };
    approved_ai: string[];
    members: import("./types").Member[];
    tasks: import("./types").TaskItem[];
    workflow_order: string[];
  }>("/decompose", {
    method: "POST",
    body: JSON.stringify({ project_input }),
  });
}

export function postGuide(project_input: string, tasks: unknown[]) {
  return request<{ source: string; guides: import("./types").GuideItem[] }>(
    "/guide",
    {
      method: "POST",
      body: JSON.stringify({ project_input, tasks }),
    },
  );
}

export function postAssign(
  project_input: string,
  assignments: { task_id: string; member_id: string }[],
) {
  return request<{ ok: boolean; stored: string }>("/assign", {
    method: "POST",
    body: JSON.stringify({ project_input, assignments }),
  });
}

export function postExecute(payload: {
  task_id: string;
  task_name?: string;
  project_input?: string;
}) {
  return request<{
    ok: boolean;
    task_id: string;
    task_name: string;
    detail?: string;
    stages: { key: string; label: string; content: string }[];
  }>("/execute", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export { API_URL };
