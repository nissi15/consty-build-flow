import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllPagesInParallel, withDataTimeout } from '@/lib/supabase-pagination';
import { PROJECT_END_DATE } from '@/lib/project-period';

interface Budget {
  id: string;
  total_budget: number;
  used_budget: number;
  created_at: string;
}

export function useBudget() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBudget = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('budget')
        .select('*')
        .order('total_budget', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Budget fetch error:', error);
        setBudget(null);
      } else {
        setBudget(data);
      }
    } catch (error) {
      console.error('Error in fetchBudget:', error);
      setBudget(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const recalculateTotals = useCallback(async () => {
    if (!budget) return;

    try {
      const { count, error: countError } = await withDataTimeout(
        supabase.from('expenses').select('id', { count: 'exact', head: true }).lte('date', PROJECT_END_DATE),
      );
      if (countError) throw countError;
      const expenses = await fetchAllPagesInParallel<{ amount: number }>(count || 0, (from, to) => supabase
        .from('expenses')
        .select('amount')
        .lte('date', PROJECT_END_DATE)
        .order('id')
        .range(from, to), 1000, 6);
      const usedBudget = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

      const { error: updateError } = await supabase
        .from('budget')
        .update({ used_budget: usedBudget, budget_remaining: Number(budget.total_budget) - usedBudget })
        .eq('id', budget.id);

      if (updateError) throw updateError;

      await supabase.from('activity_log').insert({
        message: `Budget totals recalculated. Used budget: RWF ${usedBudget.toLocaleString()}`,
        action_type: 'budget',
      });

      fetchBudget();
    } catch (error) {
      console.error('Error recalculating totals:', error);
      throw error;
    }
  }, [budget, fetchBudget]);

  useEffect(() => {
    fetchBudget();

    const budgetChannel = supabase
      .channel('budget-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget' }, () => {
        fetchBudget();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(budgetChannel);
    };
  }, [fetchBudget]);

  const stats = {
    totalBudget: budget?.total_budget || 50000,
    usedBudget: budget?.used_budget || 0,
    remainingBudget: (budget?.total_budget || 50000) - (budget?.used_budget || 0),
    usagePercentage: budget && budget.total_budget > 0 ? (budget.used_budget / budget.total_budget) * 100 : 0,
  };

  return {
    budget,
    loading,
    stats,
    refetchBudget: fetchBudget,
    recalculateTotals,
  };
}
