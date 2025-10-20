import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  index?: number;
}

const StatCard = ({ title, value, change, changeType = 'neutral', icon: Icon, index = 0 }: StatCardProps) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'negative': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      default: return 'text-slate-500 bg-slate-50 dark:text-slate-400 dark:bg-slate-800/20';
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className="group"
    >
      <Card className="bg-white dark:bg-[#111827] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{value}</h3>
            {change && (
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getChangeColor()}`}>
                {change}
              </span>
            )}
          </div>
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-sm"
          >
            <Icon className="h-6 w-6 text-white" />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default StatCard;
