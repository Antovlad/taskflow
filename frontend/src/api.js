export const API_BASE = "http://localhost:8080";

export async function fetchTasks() {
  const r = await fetch(`${API_BASE}/api/tasks`);
  if (!r.ok) throw new Error("Failed to load tasks");
  return r.json();
}

export async function createTask(payload) {
  const r = await fetch(`${API_BASE}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(txt || "Failed to create task");
  }
  return r.json();
}

export async function deleteTask(id) {
  const r = await fetch(`${API_BASE}/api/tasks/${id}`, { method: "DELETE" });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(txt || "Failed to delete task");
  }
}

export async function updateTaskStatus(id, status) {
  const r = await fetch(`${API_BASE}/api/tasks/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(txt || "Failed to update status");
  }
  return r.json();
}

export async function generateSchedule(strategy, availableMinutesPerDay) {
  const r = await fetch(`${API_BASE}/api/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ strategy, availableMinutesPerDay }),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(txt || "Failed to generate schedule");
  }
  return r.json();
}

export async function compareSchedule(availableMinutesPerDay) {
  const r = await fetch(`${API_BASE}/api/schedule/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ strategy: "EDF", availableMinutesPerDay }),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(txt || "Failed to compare schedule");
  }
  return r.json();
}
