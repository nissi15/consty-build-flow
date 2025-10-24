import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Worker {
  id: string;
  name: string;
  role: string;
}

interface PendingAttendanceProps {
  workers: Worker[];
  onMarkPresent: (workerId: string) => void;
  onMarkAbsent: (workerId: string) => void;
}

export function PendingAttendance({ workers, onMarkPresent, onMarkAbsent }: PendingAttendanceProps) {
  if (workers.length === 0) {
    return (
      <Card className="bg-white dark:bg-[#111827] rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-800">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            All Caught Up!
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            No pending attendance to mark for today.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#111827] rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
          <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Pending Attendance ({workers.length})
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Mark attendance for workers today
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        {workers.map((worker, index) => (
          <motion.div
            key={worker.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10 ring-2 ring-slate-200 dark:ring-slate-700">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                    {worker.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {worker.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {worker.role}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white gap-1.5 shadow-sm"
                  onClick={() => onMarkPresent(worker.id)}
                >
                  <CheckCircle className="h-4 w-4" />
                  Present
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 gap-1.5"
                  onClick={() => onMarkAbsent(worker.id)}
                >
                  <XCircle className="h-4 w-4" />
                  Absent
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
