import { Prediction } from "./UserDashboard";
import { Skeleton } from "./ui/skeleton";

interface PredictionResultsProps {
  predictions: Prediction[];
  isLoading?: boolean;
}

export function PredictionResults({ predictions, isLoading }: PredictionResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-live="polite">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-10 w-12 rounded-lg" />
              <Skeleton className="h-5 w-14 rounded" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
        <p className="text-sm text-gray-500 pt-2">Analyzing digit…</p>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Draw a digit and click "Predict" to see results</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {predictions.map((pred, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`text-4xl font-bold ${index === 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                {pred.digit}
              </span>
              <span className={`text-sm ${index === 0 ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                {(pred.confidence * 100).toFixed(1)}%
              </span>
            </div>
            {index === 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Best Match
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                index === 0 ? 'bg-blue-600' : 'bg-gray-400'
              }`}
              style={{ width: `${pred.confidence * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
