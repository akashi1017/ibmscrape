import { Pencil } from "lucide-react";
import { MultiDigitPrediction } from "./UserDashboard";

interface Props {
  prediction: MultiDigitPrediction | null;
  isLoading?: boolean;
}

function ConfPill({ digit, confidence }: { digit: number; confidence: number }) {
  const pct = confidence * 100;
  const tier = pct >= 80 ? "green" : pct >= 50 ? "amber" : "red";
  return (
    <span className={`dg-conf-pill dg-conf-pill--${tier}`}>
      <span className="dg-conf-pill-digit">{digit}</span>
      <span className="dg-conf-pill-pct">{pct.toFixed(0)}%</span>
    </span>
  );
}

export function PredictionResults({ prediction, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="dg-result-empty" aria-busy="true" aria-live="polite">
        <span className="dg-spinner dg-spinner--lg" />
        <span style={{ marginTop: 12, color: "var(--fg-muted)", fontSize: 13 }}>
          Analyzing digits…
        </span>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="dg-result-empty">
        <Pencil size={36} style={{ opacity: 0.15 }} />
        <span>Draw or upload a number and click "Predict"</span>
      </div>
    );
  }

  const avgPct = (prediction.confidence * 100).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="dg-result-number">
        <span className="mono">{prediction.predicted_value}</span>
      </div>

      {prediction.per_digit_confidences.length > 0 && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--fg-muted)", marginBottom: 8 }}>
            Per-digit confidence
          </p>
          <div className="dg-pills-row">
            {prediction.per_digit_confidences.map((d, i) => (
              <ConfPill key={i} digit={d.digit} confidence={d.confidence} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, marginBottom: 6, fontWeight: 500 }}>
          <span>Avg confidence</span>
          <span className="mono" style={{ color: "var(--dg-accent)", fontWeight: 600 }}>{avgPct}%</span>
        </div>
        <div className="dg-result-bar-track">
          <div className="dg-result-bar-fill" style={{ width: `${avgPct}%` }} />
        </div>
      </div>

      <p style={{ fontSize: 12, color: "var(--fg-muted)", textAlign: "center" }}>
        Detected {prediction.digit_count} digit{prediction.digit_count === 1 ? "" : "s"} with {avgPct}% average confidence
      </p>
    </div>
  );
}
