import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth } from 'date-fns';

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
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

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
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount');

      if (expensesError) throw expensesError;

      const usedBudget = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

      const { error: updateError } = await supabase
        .from('budget')
        .update({ used_budget: usedBudget })
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

    const expenseChannel = supabase
      .channel('expense-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        if (budget) {
          recalculateTotals();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(budgetChannel);
      supabase.removeChannel(expenseChannel);
    };
  }, []);

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