interface AdminPrediction {
  id: number;
  user_name: string;
  user_email: string;
  predicted_digit: number;
  confidence: number;
  created_at: string;
}

interface UserActivityTableProps {
  predictions: AdminPrediction[];
}

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function UserActivityTable({ predictions }: UserActivityTableProps) {
  if (predictions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No predictions recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Digit</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Confidence</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((p) => (
            <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="text-sm font-medium text-gray-900 truncate max-w-[160px]">{p.user_name}</div>
                <div className="text-xs text-gray-500 truncate max-w-[160px]">{p.user_email}</div>
              </td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center justify-center size-9 bg-blue-100 text-blue-700 font-bold rounded-lg text-lg">
                  {p.predicted_digit}
                </span>
              </td>
              <td className="py-3 px-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex-1 max-w-[80px] bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ width: `${(p.confidence * 100).toFixed(0)}%` }}
                    />
                  </div>
                  <span className="text-gray-900 font-medium whitespace-nowrap">
                    {(p.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
                {formatTime(p.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
