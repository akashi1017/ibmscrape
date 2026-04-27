import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import API_BASE from "../config";

interface DigitConfidence { digit: number; confidence: number; }
interface PredictionRecord {
  id: number; predicted_value: string; confidence: number; digit_count: number;
  per_digit_confidences: DigitConfidence[] | null; image_path: string | null; created_at: string;
}

const PAGE_SIZE = 20;

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

export default function UserHistoryPage() {
  const [items, setItems] = useState<PredictionRecord[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("mnist-auth-token");
    if (!token) { setError("Not authenticated"); setLoading(false); return; }

    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_BASE}/api/history?skip=${page * PAGE_SIZE}&limit=${PAGE_SIZE}`, { headers })
        .then(r => r.ok ? r.json() : Promise.reject(`Error ${r.status}`)),
      fetch(`${API_BASE}/api/history/count`, { headers })
        .then(r => r.ok ? r.json() : { total: null }),
    ])
      .then(([data, countData]: [PredictionRecord[], { total: number | null }]) => {
        setItems(data); setTotal(countData.total); setLoading(false);
      })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, [page]);

  const lastPage = total != null ? Math.max(0, Math.ceil(total / PAGE_SIZE) - 1) : null;
  const hasNext = lastPage != null ? page < lastPage : items.length === PAGE_SIZE;

  return (
    <div>
      <div className="dg-section-header">
        <div>
          <h1 className="dg-section-title">History</h1>
          <p className="dg-section-subtitle">
            All your past predictions{total != null ? ` (${total} total)` : ""}
          </p>
        </div>
      </div>

      {error && <p style={{ color: "var(--dg-red)", fontSize: 13, marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--fg-muted)", fontSize: 13 }}>
          <span className="dg-spinner" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="dg-card" style={{ textAlign: "center", padding: 48, color: "var(--fg-muted)", fontSize: 14 }}>
          No predictions yet.
        </div>
      ) : (
        <>
          <div className="dg-card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="dg-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Number</th>
                  <th>Per-digit confidence</th>
                  <th>Avg</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {items.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="dg-thumb">
                        {p.image_path && (
                          <img src={`${API_BASE}/${p.image_path}`} alt={p.predicted_value} />
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="dg-number-badge">{p.predicted_value}</span>
                    </td>
                    <td>
                      <div className="dg-pills-row">
                        {(p.per_digit_confidences ?? []).map((d, i) => (
                          <ConfPill key={i} digit={d.digit} confidence={d.confidence} />
                        ))}
                      </div>
                    </td>
                    <td className="mono" style={{ whiteSpace: "nowrap" }}>
                      {(p.confidence * 100).toFixed(1)}%
                    </td>
                    <td style={{ color: "var(--fg-muted)", whiteSpace: "nowrap", fontSize: 12 }}>
                      {new Date(p.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dg-pagination">
            <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>
              Page {page + 1}{lastPage != null ? ` of ${lastPage + 1}` : ""}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className="btn-ghost btn-sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                className="btn-ghost btn-sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!hasNext}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
