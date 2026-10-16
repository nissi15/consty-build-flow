import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { fetchAllPagesInParallel, withDataTimeout } from '@/lib/supabase-pagination';

type Worker = Database['public']['Tables']['workers']['Row'];
type Attendance = Database['public']['Tables']['attendance']['Row'];
type Expense = Database['public']['Tables']['expenses']['Row'];
type Budget = Database['public']['Tables']['budget']['Row'];
type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
type AttendanceWithWorker = Attendance & {
  workers: Pick<Worker, 'id' | 'name' | 'role'>;
};

export const useWorkers = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = useCallback(async () => {
    try {
      console.log('Fetching workers...');
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching workers:', error);
        return;
      }

      console.log('Workers data received:', data);
      if (data) {
        setWorkers(data);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers();

    const channel = supabase
      .channel('workers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, (payload) => {
        console.log('Workers changed:', payload);
        fetchWorkers();
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWorkers]);

  return { workers, loading, refetch: fetchWorkers };
};

export const useAttendance = () => {
  const [attendance, setAttendance] = useState<AttendanceWithWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const requestInFlight = useRef<Promise<void> | null>(null);
  const refetchQueued = useRef(false);
  const realtimeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAttendance = useCallback(async () => {
    if (requestInFlight.current) {
      refetchQueued.current = true;
      return requestInFlight.current;
    }

    const run = async () => {
      do {
        refetchQueued.current = false;
        try {
          const { count, error: countError } = await withDataTimeout(
            supabase.from('attendance').select('id', { count: 'exact', head: true }),
          );
          if (countError) throw countError;

          const data = await fetchAllPagesInParallel<AttendanceWithWorker>(count || 0, (from, to) => supabase
            .from('attendance')
            .select('*, workers(id, name, role)')
            .order('created_at', { ascending: false })
            .range(from, to));
          setAttendance(data);
        } catch (error) {
          console.error('Error fetching attendance:', error);
        }
      } while (refetchQueued.current);
    };

    requestInFlight.current = run().finally(() => {
      requestInFlight.current = null;
      setLoading(false);
    });
    return requestInFlight.current;
  }, []);

  useEffect(() => {
    fetchAttendance();

    const channel = supabase
      .channel('attendance-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
        if (realtimeTimer.current) clearTimeout(realtimeTimer.current);
        realtimeTimer.current = setTimeout(fetchAttendance, 750);
      })
      .subscribe();

    return () => {
      if (realtimeTimer.current) clearTimeout(realtimeTimer.current);
      supabase.removeChannel(channel);
    };
  }, [fetchAttendance]);

  return { attendance, loading, refetch: fetchAttendance };
};

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();

    const channel = supabase
      .channel('expenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        fetchExpenses();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setExpenses(data);
    }
    setLoading(false);
  };

  return { expenses, loading, refetch: fetchExpenses };
};

export const useBudget = () => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudget();

    const channel = supabase
      .channel('budget-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget' }, () => {
        fetchBudget();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBudget = async () => {
    const { data, error } = await supabase
      .from('budget')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (!error && data) {
      setBudget(data);
    }
    setLoading(false);
  };

  return { budget, loading, refetch: fetchBudget };
};

export const useActivityLog = () => {
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityLog();

    const channel = supabase
      .channel('activity-log-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, () => {
        fetchActivityLog();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActivityLog = async () => {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (!error && data) {
      setActivityLog(data);
    }
    setLoading(false);
  };

  return { activityLog, loading, refetch: fetchActivityLog };
};
