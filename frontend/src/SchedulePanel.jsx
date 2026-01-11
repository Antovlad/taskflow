import { useState } from "react";
import { generateSchedule } from "./api";

export default function SchedulePanel() {
  const [strategy, setStrategy] = useState("EDF");
  const [minutes, setMinutes] = useState(480);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onGenerate() {
    setBusy(true);
    setError("");
    try {
      const res = await generateSchedule(strategy, Number(minutes));
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ border: "1px solid #eee", padding: 16, borderRadius: 12 }}>
      <h2 style={{ marginTop: 0 }}>Schedule</h2>

      {error && (
        <div style={{ background: "#ffe6e6", padding: 10, borderRadius: 8, marginBottom: 12 }}>
          <b>Eroare:</b> {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <label>
          Strategy{" "}
          <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
            <option value="EDF">EDF (Earliest Deadline First)</option>
            <option value="WEIGHTED_GREEDY">Weighted Greedy</option>
          </select>
        </label>

        <label>
          Minutes/day{" "}
          <input
            type="number"
            min="30"
            max="1440"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            style={{ width: 100 }}
          />
        </label>

        <button onClick={onGenerate} disabled={busy}>
          {busy ? "Calculating..." : "Generate schedule"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 16 }}>
          <p>
            <b>Total minutes:</b> {result.totalEstimatedMinutes}{" "}
            {result.overloaded && <span style={{ color: "crimson" }}>(OVERLOADED)</span>}
          </p>
          <p>
            <b>On-time rate:</b> {(result.onTimeRate * 100).toFixed(0)}% •{" "}
            <b>Avg tardiness:</b> {result.averageTardinessMin.toFixed(1)} min
          </p>

          {result.orderedTasks.length === 0 ? (
            <p style={{ color: "#666" }}>No tasks to schedule.</p>
          ) : (
            <ol>
              {result.orderedTasks.map((t) => (
                <li key={t.id} style={{ marginBottom: 8 }}>
                  <b>{t.title}</b>{" "}
                  <span style={{ color: "#666" }}>
                    ({t.estimatedMinutes} min, prio {t.priority}, score{" "}
                    {t.score.toFixed(2)})
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
