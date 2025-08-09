interface StatCardProps {
  label: string;
  value: string | number;
  color?: 'green' | 'blue' | 'yellow' | 'gray' | 'red';
  subtitle?: string;
}

export function StatCard({ label, value, color = 'gray', subtitle }: StatCardProps) {
  const colorClasses = {
    green: 'text-green-600 bg-green-50',
    blue: 'text-blue-600 bg-blue-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    gray: 'text-gray-600 bg-gray-50',
    red: 'text-red-600 bg-red-50'
  };
  
  return (
    <div className={`rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="text-sm font-medium opacity-75">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {subtitle && (
        <div className="text-xs mt-1 opacity-75">{subtitle}</div>
      )}
    </div>
  );
}