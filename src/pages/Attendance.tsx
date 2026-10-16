import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';
import { useWorkers, useAttendance } from '@/hooks/useSupabaseData';
import { format, subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AttendanceStats } from '@/components/attendance/AttendanceStats';
import { PendingAttendance } from '@/components/attendance/PendingAttendance';
import { AttendanceTrendChart } from '@/components/attendance/AttendanceTrendChart';
import { AttendanceRecords } from '@/components/attendance/AttendanceRecords';
import { PROJECT_END } from '@/lib/project-period';

const Attendance = () => {
  const [date] = useState<Date>(PROJECT_END);
  const { workers, loading: workersLoading } = useWorkers();
  const attendanceWindow = useMemo(() => ({
    from: format(subDays(PROJECT_END, 30), 'yyyy-MM-dd'),
    to: format(PROJECT_END, 'yyyy-MM-dd'),
  }), []);
  const { attendance, loading: attendanceLoading, refetch: refetchAttendance } = useAttendance(attendanceWindow);

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
    <div className="min-h-screen space-y-6 bg-background p-4 text-foreground sm:p-6 lg:p-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
            <MapPin className="h-3.5 w-3.5" /> Musanze Town Buildings · Workforce
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Attendance</h1>
          <p className="mt-2 text-muted-foreground">Review daily presence and the latest 31 days of workforce history.</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Reporting date</p>
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

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <AttendanceRecords attendance={attendance} />
      </motion.div>
    </div>
  );
};

export default Attendance;
