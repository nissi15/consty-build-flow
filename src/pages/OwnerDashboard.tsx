import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useOwner } from '@/contexts/OwnerContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, Users, DollarSign, TrendingUp, TrendingDown,
  LogOut, Eye, Activity, Wallet, ShoppingCart, Clock, Moon, Sun
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getCategoryColor } from '@/constants/expenseCategories';
import { useTheme } from '@/contexts/ThemeContext';

export default function OwnerDashboard() {
  const { isOwner, ownerName, managerId, logoutOwner } = useOwner();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  // Date range state for filtering dashboard data
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [stats, setStats] = useState({
    totalBudget: 0,
    usedBudget: 0,
    remainingBudget: 0,
    totalWorkers: 0,
    activeWorkers: 0,
    presentToday: 0,
    totalPayroll: 0,
    expenses: [] as any[],
    attendance: [] as any[],
    workers: [] as any[],
    activityLog: [] as any[],
  });

  useEffect(() => {
    if (!isOwner || !managerId) {
      navigate('/auth');
      return;
    }

    fetchOwnerStats();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchOwnerStats, 30000);
    return () => clearInterval(interval);
  }, [isOwner, managerId, navigate, dateRange]);

  const fetchOwnerStats = async () => {
    try {
      setLoading(true);

      const fromDate = format(startOfDay(dateRange.from), 'yyyy-MM-dd');
      const toDate = format(endOfDay(dateRange.to), 'yyyy-MM-dd');

      // Fetch budget
      const { data: budgetData } = await supabase
        .from('budget')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Fetch all workers
      const { data: workersData } = await supabase
        .from('workers')
        .select('*');

      // Fetch attendance in date range
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .gte('date', fromDate)
        .lte('date', toDate)
        .order('date', { ascending: false });

      // Fetch expenses in date range
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .gte('created_at', fromDate)
        .lte('created_at', toDate)
        .order('created_at', { ascending: false });

      // Fetch activity in date range
      const { data: activityData } = await supabase
        .from('activity_log')
        .select('*')
        .gte('created_at', fromDate)
        .lte('created_at', toDate)
        .order('created_at', { ascending: false })
        .limit(50);

      // Calculate payroll
      const totalPayroll = expensesData
        ?.filter(e => e.type === 'salary' || e.category === 'Labor')
        .reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      const today = format(new Date(), 'yyyy-MM-dd');
      const presentToday = attendanceData?.filter(a => 
        a.date === today && a.status === 'present'
      ).length || 0;

      const activeWorkers = workersData?.filter(w => w.is_active).length || 0;

      setStats({
        totalBudget: budgetData?.total_budget || 0,
        usedBudget: budgetData?.used_budget || 0,
        remainingBudget: budgetData?.budget_remaining || budgetData?.total_budget - budgetData?.used_budget || 0,
        totalWorkers: workersData?.length || 0,
        activeWorkers,
        presentToday,
        totalPayroll,
        expenses: expensesData || [],
        attendance: attendanceData || [],
        workers: workersData || [],
        activityLog: activityData || [],
      });
    } catch (error) {
      console.error('Error fetching owner stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate expense breakdown by category
  const expenseBreakdown = useMemo(() => {
    const breakdown: { [key: string]: number } = {};
    stats.expenses.forEach(expense => {
      const category = expense.type || expense.category || 'Other';
      breakdown[category] = (breakdown[category] || 0) + Number(expense.amount);
    });

    return Object.entries(breakdown)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round(value),
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }, [stats.expenses]);

  // Calculate daily spending for last 7 days
  const dailySpending = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayExpenses = stats.expenses
        .filter(e => e.created_at?.startsWith(dateStr))
        .reduce((sum, e) => sum + Number(e.amount), 0);
      
      days.push({
        date: format(date, 'MMM dd'),
        amount: Math.round(dayExpenses),
      });
    }
    return days;
  }, [stats.expenses]);

  // Attendance rate last 7 days
  const attendanceRate = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayAttendance = stats.attendance.filter(a => a.date === dateStr);
      const present = dayAttendance.filter(a => a.status === 'present').length;
      
      days.push({
        date: format(date, 'MMM dd'),
        present,
        total: stats.activeWorkers,
      });
    }
    return days;
  }, [stats.attendance, stats.activeWorkers]);

  const handleLogout = () => {
    logoutOwner();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const budgetPercentage = stats.totalBudget > 0 
    ? (stats.usedBudget / stats.totalBudget) * 100 
    : 0;

  // Custom label renderer for pie chart - only show labels for slices > 5%
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null; // Don't show label if less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#475569" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs sm:text-sm font-medium"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-cyan-50/20 dark:from-[#0B1120] dark:via-[#0B1120] dark:to-[#0B1120]">
      {/* Header */}
      <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className="p-2 sm:p-2.5 bg-gradient-to-br from-purple-600 via-purple-500 to-cyan-500 rounded-xl shadow-lg flex-shrink-0">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
                  Welcome, {ownerName}! 👋
                </h1>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 text-[10px] sm:text-xs px-1.5 py-0">
                    <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                    View Only
                  </Badge>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 hidden xs:block">
                    Updated: {format(new Date(), 'h:mm a')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative overflow-hidden h-8 w-8 sm:h-9 sm:w-9"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center"
                >
                  {theme === 'light' ? (
                    <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700 dark:text-slate-300" />
                  ) : (
                    <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  )}
                </motion.div>
              </Button>
              
              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1 sm:gap-2 px-2 sm:px-3 flex-shrink-0 text-xs sm:text-sm"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
          
          {/* Date Range Filter */}
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Date Range:</span>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={dateRange.from.getTime() === subDays(new Date(), 7).setHours(0,0,0,0) ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange({ from: subDays(new Date(), 7), to: new Date() })}
                className="text-xs h-7 px-2"
              >
                Last 7 Days
              </Button>
              <Button
                variant={dateRange.from.getTime() === subDays(new Date(), 30).setHours(0,0,0,0) ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange({ from: subDays(new Date(), 30), to: new Date() })}
                className="text-xs h-7 px-2"
              >
                Last 30 Days
              </Button>
              <Button
                variant={dateRange.from.getTime() === subDays(new Date(), 90).setHours(0,0,0,0) ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange({ from: subDays(new Date(), 90), to: new Date() })}
                className="text-xs h-7 px-2"
              >
                Last 90 Days
              </Button>
            </div>
            <Badge variant="outline" className="text-[10px] sm:text-xs">
              {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm p-3 sm:p-4 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Total Budget</p>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
                    RWF {stats.totalBudget.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg self-end sm:self-auto">
                  <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm p-3 sm:p-4 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Total Spent</p>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
                    RWF {stats.usedBudget.toLocaleString()}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
                    {budgetPercentage.toFixed(1)}% of budget
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg self-end sm:self-auto">
                  <TrendingDown className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm p-3 sm:p-4 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Total Payroll</p>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
                    RWF {stats.totalPayroll.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg self-end sm:self-auto">
                  <Wallet className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm p-3 sm:p-4 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Workers Present</p>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.presentToday} / {stats.activeWorkers}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
                    Today's attendance
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg self-end sm:self-auto">
                  <Users className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Budget Progress & Expense Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Budget Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
                Budget Overview
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Budget</span>
                  <span className="font-semibold">RWF {stats.totalBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Used</span>
                  <span className="font-semibold text-orange-600">RWF {stats.usedBudget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Remaining</span>
                  <span className="font-semibold text-green-600">RWF {stats.remainingBudget.toLocaleString()}</span>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-400">Progress</span>
                    <span className="font-medium">{budgetPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-6 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        budgetPercentage > 90
                          ? 'bg-red-500'
                          : budgetPercentage > 75
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Expense Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
                Expense Breakdown
              </h3>
              {expenseBreakdown.length > 0 ? (
                <div className="h-[280px] sm:h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="45%"
                        labelLine={true}
                        label={renderCustomLabel}
                        outerRadius={window.innerWidth < 640 ? 70 : 90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getCategoryColor(entry.name, index)}
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`RWF ${value.toLocaleString()}`, 'Amount']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value: string) => <span className="text-xs sm:text-sm">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8 text-sm">No expenses in selected date range</p>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Daily Spending Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                Daily Spending (Last 7 Days)
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
              <BarChart data={dailySpending}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" className="text-[10px] sm:text-xs" />
                <YAxis className="text-[10px] sm:text-xs" />
                <Tooltip 
                  formatter={(value: number) => [`RWF ${value.toLocaleString()}`, 'Amount']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Attendance Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                Worker Attendance (Last 7 Days)
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={200} className="sm:h-[250px]">
              <BarChart data={attendanceRate}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis dataKey="date" className="text-[10px] sm:text-xs" />
                <YAxis className="text-[10px] sm:text-xs" />
                <Tooltip contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px',
                  fontSize: '12px'
                }} />
                <Bar dataKey="present" fill="#10b981" radius={[8, 8, 0, 0]} name="Present" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-sm p-4 sm:p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                Recent Activity
              </h3>
            </div>
            <div className="space-y-2 max-h-64 sm:max-h-96 overflow-y-auto">
              {stats.activityLog.length > 0 ? (
                stats.activityLog.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 break-words">
                        {activity.message}
                      </p>
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
                        {format(new Date(activity.created_at), 'MMM dd, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">
                  No recent activity
                </p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
