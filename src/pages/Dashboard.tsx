import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import StatCard from '@/components/dashboard/StatCard';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useWorkers, useAttendance, useExpenses, useBudget } from '@/hooks/useSupabaseData';
import { useMemo } from 'react';

const chartConfig = {
  attendance: { label: 'Attendance %', color: 'hsl(var(--chart-1))' },
  expenses: { label: 'Expenses', color: 'hsl(var(--chart-2))' },
};

const Dashboard = () => {
  const { workers, loading: workersLoading } = useWorkers();
  const { attendance, loading: attendanceLoading } = useAttendance();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { budget, loading: budgetLoading } = useBudget();

  const stats = useMemo(() => {
    const totalWorkers = workers.filter(w => w.is_active).length;
    const todayAttendance = attendance.filter(a => {
      const today = new Date().toISOString().split('T')[0];
      return a.date === today && a.status === 'present';
    }).length;
    const attendanceRate = totalWorkers > 0 ? Math.round((todayAttendance / totalWorkers) * 100) : 0;

    return [
      { title: 'Total Workers', value: totalWorkers.toString(), change: `${workers.length} total`, icon: Users },
      { title: 'Attendance Rate', value: `${attendanceRate}%`, change: `${todayAttendance}/${totalWorkers} present today`, icon: Calendar },
      { title: 'Monthly Expenses', value: `$${budget?.used_budget?.toFixed(0) || '0'}`, change: `of $${budget?.total_budget?.toFixed(0) || '0'} budget`, icon: DollarSign },
      { title: 'Active Projects', value: '18', change: '+3 new projects', icon: TrendingUp },
    ];
  }, [workers, attendance, budget]);

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
    const colors = ['#FF8C00', '#FFC94A', '#FFB84D', '#FFA500'];
    
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
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-4">Weekly Attendance</h3>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="attendance" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-4">Weekly Expenses</h3>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--chart-2))', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>
        </motion.div>
      </div>

      {expenseData.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={(entry) => `${entry.name}: $${(Number(entry.value) / 1000).toFixed(1)}K`}
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
