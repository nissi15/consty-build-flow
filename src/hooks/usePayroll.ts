import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, format, subWeeks } from 'date-fns';
import { fetchAllPagesInParallel, withDataTimeout } from '@/lib/supabase-pagination';

interface PayrollRecord {
  id: string;
  worker_id: string;
  period_start: string;
  period_end: string;
  days_worked: number;
  daily_rate: number;
  lunch_deduction: number;
  gross_amount: number;
  lunch_total: number;
  net_amount: number;
  status: 'pending' | 'approved' | 'paid';
  paid_at: string | null;
  created_at: string;
  worker?: {
    name: string;
    role: string;
  };
}

interface PayrollItem {
  id: string;
  payroll_id: string;
  date: string;
  amount: number;
  lunch_deduction: number;
  created_at: string;
}

interface PayrollStats {
  weeklyPayroll: number;
  workersOnPayroll: number;
  payrollPeriods: number;
}

export function usePayroll() {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PayrollStats>({
    weeklyPayroll: 0,
    workersOnPayroll: 0,
    payrollPeriods: 0,
  });
  const requestInFlight = useRef<Promise<void> | null>(null);
  const refetchQueued = useRef(false);
  const realtimeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPayrolls = useCallback(async () => {
    if (requestInFlight.current) {
      refetchQueued.current = true;
      return requestInFlight.current;
    }

    const run = async () => {
      do {
        refetchQueued.current = false;
        try {
          const { count, error: countError } = await withDataTimeout(
            supabase.from('payroll').select('id', { count: 'exact', head: true }),
          );
          if (countError) throw countError;
          const payrollData = await fetchAllPagesInParallel<PayrollRecord>(count || 0, (from, to) => supabase
            .from('payroll')
            .select('*, worker:workers(name, role)')
            .order('period_start', { ascending: false })
            .order('created_at', { ascending: false })
            .range(from, to), 1000, 4);

          setPayrolls(payrollData);
          const currentWeekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
          const currentWeekEnd = format(endOfWeek(new Date()), 'yyyy-MM-dd');
          const weeklyTotal = payrollData
            .filter(p => p.period_start >= currentWeekStart && p.period_end <= currentWeekEnd)
            .reduce((sum, p) => sum + Number(p.net_amount), 0);
          setStats({
            weeklyPayroll: weeklyTotal,
            workersOnPayroll: new Set(payrollData.map(p => p.worker_id)).size,
            payrollPeriods: new Set(payrollData.map(p => `${p.period_start}-${p.period_end}`)).size,
          });
        } catch (error) {
          console.error('Error fetching payrolls:', error);
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
    fetchPayrolls();

    const channel = supabase
      .channel('payroll-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payroll' }, () => {
        if (realtimeTimer.current) clearTimeout(realtimeTimer.current);
        realtimeTimer.current = setTimeout(fetchPayrolls, 750);
      })
      .subscribe();

    return () => {
      if (realtimeTimer.current) clearTimeout(realtimeTimer.current);
      supabase.removeChannel(channel);
    };
  }, [fetchPayrolls]);

  const generatePayroll = async () => {
    try {
      const startDate = format(startOfWeek(new Date()), 'yyyy-MM-dd');
      const endDate = format(endOfWeek(new Date()), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .rpc('generate_payroll', {
          start_date: startDate,
          end_date: endDate,
        });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error generating payroll:', error);
      throw error;
    }
  };

  const getPayrollTrend = () => {
    if (payrolls.length === 0) {
      return [];
    }

    // Group by week - get the week of the period_start for each payroll
    const weeklyData = payrolls.reduce((acc, curr) => {
      const periodStart = curr.period_start.split('T')[0]; // Remove time if present
      const weekStart = startOfWeek(new Date(periodStart), { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'MMM d'); // Format like "Oct 26"
      const weekDate = weekStart.getTime(); // Store timestamp for sorting
      
      if (!acc[weekKey]) {
        acc[weekKey] = { week: weekKey, amount: 0, weekDate };
      }
      acc[weekKey].amount += Number(curr.net_amount || 0);
      return acc;
    }, {} as Record<string, { week: string; amount: number; weekDate: number }>);

    // Sort by date timestamp
    return Object.values(weeklyData)
      .sort((a, b) => a.weekDate - b.weekDate)
      .map(({ week, amount }) => ({ week, amount }));
  };

  return {
    payrolls,
    loading,
    stats,
    generatePayroll,
    getPayrollTrend,
    refetch: fetchPayrolls,
  };
}
