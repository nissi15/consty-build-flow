import { motion } from 'framer-motion';
import { Plus, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/contexts/ProjectContext';
import { ExpenseStats } from '@/components/expenses/ExpenseStats';
import { ExpenseBreakdown } from '@/components/expenses/ExpenseBreakdown';
import { WeeklySpendingTrend } from '@/components/expenses/WeeklySpendingTrend';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { useExpenses } from '@/hooks/useExpenses';
import { getTodayInRwanda } from '@/utils/dateUtils';

export default function Expenses() {
  const { currentProject } = useProject();
  const { expenses, loading, stats, refetchExpenses } = useExpenses(currentProject?.id);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    description: '',
    date: getTodayInRwanda(),
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
      const expenseDate = new Date(expense.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      const matchesDate = expenseDate >= startDate && expenseDate <= endDate;
      return matchesCategory && matchesDate;
    });
  }, [expenses, selectedCategory, dateRange]);

  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!currentProject?.id) {
      toast.error('Please select a project first');
      return;
    }

    setIsAddingExpense(true);
    const { error } = await supabase.from('expenses').insert({
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      date: newExpense.date,
      project_id: currentProject.id,
    });

    if (error) {
      toast.error('Failed to add expense');
      console.error(error);
    } else {
      toast.success('Expense added successfully!');
      setNewExpense({
        category: '',
        amount: '',
        description: '',
        date: getTodayInRwanda(),
      });

      await supabase.from('activity_log').insert({
        message: `New expense added: RWF ${newExpense.amount} for ${newExpense.category}`,
        action_type: 'expense',
        project_id: currentProject.id,
      });

      // Update budget used_budget
      const { data: latestBudget } = await supabase
        .from('budget')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestBudget) {
        await supabase
          .from('budget')
          .update({ used_budget: latestBudget.used_budget + parseFloat(newExpense.amount) })
          .eq('id', latestBudget.id);
      }

      refetchExpenses();
    }
    setIsAddingExpense(false);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    const { error } = await supabase.from('expenses').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete expense');
      console.error(error);
    } else {
      toast.success('Expense deleted successfully!');

      // Update budget used_budget
      const { data: latestBudget } = await supabase
        .from('budget')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestBudget) {
        await supabase
          .from('budget')
          .update({ used_budget: Math.max(0, latestBudget.used_budget - Number(expense.amount)) })
          .eq('id', latestBudget.id);
      }

      await supabase.from('activity_log').insert({
        message: `Expense deleted: RWF ${expense.amount} for ${expense.category}`,
        action_type: 'expense',
      });

      refetchExpenses();
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="space-y-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Expense Management</h1>
              <p className="text-muted-foreground">Track and analyze project expenses across all categories</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-purple-500 hover:bg-purple-600">
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newExpense.category}
                      onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Labor">Labor</SelectItem>
                        <SelectItem value="Materials">Materials</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Transport">Transport</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount (RWF) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      placeholder="What is this expense for?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <div className="relative">
                      <Input
                        id="date"
                        type="date"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddingExpense(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddExpense} disabled={isAddingExpense}>
                      {isAddingExpense ? 'Adding...' : 'Add Expense'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <ExpenseStats stats={stats} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Expense Breakdown
            </h2>
            <ExpenseBreakdown expenses={filteredExpenses} />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Weekly Spending Trend</h2>
            <WeeklySpendingTrend expenses={filteredExpenses} />
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white dark:bg-[#111827] rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Expenses
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Labor">Labor</SelectItem>
                  <SelectItem value="Materials">Materials</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-4 flex-1">
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {loading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : (
            <ExpenseList 
              expenses={filteredExpenses}
              onDelete={handleDeleteExpense}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}