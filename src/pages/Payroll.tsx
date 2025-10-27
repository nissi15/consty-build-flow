import { motion } from 'framer-motion';
import { CalendarDays, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';
import { usePayroll } from '@/hooks/usePayroll';
import { useWorkers, useAttendance } from '@/hooks/useSupabaseData';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { PayrollStats } from '@/components/payroll/PayrollStats';
import { PayrollChart } from '@/components/payroll/PayrollChart';
import { PayrollHistory } from '@/components/payroll/PayrollHistory';
import { WorkerPayrollList } from '@/components/payroll/WorkerPayrollList';

export default function Payroll() {
  const { payrolls, loading, stats, generatePayroll, getPayrollTrend } = usePayroll();
  const { workers, loading: workersLoading } = useWorkers();
  const { attendance, loading: attendanceLoading } = useAttendance();
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().setDate(new Date().getDate() - 7)),
    end: new Date(),
  });

  const filteredWorkers = useMemo(() => {
    if (!searchQuery.trim()) return workers;
    
    return workers.filter(worker => 
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workers, searchQuery]);

  const handleGeneratePayroll = async () => {
    try {
      setIsGenerating(true);
      await generatePayroll();
      toast.success('Payroll generated successfully');
    } catch (error) {
      console.error('Error generating payroll:', error);
      toast.error('Failed to generate payroll');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    const data = payrolls.map(p => ({
      'Worker Name': p.worker?.name,
      'Role': p.worker?.role,
      'Period': `${format(new Date(p.period_start), 'MM/dd/yyyy')} - ${format(new Date(p.period_end), 'MM/dd/yyyy')}`,
      'Days Worked': p.days_worked,
      'Daily Rate': p.daily_rate,
      'Gross Amount': p.gross_amount,
      'Lunch Deduction': p.lunch_total,
      'Net Amount': p.net_amount,
      'Status': p.status,
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 min-h-screen">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Payroll Management</h1>
          <p className="text-muted-foreground">Generate and track weekly payrolls with automated calculations</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{format(new Date(), 'MM/dd/yyyy')}</span>
          </div>
          <Button 
            onClick={handleGeneratePayroll} 
            disabled={isGenerating}
            className="bg-purple-500 hover:bg-purple-600 gap-2"
          >
            + Generate Payroll
          </Button>
        </div>
      </motion.div>

      {(loading || workersLoading || attendanceLoading) ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[300px]" />
        </div>
      ) : (
        <>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <PayrollStats {...stats} />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search worker by name or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </Button>
              )}
            </div>
            
            <WorkerPayrollList 
              workers={filteredWorkers}
              attendance={attendance}
              selectedPeriod={selectedPeriod}
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <PayrollChart
              data={getPayrollTrend()}
              onExport={handleExport}
              showNoData={payrolls.length === 0}
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <PayrollHistory
              onGeneratePayroll={handleGeneratePayroll}
              showNoData={payrolls.length === 0}
            />
          </motion.div>
        </>
      )}
    </div>
  );
}