import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, Calendar, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface Worker {
  id: string;
  name: string;
  role: string;
  daily_rate: number;
  lunch_allowance: number;
  is_active: boolean;
}

interface Attendance {
  id: string;
  worker_id: string;
  date: string;
  status: string;
  hours: number | null;
  lunch_taken: boolean | null;
  lunch_money: number | null;
}

interface WorkerPayrollListProps {
  workers: Worker[];
  attendance: Attendance[];
  selectedPeriod?: { start: Date; end: Date };
  paidWorkers?: Set<string>;
  onTogglePaid?: (workerId: string) => void;
  onDelete?: (workerId: string) => void;
}

export function WorkerPayrollList({ workers, attendance, selectedPeriod, paidWorkers = new Set(), onTogglePaid, onDelete }: WorkerPayrollListProps) {
  const periodStart = selectedPeriod?.start || startOfWeek(new Date());
  const periodEnd = selectedPeriod?.end || endOfWeek(new Date());

  const calculateWorkerPayroll = (worker: Worker) => {
    const periodStartStr = format(periodStart, 'yyyy-MM-dd');
    const periodEndStr = format(periodEnd, 'yyyy-MM-dd');

    const workerAttendance = attendance.filter(
      a => a.worker_id === worker.id && 
           a.date >= periodStartStr && 
           a.date <= periodEndStr &&
           a.status === 'present'
    );

    const daysWorked = workerAttendance.length;
    const grossAmount = daysWorked * worker.daily_rate;
    const lunchTotal = workerAttendance.filter(a => a.lunch_taken).length * worker.lunch_allowance;
    const netAmount = grossAmount - lunchTotal; // Lunch is DEDUCTED from salary

    return {
      daysWorked,
      grossAmount,
      lunchTotal,
      netAmount,
      workerAttendance
    };
  };

  const activeWorkers = workers.filter(w => w.is_active);
  
  const totalPayroll = activeWorkers.reduce((sum, worker) => {
    const payroll = calculateWorkerPayroll(worker);
    return sum + payroll.netAmount;
  }, 0);

  if (activeWorkers.length === 0) {
    return (
      <Card className="bg-white dark:bg-[#111827] rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-800">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No Active Workers
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Add workers to start managing payroll.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#111827] rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Workers Payroll
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {format(periodStart, 'MMM d')} - {format(periodEnd, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Payroll</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              RWF {totalPayroll.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {activeWorkers.map((worker, index) => {
          const payroll = calculateWorkerPayroll(worker);
          
          return (
            <motion.div
              key={worker.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-12 w-12 ring-2 ring-slate-200 dark:ring-slate-700">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                      {worker.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {worker.name}
                      </p>
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(worker.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                        {worker.role}
                      </Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        RWF {worker.daily_rate.toLocaleString()}/day
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-6 flex-shrink-0">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mb-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <p className="text-xs">Days</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {payroll.daysWorked}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mb-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      <p className="text-xs">Salary</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      RWF {payroll.grossAmount.toLocaleString()}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mb-1">
                      <Clock className="h-3.5 w-3.5" />
                      <p className="text-xs">Lunch Deduction</p>
                    </div>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      -RWF {payroll.lunchTotal.toLocaleString()}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total</p>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      RWF {payroll.netAmount.toLocaleString()}
                    </p>
                  </div>

                  {onTogglePaid && (
                    <div className="text-center">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Paid</p>
                      <div className="flex items-center justify-center gap-2">
                        <Checkbox
                          checked={paidWorkers.has(worker.id)}
                          onCheckedChange={() => onTogglePaid(worker.id)}
                          className="h-5 w-5"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {payroll.daysWorked === 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    ⚠️ No attendance recorded for this period
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {activeWorkers.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="space-y-1">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {activeWorkers.filter(w => calculateWorkerPayroll(w).daysWorked > 0).length} of {activeWorkers.length} workers have attendance
              </p>
              {onTogglePaid && paidWorkers.size > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  <CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />
                  {paidWorkers.size} worker{paidWorkers.size !== 1 ? 's' : ''} marked as paid
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total to be paid</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                RWF {totalPayroll.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}


