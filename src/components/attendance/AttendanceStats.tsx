import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AttendanceStatsProps {
  totalWorkers: number;
  presentToday: number;
  absentToday: number;
  attendanceRate: number;
}

export function AttendanceStats({ totalWorkers, presentToday, absentToday, attendanceRate }: AttendanceStatsProps) {
  const stats = [
    {
      title: 'Total Workers',
      value: totalWorkers,
      icon: Users,
      iconClass: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Present Today',
      value: presentToday,
      icon: CheckCircle,
      iconClass: 'bg-green-100 text-green-600',
    },
    {
      title: 'Absent Today',
      value: absentToday,
      icon: XCircle,
      iconClass: 'bg-red-100 text-red-600',
    },
    {
      title: 'Attendance Rate',
      value: `${attendanceRate}%`,
      icon: Clock,
      iconClass: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
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
  );
}
