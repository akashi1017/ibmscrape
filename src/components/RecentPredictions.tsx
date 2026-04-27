import { PredictionHistory } from "./UserDashboard";
import { Clock } from "lucide-react";

interface Props {
  history: PredictionHistory[];
}

export function RecentPredictions({ history }: Props) {
  if (history.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: "var(--fg-muted)", fontSize: 13 }}>
        No predictions yet — draw or upload a number above.
      </div>
    );
  }

  return (
    <div className="dg-recent-list">
      {history.slice(0, 8).map(item => {
        const pct = (item.confidence * 100).toFixed(0);
        const timeStr = item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        return (
          <div key={item.id} className="dg-recent-item">
            <div className="dg-recent-thumb">
              {item.imageData ? (
                <img src={item.imageData} alt={item.predicted_value} />
              ) : null}
            </div>
            <span className="mono" style={{ fontWeight: 600, fontSize: 15 }}>
              {item.predicted_value}
            </span>
            <span className="dg-conf-badge">{pct}%</span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--fg-muted)" }}>
              {timeStr}
            </span>
          </div>
        );
      })}
    </div>
  );
}
