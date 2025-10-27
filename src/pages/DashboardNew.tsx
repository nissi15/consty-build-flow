import { motion } from 'framer-motion';
import { Users, DollarSign, TrendingUp, Calendar, Clock, Package, Wrench } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSyncSystem } from '@/hooks/useSyncSystem';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { format, startOfWeek, endOfWeek, subDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { getCategoryColor } from '@/constants/expenseCategories';

export default function Dashboard() {
  const { user } = useAuth();
  const { 
    workers, 
    attendance, 
    expenses, 
    budget, 
    loading, 
    getDashboardStats, 
    getExpenseBreakdown, 
    getAttendanceTrends 
  } = useSyncSystem();

  const stats = useMemo(() => getDashboardStats(), [getDashboardStats]);
  const expenseBreakdown = useMemo(() => getExpenseBreakdown(), [getExpenseBreakdown]);
  const attendanceTrends = useMemo(() => getAttendanceTrends(), [getAttendanceTrends]);

  const statCards = [
    {
      title: 'Total Workers',
      value: stats.totalWorkers,
      icon: Users,
      change: '+2 this week',
      changeType: 'positive' as const,
      iconClass: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: Clock,
      change: `${Math.round((stats.presentToday / stats.totalWorkers) * 100)}% attendance`,
      changeType: 'positive' as const,
      iconClass: 'bg-green-100 text-green-600',
    },
    {
      title: 'Weekly Expenses',
      value: `$${stats.totalExpenses.toLocaleString()}`,
      icon: DollarSign,
      change: '+12% from last week',
      changeType: 'positive' as const,
      iconClass: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Budget Remaining',
      value: `$${stats.budgetRemaining.toLocaleString()}`,
      icon: TrendingUp,
      change: `${Math.round((stats.budgetRemaining / stats.totalBudget) * 100)}% remaining`,
      changeType: stats.budgetRemaining > stats.totalBudget * 0.2 ? 'positive' : 'negative' as const,
      iconClass: 'bg-purple-100 text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background text-foreground min-h-screen">
      <div className="space-y-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user?.user_metadata?.full_name || 'User'}!
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your construction project today.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 glass">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={`text-xs ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.iconClass}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Breakdown Pie Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 glass">
              <h2 className="text-lg font-semibold mb-4">Expense Breakdown</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getCategoryColor(entry.name, index)}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* Attendance Trend Line Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 glass">
              <h2 className="text-lg font-semibold mb-4">7-Day Attendance Trend</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                      formatter={(value: number, name: string) => [
                        name === 'present' ? value : `$${value.toLocaleString()}`,
                        name === 'present' ? 'Present Workers' : 'Daily Cost'
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="present"
                      stroke="#28C76F"
                      strokeWidth={2}
                      dot={{ fill: '#28C76F', r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="#FF9F43"
                      strokeWidth={2}
                      dot={{ fill: '#FF9F43', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Budget Gauge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 glass">
            <h2 className="text-lg font-semibold mb-4">Budget Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Budget</span>
                <span className="font-semibold">${stats.totalBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Used</span>
                <span className="font-semibold">${stats.budgetUsed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Remaining</span>
                <span className="font-semibold text-green-600">${stats.budgetRemaining.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, (stats.budgetUsed / stats.totalBudget) * 100)}%` 
                  }}
                />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                {Math.round((stats.budgetUsed / stats.totalBudget) * 100)}% of budget used
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
