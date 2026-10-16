import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calendar, PieChart } from 'lucide-react';

interface ExpenseStatsProps {
  stats: {
    totalExpenses: number;
    monthlyAverage: number;
    thisMonth: number;
    categories: number;
  };
}

export function ExpenseStats({ stats }: ExpenseStatsProps) {
  const statItems = [
    {
      title: 'Total Expenses',
      value: `RWF ${stats.totalExpenses.toLocaleString()}`,
      icon: DollarSign,
      iconClass: 'bg-secondary text-secondary-foreground',
    },
    {
      title: 'Monthly Average',
      value: `RWF ${stats.monthlyAverage.toLocaleString()}`,
      icon: TrendingUp,
      iconClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    },
    {
      title: 'This Month',
      value: `RWF ${stats.thisMonth.toLocaleString()}`,
      icon: Calendar,
      iconClass: 'bg-accent text-accent-foreground',
    },
    {
      title: 'Categories',
      value: stats.categories,
      icon: PieChart,
      iconClass: 'bg-secondary text-secondary-foreground',
    },
  ];

  return (
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
  );
}
