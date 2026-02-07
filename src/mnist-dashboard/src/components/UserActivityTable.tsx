interface Activity {
  id: string;
  user: string;
  action: string;
  digit: number;
  confidence: number;
  timestamp: string;
}

const activities: Activity[] = [
  { id: '1', user: 'user_8492', action: 'Prediction', digit: 7, confidence: 99.2, timestamp: '2 min ago' },
  { id: '2', user: 'user_3271', action: 'Prediction', digit: 3, confidence: 97.8, timestamp: '3 min ago' },
  { id: '3', user: 'user_5649', action: 'Prediction', digit: 1, confidence: 99.5, timestamp: '5 min ago' },
  { id: '4', user: 'user_7823', action: 'Prediction', digit: 9, confidence: 96.3, timestamp: '7 min ago' },
  { id: '5', user: 'user_1092', action: 'Prediction', digit: 5, confidence: 98.7, timestamp: '8 min ago' },
  { id: '6', user: 'user_4556', action: 'Prediction', digit: 0, confidence: 99.1, timestamp: '10 min ago' },
  { id: '7', user: 'user_9834', action: 'Prediction', digit: 2, confidence: 97.4, timestamp: '12 min ago' },
];

export function UserActivityTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Digit</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Confidence</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-900 font-medium">{activity.user}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{activity.action}</td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center justify-center size-8 bg-blue-100 text-blue-700 font-bold rounded">
                  {activity.digit}
                </span>
              </td>
              <td className="py-3 px-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex-1 max-w-[100px] bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-600 h-1.5 rounded-full"
                      style={{ width: `${activity.confidence}%` }}
                    />
                  </div>
                  <span className="text-gray-900 font-medium">{activity.confidence}%</span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-gray-500">{activity.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
