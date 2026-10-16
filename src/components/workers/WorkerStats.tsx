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
      iconClass: 'bg-[#e5e9e5] text-[#31483a] dark:bg-[#26312b] dark:text-[#b9cbbf]',
    },
    {
      title: 'Present today',
      value: presentToday,
      note: `${attendanceRate}% of active workers`,
      icon: CalendarDays,
      iconClass: 'bg-[#e1eadf] text-[#3e6549] dark:bg-[#25372a] dark:text-[#add0b5]',
    },
    {
      title: 'Average daily rate',
      value: `RWF ${avgDailyRate.toLocaleString('en-US')}`,
      note: 'Per active worker',
      icon: Banknote,
      iconClass: 'bg-[#eee4d5] text-[#8a603d] dark:bg-[#3a2f24] dark:text-[#d6ad83]',
    },
    {
      title: 'Hours logged',
      value: weeklyHours.toLocaleString('en-US'),
      note: 'Rolling seven days',
      icon: Clock,
      iconClass: 'bg-[#e5e8e7] text-[#53625b] dark:bg-[#252d29] dark:text-[#b8c0bc]',
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
          <Card className="rounded-xl border-[#ded8cd] bg-[#fbfaf7] p-5 shadow-[0_1px_2px_rgba(29,33,31,0.04)] dark:border-[#28312c] dark:bg-[#151a17]">
            <div className="flex items-start gap-4">
              <div className={`rounded-lg p-2.5 ${stat.iconClass}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#78817c] dark:text-[#8f9993]">{stat.title}</p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-[#1b221e] dark:text-[#f1ede5]">{stat.value}</p>
                <p className="mt-1 text-xs text-[#8b928e] dark:text-[#737d77]">{stat.note}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
