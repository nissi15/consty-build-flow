import { motion } from 'framer-motion';
import { Download, RefreshCw, Calculator, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/contexts/ProjectContext';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { BudgetAllocation } from '@/components/budget/BudgetAllocation';
import { ExpenseOverTime } from '@/components/budget/ExpenseOverTime';
import { BudgetStats } from '@/components/budget/BudgetStats';
import { useBudget } from '@/hooks/useBudget';
import { useExpenses } from '@/hooks/useSupabaseData';
import { exportToCSV, formatCurrency } from '@/lib/utils';

export default function Budget() {
  const { currentProject } = useProject();
  const { budget, loading, stats, refetchBudget, recalculateTotals } = useBudget(currentProject?.id);
  const { expenses, loading: expensesLoading } = useExpenses(currentProject?.id);
  
  console.log('Budget component rendering, loading:', loading, 'budget:', budget);

  useEffect(() => {
    console.log('Budget page mounted');
  }, []);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleAdjustBudget = async () => {
    if (!newBudget || isNaN(parseFloat(newBudget))) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    setIsAdjusting(true);
    try {
      const { error } = await supabase
        .from('budget')
        .update({ total_budget: parseFloat(newBudget) })
        .eq('id', budget?.id);

      if (error) throw error;

      toast.success('Budget updated successfully');
      refetchBudget();

      if (currentProject?.id) {
        await supabase.from('activity_log').insert({
          message: `Budget adjusted to ${formatCurrency(parseFloat(newBudget))}`,
          action_type: 'budget',
          project_id: currentProject.id,
        });
      }
    } catch (error) {
      console.error('Error adjusting budget:', error);
      toast.error('Failed to adjust budget');
    } finally {
      setIsAdjusting(false);
      setNewBudget('');
    }
  };

  const handleExportBudget = async () => {
    setIsExporting(true);
    try {
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;

      const reportData = expenses.map(expense => ({
        Date: format(new Date(expense.date), 'yyyy-MM-dd'),
        Category: expense.category,
        Amount: expense.amount,
        Description: expense.description,
      }));

      const budgetSummary = {
        Date: format(new Date(), 'yyyy-MM-dd'),
        Category: 'Budget Summary',
        Amount: budget?.total_budget,
        Description: `Total Budget: ${formatCurrency(budget?.total_budget || 0)}, Used: ${formatCurrency(budget?.used_budget || 0)}, Remaining: ${formatCurrency((budget?.total_budget || 0) - (budget?.used_budget || 0))}`,
      };

      reportData.unshift(budgetSummary);

      exportToCSV(reportData, `budget-report-${format(new Date(), 'yyyy-MM-dd')}`);
      toast.success('Budget report exported successfully');
    } catch (error) {
      console.error('Error exporting budget:', error);
      toast.error('Failed to export budget report');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRecalculateTotals = async () => {
    setIsRecalculating(true);
    try {
      await recalculateTotals();
      toast.success('Budget totals recalculated successfully');
    } catch (error) {
      console.error('Error recalculating totals:', error);
      toast.error('Failed to recalculate budget totals');
    } finally {
      setIsRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="space-y-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Budget Management</h1>
              <p className="text-muted-foreground">Track and manage your project budget allocation</p>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Adjust Budget
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adjust Budget</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="budget">New Budget Amount (RWF)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={newBudget}
                        onChange={(e) => setNewBudget(e.target.value)}
                        placeholder="Enter new budget amount"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setNewBudget('')}>
                        Cancel
                      </Button>
                      <Button onClick={handleAdjustBudget} disabled={isAdjusting}>
                        {isAdjusting ? 'Adjusting...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="gap-2" onClick={handleRecalculateTotals} disabled={isRecalculating}>
                <RefreshCw className={`h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
                Recalculate
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleExportBudget} disabled={isExporting}>
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button 
                variant="outline" 
                className="gap-2" 
                onClick={async () => {
                  if (!currentProject?.id) {
                    toast.error('Please select a project first');
                    return;
                  }
                  try {
                    const { data, error } = await supabase
                      .from('budget')
                      .insert([{ total_budget: 100000, used_budget: 0, project_id: currentProject.id }])
                      .select()
                      .single();
                    
                    if (error) throw error;
                    toast.success('Budget created successfully');
                    refetchBudget();
                  } catch (error) {
                    console.error('Error creating budget:', error);
                    toast.error('Failed to create budget');
                  }
                }}
              >
                <Calculator className="h-4 w-4" />
                Create Budget
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <BudgetStats stats={stats} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Budget Allocation</h2>
            <BudgetAllocation budget={budget} />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Expense Over Time</h2>
            <ExpenseOverTime />
          </motion.div>
        </div>
      </div>
    </div>
  );
}