import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays } from 'date-fns';
import { TrendingUp } from 'lucide-react';

interface Attendance {
  id: string;
  worker_id: string;
  date: string;
  status: string;
}

interface AttendanceTrendChartProps {
  attendance: Attendance[];
}

export function AttendanceTrendChart({ attendance }: AttendanceTrendChartProps) {
  const chartData = useMemo(() => {
    // Get last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayAttendance = attendance.filter(a => a.date === dateStr);
      const present = dayAttendance.filter(a => a.status === 'present').length;
      const absent = dayAttendance.filter(a => a.status === 'absent').length;
      
      days.push({
        date: format(date, 'MMM dd'),
        fullDate: dateStr,
        Present: present,
        Absent: absent,
        Total: present + absent,
      });
    }
    
    return days;
  }, [attendance]);

  return (
    <Card className="bg-white dark:bg-[#111827] rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Attendance Trend (Last 7 Days)
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Daily worker attendance overview
          </p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis 
            dataKey="date" 
            className="text-xs fill-slate-600 dark:fill-slate-400"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            className="text-xs fill-slate-600 dark:fill-slate-400"
            tick={{ fill: 'currentColor' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ color: '#0f172a', fontWeight: 600 }}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
          <Bar dataKey="Present" fill="#10b981" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Absent" fill="#ef4444" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

