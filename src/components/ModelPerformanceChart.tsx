import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', accuracy: 97.2, predictions: 1200 },
  { time: '04:00', accuracy: 97.8, predictions: 800 },
  { time: '08:00', accuracy: 98.1, predictions: 2500 },
  { time: '12:00', accuracy: 98.5, predictions: 3800 },
  { time: '16:00', accuracy: 98.7, predictions: 4200 },
  { time: '20:00', accuracy: 98.4, predictions: 2900 },
];

export function ModelPerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="time" 
          stroke="#9ca3af"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#9ca3af"
          style={{ fontSize: '12px' }}
          domain={[96, 100]}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="accuracy" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
