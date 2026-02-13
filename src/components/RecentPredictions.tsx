import { PredictionHistory } from "./UserDashboard";

interface RecentPredictionsProps {
  history: PredictionHistory[];
}

export function RecentPredictions({ history }: RecentPredictionsProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No predictions yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
      {history.map((item) => (
        <div
          key={item.id}
          className="relative group"
        >
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={item.imageData}
              alt={`Digit ${item.prediction}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full size-6 flex items-center justify-center border-2 border-white">
            {item.prediction}
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-75 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col justify-center">
            <div className="font-semibold">Digit: {item.prediction}</div>
            <div>{(item.confidence * 100).toFixed(0)}%</div>
          </div>
        </div>
      ))}
    </div>
  );
}
