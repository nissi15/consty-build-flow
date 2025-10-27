import { motion } from 'framer-motion';
import { Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useSyncSystem } from '@/hooks/useSyncSystem';

export default function Attendance() {
  const { 
    workers, 
    attendance, 
    loading, 
    markAttendance,
    getDashboardStats 
  } = useSyncSystem();
  
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isMarking, setIsMarking] = useState<string | null>(null);

  const stats = getDashboardStats();
  const activeWorkers = workers.filter(w => w.is_active);
  
  // Get today's attendance
  const todayAttendance = attendance.filter(a => a.date === selectedDate);
  
  // Get workers who haven't been marked today
  const unmarkedWorkers = activeWorkers.filter(worker => 
    !todayAttendance.some(att => att.worker_id === worker.id)
  );

  const handleMarkAttendance = async (
    workerId: string, 
    status: 'present' | 'absent' | 'half-day',
    lunchTaken: boolean = false
  ) => {
    setIsMarking(workerId);
    try {
      await markAttendance(workerId, selectedDate, status, lunchTaken);
      toast.success(`Attendance marked as ${status}`);
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    } finally {
      setIsMarking(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background text-foreground min-h-screen">
      <div className="space-y-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Attendance Management</h1>
              <p className="text-muted-foreground">Track daily worker attendance and manage payroll</p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 glass">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Workers</p>
                  <p className="text-2xl font-semibold">{stats.totalWorkers}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 glass">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Present Today</p>
                  <p className="text-2xl font-semibold">{stats.presentToday}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 glass">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-red-100 text-red-600">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Absent Today</p>
                  <p className="text-2xl font-semibold">
                    {todayAttendance.filter(a => a.status === 'absent').length}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 glass">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  <p className="text-2xl font-semibold">
                    {stats.totalWorkers > 0 ? Math.round((stats.presentToday / stats.totalWorkers) * 100) : 0}%
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Pending Attendance */}
        {unmarkedWorkers.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 glass">
              <h2 className="text-lg font-semibold mb-4">Pending Attendance - {format(new Date(selectedDate), 'MMM dd, yyyy')}</h2>
              <div className="space-y-3">
                {unmarkedWorkers.map((worker) => (
                  <div key={worker.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{worker.name}</p>
                        <p className="text-sm text-muted-foreground">{worker.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAttendance(worker.id, 'present', true)}
                        disabled={isMarking === worker.id}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Present + Lunch
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAttendance(worker.id, 'present', false)}
                        disabled={isMarking === worker.id}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAttendance(worker.id, 'half-day')}
                        disabled={isMarking === worker.id}
                        className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Half Day
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAttendance(worker.id, 'absent')}
                        disabled={isMarking === worker.id}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Absent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Today's Attendance Summary */}
        {todayAttendance.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 glass">
              <h2 className="text-lg font-semibold mb-4">Today's Attendance Summary</h2>
              <div className="space-y-3">
                {todayAttendance.map((att) => {
                  const worker = workers.find(w => w.id === att.worker_id);
                  if (!worker) return null;
                  
                  return (
                    <div key={att.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          att.status === 'present' ? 'bg-green-100 text-green-600' :
                          att.status === 'half-day' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {att.status === 'present' ? <CheckCircle className="h-5 w-5" /> :
                           att.status === 'half-day' ? <Clock className="h-5 w-5" /> :
                           <XCircle className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-semibold">{worker.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {worker.role} • {att.status.charAt(0).toUpperCase() + att.status.slice(1)}
                            {att.lunch_taken && ' • Lunch'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">RWF {((worker.daily_rate || 0) + (att.lunch_money || 0)).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          RWF {(worker.daily_rate || 0).toFixed(2)} + RWF {(att.lunch_money || 0).toFixed(2)} lunch
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {unmarkedWorkers.length === 0 && todayAttendance.length === 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-12"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No attendance records</h3>
            <p className="text-muted-foreground mb-4">
              Mark attendance for your workers to track daily costs and payroll.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
