import { Circle } from 'lucide-react';

interface RobotStatusBadgeProps {
  isActive: boolean;
  mode?: 'Normal' | 'Estratégico' | 'Insano';
}

export function RobotStatusBadge({ isActive, mode }: RobotStatusBadgeProps) {
  const getModeClass = (m?: string) => {
    if (!m) return '';
    if (m === 'Normal') return 'badge-mode normal';
    if (m === 'Estratégico') return 'badge-mode estrategico';
    if (m === 'Insano') return 'badge-mode insano';
    return '';
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`badge-status ${isActive ? 'active' : 'inactive'}`}>
        <Circle className="w-2 h-2 fill-current" />
        <span>{isActive ? 'Ativo' : 'Inativo'}</span>
      </div>
      {mode && <div className={getModeClass(mode)}>{mode}</div>}
    </div>
  );
}
