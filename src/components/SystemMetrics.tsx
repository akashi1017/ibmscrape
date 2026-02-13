import { CheckCircle, AlertCircle, Database, Clock } from "lucide-react";

interface MetricItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: 'healthy' | 'warning' | 'error';
}

function MetricItem({ icon, label, value, status }: MetricItemProps) {
  const statusColors = {
    healthy: 'text-green-600 bg-green-50',
    warning: 'text-orange-600 bg-orange-50',
    error: 'text-red-600 bg-red-50',
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${statusColors[status]}`}>
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{label}</div>
          <div className="text-xs text-gray-500">{value}</div>
        </div>
      </div>
      {status === 'healthy' ? (
        <CheckCircle className="size-5 text-green-600" />
      ) : (
        <AlertCircle className={`size-5 ${status === 'warning' ? 'text-orange-600' : 'text-red-600'}`} />
      )}
    </div>
  );
}

export function SystemMetrics() {
  return (
    <div className="space-y-1">
      <MetricItem
        icon={<Database className="size-4" />}
        label="Model Status"
        value="v2.1.4 - Active"
        status="healthy"
      />
      <MetricItem
        icon={<Clock className="size-4" />}
        label="API Response Time"
        value="124ms avg"
        status="healthy"
      />
      <MetricItem
        icon={<Database className="size-4" />}
        label="Database"
        value="Connected - 98% capacity"
        status="warning"
      />
      <MetricItem
        icon={<CheckCircle className="size-4" />}
        label="Server Health"
        value="CPU: 45% | RAM: 62%"
        status="healthy"
      />
    </div>
  );
}
