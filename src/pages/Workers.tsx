import { motion } from 'framer-motion';
import { Plus, Calendar, Users, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkers, useAttendance } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { WorkerStats } from '@/components/workers/WorkerStats';
import { WorkerList } from '@/components/workers/WorkerList';
import { WorkerFilters } from '@/components/workers/WorkerFilters';
import { getTodayInRwanda } from '@/utils/dateUtils';

export default function Workers() {
  const { workers, loading, refetch: refetchWorkers } = useWorkers();
  const { attendance, loading: attendanceLoading } = useAttendance();

  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddingWorker, setIsAddingWorker] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    role: '',
    daily_rate: '',
    lunch_allowance: '50',
    contact_info: '',
    join_date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [editingWorker, setEditingWorker] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const stats = useMemo(() => {
    const activeWorkers = workers.filter(w => w.is_active);
    const today = getTodayInRwanda();
    const presentToday = attendance.filter(a => 
      a.date === today && a.status === 'present'
    ).length;
    
    const avgDailyRate = activeWorkers.length > 0
      ? Math.round(activeWorkers.reduce((sum, w) => sum + Number(w.daily_rate), 0) / activeWorkers.length)
      : 0;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weeklyHours = attendance
      .filter(a => new Date(a.date) >= weekStart && a.status === 'present')
      .reduce((sum, a) => sum + Number(a.hours || 8), 0);

    return {
      totalWorkers: activeWorkers.length,
      presentToday,
      avgDailyRate,
      weeklyHours,
    };
  }, [workers, attendance]);

  const filteredWorkers = useMemo(() => {
    // First filter by search term
    let filtered = workers.filter(w => 
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.role.toLowerCase().includes(search.toLowerCase())
    );

    // Add attendance data to workers
    filtered = filtered.map(worker => {
      // Get today's attendance if a specific date is not selected
      const targetDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : getTodayInRwanda();
      const todayAttendance = attendance.find(a => 
        a.worker_id === worker.id && a.date === targetDate
      );

      // Get weekly attendance stats
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const weeklyAttendance = attendance.filter(a => 
        a.worker_id === worker.id && 
        new Date(a.date) >= weekStart
      );

      return {
        ...worker,
        attendance: todayAttendance,
        weeklyAttendance: {
          days: weeklyAttendance.length,
          marked: weeklyAttendance.filter(a => a.status === 'present').length,
        },
      };
    });

    // Filter by status
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'not_marked') {
        filtered = filtered.filter(w => {
          const today = getTodayInRwanda();
          return !attendance.some(a => a.worker_id === w.id && a.date === today);
        });
      } else {
        filtered = filtered.filter(w => {
          const today = getTodayInRwanda();
          return attendance.some(a => a.worker_id === w.id && a.date === today && a.status === selectedStatus);
        });
      }
    }

    return filtered;
  }, [workers, attendance, search, selectedDate, selectedStatus]);

  const handleAddWorker = async () => {
    if (!newWorker.name || !newWorker.role || !newWorker.daily_rate || !newWorker.join_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsAddingWorker(true);
    const { error } = await supabase.from('workers').insert({
      name: newWorker.name,
      role: newWorker.role,
      daily_rate: parseFloat(newWorker.daily_rate),
      lunch_allowance: parseFloat(newWorker.lunch_allowance),
      contact_info: newWorker.contact_info,
      join_date: newWorker.join_date,
      is_active: true,
    });

    if (error) {
      console.error('Add worker error:', error);
      toast.error(`Failed to add worker: ${error.message}`);
    } else {
      toast.success(`Worker ${newWorker.name} added successfully!`);
      setNewWorker({ 
        name: '', 
        role: '', 
        daily_rate: '', 
        lunch_allowance: '50',
        contact_info: '',
        join_date: format(new Date(), 'yyyy-MM-dd'),
      });
      
      await supabase.from('activity_log').insert({
        message: `New worker added: ${newWorker.name}`,
        action_type: 'worker',
      });
    }
    setIsAddingWorker(false);
  };

  const handleAutoCalculate = async () => {
    setIsCalculating(true);
    const today = getTodayInRwanda();
    
    try {
      // Get all present workers for today
      const presentWorkers = attendance.filter(a => 
        a.date === today && a.status === 'present'
      );

      if (presentWorkers.length === 0) {
        toast.error('No workers marked as present today');
        setIsCalculating(false);
        return;
      }

      let totalLunchExpense = 0;

      // Update each attendance record with worker's daily rate and lunch
      const updates = presentWorkers.map(async (att) => {
        const worker = workers.find(w => w.id === att.worker_id);
        if (!worker) return;

        // Update attendance
        await supabase
          .from('attendance')
          .update({
            lunch_money: worker.lunch_allowance,
            hours: att.hours || 8, // Default to 8 hours if not set
          })
          .eq('id', att.id);

        // Create expense entry for lunch money with correct date
        if (worker.lunch_allowance > 0) {
          const { error: expenseError } = await supabase.from('expenses').insert({
            category: 'Lunch',
            amount: worker.lunch_allowance,
            description: `Lunch allowance for ${worker.name} on ${today}`,
            date: today, // This is already in Rwanda timezone from getTodayInRwanda()
          });
          
          if (!expenseError) {
            totalLunchExpense += worker.lunch_allowance;
          }
        }
      });

      await Promise.all(updates);
      
      toast.success(`Auto-calculated rates for ${presentWorkers.length} present workers. Total lunch expense: RWF ${totalLunchExpense}`);
      await supabase.from('activity_log').insert({
        message: `Auto-calculated daily rates for ${presentWorkers.length} workers (Lunch: RWF ${totalLunchExpense})`,
        action_type: 'attendance',
      });
    } catch (error) {
      console.error('Auto-calculate error:', error);
      toast.error('Failed to auto-calculate rates');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleEditWorker = async () => {
    if (!editingWorker) return;

    if (!editingWorker.name || !editingWorker.role || !editingWorker.daily_rate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const { error } = await supabase
      .from('workers')
      .update({
        name: editingWorker.name,
        role: editingWorker.role,
        daily_rate: parseFloat(editingWorker.daily_rate),
        lunch_allowance: parseFloat(editingWorker.lunch_allowance),
        contact_info: editingWorker.contact_info,
      })
      .eq('id', editingWorker.id);

    if (error) {
      console.error('Edit worker error:', error);
      toast.error(`Failed to update worker: ${error.message}`);
    } else {
      toast.success(`Worker ${editingWorker.name} updated successfully!`);
      setIsEditDialogOpen(false);
      setEditingWorker(null);
      
      await supabase.from('activity_log').insert({
        message: `Worker updated: ${editingWorker.name}`,
        action_type: 'worker',
      });
      refetchWorkers();
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
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="space-y-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Worker Management</h1>
              <p className="text-muted-foreground">Manage your construction team and track their performance</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleAutoCalculate}
                disabled={isCalculating}
                className="gap-2 bg-green-500 hover:bg-green-600"
              >
                <Calculator className="h-4 w-4" />
                {isCalculating ? 'Calculating...' : 'Auto-Calculate Today'}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-purple-500 hover:bg-purple-600">
                    <Plus className="h-4 w-4" />
                    Add Worker
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Worker</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Worker Name *</Label>
                    <Input
                      id="name"
                      value={newWorker.name}
                      onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                      placeholder="e.g., John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role/Position *</Label>
                    <Input
                      id="role"
                      value={newWorker.role}
                      onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value })}
                      placeholder="e.g., Foreman, Carpenter, Electrician"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="daily_rate">Daily Rate (RWF) *</Label>
                      <Input
                        id="daily_rate"
                        type="number"
                        value={newWorker.daily_rate}
                        onChange={(e) => setNewWorker({ ...newWorker, daily_rate: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lunch_allowance">Lunch Cost (RWF) *</Label>
                      <Input
                        id="lunch_allowance"
                        type="number"
                        value={newWorker.lunch_allowance}
                        onChange={(e) => setNewWorker({ ...newWorker, lunch_allowance: e.target.value })}
                        placeholder="50"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contact_info">Contact Information</Label>
                    <Input
                      id="contact_info"
                      value={newWorker.contact_info}
                      onChange={(e) => setNewWorker({ ...newWorker, contact_info: e.target.value })}
                      placeholder="Phone number or email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="join_date">Join Date *</Label>
                    <div className="relative">
                      <Input
                        id="join_date"
                        type="date"
                        value={newWorker.join_date}
                        onChange={(e) => setNewWorker({ ...newWorker, join_date: e.target.value })}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddingWorker(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddWorker} disabled={isAddingWorker}>
                      {isAddingWorker ? 'Adding...' : 'Save Worker'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <WorkerStats {...stats} />
        </motion.div>

        {workers.length === 0 ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center py-12"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No workers yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your team by adding your first construction worker. Track their attendance, manage payroll, and monitor performance.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-purple-500 hover:bg-purple-600">
                  <Plus className="h-4 w-4" />
                  Add Your First Worker
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Worker</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Worker Name *</Label>
                    <Input
                      id="name"
                      value={newWorker.name}
                      onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                      placeholder="e.g., John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role/Position *</Label>
                    <Input
                      id="role"
                      value={newWorker.role}
                      onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value })}
                      placeholder="e.g., Foreman, Carpenter, Electrician"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="daily_rate">Daily Rate (RWF) *</Label>
                      <Input
                        id="daily_rate"
                        type="number"
                        value={newWorker.daily_rate}
                        onChange={(e) => setNewWorker({ ...newWorker, daily_rate: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lunch_allowance">Lunch Cost (RWF) *</Label>
                      <Input
                        id="lunch_allowance"
                        type="number"
                        value={newWorker.lunch_allowance}
                        onChange={(e) => setNewWorker({ ...newWorker, lunch_allowance: e.target.value })}
                        placeholder="50"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contact_info">Contact Information</Label>
                    <Input
                      id="contact_info"
                      value={newWorker.contact_info}
                      onChange={(e) => setNewWorker({ ...newWorker, contact_info: e.target.value })}
                      placeholder="Phone number or email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="join_date">Join Date *</Label>
                    <div className="relative">
                      <Input
                        id="join_date"
                        type="date"
                        value={newWorker.join_date}
                        onChange={(e) => setNewWorker({ ...newWorker, join_date: e.target.value })}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddingWorker(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddWorker} disabled={isAddingWorker}>
                      {isAddingWorker ? 'Adding...' : 'Save Worker'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <WorkerFilters
                search={search}
                onSearchChange={setSearch}
                date={selectedDate}
                onDateChange={setSelectedDate}
                status={selectedStatus}
                onStatusChange={setSelectedStatus}
              />
              <WorkerList 
                workers={filteredWorkers}
                onEdit={(worker) => {
                  setEditingWorker({
                    id: worker.id,
                    name: worker.name,
                    role: worker.role,
                    daily_rate: worker.daily_rate.toString(),
                    lunch_allowance: worker.lunch_allowance.toString(),
                    contact_info: worker.contact_info || '',
                  });
                  setIsEditDialogOpen(true);
                }}
                onDelete={async (worker) => {
                  const { error } = await supabase
                    .from('workers')
                    .delete()
                    .eq('id', worker.id);

                  if (error) {
                    toast.error('Failed to delete worker');
                    console.error(error);
                  } else {
                    toast.success(`Worker ${worker.name} deleted successfully`);
                    await supabase.from('activity_log').insert({
                      message: `Worker deleted: ${worker.name}`,
                      action_type: 'worker',
                    });
                    // Refresh the workers list
                    refetchWorkers();
                  }
                }}
              />
            </motion.div>
          </>
        )}
      </div>

      {/* Edit Worker Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Worker</DialogTitle>
          </DialogHeader>
          {editingWorker && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Worker Name *</Label>
                <Input
                  id="edit-name"
                  value={editingWorker.name}
                  onChange={(e) => setEditingWorker({ ...editingWorker, name: e.target.value })}
                  placeholder="e.g., John Smith"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role/Position *</Label>
                <Input
                  id="edit-role"
                  value={editingWorker.role}
                  onChange={(e) => setEditingWorker({ ...editingWorker, role: e.target.value })}
                  placeholder="e.g., Foreman, Carpenter, Electrician"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-daily_rate">Daily Rate (RWF) *</Label>
                  <Input
                    id="edit-daily_rate"
                    type="number"
                    value={editingWorker.daily_rate}
                    onChange={(e) => setEditingWorker({ ...editingWorker, daily_rate: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-lunch_allowance">Lunch Cost (RWF) *</Label>
                  <Input
                    id="edit-lunch_allowance"
                    type="number"
                    value={editingWorker.lunch_allowance}
                    onChange={(e) => setEditingWorker({ ...editingWorker, lunch_allowance: e.target.value })}
                    placeholder="50"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-contact_info">Contact Information</Label>
                <Input
                  id="edit-contact_info"
                  value={editingWorker.contact_info}
                  onChange={(e) => setEditingWorker({ ...editingWorker, contact_info: e.target.value })}
                  placeholder="Phone number or email"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingWorker(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleEditWorker}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

