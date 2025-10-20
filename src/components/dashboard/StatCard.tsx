import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  index?: number;
}

const AnimatedValue = ({ value }: { value: string | number }) => {
  if (typeof value === 'number') {
    const count = useMotionValue(0);
    const rounded = useTransform(count, latest => Math.round(latest).toLocaleString());
    // eslint-disable-next-line react-hooks/rules-of-hooks
    animate(count, value, { duration: 0.8, ease: 'easeOut' });
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{rounded as unknown as string}</>;
  }

  // Try to parse formats like "RWF 123,456" or "45%"
  const prefixMatch = value.match(/^(RWF\s+)/);
  const suffixMatch = value.match(/(%)$/);
  const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
  if (isNaN(numeric)) {
    return <>{value}</>;
  }

  const count = useMotionValue(0);
  const formatted = useTransform(count, latest => {
    const num = Math.round(latest);
    const text = num.toLocaleString();
    return `${prefixMatch ? prefixMatch[1] : ''}${text}${suffixMatch ? suffixMatch[1] : ''}`;
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  animate(count, numeric, { duration: 0.8, ease: 'easeOut' });
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{formatted as unknown as string}</>;
};

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
            <h3 className="text-3xl font-bold mb-2"><AnimatedValue value={value} /></h3>
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
