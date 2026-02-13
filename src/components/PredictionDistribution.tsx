import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { digit: '0', count: 4523 },
  { digit: '1', count: 4891 },
  { digit: '2', count: 4328 },
  { digit: '3', count: 4667 },
  { digit: '4', count: 4234 },
  { digit: '5', count: 4112 },
  { digit: '6', count: 4456 },
  { digit: '7', count: 4789 },
  { digit: '8', count: 4345 },
  { digit: '9', count: 4583 },
];

export function PredictionDistribution() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="digit" 
          stroke="#9ca3af"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#9ca3af"
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px'
          }}
        />
        <Bar 
          dataKey="count" 
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
