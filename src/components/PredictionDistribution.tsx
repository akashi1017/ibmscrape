import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PredictionDistributionProps {
  distribution: Record<string, number>;
}

const DIGIT_COLORS = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
];

export function PredictionDistribution({ distribution }: PredictionDistributionProps) {
  // Build data for digits 0–9, defaulting to 0 if no predictions for that digit
  const data = Array.from({ length: 10 }, (_, i) => ({
    digit: String(i),
    count: distribution[String(i)] ?? 0,
  }));

  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
        No predictions recorded yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="digit"
          stroke="#9ca3af"
          style={{ fontSize: '12px' }}
          label={{ value: 'Digit', position: 'insideBottom', offset: -2, fontSize: 12, fill: '#6b7280' }}
        />
        <YAxis
          stroke="#9ca3af"
          style={{ fontSize: '12px' }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value: number) => [value.toLocaleString(), 'Predictions']}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={DIGIT_COLORS[index % DIGIT_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
