import { useEffect, useState } from "react";
import {
  createTask,
  fetchTasks,
  deleteTask,
  updateTaskStatus,
  generateSchedule,
  compareSchedule,
} from "./api";

function toInstantFromLocalDatetime(localValue) {
  const d = new Date(localValue); // timezone local -> ISO UTC
  return d.toISOString();
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadlineLocal, setDeadlineLocal] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [priority, setPriority] = useState(3);

  // schedule state
  const [strategy, setStrategy] = useState("EDF");
  const [availableMinutesPerDay, setAvailableMinutesPerDay] = useState(480);
  const [scheduleResult, setScheduleResult] = useState(null);
  const [scheduleBusy, setScheduleBusy] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  // compare state
  const [compareBusy, setCompareBusy] = useState(false);
  const [compareError, setCompareError] = useState("");
  const [compareResult, setCompareResult] = useState(null);

  async function reload() {
    setError("");
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (!deadlineLocal) throw new Error("Alege un deadline.");
      const payload = {
        title,
        description,
        deadline: toInstantFromLocalDatetime(deadlineLocal),
        estimatedMinutes: Number(estimatedMinutes),
        priority: Number(priority),
      };

      await createTask(payload);

      setTitle("");
      setDescription("");
      setDeadlineLocal("");
      setEstimatedMinutes(60);
      setPriority(3);

      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onChangeStatus(id, status) {
    setBusy(true);
    setError("");
    try {
      await updateTaskStatus(id, status);
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    const ok = confirm("Ștergi task-ul?");
    if (!ok) return;

    setBusy(true);
    setError("");
    try {
      await deleteTask(id);
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onGenerateSchedule() {
    setScheduleBusy(true);
    setScheduleError("");
    try {
      const res = await generateSchedule(strategy, Number(availableMinutesPerDay));
      setScheduleResult(res);
    } catch (e) {
      setScheduleError(e.message);
    } finally {
      setScheduleBusy(false);
    }
  }

  async function onCompare() {
    setCompareBusy(true);
    setCompareError("");
    try {
      const res = await compareSchedule(Number(availableMinutesPerDay));
      setCompareResult(res);
    } catch (e) {
      setCompareError(e.message);
    } finally {
      setCompareBusy(false);
    }
  }

  function renderReason(t) {
    if (!t.reason) return null;
    return <div style={{ color: "#666" }}>reason: {t.reason}</div>;
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>TaskFlow</h1>
      <p style={{ marginTop: 0, color: "#666" }}>Smart task management and scheduling</p>

      {error && (
        <div style={{ background: "#ffe6e6", padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <b>Eroare:</b> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        {/* FORM */}
        <div style={{ border: "1px solid #eee", padding: 16, borderRadius: 12 }}>
          <h2 style={{ marginTop: 0 }}>Adaugă task</h2>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              Titlu
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              Descriere
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              Deadline
              <input
                type="datetime-local"
                value={deadlineLocal}
                onChange={(e) => setDeadlineLocal(e.target.value)}
                required
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              Durată estimată (minute)
              <input
                type="number"
                min="1"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                required
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              Prioritate (1-5)
              <input
                type="number"
                min="1"
                max="5"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
              />
            </label>

            <button type="submit" disabled={busy} style={{ padding: "10px 12px" }}>
              {busy ? "Se salvează..." : "Creează task"}
            </button>
          </form>
        </div>

        {/* TASKS LIST */}
        <div style={{ border: "1px solid #eee", padding: 16, borderRadius: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h2 style={{ marginTop: 0 }}>Task-uri</h2>
            <button onClick={reload} disabled={busy} style={{ padding: "8px 10px" }}>
              Refresh
            </button>
          </div>

          {tasks.length === 0 ? (
            <p style={{ color: "#666" }}>Nu ai task-uri încă.</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {tasks
                .slice()
                .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                .map((t) => (
                  <li key={t.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <b>{t.title}</b>{" "}
                        <span style={{ color: "#666" }}>
                          ({t.estimatedMinutes} min, prio {t.priority})
                        </span>
                        <div style={{ color: "#444", marginTop: 2 }}>
                          status: <b>{t.status}</b> • deadline: {new Date(t.deadline).toLocaleString()}
                        </div>
                        {t.description && <div style={{ color: "#666" }}>{t.description}</div>}
                      </div>

                      <button onClick={() => onDelete(t.id)} disabled={busy} style={{ height: 36 }}>
                        Delete
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                      <button onClick={() => onChangeStatus(t.id, "TODO")} disabled={busy}>
                        TODO
                      </button>
                      <button onClick={() => onChangeStatus(t.id, "IN_PROGRESS")} disabled={busy}>
                        In progress
                      </button>
                      <button onClick={() => onChangeStatus(t.id, "DONE")} disabled={busy}>
                        Done
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      {/* SCHEDULING */}
      <div style={{ marginTop: 24, border: "1px solid #eee", padding: 16, borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Schedule</h2>

        {(scheduleError || compareError) && (
          <div style={{ background: "#ffe6e6", padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <b>Eroare:</b> {scheduleError || compareError}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Strategie
            <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
              <option value="EDF">EDF (Earliest Deadline First)</option>
              <option value="WEIGHTED_GREEDY">Weighted Greedy</option>
            </select>
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Minute/zi
            <input
              type="number"
              min="30"
              max="1440"
              value={availableMinutesPerDay}
              onChange={(e) => setAvailableMinutesPerDay(e.target.value)}
              style={{ width: 110 }}
            />
          </label>

          <button onClick={onGenerateSchedule} disabled={scheduleBusy} style={{ padding: "8px 10px" }}>
            {scheduleBusy ? "Calculating..." : "Generate schedule"}
          </button>

          <button onClick={onCompare} disabled={compareBusy} style={{ padding: "8px 10px" }}>
            {compareBusy ? "Comparing..." : "Compare strategies"}
          </button>
        </div>

        {scheduleResult && (
          <div style={{ marginTop: 16 }}>
            <p style={{ marginBottom: 6 }}>
              <b>Total minutes:</b> {scheduleResult.totalEstimatedMinutes} / {scheduleResult.availableMinutesPerDay}{" "}
              {scheduleResult.overloaded && <span style={{ color: "crimson" }}>(OVERLOADED)</span>}
            </p>
            <p style={{ marginTop: 0 }}>
              <b>On-time rate:</b> {(scheduleResult.onTimeRate * 100).toFixed(0)}% •{" "}
              <b>Avg tardiness:</b> {scheduleResult.averageTardinessMin.toFixed(1)} min
            </p>

            {scheduleResult.orderedTasks.length === 0 ? (
              <p style={{ color: "#666" }}>No tasks to schedule (maybe all are DONE).</p>
            ) : (
              <ol style={{ paddingLeft: 18 }}>
                {scheduleResult.orderedTasks.map((t) => (
                  <li key={t.id} style={{ marginBottom: 10 }}>
                    <b>{t.title}</b>{" "}
                    <span style={{ color: "#666" }}>
                      ({t.estimatedMinutes} min, prio {t.priority}, score {Number(t.score).toFixed(2)})
                    </span>
                    <div style={{ color: "#444" }}>
                      deadline: {new Date(t.deadline).toLocaleString()} • status: {t.status}
                    </div>
                    {renderReason(t)}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {compareResult && (
          <div style={{ marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>Comparison</h3>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px" }}>
                    Strategy
                  </th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px" }}>
                    Total
                  </th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px" }}>
                    Overloaded
                  </th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px" }}>
                    On-time
                  </th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "8px" }}>
                    Avg tardiness
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "EDF", r: compareResult.edf },
                  { name: "Weighted Greedy", r: compareResult.weightedGreedy },
                ].map((row) => (
                  <tr key={row.name}>
                    <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                      <b>{row.name}</b>
                    </td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                      {row.r.totalEstimatedMinutes} / {row.r.availableMinutesPerDay}
                    </td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                      {row.r.overloaded ? <span style={{ color: "crimson" }}>YES</span> : "NO"}
                    </td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                      {(row.r.onTimeRate * 100).toFixed(0)}%
                    </td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                      {row.r.averageTardinessMin.toFixed(1)} min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
