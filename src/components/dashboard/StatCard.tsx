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
      className="group"
    >
      <Card className="rounded-xl border-[#ded8cd] bg-[#fbfaf7] p-6 shadow-[0_1px_2px_rgba(29,33,31,0.04)] transition-colors dark:border-[#28312c] dark:bg-[#151a17]">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#78817c] dark:text-[#8f9993]">{title}</p>
            <h3 className="mb-2 text-2xl font-semibold tracking-[-0.02em] text-[#1b221e] dark:text-[#f1ede5]">{value}</h3>
            {change && (
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getChangeColor()}`}>
                {change}
              </span>
            )}
          </div>
          <div className="rounded-lg bg-[#f2f3f5] p-3 text-[#34373d] dark:bg-[#202226] dark:text-[#d1d3d7]">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default StatCard;
