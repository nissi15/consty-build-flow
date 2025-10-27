import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Worker {
  id: string;
  name: string;
  role: string;
  daily_rate: number;
  lunch_allowance: number;
  contact_info: string | null;
  join_date: string | null;
  is_active: boolean;
  total_days_worked: number | null;
  total_payable: number | null;
  created_at: string;
}

interface Attendance {
  id: string;
  worker_id: string;
  date: string;
  status: string;
  lunch_taken: boolean | null;
  lunch_money: number | null;
  check_in_time: string | null;
  check_out_time: string | null;
  hours: number | null;
  created_at: string;
  worker?: {
    name: string;
    role: string;
  };
}

interface Expense {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  date: string;
  type: string | null;
  created_at: string;
}

interface Budget {
  id: string;
  total_budget: number;
  used_budget: number;
  budget_remaining: number | null;
  created_at: string;
}

interface ActivityLog {
  id: string;
  message: string;
  action_type: string | null;
  created_at: string;
}

interface Budget {
  id: string;
  total_budget: number;
  used_budget: number;
  budget_remaining: number | null;
  created_at: string;
}

interface ActivityLog {
  id: string;
  message: string;
  action_type: string | null;
  created_at: string;
}

export function useSyncSystem() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    console.log('Fetching all sync system data...');
    setLoading(true);
    
    try {
      // Fetch workers
      const { data: workersData, error: workersError } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false });

      if (workersError) throw workersError;

      // Fetch attendance with worker data
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          *,
          worker:workers(*)
        `)
        .order('date', { ascending: false });

      if (attendanceError) throw attendanceError;

      // Fetch expenses with worker and attendance data
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          worker:workers(*),
          attendance:attendance(*)
        `)
        .order('created_at', { ascending: false });

      if (expensesError) throw expensesError;

      // Fetch budget
      const { data: budgetData, error: budgetError } = await supabase
        .from('budget')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (budgetError && budgetError.code !== 'PGRST116') throw budgetError;

      // Fetch activity log with worker data
      const { data: activityData, error: activityError } = await supabase
        .from('activity_log')
        .select(`
          *,
          worker:workers(*)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (activityError) throw activityError;

      setWorkers(workersData || []);
      setAttendance(attendanceData || []);
      setExpenses(expensesData || []);
      setBudget(budgetData || null);
      setActivityLog(activityData || []);

      console.log('Sync system data loaded:', {
        workers: workersData?.length || 0,
        attendance: attendanceData?.length || 0,
        expenses: expensesData?.length || 0,
        budget: budgetData ? 'loaded' : 'none',
        activityLog: activityData?.length || 0,
      });

    } catch (error) {
      console.error('Error fetching sync system data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark attendance
  const markAttendance = useCallback(async (
    workerId: string,
    date: string,
    status: 'present' | 'absent' | 'half-day',
    lunchTaken: boolean = false,
    checkInTime?: string,
    checkOutTime?: string,
    hours?: number
  ) => {
    try {
      console.log('Marking attendance:', { workerId, date, status, lunchTaken });
      
      const { data, error } = await supabase
        .from('attendance')
        .upsert({
          worker_id: workerId,
          date,
          status,
          lunch_taken: lunchTaken,
          check_in_time: checkInTime,
          check_out_time: checkOutTime,
          hours,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Attendance marked successfully:', data);
      return data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }, []);

  // Add manual expense
  const addManualExpense = useCallback(async (
    type: 'material' | 'misc',
    description: string,
    amount: number
  ) => {
    try {
      console.log('Adding manual expense:', { type, description, amount });
      
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          category: type,
          description,
          amount,
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Manual expense added successfully:', data);
      return data;
    } catch (error) {
      console.error('Error adding manual expense:', error);
      throw error;
    }
  }, []);

  // Update budget
  const updateBudget = useCallback(async (totalBudget: number) => {
    try {
      console.log('Updating budget:', totalBudget);
      
      const { data, error } = await supabase
        .from('budget')
        .upsert({
          total_budget: totalBudget,
          used_budget: budget?.used_budget || 0,
          budget_remaining: totalBudget - (budget?.used_budget || 0),
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Budget updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }, [budget]);

  // Get dashboard stats
  const getDashboardStats = useCallback(() => {
    const activeWorkers = workers.filter(w => w.is_active);
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === today && a.status === 'present');
    
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const salaryExpenses = expenses.filter(e => e.category === 'Labor').reduce((sum, e) => sum + e.amount, 0);
    const materialExpenses = expenses.filter(e => e.category === 'Materials').reduce((sum, e) => sum + e.amount, 0);
    const miscExpenses = expenses.filter(e => e.type === 'misc').reduce((sum, e) => sum + e.amount, 0);

    return {
      totalWorkers: activeWorkers.length,
      presentToday: todayAttendance.length,
      totalExpenses,
      salaryExpenses,
      materialExpenses,
      miscExpenses,
      budgetRemaining: budget?.budget_remaining || 0,
      budgetUsed: budget?.used_budget || 0,
      totalBudget: budget?.total_budget || 0,
    };
  }, [workers, attendance, expenses, budget]);

  // Get expense breakdown for charts
  const getExpenseBreakdown = useCallback(() => {
    const breakdown = expenses.reduce((acc, expense) => {
      acc[expense.type] = (acc[expense.type] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(breakdown).map(([type, amount]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: amount,
    }));
  }, [expenses]);

  // Get attendance trends
  const getAttendanceTrends = useCallback(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayAttendance = attendance.filter(a => a.date === date);
      const presentCount = dayAttendance.filter(a => a.status === 'present').length;
      const totalCost = dayAttendance.reduce((sum, a) => {
        const worker = workers.find(w => w.id === a.worker_id);
        return sum + ((worker?.daily_rate || 0) + (a.lunch_money || 0));
      }, 0);

      return {
        date,
        present: presentCount,
        cost: totalCost,
      };
    });
  }, [attendance]);

  // Setup real-time subscriptions
  useEffect(() => {
    fetchAllData();

    const channels = [
      supabase
        .channel('workers-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => {
          console.log('Workers table changed');
          fetchAllData();
        })
        .subscribe(),
      
      supabase
        .channel('attendance-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
          console.log('Attendance table changed');
          fetchAllData();
        })
        .subscribe(),
      
      supabase
        .channel('expenses-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
          console.log('Expenses table changed');
          fetchAllData();
        })
        .subscribe(),
      
      supabase
        .channel('budget-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'budget' }, () => {
          console.log('Budget table changed');
          fetchAllData();
        })
        .subscribe(),
      
      supabase
        .channel('activity-log-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, () => {
          console.log('Activity log changed');
          fetchAllData();
        })
        .subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [fetchAllData]);

  return {
    // Data
    workers,
    attendance,
    expenses,
    budget,
    activityLog,
    loading,
    
    // Actions
    markAttendance,
    addManualExpense,
    updateBudget,
    refetchAll: fetchAllData,
    
    // Computed data
    getDashboardStats,
    getExpenseBreakdown,
    getAttendanceTrends,
  };
}
