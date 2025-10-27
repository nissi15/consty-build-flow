import { motion } from 'framer-motion';
import { Users, Clock, DollarSign, Package, Wrench, Truck } from 'lucide-react';
import { ActivityLog } from '@/components/dashboard/ActivityLog';
import { ExportButton } from '@/components/dashboard/ExportButton';
import { ChartDetailModal } from '@/components/dashboard/ChartDetailModal';
import { ProjectSelector } from '@/components/layout/ProjectSelector';
import { useState } from 'react';
import { useDataRefresh } from '@/hooks/useDataRefresh';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import StatCard from '@/components/dashboard/StatCard';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
interface ChartClickData {
  activePayload?: Array<{
    payload: any;
    [key: string]: any;
  }>;
  [key: string]: any;
}
import { useWorkers, useAttendance, useExpenses, useBudget } from '@/hooks/useSupabaseData';
import { usePayroll } from '@/hooks/usePayroll';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, subWeeks, eachDayOfInterval } from 'date-fns';
import { getCategoryColor } from '@/constants/expenseCategories';
import { getTodayInRwanda } from '@/utils/dateUtils';

const chartConfig = {
  attendance: { label: 'Attendance %', color: 'hsl(var(--chart-1))' },
  expenses: { label: 'Expenses', color: 'hsl(var(--chart-2))' },
};

interface StatItem {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: any;
}

const Dashboard = () => {
  // Set up automatic data refresh every 30 seconds
  useDataRefresh(30000);
  
  const { user } = useAuth();
  const { currentProject } = useProject();
  const { workers, loading: workersLoading } = useWorkers(currentProject?.id);
  const { attendance, loading: attendanceLoading } = useAttendance(currentProject?.id);
  const { expenses, loading: expensesLoading } = useExpenses(currentProject?.id);
  const { budget, loading: budgetLoading } = useBudget(currentProject?.id);
  const { payrolls, loading: payrollLoading } = usePayroll(currentProject?.id);

  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    data: any[];
    type: 'expenses' | 'attendance' | 'budget';
  }>({
    open: false,
    title: '',
    description: '',
    data: [],
    type: 'expenses',
  });

  const stats: StatItem[] = useMemo(() => {
    const totalWorkers = workers.filter(w => w.is_active).length;
    const today = getTodayInRwanda();
    
    // Calculate weekly expenses
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weeklyExpenses = expenses
      .filter(e => new Date(e.date) >= weekStart)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    
    // Calculate last week's expenses for comparison
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekExpenses = expenses
      .filter(e => new Date(e.date) >= lastWeekStart && new Date(e.date) < weekStart)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    
    const expenseChange = lastWeekExpenses > 0 
      ? ((weeklyExpenses - lastWeekExpenses) / lastWeekExpenses * 100)
      : 0;

    // Calculate remaining budget
    const remainingBudget = (budget?.total_budget || 0) - (budget?.used_budget || 0);
    
    // Calculate labor and material expenses
    const laborExpenses = expenses
      .filter(e => e.category === 'Labor')
      .reduce((sum, e) => sum + Number(e.amount), 0);
    
    const materialExpenses = expenses
      .filter(e => e.category === 'Materials')
      .reduce((sum, e) => sum + Number(e.amount), 0);

    // Calculate attendance rate
    const todayAttendance = attendance.filter(a => 
      a.date === today && a.status === 'present'
    ).length;
    const attendanceRate = totalWorkers > 0 ? Math.round((todayAttendance / totalWorkers) * 100) : 0;

    return [
      { title: 'Total Workers', value: totalWorkers.toString(), icon: Users, change: '+2 this week', changeType: 'positive' },
      { title: 'Weekly Expenses', value: `RWF ${weeklyExpenses.toFixed(0)}`, change: `${expenseChange.toFixed(1)}% from last week`, icon: DollarSign, changeType: expenseChange > 0 ? 'negative' : 'positive' as const },
      { title: 'Remaining Budget', value: `RWF ${remainingBudget.toFixed(0)}`, icon: Package, change: `${Math.round((remainingBudget / (budget?.total_budget || 1)) * 100)}% remaining`, changeType: remainingBudget > (budget?.total_budget || 1) * 0.2 ? 'positive' : 'negative' as const },
      { title: 'Attendance Rate', value: `${attendanceRate}%`, icon: Clock, change: `${todayAttendance} present today`, changeType: attendanceRate > 80 ? 'positive' : 'negative' as const },
      { title: 'Labor Expenses', value: `RWF ${laborExpenses.toFixed(0)}`, icon: Wrench, change: 'This week', changeType: 'neutral' },
      { title: 'Material Expenses', value: `RWF ${materialExpenses.toFixed(0)}`, icon: Truck, change: 'This week', changeType: 'neutral' },
    ];
  }, [workers, expenses, budget, attendance]);

  const weeklyData = useMemo(() => {
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 }); // Sunday
    const daysOfWeek = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

    return daysOfWeek.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayName = format(day, 'EEE'); // Mon, Tue, etc.
      
      const dayExpenses = expenses
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      
      const dayAttendance = attendance
        .filter(a => a.date === dateStr && a.status === 'present')
        .length;
      
      const activeWorkers = workers.filter(w => w.is_active).length;
      const attendancePercent = activeWorkers > 0 ? Math.round((dayAttendance / activeWorkers) * 100) : 0;

      return {
        day: dayName,
        attendance: attendancePercent,
        expenses: dayExpenses,
      };
    });
  }, [expenses, attendance, workers]);

  const expenseData = useMemo(() => {
    // Group expenses by category dynamically
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array format for chart
    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        color: getCategoryColor(name, index), // Use category color or fallback
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }, [expenses]);

  const payrollTrendData = useMemo(() => {
    // Group payrolls by week for the last 4 weeks
    const weeksData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const weekEndStr = format(weekEnd, 'yyyy-MM-dd');
      
      const weekPayrolls = payrolls.filter(p => 
        p.period_start >= weekStartStr && p.period_end <= weekEndStr
      );
      
      const totalPayroll = weekPayrolls.reduce((sum, p) => sum + Number(p.net_amount), 0);
      
      weeksData.push({
        week: `Week ${4 - i}`,
        payroll: totalPayroll,
        fullDate: format(weekStart, 'MMM d'),
      });
    }
    
    return weeksData;
  }, [payrolls]);

  const budgetVsActualData = useMemo(() => {
    // Calculate budget and actual spending for the last 4 weeks
    const weeklyBudget = (budget?.total_budget || 0) / 4; // Divide total budget by 4 weeks
    const weeksData = [];
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const weekEndStr = format(weekEnd, 'yyyy-MM-dd');
      
      const weekExpenses = expenses.filter(e => 
        e.date >= weekStartStr && e.date <= weekEndStr
      ).reduce((sum, e) => sum + Number(e.amount), 0);
      
      weeksData.push({
        week: `Week ${4 - i}`,
        budget: weeklyBudget,
        actual: weekExpenses,
        fullDate: format(weekStart, 'MMM d'),
      });
    }
    
    return weeksData;
  }, [expenses, budget]);

  if (workersLoading || attendanceLoading || expensesLoading || budgetLoading || payrollLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 min-h-screen">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row gap-6"
      >
        <motion.div 
          className="flex-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 text-white p-6 rounded-2xl shadow-md"
          animate={{
            background: [
              'linear-gradient(90deg, #6366F1, #3B82F6, #06B6D4)',
              'linear-gradient(90deg, #3B82F6, #06B6D4, #6366F1)',
              'linear-gradient(90deg, #06B6D4, #6366F1, #3B82F6)',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.user_metadata?.full_name || 'User'}!</h1>
          <p className="opacity-90">Here's an overview of your construction site today.</p>
          <p className="text-sm opacity-80 mt-2">{format(new Date(), 'EEEE, MMM dd')}</p>
        </motion.div>
        <div className="flex items-end gap-3">
          <ProjectSelector />
          <ExportButton
            expenses={expenses}
            attendance={attendance}
            workers={workers}
            budget={budget}
            className="w-full sm:w-auto"
          />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard 
            key={stat.title} 
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            index={index} 
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white dark:bg-[#111827] rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Weekly Expenses Breakdown</h3>
            <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={weeklyData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  onClick={(data: ChartClickData) => {
                    if (data && data.activePayload) {
                      const day = data.activePayload[0].payload.day;
                      const dayExpenses = expenses.filter(e => 
                        format(new Date(e.date), 'EEE') === day
                      );
                      setDetailModal({
                        open: true,
                        title: `Expenses for ${day}`,
                        description: 'Detailed breakdown of expenses for the selected day',
                        data: dayExpenses,
                        type: 'expenses',
                      });
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`RWF ${value.toLocaleString()}`, 'Expenses']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="expenses" fill="#f97316" radius={[4, 4, 0, 0]} cursor="pointer" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white dark:bg-[#111827] rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Payroll Trend</h3>
              {payrollTrendData.every(d => d.payroll === 0) ? (
                <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-slate-500 dark:text-slate-400 mb-2">No payroll data yet</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Generate payroll from the Payroll page</p>
                  </div>
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={payrollTrendData}
                      margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="week" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`RWF ${value.toLocaleString()}`, 'Payroll']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="payroll" 
                        stroke="#f97316" 
                        strokeWidth={2}
                        dot={{ fill: '#f97316', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white dark:bg-[#111827] rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Budget vs Actual</h3>
              {budgetVsActualData.every(d => d.budget === 0 && d.actual === 0) ? (
                <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-slate-500 dark:text-slate-400 mb-2">No budget data yet</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Set a budget from the Budget page</p>
                  </div>
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={budgetVsActualData}
                      margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="week" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`RWF ${value.toLocaleString()}`, '']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="budget" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                        dot={{ fill: '#22c55e', r: 4 }}
                        name="Budget"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#f97316" 
                        strokeWidth={2}
                        dot={{ fill: '#f97316', r: 4 }}
                        name="Actual"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-white dark:bg-[#111827] rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Expense Categories</h3>
            {expenseData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">No expense data available</p>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={expenseData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    onClick={(data: ChartClickData) => {
                      if (data && data.activePayload) {
                        const category = data.activePayload[0].payload.name;
                        setDetailModal({
                          open: true,
                          title: `${category} Expenses`,
                          description: `Detailed breakdown of ${category} expenses`,
                          data: expenses.filter(e => e.category === category),
                          type: 'expenses',
                        });
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`RWF ${value.toLocaleString()}`, 'Amount']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} cursor="pointer">
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <ActivityLog />
      </motion.div>

      {/* Detail Modal */}
      <ChartDetailModal
        open={detailModal.open}
        onOpenChange={(open) => setDetailModal({ ...detailModal, open })}
        title={detailModal.title}
        description={detailModal.description}
        data={detailModal.data}
        type={detailModal.type}
      />
    </div>
  );
};

export default Dashboard;
