import { motion } from 'framer-motion';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import StatCard from '@/components/dashboard/StatCard';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const stats = [
  { title: 'Total Workers', value: '248', change: '+12% from last month', icon: Users },
  { title: 'Attendance Rate', value: '94%', change: '+5% this week', icon: Calendar },
  { title: 'Monthly Payroll', value: '$125K', change: 'On track', icon: DollarSign },
  { title: 'Active Projects', value: '18', change: '+3 new projects', icon: TrendingUp },
];

const weeklyData = [
  { day: 'Mon', attendance: 95, expenses: 12000 },
  { day: 'Tue', attendance: 92, expenses: 15000 },
  { day: 'Wed', attendance: 96, expenses: 11000 },
  { day: 'Thu', attendance: 94, expenses: 13000 },
  { day: 'Fri', attendance: 91, expenses: 14000 },
  { day: 'Sat', attendance: 88, expenses: 9000 },
  { day: 'Sun', attendance: 85, expenses: 7000 },
];

const expenseData = [
  { name: 'Labor', value: 45000, color: '#FF8C00' },
  { name: 'Materials', value: 30000, color: '#FFC94A' },
  { name: 'Equipment', value: 15000, color: '#FFB84D' },
  { name: 'Other', value: 10000, color: '#FFA500' },
];

const chartConfig = {
  attendance: { label: 'Attendance %', color: 'hsl(var(--chart-1))' },
  expenses: { label: 'Expenses', color: 'hsl(var(--chart-2))' },
};

const Dashboard = () => {
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
                  label={(entry) => `${entry.name}: $${(Number(entry.value) / 1000).toFixed(0)}K`}
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
    </div>
  );
};

export default Dashboard;
