import { useMemo } from 'react';

interface BudgetGaugeProps {
  totalBudget: number;
  totalSpent: number;
  size?: number;
}

export const BudgetGauge = ({ totalBudget, totalSpent, size = 220 }: BudgetGaugeProps) => {
  const { percent, remaining, statusLabel } = useMemo(() => {
    const spent = Math.max(Number(totalSpent || 0), 0);
    const total = Math.max(Number(totalBudget || 0), 0);
    const pct = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;
    const rem = Math.max(total - spent, 0);
    let label = 'Within budget';
    if (pct > 95) label = 'Exceeded (>95%)';
    else if (pct >= 80) label = 'Near limit (80–95%)';
    return { percent: pct, remaining: rem, statusLabel: label };
  }, [totalBudget, totalSpent]);

  const gradient = `conic-gradient(hsl(var(--primary)) 0% ${percent}%, hsl(var(--muted)) ${percent}% 100%)`;
  const circleSize = `${size}px`;
  const innerSize = `${size - 36}px`;

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className="relative rounded-full flex items-center justify-center shadow-inner"
        style={{ width: circleSize, height: circleSize, background: gradient }}
      >
        <div
          className="absolute rounded-full bg-card flex flex-col items-center justify-center text-center px-6"
          style={{ width: innerSize, height: innerSize }}
        >
          <div className="text-sm text-muted-foreground mb-1">Remaining Budget</div>
          <div className="text-2xl font-bold">RWF {Number(remaining).toLocaleString()}</div>
          <div className="text-xs mt-1 opacity-80">{percent}% used • {statusLabel}</div>
        </div>
      </div>
    </div>
  );
};

export default BudgetGauge;
