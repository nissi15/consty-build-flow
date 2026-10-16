import { useCallback, useEffect, useRef, useState } from 'react';
import { format, subMonths } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { withDataTimeout } from '@/lib/supabase-pagination';
import { PROJECT_END, PROJECT_END_DATE } from '@/lib/project-period';

const DASHBOARD_SNAPSHOT_ID = '60000000-0000-4000-8000-000000000002';

export interface DashboardSummary {
  active_workers: number;
  present_today: number;
  monthly_payroll: number;
  budget: {
    total_budget: number;
    used_budget: number;
  };
  months: Array<{
    month: string;
    spending: number;
    attendance: number;
  }>;
  total_expenses: number;
  category_totals: Record<string, number>;
  recent_materials: Array<{
    id: string;
    description: string | null;
    date: string;
    amount: number;
  }>;
}

const emptySummary: DashboardSummary = {
  active_workers: 0,
  present_today: 0,
  monthly_payroll: 0,
  budget: { total_budget: 0, used_budget: 0 },
  months: [],
  total_expenses: 0,
  category_totals: {},
  recent_materials: [],
};

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const realtimeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      const today = PROJECT_END_DATE;
      const monthStart = '2026-07-01';
      const nextMonth = new Date(`${monthStart}T00:00:00`);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthStart = format(nextMonth, 'yyyy-MM-dd');
      const [workersResult, attendanceResult, payrollResult, budgetResult, snapshotResult, materialsResult] = await withDataTimeout(Promise.all([
        supabase.from('workers').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('date', today).eq('status', 'present'),
        supabase.from('payroll').select('net_amount').gte('period_start', monthStart).lt('period_start', nextMonthStart),
        supabase.from('budget').select('total_budget,used_budget').order('total_budget', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('activity_log').select('message').eq('id', DASHBOARD_SNAPSHOT_ID).maybeSingle(),
        supabase.from('expenses').select('id,description,date,amount').eq('category', 'Materials').lte('date', PROJECT_END_DATE).order('date', { ascending: false }).order('created_at', { ascending: false }).limit(4),
      ]),
        'The dashboard summary timed out. Please refresh and try again.',
      );
      const firstError = [workersResult, attendanceResult, payrollResult, budgetResult, snapshotResult, materialsResult]
        .map(result => result.error)
        .find(Boolean);
      if (firstError) throw firstError;

      const fallbackMonths = Array.from({ length: 11 }, (_, index) => ({
        month: format(subMonths(PROJECT_END, 10 - index), 'MMM'),
        spending: 0,
        attendance: 0,
      }));
      let snapshotMonths = fallbackMonths;
      let snapshotTotal = Number(budgetResult.data?.used_budget || 0);
      let categoryTotals: Record<string, number> = {};
      if (snapshotResult.data?.message) {
        try {
          const parsed = JSON.parse(snapshotResult.data.message) as Pick<DashboardSummary, 'months' | 'total_expenses' | 'category_totals'>;
          if (Array.isArray(parsed.months) && parsed.months.length === 11) snapshotMonths = parsed.months;
          if (Number.isFinite(parsed.total_expenses)) snapshotTotal = Number(parsed.total_expenses);
          if (parsed.category_totals && typeof parsed.category_totals === 'object') categoryTotals = parsed.category_totals;
        } catch {
          // A malformed optional snapshot should never stop the live dashboard cards.
        }
      }

      setSummary({
        active_workers: workersResult.count || 0,
        present_today: attendanceResult.count || 0,
        monthly_payroll: (payrollResult.data || []).reduce((total, row) => total + Number(row.net_amount || 0), 0),
        budget: {
          total_budget: Number(budgetResult.data?.total_budget || 0),
          used_budget: Number(budgetResult.data?.used_budget || 0),
        },
        months: snapshotMonths,
        total_expenses: snapshotTotal,
        category_totals: categoryTotals,
        recent_materials: materialsResult.data || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const queueRefresh = () => {
      if (realtimeTimer.current) clearTimeout(realtimeTimer.current);
      realtimeTimer.current = setTimeout(fetchSummary, 750);
    };
    const channel = supabase
      .channel('dashboard-summary-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, queueRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, queueRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, queueRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payroll' }, queueRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget' }, queueRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, queueRefresh)
      .subscribe();

    return () => {
      if (realtimeTimer.current) clearTimeout(realtimeTimer.current);
      supabase.removeChannel(channel);
    };
  }, [fetchSummary]);

  return { summary, loading, refetch: fetchSummary };
}
