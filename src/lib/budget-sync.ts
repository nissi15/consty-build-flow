import { supabase } from '@/integrations/supabase/client';

const DASHBOARD_SNAPSHOT_ID = '60000000-0000-4000-8000-000000000002';

export async function getProjectBudgetPosition() {
  const { data: budget, error } = await supabase
    .from('budget')
    .select('id,total_budget,used_budget')
    .order('total_budget', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return budget;
}

export async function setProjectBudgetUsed(usedBudget: number) {
  const budget = await getProjectBudgetPosition();
  if (!budget) return;

  const safeUsedBudget = Math.max(0, usedBudget);
  const totalBudget = Number(budget.total_budget || 0);
  const { error: updateError } = await supabase
    .from('budget')
    .update({ used_budget: safeUsedBudget, budget_remaining: totalBudget - safeUsedBudget })
    .eq('id', budget.id);
  if (updateError) throw updateError;
}

export async function adjustDashboardExpenseSnapshot(expense: { amount: number; category: string; date: string }, direction: 1 | -1) {
  const { data, error } = await supabase
    .from('activity_log')
    .select('message')
    .eq('id', DASHBOARD_SNAPSHOT_ID)
    .maybeSingle();
  if (error || !data?.message) return;

  try {
    const snapshot = JSON.parse(data.message) as {
      total_expenses?: number;
      category_totals?: Record<string, number>;
      months?: Array<{ month: string; spending: number; attendance: number }>;
    };
    const delta = Number(expense.amount) * direction;
    snapshot.total_expenses = Math.max(0, Number(snapshot.total_expenses || 0) + delta);
    snapshot.category_totals = snapshot.category_totals || {};
    snapshot.category_totals[expense.category] = Math.max(0, Number(snapshot.category_totals[expense.category] || 0) + delta);
    const month = new Date(`${expense.date}T12:00:00`).toLocaleString('en', { month: 'short' });
    const monthRow = snapshot.months?.find(item => item.month === month);
    if (monthRow) monthRow.spending = Math.max(0, Number(monthRow.spending || 0) + delta);
    await supabase.from('activity_log').update({ message: JSON.stringify(snapshot) }).eq('id', DASHBOARD_SNAPSHOT_ID);
  } catch {
    // Budget remains authoritative even if an optional chart snapshot is malformed.
  }
}
