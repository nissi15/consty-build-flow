import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOwner } from '@/contexts/OwnerContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, Users, DollarSign, TrendingUp, 
  LogOut, Eye, Calendar, Activity 
} from 'lucide-react';
import { format } from 'date-fns';

export default function OwnerDashboard() {
  const { isOwner, ownerName, managerId, logoutOwner } = useOwner();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBudget: 0,
    usedBudget: 0,
    remainingBudget: 0,
    totalWorkers: 0,
    presentToday: 0,
    recentExpenses: [] as any[],
    activityLog: [] as any[],
  });

  useEffect(() => {
    if (!isOwner || !managerId) {
      navigate('/auth');
      return;
    }

    fetchOwnerStats();
  }, [isOwner, managerId, navigate]);

  const fetchOwnerStats = async () => {
    try {
      setLoading(true);

      // Fetch budget
      const { data: budgetData } = await supabase
        .from('budget')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Fetch workers count
      const { data: workersData } = await supabase
        .from('workers')
        .select('id, is_active')
        .eq('is_active', true);

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', today)
        .eq('status', 'present');

      // Fetch recent expenses (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent activity
      const { data: activityData } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalBudget: budgetData?.total_budget || 0,
        usedBudget: budgetData?.used_budget || 0,
        remainingBudget: budgetData?.budget_remaining || 0,
        totalWorkers: workersData?.length || 0,
        presentToday: attendanceData?.length || 0,
        recentExpenses: expensesData || [],
        activityLog: activityData || [],
      });
    } catch (error) {
      console.error('Error fetching owner stats:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* Header */}
      <div className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-xl">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Welcome, {ownerName}!
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                    <Eye className="h-3 w-3 mr-1" />
                    View Only
                  </Badge>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Last updated: {format(new Date(), 'MMM dd, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white dark:bg-[#111827] p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Budget</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    RWF {stats.totalBudget.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white dark:bg-[#111827] p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Used Budget</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    RWF {stats.usedBudget.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white dark:bg-[#111827] p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Team Members</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.totalWorkers}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white dark:bg-[#111827] p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Present Today</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.presentToday}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Budget Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white dark:bg-[#111827] p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Budget Overview
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Progress</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {budgetPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    budgetPercentage > 80
                      ? 'bg-red-500'
                      : budgetPercentage > 60
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${budgetPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm pt-2">
                <span className="text-slate-600 dark:text-slate-400">
                  Remaining: <span className="font-medium text-slate-900 dark:text-slate-100">
                    RWF {stats.remainingBudget.toLocaleString()}
                  </span>
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white dark:bg-[#111827] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Recent Activity
              </h3>
            </div>
            <div className="space-y-3">
              {stats.activityLog.length > 0 ? (
                stats.activityLog.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        {activity.message}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {format(new Date(activity.created_at), 'MMM dd, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 dark:text-slate-400 py-4">
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

