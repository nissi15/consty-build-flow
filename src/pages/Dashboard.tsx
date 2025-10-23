import { motion } from 'framer-motion';
import { Users, Clock, DollarSign, Package, Wrench, Truck } from 'lucide-react';
import { ActivityLog } from '@/components/dashboard/ActivityLog';
import { ExportButton } from '@/components/dashboard/ExportButton';
import { ChartDetailModal } from '@/components/dashboard/ChartDetailModal';
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
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
interface ChartClickData {
  activePayload?: Array<{
    payload: any;
    [key: string]: any;
  }>;
  [key: string]: any;
}
import { useWorkers, useAttendance, useExpenses, useBudget } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';
import { format } from 'date-fns';

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
  const { workers, loading: workersLoading } = useWorkers();
  const { attendance, loading: attendanceLoading } = useAttendance();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { budget, loading: budgetLoading } = useBudget();

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
    const today = new Date().toISOString().split('T')[0];
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
  }, [workers, expenses, budget]);

  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => {
      const dayExpenses = expenses
        .filter(e => new Date(e.date).getDay() === days.indexOf(day) + 1)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      
      const dayAttendance = attendance
        .filter(a => new Date(a.date).getDay() === days.indexOf(day) + 1 && a.status === 'present')
        .length;
      
      const attendancePercent = workers.length > 0 ? Math.round((dayAttendance / workers.length) * 100) : 0;

      return {
        day,
        attendance: attendancePercent,
        expenses: dayExpenses,
      };
    });
  }, [expenses, attendance, workers]);

  const expenseData = useMemo(() => {
    const categories = ['Labor', 'Materials', 'Equipment', 'Other'];
    const colors = ['#8B5CF6', '#06B6D4', '#3B82F6', '#6366F1'];
    
    return categories.map((category, idx) => {
      const categoryExpenses = expenses
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      
      return {
        name: category,
        value: categoryExpenses,
        color: colors[idx],
      };
    }).filter(item => item.value > 0);
  }, [expenses]);

  if (workersLoading || attendanceLoading || expensesLoading || budgetLoading) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={weeklyData}
                  onClick={(data: ChartClickData) => {
                    if (data && data.activePayload) {
                      const day = data.activePayload[0].payload.day;
                      const dayExpenses = expenses.filter(e => 
                        format(new Date(e.date), 'E') === day
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
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
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
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold mb-4">Payroll Trend</h3>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={[
                      { week: 'Week 1', payroll: 3200 },
                      { week: 'Week 2', payroll: 3800 },
                      { week: 'Week 3', payroll: 4200 },
                      { week: 'Week 4', payroll: 4000 },
                    ]}
                    onClick={(data: ChartClickData) => {
                      if (data && data.activePayload) {
                        const week = data.activePayload[0].payload.week;
                        const weekStart = new Date();
                        weekStart.setDate(weekStart.getDate() - 21 + parseInt(week.split(' ')[1]) * 7);
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekEnd.getDate() + 6);
                        
                        const weekAttendance = attendance.filter(a => {
                          const date = new Date(a.date);
                          return date >= weekStart && date <= weekEnd;
                        });
                        
                        setDetailModal({
                          open: true,
                          title: `Attendance for ${week}`,
                          description: 'Detailed breakdown of attendance and payroll for the selected week',
                          data: weekAttendance,
                          type: 'attendance',
                        });
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="payroll" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      dot={{ fill: '#f97316', r: 4 }}
                      cursor="pointer"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold mb-4">Budget vs Actual</h3>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={[
                      { week: 'Week 1', budget: 5000, actual: 4000 },
                      { week: 'Week 2', budget: 5000, actual: 4800 },
                      { week: 'Week 3', budget: 5000, actual: 5100 },
                      { week: 'Week 4', budget: 5000, actual: 4900 },
                    ]}
                    onClick={(data: ChartClickData) => {
                      if (data && data.activePayload) {
                        const week = data.activePayload[0].payload.week;
                        const weekStart = new Date();
                        weekStart.setDate(weekStart.getDate() - 21 + parseInt(week.split(' ')[1]) * 7);
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekEnd.getDate() + 6);
                        
                        const weekData = [
                          { week, budget: 5000, actual: data.activePayload[0].payload.actual },
                        ];
                        
                        setDetailModal({
                          open: true,
                          title: `Budget vs Actual for ${week}`,
                          description: 'Detailed breakdown of budget variance for the selected week',
                          data: weekData,
                          type: 'budget',
                        });
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="budget" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={{ fill: '#22c55e', r: 4 }}
                      cursor="pointer"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      dot={{ fill: '#f97316', r: 4 }}
                      cursor="pointer"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
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
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Payroll', value: 45, color: '#64748b' },
                      { name: 'Materials', value: 25, color: '#f97316' },
                      { name: 'Equipment', value: 18, color: '#22c55e' },
                      { name: 'Transport', value: 8, color: '#3b82f6' },
                      { name: 'Miscellaneous', value: 4, color: '#a855f7' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    fill="#8884d8"
                  />
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
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
