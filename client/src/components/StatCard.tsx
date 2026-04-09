import { ArrowDown, ArrowUp } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, change, icon, className = '' }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className={`card-premium-sm ${className}`}>
      <div className="flex items-start justify-between">
        <div className="stat-display">
          <span className="stat-label">{label}</span>
          <span className="stat-value">{value}</span>
          {change !== undefined && (
            <div className={`stat-change ${isPositive ? 'positive' : 'negative'} flex items-center gap-1`}>
              {isPositive ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              <span>{Math.abs(change).toFixed(2)}%</span>
            </div>
          )}
        </div>
        {icon && <div className="text-accent">{icon}</div>}
      </div>
    </div>
  );
}
