import { Prediction } from "./UserDashboard";
import { Skeleton } from "./ui/skeleton";

interface PredictionResultsProps {
  prediction: Prediction | null;
  isLoading?: boolean;
}

export function PredictionResults({ prediction, isLoading }: PredictionResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 text-center" aria-busy="true" aria-live="polite">
        <Skeleton className="h-28 w-28 rounded-2xl mx-auto" />
        <Skeleton className="h-5 w-24 rounded mx-auto" />
        <p className="text-sm text-gray-500 pt-1">Analyzing digit…</p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-4xl mb-3">🖊️</p>
        <p className="text-sm">Draw a digit and click "Predict" to see the result</p>
      </div>
    );
  }

  const confidencePct = (prediction.confidence * 100).toFixed(1);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Large digit display */}
      <div className="flex items-center justify-center w-28 h-28 rounded-2xl bg-blue-50 border-2 border-blue-200">
        <span className="text-6xl font-extrabold text-blue-600">{prediction.digit}</span>
      </div>

      {/* Confidence */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Confidence</span>
          <span className="text-sm font-bold text-blue-600">{confidencePct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-700"
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        The model predicts this digit with {confidencePct}% confidence.
      </p>
    </div>
  );
}
