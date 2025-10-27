import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Worker = Database['public']['Tables']['workers']['Row'];
type Attendance = Database['public']['Tables']['attendance']['Row'];
type Expense = Database['public']['Tables']['expenses']['Row'];
type Budget = Database['public']['Tables']['budget']['Row'];
type ActivityLog = Database['public']['Tables']['activity_log']['Row'];

export const useWorkers = (projectId?: string | null) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = useCallback(async () => {
    try {
      console.log('Fetching workers for project:', projectId);
      let query = supabase
        .from('workers')
        .select('*');
      
      // Only filter by project_id if provided
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
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
  }, [projectId]);

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

export const useAttendance = (projectId?: string | null) => {
  const [attendance, setAttendance] = useState<(Attendance & { workers: Worker })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    let query = supabase
      .from('attendance')
      .select('*, workers(*)');
    
    // Only filter by project_id if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (!error && data) {
      setAttendance(data as any);
    }
    setLoading(false);
  }, [projectId]);

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
  }, [fetchAttendance]);

  return { attendance, loading, refetch: fetchAttendance };
};

export const useExpenses = (projectId?: string | null) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    let query = supabase
      .from('expenses')
      .select('*');
    
    // Only filter by project_id if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (!error && data) {
      setExpenses(data);
    }
    setLoading(false);
  }, [projectId]);

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
  }, [fetchExpenses]);

  return { expenses, loading, refetch: fetchExpenses };
};

export const useBudget = (projectId?: string | null) => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBudget = useCallback(async () => {
    let query = supabase
      .from('budget')
      .select('*');
    
    // Only filter by project_id if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (!error && data) {
      setBudget(data);
    }
    setLoading(false);
  }, [projectId]);

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

export const useActivityLog = (projectId?: string | null) => {
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivityLog = useCallback(async () => {
    let query = supabase
      .from('activity_log')
      .select('*');
    
    // Only filter by project_id if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (!error && data) {
      setActivityLog(data);
    }
    setLoading(false);
  }, [projectId]);

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
  }, [fetchActivityLog]);

  return { activityLog, loading, refetch: fetchActivityLog };
};
