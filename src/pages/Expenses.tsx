import { motion } from 'framer-motion';
import { Plus, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useExpenses, useBudget } from '@/hooks/useSupabaseData';
import { useMemo } from 'react';
import { formatRWF } from '@/lib/utils';

const chartConfig = {
  amount: { label: 'Spent', color: 'hsl(var(--chart-1))' },
  budget: { label: 'Budget', color: 'hsl(var(--chart-2))' },
};

const Expenses = () => {
  const { expenses } = useExpenses();
  const { budget } = useBudget();

  const categories = useMemo(() => {
    const map: Record<string, { name: string; amount: number; budget: number }> = {};
    for (const e of expenses) {
      const key = e.category || 'Other';
      if (!map[key]) map[key] = { name: key, amount: 0, budget: 0 };
      map[key].amount += Number(e.amount);
    }
    // Distribute a simple budget baseline from total_budget
    const totalBudget = Number(budget?.total_budget || 0);
    const perCat = Object.keys(map).length > 0 ? totalBudget / Object.keys(map).length : 0;
    for (const key of Object.keys(map)) map[key].budget = perCat;
    return Object.values(map);
  }, [expenses, budget]);

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Expenses</h1>
          <p className="text-muted-foreground">Track and manage project expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 glass">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-muted-foreground mb-1">Total Expenses</p>
              <h2 className="text-4xl font-bold">{formatRWF(totalExpenses)}</h2>
            </div>
          </div>
          
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="budget" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 glass">
          <h3 className="text-lg font-semibold mb-4">Recent Expenses</h3>
          <div className="space-y-3">
            {expenses.slice(0, 20).map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{expense.description || expense.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{expense.category}</Badge>
                    <span className="text-sm text-muted-foreground">{expense.date}</span>
                  </div>
                </div>
                <p className="text-lg font-bold">{formatRWF(expense.amount)}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Expenses;
