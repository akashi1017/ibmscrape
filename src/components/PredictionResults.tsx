import { Prediction, MultiDigitPrediction } from "./UserDashboard";
import { Skeleton } from "./ui/skeleton";

interface PredictionResultsProps {
  prediction: Prediction | null;
  multiPrediction: MultiDigitPrediction | null;
  isLoading?: boolean;
}

export function PredictionResults({ prediction, multiPrediction, isLoading }: PredictionResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 text-center" aria-busy="true" aria-live="polite">
        <Skeleton className="h-28 w-28 rounded-2xl mx-auto" />
        <Skeleton className="h-5 w-24 rounded mx-auto" />
        <p className="text-sm text-gray-500 pt-1">Analyzing digit…</p>
      </div>
    );
  }

  if (!prediction && !multiPrediction) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-4xl mb-3">🖊️</p>
        <p className="text-sm">Draw a digit and click "Predict" to see the result</p>
      </div>
    );
  }

  // Multi-digit result
  if (multiPrediction) {
    const avgPct = (multiPrediction.avg_confidence * 100).toFixed(1);

    return (
      <div className="flex flex-col items-center gap-5">
        {/* Number display */}
        <div className="flex items-center justify-center rounded-2xl bg-blue-50 border-2 border-blue-200 px-6 py-4 min-w-[80px]">
          <span className="text-5xl font-extrabold text-blue-600 tracking-wider">{multiPrediction.number}</span>
        </div>

        {/* Per-digit breakdown */}
        <div className="w-full space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-2">Per-digit breakdown</p>
          {multiPrediction.digits.map((d, i) => {
            const pct = (d.confidence * 100).toFixed(1);
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg font-bold text-blue-600 w-6 text-center">{d.digit}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600 w-12 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>

        {/* Average confidence */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Avg Confidence</span>
            <span className="text-sm font-bold text-blue-600">{avgPct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-700"
              style={{ width: `${avgPct}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Detected {multiPrediction.digit_count} digit{multiPrediction.digit_count > 1 ? 's' : ''} with {avgPct}% average confidence.
        </p>
      </div>
    );
  }

  // Single-digit result
  const confidencePct = (prediction!.confidence * 100).toFixed(1);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Large digit display */}
      <div className="flex items-center justify-center w-28 h-28 rounded-2xl bg-blue-50 border-2 border-blue-200">
        <span className="text-6xl font-extrabold text-blue-600">{prediction!.digit}</span>
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
