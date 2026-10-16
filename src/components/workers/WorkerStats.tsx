import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Users, Clock, Banknote, CalendarDays } from 'lucide-react';

interface WorkerStatsProps {
  totalWorkers: number;
  presentToday: number;
  avgDailyRate: number;
  weeklyHours: number;
}

export function WorkerStats({ totalWorkers, presentToday, avgDailyRate, weeklyHours }: WorkerStatsProps) {
  const attendanceRate = totalWorkers > 0 ? Math.round((presentToday / totalWorkers) * 100) : 0;
  const stats = [
    {
      title: 'Active workers',
      value: totalWorkers,
      note: 'Current workforce',
      icon: Users,
      iconClass: 'bg-accent text-accent-foreground',
    },
    {
      title: 'Present today',
      value: presentToday,
      note: `${attendanceRate}% of active workers`,
      icon: CalendarDays,
      iconClass: 'bg-secondary text-secondary-foreground',
    },
    {
      title: 'Average daily rate',
      value: `RWF ${avgDailyRate.toLocaleString('en-US')}`,
      note: 'Per active worker',
      icon: Banknote,
      iconClass: 'bg-secondary text-secondary-foreground',
    },
    {
      title: 'Hours logged',
      value: weeklyHours.toLocaleString('en-US'),
      note: 'Rolling seven days',
      icon: Clock,
      iconClass: 'bg-secondary text-secondary-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-5 transition-colors hover:border-primary/20">
            <div className="flex items-start gap-4">
              <div className={`rounded-xl p-2.5 ${stat.iconClass}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#73777f] dark:text-[#92969d]">{stat.title}</p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-[#111214] dark:text-[#f5f5f7]">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
