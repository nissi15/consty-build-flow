import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useBudget, useExpenses } from '@/hooks/useSupabaseData';
import { useMemo } from 'react';
import { formatRWF } from '@/lib/utils';

const Budget = () => {
  const { budget } = useBudget();
  const { expenses } = useExpenses();

  const totals = useMemo(() => {
    const totalBudget = Number(budget?.total_budget || 0);
    const totalSpent = Number(budget?.used_budget || 0);
    const remaining = Math.max(totalBudget - totalSpent, 0);
    const percent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    let status: 'Within' | 'Near' | 'Exceeded' = 'Within';
    if (percent >= 95) status = 'Exceeded';
    else if (percent >= 80) status = 'Near';
    return { totalBudget, totalSpent, remaining, percent, status };
  }, [budget, expenses]);

  const badgeClass =
    totals.status === 'Exceeded'
      ? 'bg-destructive/20 text-destructive'
      : totals.status === 'Near'
      ? 'bg-secondary/20 text-secondary-foreground'
      : 'bg-primary/20 text-primary';

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Budget</h1>
          <p className="text-muted-foreground">Monitor project budgets and spending</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Adjust Budget
        </Button>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 glass">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground">Total Budget</p>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-3xl font-bold">{formatRWF(totals.totalBudget)}</h3>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
          <Card className="p-6 glass">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground">Total Spent</p>
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <h3 className="text-3xl font-bold">{formatRWF(totals.totalSpent)}</h3>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="p-6 glass">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground">Remaining</p>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-3xl font-bold">{formatRWF(totals.remaining)}</h3>
          </Card>
        </motion.div>
      </div>

      <div className="space-y-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
          <Card className="p-6 glass hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Overall Budget Usage</h3>
                  <p className="text-sm text-muted-foreground">Updates in real-time with expenses</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${badgeClass}`}>
                  {totals.status === 'Exceeded' ? 'Exceeded (>95%)' : totals.status === 'Near' ? 'Near (80–95%)' : 'Within (<80%)'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Spent: {formatRWF(totals.totalSpent)}</span>
                  <span>Remaining: {formatRWF(totals.remaining)}</span>
                </div>
                <Progress value={totals.percent} className="h-3" />
                <p className="text-sm text-muted-foreground text-right">{totals.percent.toFixed(1)}% used</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Budget;
