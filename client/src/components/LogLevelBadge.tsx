import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface LogLevelBadgeProps {
  level: 'info' | 'aviso' | 'erro';
}

export function LogLevelBadge({ level }: LogLevelBadgeProps) {
  const getIcon = () => {
    switch (level) {
      case 'info':
        return <Info className="w-3 h-3" />;
      case 'aviso':
        return <AlertTriangle className="w-3 h-3" />;
      case 'erro':
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <span className={`badge-log ${level}`}>
      {getIcon()}
      <span className="capitalize">{level}</span>
    </span>
  );
}
