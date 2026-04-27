import { useEffect, useState, useMemo } from "react";
import { Activity, Target, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line,
} from "recharts";
import API_BASE from "../config";

interface DigitConfidence { digit: number; confidence: number; }
interface PredictionRecord {
  id: number; predicted_value: string; confidence: number; digit_count: number;
  per_digit_confidences: DigitConfidence[] | null; image_path: string | null; created_at: string;
}
interface UserStats {
  prediction_count: number; avg_confidence: number; last_prediction: PredictionRecord | null;
}

const DIGIT_COLORS = [
  "#3b82f6","#10b981","#8b5cf6","#f59e0b","#ef4444",
  "#06b6d4","#ec4899","#84cc16","#f97316","#6366f1",
];

function ConfPill({ digit, confidence }: { digit: number; confidence: number }) {
  const pct = confidence * 100;
  const tier = pct >= 80 ? "green" : pct >= 50 ? "amber" : "red";
  return (
    <span className={`dg-conf-pill dg-conf-pill--${tier}`}>
      <span className="dg-conf-pill-digit">{digit}</span>
      <span className="dg-conf-pill-pct">{pct.toFixed(0)}%</span>
    </span>
  );
}

export default function UserStatsPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("mnist-auth-token");
    if (!token) { setError("Not authenticated"); setLoading(false); return; }

    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_BASE}/api/me/stats`, { headers }).then(r => r.ok ? r.json() : Promise.reject(`Error ${r.status}`)),
      fetch(`${API_BASE}/api/history?limit=100`, { headers }).then(r => r.ok ? r.json() : []),
    ])
      .then(([statsData, histData]: [UserStats, PredictionRecord[]]) => {
        setStats(statsData);
        setHistory(histData);
        setLoading(false);
      })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, []);

  const digitDistribution = useMemo(() => {
    const counts = Array.from({ length: 10 }, () => 0);
    for (const p of history) {
      if (p.per_digit_confidences && p.per_digit_confidences.length > 0) {
        for (const d of p.per_digit_confidences) {
          if (d.digit >= 0 && d.digit <= 9) counts[d.digit] += 1;
        }
      } else {
        for (const ch of p.predicted_value) {
          const d = parseInt(ch, 10);
          if (!isNaN(d) && d >= 0 && d <= 9) counts[d] += 1;
        }
      }
    }
    return counts.map((count, digit) => ({ digit: String(digit), count }));
  }, [history]);

  const overTime = useMemo(() => {
    const byDate = new Map<string, { count: number; sum: number }>();
    for (const p of history) {
      const day = new Date(p.created_at).toISOString().slice(0, 10);
      const cur = byDate.get(day) ?? { count: 0, sum: 0 };
      cur.count += 1; cur.sum += p.confidence;
      byDate.set(day, cur);
    }
    return [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, v]) => ({ date, count: v.count, avgConf: parseFloat(((v.sum / v.count) * 100).toFixed(1)) }));
  }, [history]);

  const tooltipStyle = {
    backgroundColor: "var(--bg-card)", border: "1px solid var(--dg-border)",
    borderRadius: "var(--dg-radius)", fontSize: 12, color: "var(--fg)",
  };

  return (
    <div>
      <div className="dg-section-header">
        <div>
          <h1 className="dg-section-title">Dashboard</h1>
          <p className="dg-section-subtitle">Your prediction activity at a glance</p>
        </div>
      </div>

      {error && <p style={{ color: "var(--dg-red)", fontSize: 13, marginBottom: 16 }}>{error}</p>}

      {/* Stat cards */}
      <div className="dg-stats-row">
        <div className="dg-stat-card">
          <div className="dg-stat-card-icon"><Activity size={20} /></div>
          <div className="dg-stat-card-body">
            <span className="dg-stat-card-label">Total Predictions</span>
            <span className="dg-stat-card-value mono">
              {loading ? "—" : (stats?.prediction_count ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="dg-stat-card">
          <div className="dg-stat-card-icon" style={{ color: "var(--dg-green)" }}><Target size={20} /></div>
          <div className="dg-stat-card-body">
            <span className="dg-stat-card-label">Avg Confidence</span>
            <span className="dg-stat-card-value mono">
              {loading ? "—" : `${((stats?.avg_confidence ?? 0) * 100).toFixed(1)}%`}
            </span>
          </div>
        </div>
        <div className="dg-stat-card">
          <div className="dg-stat-card-icon" style={{ color: "var(--dg-amber)" }}><Clock size={20} /></div>
          <div className="dg-stat-card-body">
            <span className="dg-stat-card-label">Last Predicted</span>
            <span className="dg-stat-card-value mono">
              {loading ? "—" : (stats?.last_prediction?.predicted_value ?? "—")}
            </span>
          </div>
        </div>
      </div>

      {/* Last prediction */}
      <div className="dg-card" style={{ marginTop: 4 }}>
        <div className="dg-card-header">
          <h3 className="dg-card-title">Last Prediction</h3>
        </div>
        {loading ? (
          <p style={{ color: "var(--fg-muted)", fontSize: 13 }}>Loading…</p>
        ) : !stats?.last_prediction ? (
          <p style={{ color: "var(--fg-muted)", fontSize: 13 }}>No predictions yet — head to Predict.</p>
        ) : (
          <div className="dg-last-pred">
            {stats.last_prediction.image_path && (
              <div className="dg-last-pred-img">
                <img src={`${API_BASE}/${stats.last_prediction.image_path}`} alt="Last prediction" />
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span className="mono" style={{ fontSize: 32, fontWeight: 700, color: "var(--dg-accent)" }}>
                {stats.last_prediction.predicted_value}
              </span>
              <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>
                {(stats.last_prediction.confidence * 100).toFixed(1)}% avg · {stats.last_prediction.digit_count} digit{stats.last_prediction.digit_count === 1 ? "" : "s"}
              </span>
              <span style={{ fontSize: 12, color: "var(--fg-dim)" }}>
                {new Date(stats.last_prediction.created_at).toLocaleString()}
              </span>
              {(stats.last_prediction.per_digit_confidences ?? []).length > 0 && (
                <div className="dg-pills-row" style={{ marginTop: 4 }}>
                  {(stats.last_prediction.per_digit_confidences ?? []).map((d, i) => (
                    <ConfPill key={i} digit={d.digit} confidence={d.confidence} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Analytics charts */}
      {!loading && history.length > 0 && (
        <div className="dg-user-charts">
          <div className="dg-card">
            <h3 className="dg-card-title" style={{ marginBottom: 4 }}>Digit Distribution</h3>
            <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 16 }}>How often each digit appears</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={digitDistribution} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dg-border)" />
                <XAxis dataKey="digit" stroke="var(--fg-dim)" style={{ fontSize: 12 }} />
                <YAxis stroke="var(--fg-dim)" style={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {digitDistribution.map((_, i) => (
                    <Cell key={i} fill={DIGIT_COLORS[i % DIGIT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="dg-card">
            <h3 className="dg-card-title" style={{ marginBottom: 4 }}>Predictions Over Time</h3>
            <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 16 }}>Daily volume</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={overTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dg-border)" />
                <XAxis dataKey="date" stroke="var(--fg-dim)" style={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="var(--fg-dim)" style={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--fg-dim)" domain={[0, 100]} style={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line yAxisId="left" type="monotone" dataKey="count" name="Predictions" stroke="var(--dg-accent)" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="avgConf" name="Avg Conf %" stroke="var(--dg-green)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
