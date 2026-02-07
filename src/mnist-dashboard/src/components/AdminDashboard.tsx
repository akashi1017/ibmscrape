import { useState, useEffect } from "react";
import {
  Users,
  Activity,
  TrendingUp,
  Database,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap
} from "lucide-react";
import { ModelPerformanceChart } from "./ModelPerformanceChart";
import { PredictionDistribution } from "./PredictionDistribution";
import { SystemMetrics } from "./SystemMetrics";
import { UserActivityTable } from "./UserActivityTable";

interface Stats {
  totalPredictions: number;
  activeUsers: number;
  modelAccuracy: number;
  avgResponseTime: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalPredictions: 45328,
    activeUsers: 1247,
    modelAccuracy: 98.7,
    avgResponseTime: 124,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalPredictions: prev.totalPredictions + Math.floor(Math.random() * 3),
        activeUsers: Math.max(1000, prev.activeUsers + Math.floor(Math.random() * 10) - 5),
        avgResponseTime: Math.max(80, Math.min(200, prev.avgResponseTime + Math.floor(Math.random() * 20) - 10)),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor system performance and user activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Activity className="size-6 text-blue-600" />}
          label="Total Predictions"
          value={stats.totalPredictions.toLocaleString()}
          change="+12.5%"
          positive
        />
        <StatCard
          icon={<Users className="size-6 text-green-600" />}
          label="Active Users"
          value={stats.activeUsers.toLocaleString()}
          change="+8.2%"
          positive
        />
        <StatCard
          icon={<TrendingUp className="size-6 text-purple-600" />}
          label="Model Accuracy"
          value={`${stats.modelAccuracy}%`}
          change="+0.3%"
          positive
        />
        <StatCard
          icon={<Zap className="size-6 text-orange-600" />}
          label="Avg Response Time"
          value={`${stats.avgResponseTime}ms`}
          change="-5.1%"
          positive
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Model Performance</h2>
          <ModelPerformanceChart />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Prediction Distribution</h2>
          <PredictionDistribution />
        </div>
      </div>

      {/* System Status and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
            <SystemMetrics />
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent User Activity</h2>
            <UserActivityTable />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

function StatCard({ icon, label, value, change, positive }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
        <span className={`text-sm font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
