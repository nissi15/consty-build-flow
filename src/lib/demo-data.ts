import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';
import { fetchAllPagesInParallel } from '@/lib/supabase-pagination';

export interface DemoSeedResult {
  workers: number;
  attendance: number;
  payroll: number;
  expenses: number;
  months: number;
}

export type DemoSeedProgress = (message: string) => void;

const DEMO_ID = {
  worker: '10000000-0000-4000-8000-',
  expense: '30000000-0000-4000-8000-',
  payroll: '40000000-0000-4000-8000-',
  budget: '50000000-0000-4000-8000-000000000001',
  activity: '60000000-0000-4000-8000-000000000001',
};

const surnames = [
  'Habimana', 'Uwimana', 'Niyonsenga', 'Mukamana', 'Nshimiyimana', 'Nsengiyumva',
  'Bizimana', 'Hakizimana', 'Tuyishime', 'Murekatete', 'Uwamahoro', 'Ishimwe',
  'Mugabo', 'Iradukunda', 'Ndayisaba', 'Mutabazi', 'Rukundo', 'Manzi', 'Kalisa',
  'Nkusi', 'Gatera', 'Musabyimana', 'Nkurunziza', 'Nyiraneza', 'Kamana', 'Sibomana',
  'Dushimimana', 'Ndahiro', 'Kayitesi', 'Uwase', 'Mutesi', 'Niyonzima', 'Gasana',
  'Twagirayezu', 'Mukantwari', 'Uwera', 'Munyaneza', 'Dusenge', 'Harerimana',
  'Munyakazi', 'Mugiraneza', 'Ntirenganya', 'Ntakirutimana', 'Rugamba', 'Rutikanga',
];

const initials = ['P', 'D', 'E', 'J', 'M', 'A', 'C', 'F', 'G', 'I', 'K', 'N', 'R', 'S', 'T', 'V', 'Y', 'B'];
const registerNames = Array.from({ length: 90 }, (_, index) => {
  if (index === 0) return 'Habimana P';
  if (index === 1) return 'Jacque D';
  const surname = surnames[(index * 7 + 2) % surnames.length];
  const initial = initials[(index * 5 + Math.floor(index / surnames.length)) % initials.length];
  return `${surname} ${initial}`;
});

const rolePlan = [
  ['Site engineer', 3, 12000, 2000],
  ['Foreman', 4, 8000, 2000],
  ['Mason', 18, 6000, 1500],
  ['Carpenter', 12, 6500, 1500],
  ['Steel fixer', 10, 6500, 1500],
  ['Electrician', 6, 7000, 1500],
  ['Plumber', 6, 7000, 1500],
  ['Painter', 8, 5000, 1200],
  ['Equipment operator', 5, 7500, 1800],
  ['Storekeeper', 3, 4500, 1000],
  ['Safety officer', 3, 6500, 1500],
  ['Assistant', 12, 3500, 1000],
] as const;

const materials = [
  ['Cement CIMERWA 32.5N · 420 bags', 5_040_000],
  ['Cement CIMERWA 42.5N · 180 bags', 2_430_000],
  ['Reinforcement steel Y8 · 1.2 tonnes', 1_680_000],
  ['Reinforcement steel Y10 · 1.5 tonnes', 2_175_000],
  ['Reinforcement steel Y12 · 2.0 tonnes', 3_180_000],
  ['Reinforcement steel Y16 · 1.4 tonnes', 2_520_000],
  ['Binding wire · 18 rolls', 198_000],
  ['Machine-cut volcanic stone · 2 truckloads', 1_260_000],
  ['River sand · 3 truckloads', 870_000],
  ['Washed sand · 2 truckloads', 720_000],
  ['Coarse aggregate 20 mm · 3 truckloads', 1_080_000],
  ['Concrete blocks 15 cm · 1,200 pieces', 1_140_000],
  ['Concrete blocks 20 cm · 850 pieces', 1_020_000],
  ['Burnt clay bricks · 2,500 pieces', 625_000],
  ['Structural timber 4×2 · 160 lengths', 1_120_000],
  ['Formwork plywood 18 mm · 45 sheets', 1_035_000],
  ['Roofing sheets 0.45 mm · 95 sheets', 2_185_000],
  ['Roofing ridge caps and fasteners', 486_000],
  ['Electrical conduit and fittings · floor lot', 695_000],
  ['Electrical cable 2.5 mm · 24 coils', 1_560_000],
  ['PVC plumbing pipe and fittings · floor lot', 1_185_000],
  ['PPR water pipe and fittings · floor lot', 1_340_000],
  ['Floor tiles 60×60 cm · 210 m²', 2_205_000],
  ['Wall tiles 30×60 cm · 145 m²', 1_305_000],
  ['Interior emulsion paint · 42 buckets', 1_218_000],
  ['Exterior weather paint · 28 buckets', 1_036_000],
  ['Waterproofing membrane · 16 rolls', 928_000],
  ['Aluminium windows and glazing · batch', 2_840_000],
  ['Steel doors, frames and locks · batch', 2_460_000],
  ['PPE restock · helmets, boots and gloves', 745_000],
] as const;

const pad = (value: number, size = 2) => String(value).padStart(size, '0');
const isoDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const stableUnit = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280;
const stableUuid = (prefix: string, index: number) => `${prefix}${pad(index, 12)}`;

const monthWindows = (today: Date) => Array.from({ length: 11 }, (_, index) => {
  const start = new Date(today.getFullYear(), today.getMonth() - (10 - index), 1);
  const naturalEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  const end = naturalEnd > today ? today : naturalEnd;
  return { start, end };
});

async function upsertBatches<T extends Record<string, unknown>>(
  table: 'workers' | 'attendance' | 'expenses' | 'payroll',
  rows: T[],
  onConflict: string,
  batchSize = 750,
  concurrency = 3,
) {
  const batches = Array.from({ length: Math.ceil(rows.length / batchSize) }, (_, index) =>
    rows.slice(index * batchSize, (index + 1) * batchSize),
  );

  for (let index = 0; index < batches.length; index += concurrency) {
    await Promise.all(batches.slice(index, index + concurrency).map(async (batch) => {
      const { error } = await supabase.from(table).upsert(batch as never, { onConflict });
      if (error) throw error;
    }));
  }
}

export async function seedDemoPortfolio(onProgress: DemoSeedProgress = () => undefined): Promise<DemoSeedResult> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) throw new Error('Sign in before loading the demo portfolio.');

  const today = new Date();
  const months = monthWindows(today);
  const projectStart = months[0].start;
  const roleQueue = rolePlan.flatMap(([role, count, rate, lunch]) =>
    Array.from({ length: count }, () => ({ role, rate, lunch })),
  );

  const workerRows: TablesInsert<'workers'>[] = roleQueue.map((assignment, index) => {
    const name = registerNames[index];
    const joinDate = new Date(projectStart);
    joinDate.setDate(joinDate.getDate() - 35 + (index % 28));
    return {
      id: stableUuid(DEMO_ID.worker, index + 1),
      name,
      role: assignment.role,
      daily_rate: assignment.rate,
      lunch_allowance: assignment.lunch,
      contact_info: `+250 78${index % 10} ${pad(120 + index, 3)} ${pad(300 + index * 3, 3)} · DEMO`,
      join_date: isoDate(joinDate),
      is_active: index % 23 !== 0,
      total_days_worked: 0,
      total_payable: 0,
    };
  });

  onProgress('Adding 90 Rwandan team members…');
  await upsertBatches('workers', workerRows, 'id', 250);

  const attendanceRows: TablesInsert<'attendance'>[] = [];
  const workedDays = new Map<string, number>();
  const workedDaysByMonth = new Map<string, number>();

  for (const [monthIndex, month] of months.entries()) {
    const cursor = new Date(month.start);
    while (cursor <= month.end) {
      if (cursor.getDay() !== 0) {
        for (const [workerIndex, worker] of workerRows.entries()) {
          const roll = stableUnit((monthIndex + 1) * 100_000 + cursor.getDate() * 500 + workerIndex * 17);
          const present = roll > 0.1;
          const date = isoDate(cursor);
          const monthKey = `${worker.id}:${isoDate(month.start)}`;
          const hourVariance = stableUnit(workerIndex * 311 + cursor.getDate() * 19 + monthIndex) > 0.84 ? 1 : 0;
          attendanceRows.push({
            worker_id: worker.id!,
            date,
            status: present ? 'present' : 'absent',
            hours: present ? 8 + hourVariance : 0,
            lunch_taken: present,
            lunch_money: present ? worker.lunch_allowance : 0,
            check_in_time: present ? `${date}T06:${pad(48 + (workerIndex % 12))}:00+02:00` : null,
            check_out_time: present ? `${date}T16:${pad(5 + (workerIndex % 30))}:00+02:00` : null,
          });
          if (present) {
            workedDays.set(worker.id!, (workedDays.get(worker.id!) || 0) + 1);
            workedDaysByMonth.set(monthKey, (workedDaysByMonth.get(monthKey) || 0) + 1);
          }
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  const { count: existingAttendance, error: attendanceCountError } = await supabase
    .from('attendance')
    .select('id', { count: 'exact', head: true })
    .gte('date', isoDate(months[0].start))
    .lte('date', isoDate(months[months.length - 1].end))
    .in('worker_id', workerRows.map(worker => worker.id!));
  if (attendanceCountError) throw attendanceCountError;

  if (existingAttendance === attendanceRows.length) {
    onProgress(`${attendanceRows.length.toLocaleString()} attendance records already complete — skipping the slow rewrite…`);
  } else {
    onProgress(`Writing ${attendanceRows.length.toLocaleString()} attendance records in parallel batches…`);
    await upsertBatches('attendance', attendanceRows, 'worker_id,date', 1000, 3);
  }

  const updatedWorkers = workerRows.map((worker) => ({
    ...worker,
    total_days_worked: workedDays.get(worker.id!) || 0,
    total_payable: (workedDays.get(worker.id!) || 0) * (worker.daily_rate || 0),
  }));
  await upsertBatches('workers', updatedWorkers, 'id', 250);

  const payrollRows: TablesInsert<'payroll'>[] = [];
  let payrollIndex = 1;
  for (const [monthIndex, month] of months.entries()) {
    for (const worker of workerRows) {
      const daysWorked = workedDaysByMonth.get(`${worker.id}:${isoDate(month.start)}`) || 0;
      const gross = daysWorked * (worker.daily_rate || 0);
      const lunchTotal = daysWorked * (worker.lunch_allowance || 0);
      const isCurrentMonth = monthIndex === months.length - 1;
      payrollRows.push({
        id: stableUuid(DEMO_ID.payroll, payrollIndex++),
        worker_id: worker.id!,
        period_start: isoDate(month.start),
        period_end: isoDate(month.end),
        days_worked: daysWorked,
        daily_rate: worker.daily_rate || 0,
        lunch_deduction: 0,
        gross_amount: gross,
        lunch_total: lunchTotal,
        net_amount: gross + lunchTotal,
        status: isCurrentMonth ? 'pending' : 'paid',
        paid_at: isCurrentMonth ? null : `${isoDate(month.end)}T14:00:00+02:00`,
      });
    }
  }

  onProgress(`Creating ${payrollRows.length.toLocaleString()} monthly payroll records…`);
  await upsertBatches('payroll', payrollRows, 'worker_id,period_start,period_end', 500, 3);

  const expenseRows: TablesInsert<'expenses'>[] = [];
  let expenseIndex = 1;
  for (const [monthIndex, month] of months.entries()) {
    const monthlyMaterials = Array.from({ length: 40 }, (_, offset) =>
      materials[(monthIndex * 5 + offset * 2) % materials.length],
    );
    for (const [materialIndex, [description, baseAmount]] of monthlyMaterials.entries()) {
      const date = new Date(month.start);
      date.setDate(2 + ((materialIndex * 3 + monthIndex) % Math.max(3, month.end.getDate() - 2)));
      if (date > month.end) date.setTime(month.end.getTime());
      const variation = 0.82 + stableUnit(monthIndex * 101 + materialIndex * 13) * 0.36;
      expenseRows.push({
        id: stableUuid(DEMO_ID.expense, expenseIndex++),
        date: isoDate(date),
        category: 'Materials',
        type: 'material',
        description: `DEMO · Musanze Town Buildings · ${description} · delivery ${Math.floor(materialIndex / materials.length) + 1}`,
        amount: Math.round((baseAmount * variation) / 1000) * 1000,
      });
    }

    const operatingCosts = [
      ['Equipment', 'Excavator and operator hire · monthly allocation', 1_150_000],
      ['Equipment', 'Compactor, mixer and scaffolding hire', 820_000],
      ['Transport', 'Heavy material haulage and site logistics', 720_000],
      ['Transport', 'Local supplier deliveries and fuel', 420_000],
      ['Utilities', 'Site water and temporary power', 360_000],
      ['Utilities', 'Communications and security lighting', 185_000],
      ['Safety', 'Safety inspection and consumable PPE', 285_000],
      ['Professional services', 'Surveying, testing and permit allocation', 475_000],
    ] as const;
    for (const [costIndex, [category, description, baseAmount]] of operatingCosts.entries()) {
      const date = new Date(month.start);
      date.setDate(Math.min(month.end.getDate(), 7 + costIndex * 5));
      const variation = 0.9 + stableUnit(monthIndex * 73 + costIndex * 31) * 0.2;
      expenseRows.push({
        id: stableUuid(DEMO_ID.expense, expenseIndex++),
        date: isoDate(date),
        category,
        type: 'misc',
        description: `DEMO · Musanze Town Buildings · ${description}`,
        amount: Math.round((baseAmount * variation) / 1000) * 1000,
      });
    }
  }

  onProgress(`Preparing ${expenseRows.length.toLocaleString()} material and operating-cost entries…`);
  const { error: cleanupError } = await supabase
    .from('expenses')
    .delete()
    .like('description', 'DEMO · Musanze Town Buildings ·%');
  if (cleanupError) throw cleanupError;

  const { count: retainedExpenseCount, error: expenseCountError } = await supabase
    .from('expenses')
    .select('id', { count: 'exact', head: true });
  if (expenseCountError) throw expenseCountError;
  const retainedExpenses = await fetchAllPagesInParallel<{ amount: number }>(retainedExpenseCount || 0, (from, to) => supabase
    .from('expenses')
    .select('amount')
    .order('id')
    .range(from, to), 1000, 6);
  const retainedExpenseTotal = retainedExpenses.reduce((total, row) => total + Number(row.amount || 0), 0);
  const targetUsedBudget = 360_000_000;
  const minimumDemoExpenseTotal = expenseRows.length * 25_000;
  const targetExpenseTotal = Math.max(minimumDemoExpenseTotal, targetUsedBudget - retainedExpenseTotal);
  const rawExpenseTotal = expenseRows.reduce((total, row) => total + Number(row.amount), 0);
  const expenseScale = targetExpenseTotal / rawExpenseTotal;
  expenseRows.forEach((row) => {
    row.amount = Math.max(25_000, Math.round((Number(row.amount) * expenseScale) / 1000) * 1000);
  });

  const roundedExpenseTotal = expenseRows.reduce((total, row) => total + Number(row.amount), 0);
  expenseRows[expenseRows.length - 1].amount = Number(expenseRows[expenseRows.length - 1].amount) + (targetExpenseTotal - roundedExpenseTotal);

  onProgress(`Adding ${expenseRows.length.toLocaleString()} material and operating-cost entries across 11 months…`);
  await upsertBatches('expenses', expenseRows, 'id', 500, 3);

  const expenseTotal = expenseRows.reduce((total, row) => total + Number(row.amount), 0);
  const usedBudget = retainedExpenseTotal + expenseTotal;
  const totalBudget = 500_000_000;

  onProgress('Finalising the project budget and activity history…');
  const { error: budgetError } = await supabase.from('budget').upsert({
    id: DEMO_ID.budget,
    total_budget: totalBudget,
    used_budget: usedBudget,
    budget_remaining: totalBudget - usedBudget,
  }, { onConflict: 'id' });
  if (budgetError) throw budgetError;

  const { error: activityError } = await supabase.from('activity_log').upsert({
    id: DEMO_ID.activity,
    action_type: 'demo_portfolio_loaded',
    message: `Loaded 11-month Musanze Town Buildings demo: ${workerRows.length} workers, ${attendanceRows.length} attendance records, ${payrollRows.length} payroll records and ${expenseRows.length} expenses.`,
  }, { onConflict: 'id' });
  if (activityError) throw activityError;

  onProgress('Demo portfolio ready.');
  return {
    workers: workerRows.length,
    attendance: attendanceRows.length,
    payroll: payrollRows.length,
    expenses: expenseRows.length,
    months: months.length,
  };
}
