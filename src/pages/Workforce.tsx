import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, CheckCircle, Clock, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAttendance, useWorkers } from '@/hooks/useSupabaseData';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import toast from 'react-hot-toast';
import { formatRWF } from '@/lib/utils';

type AttendanceStatus = 'present' | 'late' | 'absent';

const Workforce = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { workers, loading: workersLoading } = useWorkers();
  const { attendance, loading: attendanceLoading } = useAttendance();
  const [busyWorkerId, setBusyWorkerId] = useState<string | null>(null);

  const weekBounds = useMemo(() => {
    const selected = date ?? new Date();
    return {
      start: startOfWeek(selected, { weekStartsOn: 1 }),
      end: endOfWeek(selected, { weekStartsOn: 1 }),
    };
  }, [date]);

  const computed = useMemo(() => {
    const byWorker: Record<string, { daysWorkedThisWeek: number; payableThisWeek: number }> = {};
    for (const worker of workers) {
      const records = attendance.filter((a) => a.worker_id === worker.id);
      const daysWorkedThisWeek = records.filter((r) => {
        const d = new Date(r.date);
        const worked = r.status === 'present' || r.status === 'late';
        return worked && isWithinInterval(d, { start: weekBounds.start, end: weekBounds.end });
      }).length;
      const dailyNet = Number(worker.daily_rate) - Number(worker.lunch_allowance || 0);
      const payableThisWeek = daysWorkedThisWeek * dailyNet;
      byWorker[worker.id] = { daysWorkedThisWeek, payableThisWeek };
    }
    return byWorker;
  }, [attendance, weekBounds.end, weekBounds.start, workers]);

  const markAttendance = async (
    workerId: string,
    workerName: string,
    dailyRate: number,
    lunchAllowance: number,
    status: AttendanceStatus,
  ) => {
    if (!date) {
      toast.error('Please select a date');
      return;
    }
    setBusyWorkerId(workerId);
    try {
      const iso = format(date, 'yyyy-MM-dd');
      const hours = status === 'present' ? 8 : status === 'late' ? 7 : 0;

      const { error: attErr } = await supabase.from('attendance').insert({
        worker_id: workerId,
        date: iso,
        status,
        check_in_time: status === 'present' || status === 'late' ? new Date().toISOString() : null,
        hours,
        lunch_money: lunchAllowance,
      });

      if (attErr) {
        if ((attErr as any).code === '23505') {
          toast.error('Attendance already marked for this worker on selected date');
        } else {
          toast.error('Failed to mark attendance');
          console.error(attErr);
        }
        return;
      }

      await supabase.from('activity_log').insert({
        message: `Attendance ${status} for ${workerName} on ${iso}`,
        action_type: 'attendance',
      });

      if (status !== 'absent') {
        const netLabor = Number(dailyRate) - Number(lunchAllowance || 0);
        const expenseRows = [
          {
            amount: netLabor,
            category: 'Labor',
            description: `Net wage for ${workerName} (${iso})`,
            date: iso,
          },
          {
            amount: Number(lunchAllowance || 0),
            category: 'Lunch',
            description: `Lunch deduction for ${workerName} (${iso})`,
            date: iso,
          },
        ];

        const { error: expErr } = await supabase.from('expenses').insert(expenseRows);
        if (expErr) {
          console.error(expErr);
          toast.error('Attendance saved, but failed to record expenses');
        } else {
          await supabase.from('activity_log').insert({
            message: `Expenses recorded for ${workerName}: ${formatRWF(netLabor)} labor and ${formatRWF(lunchAllowance)} lunch`,
            action_type: 'expense',
          });

          const { data: budgetRow } = await supabase
            .from('budget')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (budgetRow) {
            const newUsed = Number(budgetRow.used_budget || 0) + Number(dailyRate || 0);
            await supabase.from('budget').update({ used_budget: newUsed }).eq('id', budgetRow.id);
          }
        }
      }

      toast.success('Attendance marked successfully');
    } finally {
      setBusyWorkerId(null);
    }
  };

  if (workersLoading || attendanceLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="lg:col-span-2 h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Workforce Manager</h1>
          <p className="text-muted-foreground">Manage workers and mark attendance</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Select Date
            </h3>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="p-6 glass">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Today’s Workforce</h3>
              <div className="text-sm text-muted-foreground">
                Week: {format(weekBounds.start, 'MMM d')} – {format(weekBounds.end, 'MMM d')}
              </div>
            </div>

            <div className="space-y-3">
              {workers.map((worker, index) => {
                const { daysWorkedThisWeek, payableThisWeek } = computed[worker.id] ?? {
                  daysWorkedThisWeek: 0,
                  payableThisWeek: 0,
                };
                const initials = worker.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('');
                return (
                  <motion.div
                    key={worker.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-primary text-white flex items-center justify-center font-semibold">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium">{worker.name}</p>
                        <p className="text-sm text-muted-foreground">{worker.role}</p>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Days (wk)</p>
                        <p className="font-medium">{daysWorkedThisWeek}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Payable (wk)</p>
                        <p className="font-semibold">{formatRWF(payableThisWeek)}</p>
                      </div>
                      <Badge variant={worker.is_active ? 'default' : 'secondary'}>
                        {worker.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="gap-1"
                        disabled={busyWorkerId === worker.id}
                        onClick={() =>
                          markAttendance(
                            worker.id,
                            worker.name,
                            Number(worker.daily_rate),
                            Number(worker.lunch_allowance || 0),
                            'present',
                          )
                        }
                      >
                        <CheckCircle className="h-4 w-4" /> Present
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-1"
                        disabled={busyWorkerId === worker.id}
                        onClick={() =>
                          markAttendance(
                            worker.id,
                            worker.name,
                            Number(worker.daily_rate),
                            Number(worker.lunch_allowance || 0),
                            'late',
                          )
                        }
                      >
                        <Clock className="h-4 w-4" /> Late
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        disabled={busyWorkerId === worker.id}
                        onClick={() =>
                          markAttendance(
                            worker.id,
                            worker.name,
                            Number(worker.daily_rate),
                            Number(worker.lunch_allowance || 0),
                            'absent',
                          )
                        }
                      >
                        <X className="h-4 w-4" /> Absent
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Workforce;
