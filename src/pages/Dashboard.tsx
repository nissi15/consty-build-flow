import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ArrowUpRight, CalendarCheck, FileText, Package, Users, WalletCards } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useActivityLog } from '@/hooks/useSupabaseData';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { cleanPortfolioLabel, PROJECT_END } from '@/lib/project-period';

const formatRwf = (value: number) => {
  if (value >= 1_000_000_000) return `RWF ${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `RWF ${(value / 1_000_000).toFixed(1)}M`;
  return `RWF ${Math.round(value).toLocaleString()}`;
};

const Dashboard = () => {
  const { summary: dashboard, loading } = useDashboardSummary();
  const { activityLog } = useActivityLog();
  if (loading) return <div className="space-y-5 p-5 lg:p-8"><Skeleton className="h-24" /><div className="grid gap-4 lg:grid-cols-4">{[1, 2, 3, 4].map(item => <Skeleton key={item} className="h-32" />)}</div><Skeleton className="h-[420px]" /></div>;

  const budgetUsed = Number(dashboard.budget.used_budget || 0);
  const totalBudget = Number(dashboard.budget.total_budget || 0);
  const budgetPercent = totalBudget ? Math.round((budgetUsed / totalBudget) * 100) : 0;

  const cards = [
    { label: 'Total workforce', value: dashboard.active_workers.toString(), detail: 'Active workers on project', icon: Users },
    { label: 'Present today', value: dashboard.present_today.toString(), detail: `${dashboard.active_workers ? Math.round((dashboard.present_today / dashboard.active_workers) * 100) : 0}% attendance rate`, icon: CalendarCheck },
    { label: 'Monthly payroll', value: formatRwf(Number(dashboard.monthly_payroll)), detail: format(PROJECT_END, 'MMMM yyyy'), icon: WalletCards },
    { label: 'Budget used', value: `${budgetPercent}%`, detail: `${formatRwf(budgetUsed)} of ${formatRwf(totalBudget)}`, icon: Package },
  ];
  const recentMaterials = dashboard.recent_materials;
  const attendanceExceptions = Math.max(0, dashboard.active_workers - dashboard.present_today);

  return (
    <div className="mx-auto max-w-[1540px] space-y-5 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 text-sm text-muted-foreground">Project overview</p><h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Musanze Town Buildings</h1><p className="mt-2 text-sm text-muted-foreground">Construction operations · Musanze District, Rwanda</p></div>
        <Button asChild variant="outline" className="h-10 gap-2 bg-white dark:bg-[#111214]"><Link to="/reports"><FileText className="h-4 w-4" /> Generate report</Link></Button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, detail, icon: Icon }) => <Card key={label} className="p-5 transition-colors hover:border-primary/20"><div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div><div className="icon-tile h-10 w-10"><Icon className="h-[18px] w-[18px]" strokeWidth={1.8} /></div></div></Card>)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,.7fr)]">
        <Card className="p-5">
          <div className="mb-5 flex items-start justify-between"><div><h2 className="font-semibold">Monthly spending</h2><p className="mt-1 text-xs text-muted-foreground">Recorded project costs, including labour · last 11 months</p></div><span className="rounded-lg border px-2.5 py-1 text-xs text-muted-foreground">11 months</span></div>
          <ResponsiveContainer width="100%" height={300}><AreaChart data={dashboard.months} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}><defs><linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#111" stopOpacity={0.14} /><stop offset="100%" stopColor="#111" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e9eaec" /><XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} tick={{ fill: '#73777f' }} /><YAxis tickLine={false} axisLine={false} fontSize={12} width={48} tick={{ fill: '#73777f' }} tickFormatter={value => `${Math.round(value / 1_000_000)}M`} /><Tooltip formatter={(value: number) => [formatRwf(value), 'Spending']} contentStyle={{ borderRadius: 10, border: '1px solid #e2e4e7', boxShadow: '0 12px 30px rgba(0,0,0,.08)' }} /><Area type="monotone" dataKey="spending" stroke="#111" strokeWidth={2.25} fill="url(#spendFill)" dot={{ fill: '#111', r: 3 }} activeDot={{ r: 5 }} /></AreaChart></ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Budget position</h2><Link to="/budget" className="text-xs text-muted-foreground hover:text-foreground">View details →</Link></div>
          <div className="mx-auto my-8 flex h-44 w-44 items-center justify-center rounded-full" style={{ background: `conic-gradient(#111 ${Math.min(100, budgetPercent) * 3.6}deg, #e8e9eb 0deg)` }}><div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white dark:bg-[#111214]"><strong className="text-3xl">{budgetPercent}%</strong><span className="text-xs text-muted-foreground">used</span></div></div>
          <div className="space-y-3 border-t pt-4 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Spent</span><strong>{formatRwf(budgetUsed)}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Remaining</span><strong>{formatRwf(Math.max(0, totalBudget - budgetUsed))}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Total budget</span><strong>{formatRwf(totalBudget)}</strong></div></div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Attendance</h2><span className="text-xs text-muted-foreground">11 months</span></div><ResponsiveContainer width="100%" height={190}><BarChart data={dashboard.months}><XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={11} /><YAxis hide domain={[0, 100]} /><Tooltip formatter={(value: number) => [`${value}%`, 'Attendance']} /><Bar dataKey="attendance" fill="#cfd2d6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Card>
        <Card className="p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Recent materials</h2><Link to="/expenses" className="text-xs text-muted-foreground">View all →</Link></div><div className="divide-y">{recentMaterials.map(item => <div key={item.id} className="flex items-center gap-3 py-3"><div className="icon-tile h-8 w-8 rounded-full"><Package className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{cleanPortfolioLabel(item.description) || 'Material purchase'}</p><p className="text-xs text-muted-foreground">{format(new Date(`${item.date}T00:00:00`), 'dd MMM yyyy')}</p></div><span className="text-xs font-medium">{formatRwf(Number(item.amount))}</span></div>)}</div></Card>
        <Card className="p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Site alerts</h2><AlertTriangle className="h-4 w-4 text-amber-600" /></div><div className="space-y-3"><div className="flex gap-3 rounded-xl border border-amber-200/70 bg-amber-50/70 p-3 dark:border-amber-900 dark:bg-amber-950/35"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" /><div><p className="text-sm font-medium">{attendanceExceptions} workers not marked present</p><p className="mt-1 text-xs text-muted-foreground">Review today’s attendance before payroll closes.</p></div></div><div className="surface-row flex gap-3 p-3"><FileText className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="text-sm font-medium">Reports available</p><p className="mt-1 text-xs text-muted-foreground">Export any date range as PDF or CSV.</p></div></div>{activityLog[0] && <div className="border-t pt-3"><p className="text-xs uppercase tracking-wide text-muted-foreground">Latest activity</p><p className="mt-2 text-sm">{activityLog[0].message}</p></div>}</div><Button asChild variant="ghost" className="mt-3 h-9 w-full justify-between px-1 text-sm"><Link to="/activity">Open activity log <ArrowUpRight className="h-4 w-4" /></Link></Button></Card>
      </section>
    </div>
  );
};

export default Dashboard;
