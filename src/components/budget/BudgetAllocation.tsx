import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { getCategoryColor } from '@/constants/expenseCategories';

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
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value: Number(value) }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [budget, categoryTotals]);

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
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getCategoryColor(entry.name, index)}
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
    </div>
  );
}
