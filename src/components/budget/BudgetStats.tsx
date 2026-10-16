import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { DollarSign, TrendingDown, Wallet, Percent } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BudgetStatsProps {
  stats: {
    totalBudget: number;
    usedBudget: number;
    remainingBudget: number;
    usagePercentage: number;
  };
}

export function BudgetStats({ stats }: BudgetStatsProps) {
  const statItems = [
    {
      title: 'Total Budget',
      value: `RWF ${stats.totalBudget.toLocaleString()}`,
      icon: Wallet,
      iconClass: 'bg-secondary text-secondary-foreground',
    },
    {
      title: 'Used Budget',
      value: `RWF ${stats.usedBudget.toLocaleString()}`,
      icon: DollarSign,
      iconClass: 'bg-accent text-accent-foreground',
    },
    {
      title: 'Remaining',
      value: `RWF ${stats.remainingBudget.toLocaleString()}`,
      icon: TrendingDown,
      iconClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    },
    {
      title: 'Usage',
      value: `${stats.usagePercentage.toFixed(1)}%`,
      icon: Percent,
      iconClass: 'bg-secondary text-secondary-foreground',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 transition-colors hover:border-primary/20">
              <div className="flex items-center gap-4">
                <div className={`rounded-xl p-2.5 ${stat.iconClass}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.title}</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Budget Usage</span>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{stats.usagePercentage.toFixed(1)}%</span>
          </div>
          <Progress value={stats.usagePercentage} className="h-2" />
        </Card>
      </motion.div>
    </div>
  );
}
