import { useState, useEffect, useRef } from "react";
import {
  Users, Activity, TrendingUp, Zap, RefreshCw, AlertCircle, X,
  Hash, Sun, Moon, LogOut, Search, ChevronRight,
} from "lucide-react";
import { UserActivityTable } from "./UserActivityTable";
import {
  ConfidenceHistogram,
  PredictionScatter,
  PredictionsOverTime,
  DigitFrequency,
  AvgConfidencePerDigit,
} from "./AdminCharts";
import API_BASE from "../config";

/* ── Types ─────────────────────────────────────────────── */
interface AdminStats { total_users: number; total_predictions: number; }
interface AdminAnalytics {
  confidence_buckets: { range: string; count: number }[];
  scatter: { predicted_value: string; confidence: number }[];
  predictions_over_time: { date: string; count: number }[];
  digit_frequency: Record<string, number>;
  avg_confidence_per_digit: Record<string, number>;
}
interface AdminPrediction {
  id: number; user_id: number; user_name: string; user_email: string;
  predicted_value: string; confidence: number; digit_count: number; created_at: string;
}
interface UserRecord {
  id: number; name: string; email: string; role: string; created_at: string;
}

/* ── Helpers ────────────────────────────────────────────── */
function getInitialTheme(): "light" | "dark" {
  try {
    const s = localStorage.getItem("dg-theme") as "light" | "dark" | null;
    if (s === "light" || s === "dark") return s;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch { return "dark"; }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

/* ── UsersSheet ─────────────────────────────────────────── */
function UsersSheet({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("mnist-auth-token");
    fetch(`${API_BASE}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(`Error ${r.status}`))
      .then((data: UserRecord[]) => { setUsers(data); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => searchRef.current?.focus(), 100);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="dg-sheet-overlay" onClick={onClose} />
      <div className="dg-sheet" role="dialog" aria-label="Registered users">
        <div className="dg-sheet-header">
          <div>
            <div className="dg-sheet-title">Registered Users</div>
            <div className="dg-sheet-subtitle">
              {loading ? "Loading…" : `${users.length} total · ${filtered.length} shown`}
            </div>
          </div>
          <button className="dg-sheet-close" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        <div className="dg-sheet-search">
          <div style={{ position: "relative" }}>
            <input
              ref={searchRef}
              className="form-input"
              type="search"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--fg-muted)", pointerEvents: "none", display: "flex" }}>
              <Search size={14} />
            </span>
          </div>
        </div>

        <div className="dg-sheet-body">
          {loading && (
            <div style={{ padding: 32, textAlign: "center", color: "var(--fg-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span className="dg-spinner" /> Loading users…
            </div>
          )}
          {error && <p style={{ padding: 32, textAlign: "center", color: "var(--dg-red)" }}>{error}</p>}
          {!loading && !error && (
            <table className="dg-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th><th>Joined</th>
                  <th style={{ textAlign: "right" }}>Predictions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <>
                    <tr
                      key={u.id}
                      className="dg-user-row"
                      onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                    >
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td style={{ color: "var(--fg-muted)" }}>{u.email}</td>
                      <td>
                        <span className={`dg-role-badge dg-role-badge--${u.role}`}>{u.role}</span>
                      </td>
                      <td style={{ color: "var(--fg-muted)", whiteSpace: "nowrap" }}>
                        {formatDate(u.created_at)}
                      </td>
                      <td className="mono" style={{ textAlign: "right" }}>—</td>
                    </tr>
                    {expandedId === u.id && (
                      <tr key={`${u.id}-expand`}>
                        <td colSpan={5} style={{ padding: 0 }}>
                          <div className="dg-sheet-row-expand">
                            <div>
                              <div className="dg-sheet-expand-label">User ID</div>
                              <div className="dg-sheet-expand-val mono">u_{String(u.id).padStart(6, "0")}</div>
                            </div>
                            <div>
                              <div className="dg-sheet-expand-label">Role</div>
                              <div className="dg-sheet-expand-val">{u.role}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 32, color: "var(--fg-muted)" }}>
                      No users match "{search}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

/* ── AdminLayout ────────────────────────────────────────── */
function AdminLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);
  const userName = localStorage.getItem("mnist-auth-name") || "Admin";
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("dg-theme", theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem("mnist-auth-token");
    localStorage.removeItem("mnist-auth-role");
    window.location.href = "/login";
  };

  return (
    <div className="admin-layout">
      <header className="top-header admin-header">
        <div className="admin-header-brand">
          <div className="sidebar-logo"><Hash size={18} /></div>
          <span className="admin-header-title">DigitAI Admin</span>
        </div>
        <div style={{ flex: 1 }} />
        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="header-divider" />
          <div className="header-user">
            <div className="header-user-info">
              <span className="header-user-name">{userName}</span>
              <span className="header-user-role">Administrator</span>
            </div>
            <div className="dg-avatar">{userInitial}</div>
          </div>
          <button className="btn-ghost btn-sm" onClick={handleLogout} style={{ marginLeft: 8 }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}

/* ── Loading placeholder ────────────────────────────────── */
function ChartLoading() {
  return (
    <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-muted)", gap: 8 }}>
      <span className="dg-spinner" /> Loading…
    </div>
  );
}

/* ── AdminDashboard ─────────────────────────────────────── */
export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<AdminPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUsers, setShowUsers] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("mnist-auth-token");
    const headers: HeadersInit = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    try {
      const [statsRes, analyticsRes, predsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats`, { headers }),
        fetch(`${API_BASE}/api/admin/analytics?days=30`, { headers }),
        fetch(`${API_BASE}/api/admin/predictions?limit=200`, { headers }),
      ]);
      if (!statsRes.ok) throw new Error(`Failed to fetch stats: ${statsRes.status}`);
      if (!analyticsRes.ok) throw new Error(`Failed to fetch analytics: ${analyticsRes.status}`);
      if (!predsRes.ok) throw new Error(`Failed to fetch predictions: ${predsRes.status}`);

      setStats(await statsRes.json());
      setAnalytics(await analyticsRes.json());
      const preds: AdminPrediction[] = await predsRes.json();
      setRecentPredictions(preds.slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const loading = isLoading || !analytics;

  return (
    <AdminLayout>
      {showUsers && <UsersSheet onClose={() => setShowUsers(false)} />}

      <div className="dg-section-header">
        <div>
          <h1 className="dg-section-title">Admin Dashboard</h1>
          <p className="dg-section-subtitle">Monitor system usage and prediction activity</p>
        </div>
        <button className="btn-ghost" onClick={fetchData} disabled={isLoading}>
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "12px 16px", background: "#ef444418", border: "1px solid #ef444430", borderRadius: "var(--dg-radius)", marginBottom: 20 }}>
          <AlertCircle size={16} style={{ color: "var(--dg-red)", flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: "var(--dg-red)" }}>{error}</p>
        </div>
      )}

      {/* Overview */}
      <p className="dg-admin-section">Overview</p>
      <div className="dg-stats-row">
        <div className="dg-stat-card">
          <div className="dg-stat-card-icon"><Activity size={20} /></div>
          <div className="dg-stat-card-body">
            <span className="dg-stat-card-label">Total Predictions</span>
            <span className="dg-stat-card-value mono">
              {isLoading ? "—" : (stats?.total_predictions ?? 0).toLocaleString()}
            </span>
          </div>
        </div>

        <button
          className="dg-stat-card dg-stat-card--clickable"
          onClick={() => setShowUsers(true)}
          title="View all registered users"
        >
          <div className="dg-stat-card-icon" style={{ color: "var(--dg-green)" }}><Users size={20} /></div>
          <div className="dg-stat-card-body">
            <span className="dg-stat-card-label">Registered Users</span>
            <span className="dg-stat-card-value mono">
              {isLoading ? "—" : (stats?.total_users ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="stat-card-arrow">
            <ChevronRight size={16} />
          </div>
        </button>

        <div className="dg-stat-card">
          <div className="dg-stat-card-icon" style={{ color: "var(--dg-amber)" }}><TrendingUp size={20} /></div>
          <div className="dg-stat-card-body">
            <span className="dg-stat-card-label">Digit Classes</span>
            <span className="dg-stat-card-value mono">0 – 9</span>
          </div>
        </div>

        <div className="dg-stat-card">
          <div className="dg-stat-card-icon" style={{ color: "var(--dg-red)" }}><Zap size={20} /></div>
          <div className="dg-stat-card-body">
            <span className="dg-stat-card-label">Model</span>
            <span className="dg-stat-card-value" style={{ fontSize: 16 }}>ResNet</span>
          </div>
        </div>
      </div>

      {/* Analytics */}
      <p className="dg-admin-section">Analytics</p>
      <div className="dg-charts-grid">
        <div className="dg-card">
          <h3 className="dg-card-title" style={{ marginBottom: 4 }}>Confidence Distribution</h3>
          <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 16 }}>Histogram of average confidence scores</p>
          {loading ? <ChartLoading /> : <ConfidenceHistogram buckets={analytics!.confidence_buckets} />}
        </div>

        <div className="dg-card">
          <h3 className="dg-card-title" style={{ marginBottom: 4 }}>Number vs Confidence</h3>
          <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 16 }}>Each dot is one prediction</p>
          {loading ? <ChartLoading /> : <PredictionScatter points={analytics!.scatter} />}
        </div>

        <div className="dg-card">
          <h3 className="dg-card-title" style={{ marginBottom: 4 }}>Predictions Over Time</h3>
          <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 16 }}>Daily volume (last 30 days)</p>
          {loading ? <ChartLoading /> : <PredictionsOverTime points={analytics!.predictions_over_time} />}
        </div>

        <div className="dg-card">
          <h3 className="dg-card-title" style={{ marginBottom: 4 }}>Digit Frequency</h3>
          <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 16 }}>Occurrences of each digit 0–9</p>
          {loading ? <ChartLoading /> : <DigitFrequency frequency={analytics!.digit_frequency} />}
        </div>

        <div className="dg-card" style={{ gridColumn: "1 / -1" }}>
          <h3 className="dg-card-title" style={{ marginBottom: 4 }}>Average Confidence per Digit</h3>
          <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 16 }}>How sure the model is when predicting each digit</p>
          {loading ? <ChartLoading /> : <AvgConfidencePerDigit avgs={analytics!.avg_confidence_per_digit} />}
        </div>
      </div>

      {/* Recent activity */}
      <p className="dg-admin-section">Recent activity</p>
      <div className="dg-card">
        <div className="dg-card-header">
          <h3 className="dg-card-title">Recent Predictions</h3>
          <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Latest across all users</span>
        </div>
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--fg-muted)", fontSize: 13 }}>
            <span className="dg-spinner" /> Loading…
          </div>
        ) : (
          <UserActivityTable predictions={recentPredictions} />
        )}
      </div>
    </AdminLayout>
  );
}
