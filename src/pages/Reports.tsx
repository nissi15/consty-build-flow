import { useMemo, useState } from 'react';
import { format, subMonths } from 'date-fns';
import { Download, FileBarChart, FileSpreadsheet, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAttendance, useBudget, useExpenses, useWorkers } from '@/hooks/useSupabaseData';
import { usePayroll } from '@/hooks/usePayroll';
import { downloadReportCsv, downloadReportPdf, type ReportCell } from '@/lib/reporting';

type ReportType = 'overview' | 'workforce' | 'attendance' | 'payroll' | 'materials' | 'expenses' | 'budget';
type ReportDefinition = { headers: string[]; rows: ReportCell[][]; title: string; total: number };

const money = (value: number) => `RWF ${Math.round(Number(value || 0)).toLocaleString('en-US')}`;
const cleanDescription = (value: string | null) => (value || '—').replace('DEMO · Musanze Town Buildings · ', '');

export default function Reports() {
  const { workers } = useWorkers();
  const { attendance } = useAttendance();
  const { expenses } = useExpenses();
  const { budget } = useBudget();
  const { payrolls } = usePayroll();
  const [reportType, setReportType] = useState<ReportType>('overview');
  const [fromDate, setFromDate] = useState(format(subMonths(new Date(), 11), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [sort, setSort] = useState('date-desc');

  const report = useMemo<ReportDefinition>(() => {
    const within = (value?: string | null) => !value || (value.slice(0, 10) >= fromDate && value.slice(0, 10) <= toDate);
    const filteredExpenses = expenses.filter(item => within(item.date));
    const filteredAttendance = attendance.filter(item => within(item.date));
    const filteredPayroll = payrolls.filter(item => within(item.period_start));
    const totalExpenses = filteredExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalPayroll = filteredPayroll.reduce((sum, item) => sum + Number(item.net_amount), 0);
    const active = workers.filter(worker => worker.is_active);
    let definition: ReportDefinition;

    if (reportType === 'workforce') definition = {
      title: 'Workforce register',
      headers: ['Worker', 'Role', 'Daily rate', 'Lunch', 'Joined', 'Status'],
      rows: workers.map(worker => [worker.name, worker.role, money(worker.daily_rate), money(worker.lunch_allowance), worker.join_date, worker.is_active ? 'Active' : 'Inactive']),
      total: workers.length,
    };
    else if (reportType === 'attendance') definition = {
      title: 'Attendance report',
      headers: ['Date', 'Worker', 'Role', 'Status', 'Hours'],
      rows: filteredAttendance.map(item => [item.date, item.workers?.name || 'Unknown', item.workers?.role || '—', item.status, Number(item.hours || 0)]),
      total: filteredAttendance.length,
    };
    else if (reportType === 'payroll') definition = {
      title: 'Payroll report',
      headers: ['Period start', 'Period end', 'Worker', 'Days', 'Daily rate', 'Net amount', 'Status'],
      rows: filteredPayroll.map(item => [item.period_start, item.period_end, item.worker?.name || 'Unknown', item.days_worked, money(item.daily_rate), money(item.net_amount), item.status]),
      total: totalPayroll,
    };
    else if (reportType === 'materials') {
      const materials = filteredExpenses.filter(item => item.category === 'Materials');
      definition = { title: 'Materials cost report', headers: ['Date', 'Description', 'Amount'], rows: materials.map(item => [item.date, cleanDescription(item.description), money(item.amount)]), total: materials.reduce((sum, item) => sum + Number(item.amount), 0) };
    } else if (reportType === 'expenses') definition = {
      title: 'Project expense report',
      headers: ['Date', 'Category', 'Description', 'Amount'],
      rows: filteredExpenses.map(item => [item.date, item.category, cleanDescription(item.description), money(item.amount)]),
      total: totalExpenses,
    };
    else if (reportType === 'budget') definition = {
      title: 'Budget position report',
      headers: ['Project', 'Total budget', 'Recorded spend', 'Remaining', 'Utilisation'],
      rows: [['Musanze Town Buildings', money(Number(budget?.total_budget || 0)), money(Number(budget?.used_budget || 0)), money(Number(budget?.total_budget || 0) - Number(budget?.used_budget || 0)), `${budget?.total_budget ? Math.round((Number(budget.used_budget) / Number(budget.total_budget)) * 100) : 0}%`]],
      total: Number(budget?.used_budget || 0),
    };
    else definition = {
      title: 'Project overview report',
      headers: ['Metric', 'Value', 'Context'],
      rows: [
        ['Total project budget', money(Number(budget?.total_budget || 0)), 'Approved project allocation'],
        ['Recorded budget used', money(Number(budget?.used_budget || 0)), 'All recorded project expenses'],
        ['Expenses in range', money(totalExpenses), `${filteredExpenses.length} cost entries`],
        ['Payroll in range', money(totalPayroll), `${filteredPayroll.length} payroll records`],
        ['Active workforce', active.length, `${workers.length} total worker records`],
        ['Attendance records', filteredAttendance.length, `${fromDate} to ${toDate}`],
      ],
      total: totalExpenses + totalPayroll,
    };

    const rows = [...definition.rows].sort((a, b) => {
      const [field, direction] = sort.split('-');
      const multiplier = direction === 'asc' ? 1 : -1;
      if (field === 'amount') {
        const valueIndex = definition.headers.findIndex(header => /net amount|amount|daily rate|total budget|recorded spend/i.test(header));
        const parse = (row: ReportCell[]) => Number(String(row[valueIndex >= 0 ? valueIndex : row.length - 1]).replace(/[^0-9.-]/g, '')) || 0;
        return (parse(a) - parse(b)) * multiplier;
      }
      return String(a[0]).localeCompare(String(b[0]), undefined, { numeric: true }) * multiplier;
    });
    return { ...definition, rows };
  }, [reportType, fromDate, toDate, sort, expenses, attendance, payrolls, workers, budget]);

  const subtitle = `${fromDate} to ${toDate} · ${report.rows.length} rows · Musanze District, Rwanda`;
  const exportTitle = `${report.title}-${fromDate}-${toDate}`;

  return (
    <div className="mx-auto max-w-[1540px] space-y-5 p-4 sm:p-6 lg:p-8">
      <header><p className="mb-2 text-sm text-muted-foreground">Project intelligence</p><h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Reports</h1><p className="mt-2 text-sm text-muted-foreground">Build an audit-ready report from any operational area and date range.</p></header>

      <Card className="border-[#e2e4e7] bg-white p-5 shadow-none dark:border-[#292b2f] dark:bg-[#111214]">
        <div className="mb-5 flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /><h2 className="font-semibold">Report controls</h2></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2"><Label>Report type</Label><Select value={reportType} onValueChange={value => setReportType(value as ReportType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="overview">Project overview</SelectItem><SelectItem value="workforce">Workforce register</SelectItem><SelectItem value="attendance">Attendance</SelectItem><SelectItem value="payroll">Payroll</SelectItem><SelectItem value="materials">Materials</SelectItem><SelectItem value="expenses">All expenses</SelectItem><SelectItem value="budget">Budget position</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>From</Label><Input type="date" value={fromDate} onChange={event => setFromDate(event.target.value)} /></div>
          <div className="space-y-2"><Label>To</Label><Input type="date" value={toDate} onChange={event => setToDate(event.target.value)} /></div>
          <div className="space-y-2"><Label>Sort</Label><Select value={sort} onValueChange={setSort}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="date-desc">Newest first</SelectItem><SelectItem value="date-asc">Oldest / A–Z</SelectItem><SelectItem value="amount-desc">Highest value</SelectItem><SelectItem value="amount-asc">Lowest value</SelectItem></SelectContent></Select></div>
          <div className="flex items-end gap-2"><Button className="flex-1 gap-2" onClick={() => downloadReportPdf(report.headers, report.rows, exportTitle, subtitle)}><Download className="h-4 w-4" />PDF</Button><Button variant="outline" className="gap-2" onClick={() => downloadReportCsv(report.headers, report.rows, exportTitle)}><FileSpreadsheet className="h-4 w-4" />CSV</Button></div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[#e2e4e7] bg-white p-5 shadow-none dark:border-[#292b2f] dark:bg-[#111214]"><p className="text-sm text-muted-foreground">Selected report</p><p className="mt-2 text-xl font-semibold">{report.title}</p></Card>
        <Card className="border-[#e2e4e7] bg-white p-5 shadow-none dark:border-[#292b2f] dark:bg-[#111214]"><p className="text-sm text-muted-foreground">Rows included</p><p className="mt-2 text-xl font-semibold">{report.rows.length.toLocaleString()}</p></Card>
        <Card className="border-[#e2e4e7] bg-white p-5 shadow-none dark:border-[#292b2f] dark:bg-[#111214]"><p className="text-sm text-muted-foreground">Reported value</p><p className="mt-2 text-xl font-semibold">{reportType === 'workforce' || reportType === 'attendance' ? report.total.toLocaleString() : money(report.total)}</p></Card>
      </div>

      <Card className="overflow-hidden border-[#e2e4e7] bg-white shadow-none dark:border-[#292b2f] dark:bg-[#111214]">
        <div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold">Preview</h2><p className="mt-1 text-xs text-muted-foreground">{subtitle}</p></div><FileBarChart className="h-5 w-5 text-muted-foreground" /></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#f6f7f8] text-xs text-muted-foreground dark:bg-[#191a1d]"><tr>{report.headers.map(header => <th key={header} className="whitespace-nowrap px-5 py-3 font-medium">{header}</th>)}</tr></thead><tbody className="divide-y">{report.rows.slice(0, 50).map((row, rowIndex) => <tr key={rowIndex} className="hover:bg-[#fafafa] dark:hover:bg-[#17181a]">{row.map((cell, cellIndex) => <td key={cellIndex} className="whitespace-nowrap px-5 py-3">{cell}</td>)}</tr>)}</tbody></table></div>
        {report.rows.length > 50 && <div className="border-t px-5 py-3 text-xs text-muted-foreground">Previewing 50 of {report.rows.length.toLocaleString()} rows. Exports include every row.</div>}
      </Card>
    </div>
  );
}
