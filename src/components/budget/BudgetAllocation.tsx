import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useMemo } from 'react';

interface Budget {
  total_budget: number;
  used_budget: number;
  created_at: string;
}

interface BudgetAllocationProps {
  budget: Budget | null;
  categoryTotals?: Record<string, number>;
}

export function BudgetAllocation({ budget, categoryTotals = {} }: BudgetAllocationProps) {
  const data = useMemo(() => {
    if (!budget) return [];
    const rows = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value: Number(value) }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
    const total = rows.reduce((sum, item) => sum + item.value, 0);
    const primary = rows.filter(item => item.value / total >= 0.025);
    const other = rows.filter(item => item.value / total < 0.025).reduce((sum, item) => sum + item.value, 0);
    return other > 0 ? [...primary, { name: 'Other', value: other }] : primary;
  }, [budget, categoryTotals]);

  const colors = ['#111214', '#4b5563', '#8b95a3', '#cbd0d6'];

  if (!budget || !budget.total_budget) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">No Budget Data</div>
          <div className="text-sm">Please add a budget to see the allocation chart</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            labelLine={false}
            innerRadius={52}
            outerRadius={84}
            dataKey="value"
            label={({ name, percent }) => Number(percent) >= 0.05 ? `${name} ${(Number(percent) * 100).toFixed(0)}%` : ''}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`RWF ${value.toLocaleString()}`, 'Amount']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-lg font-semibold tracking-tight">RWF {(Number(budget.used_budget || 0) / 1_000_000).toFixed(1)}M</div>
        <div className="mt-1 text-[11px] text-muted-foreground">recorded spend</div>
      </div>
    </div>
  );
}
