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

const expenseCategories = [
  { name: 'Labor', amount: 45000, budget: 50000, color: '#FF8C00' },
  { name: 'Materials', amount: 30000, budget: 35000, color: '#FFC94A' },
  { name: 'Equipment', amount: 15000, budget: 18000, color: '#FFB84D' },
  { name: 'Transportation', amount: 8000, budget: 10000, color: '#FFA500' },
];

const recentExpenses = [
  { id: 1, description: 'Steel Beams', category: 'Materials', amount: 12500, date: '2025-01-18' },
  { id: 2, description: 'Labor Payment', category: 'Labor', amount: 15000, date: '2025-01-17' },
  { id: 3, description: 'Excavator Rental', category: 'Equipment', amount: 3500, date: '2025-01-16' },
  { id: 4, description: 'Concrete Mix', category: 'Materials', amount: 4200, date: '2025-01-15' },
  { id: 5, description: 'Truck Fuel', category: 'Transportation', amount: 800, date: '2025-01-14' },
];

const chartConfig = {
  amount: { label: 'Spent', color: 'hsl(var(--chart-1))' },
  budget: { label: 'Budget', color: 'hsl(var(--chart-2))' },
};

const Expenses = () => {
  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0);

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
              <p className="text-muted-foreground mb-1">Total Expenses This Month</p>
              <h2 className="text-4xl font-bold">${totalExpenses.toLocaleString()}</h2>
            </div>
          </div>
          
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseCategories}>
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
            {recentExpenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{expense.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{expense.category}</Badge>
                    <span className="text-sm text-muted-foreground">{expense.date}</span>
                  </div>
                </div>
                <p className="text-lg font-bold">${expense.amount.toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Expenses;
