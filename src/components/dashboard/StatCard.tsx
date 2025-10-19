import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  index?: number;
}

const StatCard = ({ title, value, change, icon: Icon, index = 0 }: StatCardProps) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <Card className="p-6 glass hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">{title}</p>
            <h3 className="text-3xl font-bold mb-2">{value}</h3>
            {change && (
              <p className="text-sm text-primary font-medium">{change}</p>
            )}
          </div>
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="p-3 rounded-xl bg-gradient-primary"
          >
            <Icon className="h-6 w-6 text-white" />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default StatCard;
