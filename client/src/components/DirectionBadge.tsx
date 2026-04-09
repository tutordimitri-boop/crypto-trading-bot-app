interface DirectionBadgeProps {
  direction: 'Long' | 'Short';
}

export function DirectionBadge({ direction }: DirectionBadgeProps) {
  return (
    <span className={`badge-direction ${direction.toLowerCase()}`}>
      {direction}
    </span>
  );
}
