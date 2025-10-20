import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface Budget {
  total_budget: number;
  used_budget: number;
  created_at: string;
}

interface BudgetAllocationProps {
  budget: Budget | null;
}

const COLORS = {
  Payroll: '#8B5CF6',
  Equipment: '#7367F0',
  Materials: '#28C76F',
  Transport: '#EA5455',
  Miscellaneous: '#00CFE8',
};

export function BudgetAllocation({ budget }: BudgetAllocationProps) {
  const data = useMemo(() => {
    if (!budget) return [];

    // This would ideally come from your expenses table grouped by category
    return [
      { name: 'Payroll', value: budget.used_budget * 0.45 }, // 45% for payroll
      { name: 'Equipment', value: budget.used_budget * 0.20 }, // 20% for equipment
      { name: 'Materials', value: budget.used_budget * 0.15 }, // 15% for materials
      { name: 'Transport', value: budget.used_budget * 0.10 }, // 10% for transport
      { name: 'Miscellaneous', value: budget.used_budget * 0.10 }, // 10% for misc
    ];
  }, [budget]);

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
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name as keyof typeof COLORS]}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
