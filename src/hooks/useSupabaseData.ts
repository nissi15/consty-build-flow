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
type AttendanceSummary = Pick<Attendance, 'id' | 'date' | 'status'>;

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

export interface AttendanceQueryOptions {
  from?: string;
  to?: string;
}

export const useAttendance = (options: AttendanceQueryOptions = {}) => {
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
          let countQuery = supabase.from('attendance').select('id', { count: 'exact', head: true });
          if (options.from) countQuery = countQuery.gte('date', options.from);
          if (options.to) countQuery = countQuery.lte('date', options.to);
          const { count, error: countError } = await withDataTimeout(countQuery);
          if (countError) throw countError;

          const data = await fetchAllPagesInParallel<AttendanceWithWorker>(count || 0, (from, to) => {
            let query = supabase
              .from('attendance')
              .select('*, workers(id, name, role)')
              .order('date', { ascending: false })
              .order('created_at', { ascending: false });
            if (options.from) query = query.gte('date', options.from);
            if (options.to) query = query.lte('date', options.to);
            return query.range(from, to);
          });
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
  }, [options.from, options.to]);

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

export const useAttendanceSummary = () => {
  const [attendance, setAttendance] = useState<AttendanceSummary[]>([]);
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
          const data = await fetchAllPagesInParallel<AttendanceSummary>(count || 0, (from, to) => supabase
            .from('attendance')
            .select('id,date,status')
            .order('date', { ascending: false })
            .range(from, to), 1000, 6);
          setAttendance(data);
        } catch (error) {
          console.error('Error fetching attendance summary:', error);
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
      .channel('attendance-summary-changes')
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
  const requestInFlight = useRef<Promise<void> | null>(null);
  const refetchQueued = useRef(false);
  const realtimeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchExpenses = useCallback(async () => {
    if (requestInFlight.current) {
      refetchQueued.current = true;
      return requestInFlight.current;
    }

    const run = async () => {
      do {
        refetchQueued.current = false;
        try {
          const { count, error: countError } = await withDataTimeout(
            supabase.from('expenses').select('id', { count: 'exact', head: true }),
          );
          if (countError) throw countError;

          const data = await fetchAllPagesInParallel<Expense>(count || 0, (from, to) => supabase
            .from('expenses')
            .select('*')
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })
            .range(from, to), 1000, 6);
          setExpenses(data);
        } catch (error) {
          console.error('Error fetching expenses:', error);
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
    fetchExpenses();

    const channel = supabase
      .channel('expenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        if (realtimeTimer.current) clearTimeout(realtimeTimer.current);
        realtimeTimer.current = setTimeout(fetchExpenses, 750);
      })
      .subscribe();

    return () => {
      if (realtimeTimer.current) clearTimeout(realtimeTimer.current);
      supabase.removeChannel(channel);
    };
  }, [fetchExpenses]);

  return { expenses, loading, refetch: fetchExpenses };
};

export const useBudget = () => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBudget = useCallback(async () => {
    const { data, error } = await supabase
      .from('budget')
      .select('*')
      .order('total_budget', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error) setBudget(data);
    setLoading(false);
  }, []);

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
  }, [fetchBudget]);

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
