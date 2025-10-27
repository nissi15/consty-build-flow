import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { DollarSign, TrendingDown, Wallet, Percent } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';

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
      value: formatCurrency(stats.totalBudget),
      icon: Wallet,
      iconClass: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Used Budget',
      value: formatCurrency(stats.usedBudget),
      icon: DollarSign,
      iconClass: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Remaining',
      value: formatCurrency(stats.remainingBudget),
      icon: TrendingDown,
      iconClass: 'bg-green-100 text-green-600',
    },
    {
      title: 'Usage',
      value: `${stats.usagePercentage.toFixed(1)}%`,
      icon: Percent,
      iconClass: 'bg-purple-100 text-purple-600',
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
            <Card className="bg-white dark:bg-[#111827] rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${stat.iconClass}`}>
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
        <div className="bg-white dark:bg-[#111827] rounded-lg p-4 shadow-lg border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Budget Usage</span>
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{stats.usagePercentage.toFixed(1)}%</span>
          </div>
          <Progress value={stats.usagePercentage} className="h-2" />
        </div>
      </motion.div>
    </div>
  );
}
