import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line,
  ScatterChart, Scatter,
} from "recharts";

const DIGIT_COLORS = [
  "#3b82f6","#10b981","#8b5cf6","#f59e0b","#ef4444",
  "#06b6d4","#ec4899","#84cc16","#f97316","#6366f1",
];

interface ConfidenceBucket { range: string; count: number; }
interface ScatterPoint { predicted_value: string; confidence: number; }
interface TimePoint { date: string; count: number; }

const tooltipStyle = {
  backgroundColor: "var(--bg-card)",
  border: "1px solid var(--dg-border)",
  borderRadius: "var(--dg-radius)",
  fontSize: 12,
  color: "var(--fg)",
};

const axisStyle = { fontSize: 11 };
const axisStroke = "var(--fg-dim)";
const gridStroke = "var(--dg-border)";
const accentColor = "#6d5cff";

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-muted)", fontSize: 13 }}>
      {children}
    </div>
  );
}

export function ConfidenceHistogram({ buckets }: { buckets: ConfidenceBucket[] }) {
  const total = buckets.reduce((s, b) => s + b.count, 0);
  if (total === 0) return <Empty>No predictions yet.</Empty>;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={buckets} barCategoryGap="15%">
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="range" stroke={axisStroke} style={axisStyle}
               label={{ value: "Confidence %", position: "insideBottom", offset: -2, fontSize: 11, fill: "var(--fg-dim)" }} />
        <YAxis stroke={axisStroke} style={axisStyle} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v.toLocaleString(), "Predictions"]} />
        <Bar dataKey="count" fill={accentColor} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PredictionScatter({ points }: { points: ScatterPoint[] }) {
  const data = points
    .map(p => {
      const numeric = parseFloat(p.predicted_value);
      return isNaN(numeric) ? null : { x: numeric, y: parseFloat((p.confidence * 100).toFixed(1)), label: p.predicted_value };
    })
    .filter(Boolean) as { x: number; y: number; label: string }[];

  if (data.length === 0) return <Empty>No numeric predictions recorded yet.</Empty>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis type="number" dataKey="x" name="Predicted Number" stroke={axisStroke} style={axisStyle}
               label={{ value: "Predicted Number", position: "insideBottom", offset: -2, fontSize: 11, fill: "var(--fg-dim)" }} />
        <YAxis type="number" dataKey="y" name="Confidence" domain={[0, 100]} stroke={axisStroke} style={axisStyle}
               label={{ value: "Confidence %", angle: -90, position: "insideLeft", offset: 10, fontSize: 11, fill: "var(--fg-dim)" }} />
        <Tooltip
          content={({ active, payload }: any) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div style={{ ...tooltipStyle, padding: "6px 10px" }}>
                <p style={{ fontWeight: 600 }}>"{d.label}"</p>
                <p style={{ color: "var(--fg-muted)" }}>Confidence: {d.y.toFixed(1)}%</p>
              </div>
            );
          }}
        />
        <Scatter data={data} fill={accentColor} opacity={0.7} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function PredictionsOverTime({ points }: { points: TimePoint[] }) {
  if (points.length === 0) return <Empty>No predictions in the selected window.</Empty>;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={points}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="date" stroke={axisStroke} style={axisStyle} />
        <YAxis stroke={axisStroke} style={axisStyle} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="count" name="Predictions" stroke={accentColor} strokeWidth={2} dot={{ r: 3, fill: accentColor }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DigitFrequency({ frequency }: { frequency: Record<string, number> }) {
  const data = Array.from({ length: 10 }, (_, i) => ({
    digit: String(i), count: frequency[String(i)] ?? 0,
  }));
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return <Empty>No digits recorded yet.</Empty>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="digit" stroke={axisStroke} style={axisStyle} />
        <YAxis stroke={axisStroke} style={axisStyle} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v.toLocaleString(), "Occurrences"]} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={DIGIT_COLORS[i]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AvgConfidencePerDigit({ avgs }: { avgs: Record<string, number> }) {
  const data = Array.from({ length: 10 }, (_, i) => ({
    digit: String(i), avg: parseFloat(((avgs[String(i)] ?? 0) * 100).toFixed(2)),
  }));
  if (!data.some(d => d.avg > 0)) return <Empty>No data yet.</Empty>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis dataKey="digit" stroke={axisStroke} style={axisStyle} />
        <YAxis domain={[0, 100]} stroke={axisStroke} style={axisStyle}
               label={{ value: "Avg %", angle: -90, position: "insideLeft", offset: 10, fontSize: 11, fill: "var(--fg-dim)" }} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v.toFixed(1)}%`, "Avg confidence"]} />
        <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={DIGIT_COLORS[i]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
