const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getHealth() {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error("health check failed");
  return res.json();
}

export { API_URL };
