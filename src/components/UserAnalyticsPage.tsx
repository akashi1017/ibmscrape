import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line,
} from "recharts";
import API_BASE from "../config";

interface DigitConfidence { digit: number; confidence: number; }
interface PredictionRecord {
  id: number;
  predicted_value: string;
  confidence: number;
  digit_count: number;
  per_digit_confidences: DigitConfidence[] | null;
  image_path: string | null;
  created_at: string;
}

const DIGIT_COLORS = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
];

export default function UserAnalyticsPage() {
  const [history, setHistory] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("mnist-auth-token");
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/api/history?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(`Error ${r.status}`))
      .then((data: PredictionRecord[]) => { setHistory(data); setLoading(false); })
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
      cur.count += 1;
      cur.sum += p.confidence;
      byDate.set(day, cur);
    }
    return [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, v]) => ({
        date,
        count: v.count,
        avgConfidence: parseFloat(((v.sum / v.count) * 100).toFixed(1)),
      }));
  }, [history]);

  const totalCount = history.length;

  return (
    <div className="px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Insights from your prediction history (last {totalCount})</p>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-gray-400 text-sm">Loading…</p>}

      {!loading && totalCount === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          No predictions yet — analytics will appear once you've made a few.
        </div>
      )}

      {!loading && totalCount > 0 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Digit distribution</h2>
            <p className="text-sm text-gray-500 mb-4">How often each digit appears in your predictions</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={digitDistribution} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="digit" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {digitDistribution.map((_, i) => (
                    <Cell key={i} fill={DIGIT_COLORS[i % DIGIT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Predictions over time</h2>
            <p className="text-sm text-gray-500 mb-4">Daily volume and average confidence</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={overTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="left" stroke="#3b82f6" style={{ fontSize: '12px' }} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" domain={[0, 100]} style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} />
                <Line yAxisId="left" type="monotone" dataKey="count" name="Predictions" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="avgConfidence" name="Avg Confidence %" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
