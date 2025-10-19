import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Download, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useWorkers, useAttendance } from '@/hooks/useSupabaseData';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { workers, loading: workersLoading } = useWorkers();
  const { attendance, loading: attendanceLoading } = useAttendance();
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'present' | 'absent' | 'late'>('present');

  const todayAttendance = attendance.filter(a => {
    if (!date) return false;
    return a.date === format(date, 'yyyy-MM-dd');
  });

  const handleMarkAttendance = async () => {
    if (!selectedWorker || !date) {
      toast.error('Please select a worker');
      return;
    }

    setIsMarkingAttendance(true);
    const { error } = await supabase.from('attendance').insert({
      worker_id: selectedWorker,
      date: format(date, 'yyyy-MM-dd'),
      status: selectedStatus,
      check_in_time: selectedStatus === 'present' ? new Date().toISOString() : null,
      hours: selectedStatus === 'present' ? 8 : selectedStatus === 'late' ? 7 : 0,
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('Attendance already marked for this worker today');
      } else {
        toast.error('Failed to mark attendance');
        console.error(error);
      }
    } else {
      toast.success('Attendance marked successfully!');
      setSelectedWorker('');
      setSelectedStatus('present');
    }
    setIsMarkingAttendance(false);
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
          <h1 className="text-4xl font-bold mb-2">Attendance</h1>
          <p className="text-muted-foreground">Track worker attendance and hours</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Mark Attendance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mark Attendance for {date ? format(date, 'PPP') : 'Today'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium">Worker</label>
                  <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a worker" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.filter(w => w.is_active).map(worker => (
                        <SelectItem key={worker.id} value={worker.id}>
                          {worker.name} - {worker.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={selectedStatus} onValueChange={(v: any) => setSelectedStatus(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleMarkAttendance} disabled={isMarkingAttendance} className="w-full">
                  {isMarkingAttendance ? 'Marking...' : 'Mark Attendance'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
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
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-4">
              Attendance for {date ? format(date, 'PPP') : 'Today'}
            </h3>
            {todayAttendance.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No attendance records for this date
              </div>
            ) : (
              <div className="space-y-3">
                {todayAttendance.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{record.workers?.name}</p>
                      <p className="text-sm text-muted-foreground">{record.hours} hours</p>
                    </div>
                    <Badge
                      variant={
                        record.status === 'present'
                          ? 'default'
                          : record.status === 'late'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {record.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Attendance;
