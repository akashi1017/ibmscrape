interface AdminPrediction {
  id: number;
  user_name: string;
  user_email: string;
  predicted_value: string;
  confidence: number;
  digit_count: number;
  created_at: string;
}

function formatTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return isoString; }
}

export function UserActivityTable({ predictions }: { predictions: AdminPrediction[] }) {
  if (predictions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: "var(--fg-muted)", fontSize: 13 }}>
        No predictions recorded yet.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="dg-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Number</th>
            <th>Digits</th>
            <th>Confidence</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map(p => (
            <tr key={p.id}>
              <td>
                <div style={{ fontWeight: 500, fontSize: 13, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.user_name}</div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.user_email}</div>
              </td>
              <td>
                <span className="dg-number-badge">{p.predicted_value}</span>
              </td>
              <td style={{ color: "var(--fg-muted)", fontSize: 13 }}>{p.digit_count}</td>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, maxWidth: 80, background: "var(--bg-elevated)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "var(--dg-accent)", borderRadius: 4, width: `${(p.confidence * 100).toFixed(0)}%` }} />
                  </div>
                  <span className="mono" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                    {(p.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </td>
              <td style={{ color: "var(--fg-muted)", whiteSpace: "nowrap", fontSize: 12 }}>
                {formatTime(p.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
