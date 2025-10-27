import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, format } from 'date-fns';

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

export function usePayroll(projectId?: string | null) {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PayrollStats>({
    weeklyPayroll: 0,
    workersOnPayroll: 0,
    payrollPeriods: 0,
  });

  const fetchPayrolls = useCallback(async () => {
    try {
      let query = supabase
        .from('payroll')
        .select('*, worker:workers(name, role)');

      // Only filter by project_id if provided
      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data: payrollData, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setPayrolls(payrollData as PayrollRecord[]);

      // Calculate stats
      const currentWeekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
      const currentWeekEnd = format(endOfWeek(new Date()), 'yyyy-MM-dd');

      const weeklyTotal = payrollData
        .filter(p => p.period_start >= currentWeekStart && p.period_end <= currentWeekEnd)
        .reduce((sum, p) => sum + p.net_amount, 0);

      const uniqueWorkers = new Set(payrollData.map(p => p.worker_id)).size;
      const uniquePeriods = new Set(payrollData.map(p => `${p.period_start}-${p.period_end}`)).size;

      setStats({
        weeklyPayroll: weeklyTotal,
        workersOnPayroll: uniqueWorkers,
        payrollPeriods: uniquePeriods,
      });
    } catch (error) {
      console.error('Error fetching payrolls:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchPayrolls();

    const channel = supabase
      .channel('payroll-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payroll' }, () => {
        fetchPayrolls();
      })
      .subscribe();

    return () => {
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
    const weeklyData = payrolls.reduce((acc, curr) => {
      const weekKey = format(new Date(curr.period_start), 'MM/dd');
      if (!acc[weekKey]) {
        acc[weekKey] = { week: weekKey, amount: 0 };
      }
      acc[weekKey].amount += curr.net_amount;
      return acc;
    }, {} as Record<string, { week: string; amount: number }>);

    return Object.values(weeklyData).sort((a, b) => 
      new Date(a.week).getTime() - new Date(b.week).getTime()
    );
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
