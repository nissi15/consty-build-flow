import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';
import { useWorkers, useAttendance } from '@/hooks/useSupabaseData';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AttendanceStats } from '@/components/attendance/AttendanceStats';
import { PendingAttendance } from '@/components/attendance/PendingAttendance';
import { AttendanceTrendChart } from '@/components/attendance/AttendanceTrendChart';

const Attendance = () => {
  const [date] = useState<Date>(new Date());
  const { workers, loading: workersLoading } = useWorkers();
  const { attendance, loading: attendanceLoading, refetch: refetchAttendance } = useAttendance();

  const stats = useMemo(() => {
    const today = format(date, 'yyyy-MM-dd');
    const todayAttendance = attendance.filter(a => a.date === today);
    const presentToday = todayAttendance.filter(a => a.status === 'present').length;
    const absentToday = todayAttendance.filter(a => a.status === 'absent').length;
    const totalWorkers = workers.filter(w => w.is_active).length;
    const attendanceRate = totalWorkers > 0 ? Math.round((presentToday / totalWorkers) * 100) : 0;

    return {
      totalWorkers,
      presentToday,
      absentToday,
      attendanceRate,
    };
  }, [workers, attendance, date]);

  const pendingWorkers = useMemo(() => {
    const today = format(date, 'yyyy-MM-dd');
    const markedWorkerIds = attendance
      .filter(a => a.date === today)
      .map(a => a.worker_id);
    
    return workers
      .filter(w => w.is_active && !markedWorkerIds.includes(w.id));
  }, [workers, attendance, date]);

  const handleMarkAttendance = async (workerId: string, status: 'present' | 'absent') => {
    const today = format(date, 'yyyy-MM-dd');
    
    try {
      const { error } = await supabase.from('attendance').insert({
        worker_id: workerId,
        date: today,
        status,
        lunch_taken: status === 'present',
        check_in_time: status === 'present' ? new Date().toISOString() : null,
        hours: status === 'present' ? 8.0 : 0,
      });

      if (error) {
        console.error('Attendance error:', error);
        if (error.code === '23505') {
          toast.error('Attendance already marked for this worker today');
        } else {
          toast.error(`Failed to mark attendance: ${error.message}`);
        }
      } else {
        toast.success('Attendance marked successfully!');
        refetchAttendance();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred');
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
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 min-h-screen">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Attendance Tracking</h1>
          <p className="text-muted-foreground">Mark worker attendance and track daily presence</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-sm font-medium">{format(date, 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <AttendanceStats {...stats} />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <AttendanceTrendChart attendance={attendance} />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <PendingAttendance
          workers={pendingWorkers}
          onMarkPresent={(workerId) => handleMarkAttendance(workerId, 'present')}
          onMarkAbsent={(workerId) => handleMarkAttendance(workerId, 'absent')}
        />
      </motion.div>
    </div>
  );
};

export default Attendance;
