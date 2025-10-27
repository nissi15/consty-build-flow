import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Worker = Database['public']['Tables']['workers']['Row'];
type Attendance = Database['public']['Tables']['attendance']['Row'];
type Expense = Database['public']['Tables']['expenses']['Row'];
type Budget = Database['public']['Tables']['budget']['Row'];
type ActivityLog = Database['public']['Tables']['activity_log']['Row'];

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
  const [attendance, setAttendance] = useState<(Attendance & { workers: Worker })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();

    const channel = supabase
      .channel('attendance-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
        fetchAttendance();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAttendance = async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, workers(*)')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setAttendance(data as any);
    }
    setLoading(false);
  };

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
