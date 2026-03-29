import { useState, useEffect } from "react";
import { Users, Activity, TrendingUp, Zap, RefreshCw, AlertCircle, X } from "lucide-react";
import { PredictionDistribution } from "./PredictionDistribution";
import { UserActivityTable } from "./UserActivityTable";
import API_BASE from "../config";

interface AdminStats {
  total_users: number;
  total_predictions: number;
  digit_distribution: Record<string, number>;
}

interface AdminPrediction {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  predicted_digit: number;
  confidence: number;
  created_at: string;
}

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

/** Modal that lists all registered users */
function UsersModal({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("mnist-auth-token");
    fetch(`${API_BASE}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject(`Error ${r.status}`))
      .then((data: UserRecord[]) => { setUsers(data); setLoading(false); })
      .catch((e) => { setError(String(e)); setLoading(false); });
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Registered Users</h2>
            <p className="text-sm text-gray-500">{loading ? "Loading…" : `${users.length} user${users.length !== 1 ? "s" : ""} total`}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="size-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading && <p className="text-center text-gray-400 py-8">Loading users…</p>}
          {error && <p className="text-center text-red-500 py-8">{error}</p>}
          {!loading && !error && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">#</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 text-sm text-gray-500">{i + 1}</td>
                    <td className="py-3 px-3 text-sm font-medium text-gray-900">{u.name}</td>
                    <td className="py-3 px-3 text-sm text-gray-600">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && !error && users.length === 0 && (
            <p className="text-center text-gray-400 py-8">No users registered yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<AdminPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUsersModal, setShowUsersModal] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("mnist-auth-token");
    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      const [statsRes, predictionsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats`, { headers }),
        fetch(`${API_BASE}/api/admin/predictions`, { headers }),
      ]);

      if (!statsRes.ok) throw new Error(`Failed to fetch stats: ${statsRes.status}`);
      if (!predictionsRes.ok) throw new Error(`Failed to fetch predictions: ${predictionsRes.status}`);

      const statsData: AdminStats = await statsRes.json();
      const predictionsData: AdminPrediction[] = await predictionsRes.json();

      setStats(statsData);
      setRecentPredictions(predictionsData.slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showUsersModal && <UsersModal onClose={() => setShowUsersModal(false)} />}

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor system usage and prediction activity</p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
          <AlertCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<Activity className="size-6 text-blue-600" />}
          label="Total Predictions"
          value={isLoading ? "—" : (stats?.total_predictions ?? 0).toLocaleString()}
          color="blue"
        />
        {/* Clickable users card */}
        <button
          onClick={() => setShowUsersModal(true)}
          className="text-left group"
          title="Click to view all registered users"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full group-hover:shadow-md group-hover:border-green-300 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Users className="size-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Registered Users</span>
              <span className="ml-auto text-xs text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">View all →</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {isLoading ? "—" : (stats?.total_users ?? 0).toLocaleString()}
            </div>
          </div>
        </button>
        <StatCard
          icon={<TrendingUp className="size-6 text-purple-600" />}
          label="Digit Classes"
          value="0 – 9"
          color="purple"
        />
      </div>

      {/* Distribution Chart */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Prediction Distribution</h2>
          <p className="text-sm text-gray-500 mb-4">Number of times each digit was predicted</p>
          {isLoading ? (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              <Zap className="size-5 animate-pulse mr-2" /> Loading chart data…
            </div>
          ) : (
            <PredictionDistribution distribution={stats?.digit_distribution ?? {}} />
          )}
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Recent Predictions</h2>
        <p className="text-sm text-gray-500 mb-4">Latest predictions made by all users</p>
        {isLoading ? (
          <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
        ) : (
          <UserActivityTable predictions={recentPredictions} />
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "blue" | "green" | "purple";
}

const colorMap = { blue: "bg-blue-50", green: "bg-green-50", purple: "bg-purple-50" };

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 ${colorMap[color]} rounded-lg`}>{icon}</div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
