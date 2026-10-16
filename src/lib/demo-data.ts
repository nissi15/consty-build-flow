import { supabase } from '@/integrations/supabase/client';
import type { TablesInsert } from '@/integrations/supabase/types';

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

const firstNames = [
  'Aline', 'Ange', 'Ariane', 'Beatha', 'Carine', 'Chantal', 'Claudine', 'Diane',
  'Divine', 'Dorcas', 'Esther', 'Francine', 'Gisèle', 'Grace', 'Immaculée',
  'Jeanne', 'Josiane', 'Julienne', 'Liliane', 'Mireille', 'Nadine', 'Odette',
  'Olive', 'Sandrine', 'Solange', 'Vestine', 'Yvette', 'Aimé', 'Alain', 'Alexis',
  'Bosco', 'Claude', 'Emmanuel', 'Éric', 'Fabrice', 'Faustin', 'Félix', 'Fred',
  'Gad', 'Gilbert', 'Innocent', 'Jacques', 'Jean', 'Jérôme', 'Joseph', 'Justin',
  'Kevin', 'Martin', 'Patrick', 'Paul', 'Samuel', 'Théogène', 'Thierry', 'Yves',
];

const surnames = [
  'Habimana', 'Uwimana', 'Niyonsenga', 'Mukamana', 'Nshimiyimana', 'Nsengiyumva',
  'Bizimana', 'Hakizimana', 'Tuyishime', 'Murekatete', 'Uwamahoro', 'Ishimwe',
  'Mugabo', 'Iradukunda', 'Ndayisaba', 'Mutabazi', 'Rukundo', 'Manzi', 'Kalisa',
  'Nkusi', 'Gatera', 'Musabyimana', 'Nkurunziza', 'Nyiraneza', 'Kamana', 'Sibomana',
  'Dushimimana', 'Ndahiro', 'Kayitesi', 'Uwase', 'Mutesi', 'Niyonzima', 'Gasana',
  'Twagirayezu', 'Mukantwari', 'Uwera', 'Munyaneza', 'Dusenge', 'Harerimana',
  'Munyakazi', 'Mugiraneza', 'Ntirenganya', 'Ntakirutimana', 'Rugamba', 'Rutikanga',
];

const rolePlan = [
  ['Site engineer', 3, 22000, 2500],
  ['Foreman', 4, 16000, 2500],
  ['Mason', 18, 10000, 2000],
  ['Carpenter', 12, 11000, 2000],
  ['Steel fixer', 10, 11000, 2000],
  ['Electrician', 6, 13500, 2200],
  ['Plumber', 6, 13000, 2200],
  ['Painter', 8, 9000, 1800],
  ['Equipment operator', 5, 14000, 2200],
  ['Storekeeper', 3, 9500, 1800],
  ['Safety officer', 3, 12500, 2200],
  ['General assistant', 12, 7000, 1500],
] as const;

const materials = [
  ['Cement, 50 kg bags', 6_480_000],
  ['Reinforcement steel Y12', 8_950_000],
  ['Reinforcement steel Y16', 9_860_000],
  ['Machine-cut stones', 5_420_000],
  ['River sand deliveries', 3_780_000],
  ['Coarse aggregate', 4_160_000],
  ['Concrete blocks', 4_880_000],
  ['Roofing sheets', 7_650_000],
  ['Structural timber', 4_720_000],
  ['Formwork plywood', 3_960_000],
  ['Electrical cable and conduit', 4_450_000],
  ['Plumbing pipe and fittings', 3_840_000],
  ['Floor and wall tiles', 5_760_000],
  ['Interior and exterior paint', 3_280_000],
  ['Doors, frames and ironmongery', 4_940_000],
  ['Windows and glazing', 5_180_000],
  ['Waterproofing materials', 2_740_000],
  ['PPE and site safety supplies', 1_320_000],
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
) {
  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    const { error } = await supabase.from(table).upsert(batch as never, { onConflict });
    if (error) throw error;
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
    const name = `${firstNames[index % firstNames.length]} ${surnames[(index * 7 + 3) % surnames.length]}`;
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

  onProgress(`Writing ${attendanceRows.length.toLocaleString()} attendance records in batches…`);
  await upsertBatches('attendance', attendanceRows, 'worker_id,date');

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
  await upsertBatches('payroll', payrollRows, 'worker_id,period_start,period_end');

  const expenseRows: TablesInsert<'expenses'>[] = [];
  let expenseIndex = 1;
  for (const [monthIndex, month] of months.entries()) {
    for (const [materialIndex, [description, baseAmount]] of materials.entries()) {
      const date = new Date(month.start);
      date.setDate(2 + ((materialIndex * 3 + monthIndex) % Math.max(3, month.end.getDate() - 2)));
      if (date > month.end) date.setTime(month.end.getTime());
      const variation = 0.82 + stableUnit(monthIndex * 101 + materialIndex * 13) * 0.36;
      expenseRows.push({
        id: stableUuid(DEMO_ID.expense, expenseIndex++),
        date: isoDate(date),
        category: 'Materials',
        type: 'material',
        description: `DEMO · Musanze Town Buildings · ${description}`,
        amount: Math.round((baseAmount * variation) / 1000) * 1000,
      });
    }

    const operatingCosts = [
      ['Equipment', 'Excavator and concrete mixer hire', 3_650_000],
      ['Transport', 'Material haulage and site logistics', 2_480_000],
      ['Utilities', 'Site water, power and communications', 1_180_000],
      ['Safety', 'Safety inspection and protective equipment', 940_000],
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

  onProgress(`Adding ${expenseRows.length.toLocaleString()} material and operating-cost entries…`);
  await upsertBatches('expenses', expenseRows, 'id', 500);

  const expenseTotal = expenseRows.reduce((total, row) => total + Number(row.amount), 0);
  const paidPayrollTotal = payrollRows
    .filter((row) => row.status === 'paid')
    .reduce((total, row) => total + Number(row.net_amount || 0), 0);
  const usedBudget = expenseTotal + paidPayrollTotal;
  const totalBudget = Math.ceil((usedBudget * 1.28) / 1_000_000) * 1_000_000;

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
