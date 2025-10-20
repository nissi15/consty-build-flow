import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';
import { useMemo } from 'react';

interface Expense {
  date: string;
  amount: number;
}

interface WeeklySpendingTrendProps {
  expenses: Expense[];
}

export function WeeklySpendingTrend({ expenses }: WeeklySpendingTrendProps) {
  const data = useMemo(() => {
    const today = new Date();
    const fourWeeksAgo = new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000);
    
    // Create an array of weeks
    const weeks = Array.from({ length: 4 }, (_, i) => {
      const weekStart = startOfWeek(new Date(today.getTime() - (3 - i) * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = endOfWeek(weekStart);
      
      // Get all expenses for this week
      const weekExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= weekStart && expenseDate <= weekEnd;
      });
      
      // Calculate total for the week
      const total = weekExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      
      return {
        name: format(weekStart, 'MMM dd'),
        amount: total,
      };
    });

    return weeks;
  }, [expenses]);

  if (data.every(week => week.amount === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No spending data available
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#8B5CF6"
            fill="#8B5CF6"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
