interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
  icon: React.ReactNode;
  color: 'orange' | 'blue' | 'green' | 'purple';
}

const COLORS = {
  orange: 'bg-orange-50 text-orange-600',
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
};

export default function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
  color,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-lg ${COLORS[color]}`}>{icon}</div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            changeType === 'up'
              ? 'text-green-700 bg-green-50'
              : 'text-red-700 bg-red-50'
          }`}
        >
          {changeType === 'up' ? '↑' : '↓'} {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-4">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{title}</p>
    </div>
  );
}