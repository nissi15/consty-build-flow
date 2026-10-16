import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllPagesInParallel, withDataTimeout } from '@/lib/supabase-pagination';

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  created_at: string;
}

export function useExpenses(options: { from?: string; to?: string } = {}) {
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

    setLoading(true);
    const run = async () => {
      do {
        refetchQueued.current = false;
        try {
          const { count, error: countError } = await withDataTimeout(
            (() => {
              let query = supabase.from('expenses').select('id', { count: 'exact', head: true });
              if (options.from) query = query.gte('date', options.from);
              if (options.to) query = query.lte('date', options.to);
              return query;
            })(),
          );
          if (countError) throw countError;
          const data = await fetchAllPagesInParallel<Expense>(count || 0, (from, to) => {
            let query = supabase
              .from('expenses')
              .select('id,category,amount,description,date,created_at')
              .order('date', { ascending: false })
              .order('created_at', { ascending: false });
            if (options.from) query = query.gte('date', options.from);
            if (options.to) query = query.lte('date', options.to);
            return query.range(from, to);
          }, 1000, 6);
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
  }, [options.from, options.to]);

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

  const stats = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    // Calculate monthly average
    const months = new Set(expenses.map(expense => expense.date.substring(0, 7))).size || 1;
    const monthlyAverage = totalExpenses / months;

    // Calculate this month's total
    const thisMonth = totalExpenses;

    // Count unique categories
    const categories = new Set(expenses.map(expense => expense.category)).size;

    return {
      totalExpenses,
      monthlyAverage,
      thisMonth,
      categories,
    };
  }, [expenses]);

  return {
    expenses,
    loading,
    stats,
    refetchExpenses: fetchExpenses,
  };
}
