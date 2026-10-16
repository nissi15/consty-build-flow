import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { startOfWeek, endOfWeek, format, subWeeks } from 'date-fns';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PROJECT_END } from '@/lib/project-period';
import { fetchAllPagesInParallel, withDataTimeout } from '@/lib/supabase-pagination';

export function ExpenseOverTime() {
  const [data, setData] = useState<{ name: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenseData = async () => {
      setLoading(true);
      try {
        const endDate = PROJECT_END;
        const startDate = subWeeks(endDate, 4); // Last 4 weeks

        const fromDate = format(startDate, 'yyyy-MM-dd');
        const toDate = format(endDate, 'yyyy-MM-dd');
        const { count, error: countError } = await withDataTimeout(
          supabase.from('expenses').select('id', { count: 'exact', head: true }).gte('date', fromDate).lte('date', toDate),
        );
        if (countError) throw countError;
        const expenses = await fetchAllPagesInParallel<{ amount: number; date: string }>(count || 0, (from, to) => supabase
          .from('expenses')
          .select('amount,date')
          .gte('date', fromDate)
          .lte('date', toDate)
          .order('date', { ascending: true })
          .range(from, to), 1000, 4);

        // Group expenses by week
        const weeklyData = Array.from({ length: 4 }, (_, i) => {
          const weekStart = startOfWeek(subWeeks(endDate, 3 - i));
          const weekEnd = endOfWeek(weekStart);
          
          const weekExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= weekStart && expenseDate <= weekEnd;
          });

          const total = weekExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

          return {
            name: format(weekStart, 'MMM dd'),
            amount: total,
          };
        });

        setData(weeklyData);
      } catch (error) {
        console.error('Error fetching expense data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseData();

    // Subscribe to expense changes
    const channel = supabase
      .channel('expense-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        fetchExpenseData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Loading expense data...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No expense data available
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 4,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis width={64} tickFormatter={(value: number) => `${(value / 1_000_000).toFixed(1)}M`} />
          <Tooltip
            formatter={(value: number) => [`RWF ${value.toLocaleString()}`, 'Amount']}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#111214"
            strokeWidth={2}
            dot={{ fill: '#111214', r: 4 }}
            activeDot={{ r: 6, fill: '#111214' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
