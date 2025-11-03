import { motion } from 'framer-motion';
import { Search, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo, useEffect } from 'react';
import { usePayroll } from '@/hooks/usePayroll';
import { useWorkers, useAttendance } from '@/hooks/useSupabaseData';
import { format, startOfWeek, endOfWeek, subWeeks, subMonths } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PayrollStats } from '@/components/payroll/PayrollStats';
import { PayrollChart } from '@/components/payroll/PayrollChart';
import { PayrollHistory } from '@/components/payroll/PayrollHistory';
import { WorkerPayrollList } from '@/components/payroll/WorkerPayrollList';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { generatePayrollPDF } from '@/lib/payroll-pdf-export';

export default function Payroll() {
  const { payrolls, loading, stats, generatePayroll, getPayrollTrend, refetch: refetchPayrolls } = usePayroll();
  const { workers, loading: workersLoading } = useWorkers();
  const { attendance, loading: attendanceLoading } = useAttendance();
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<{ start: Date; end: Date }>({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date()),
  });
  const [paidWorkers, setPaidWorkers] = useState<Set<string>>(new Set());
  const [excludedWorkers, setExcludedWorkers] = useState<Set<string>>(new Set());

  // Sync paid workers from database when period changes or payrolls update
  useEffect(() => {
    const periodStartStr = format(selectedPeriod.start, 'yyyy-MM-dd');
    const periodEndStr = format(selectedPeriod.end, 'yyyy-MM-dd');
    
    // Match dates - they come from DB as strings and might have different formats
    const paidWorkersFromDB = payrolls
      .filter(p => {
        const pStart = p.period_start.split('T')[0]; // Remove time if present
        const pEnd = p.period_end.split('T')[0];
        return pStart === periodStartStr && pEnd === periodEndStr && p.status === 'paid';
      })
      .map(p => p.worker_id);
    
    setPaidWorkers(new Set(paidWorkersFromDB));
  }, [selectedPeriod, payrolls]);

  const filteredWorkers = useMemo(() => {
    let filtered = workers.filter(w => !excludedWorkers.has(w.id));
    
    if (!searchQuery.trim()) return filtered;
    
    return filtered.filter(worker => 
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workers, searchQuery, excludedWorkers]);

  // Calculate dynamic stats based on current attendance data for the selected period
  const dynamicStats = useMemo(() => {
    const periodStartStr = format(selectedPeriod.start, 'yyyy-MM-dd');
    const periodEndStr = format(selectedPeriod.end, 'yyyy-MM-dd');

    const activeWorkersList = filteredWorkers.filter(w => w.is_active);
    
    const totalPayroll = activeWorkersList.reduce((sum, worker) => {
      const workerAttendance = attendance.filter(
        a => a.worker_id === worker.id && 
             a.date >= periodStartStr && 
             a.date <= periodEndStr &&
             a.status === 'present'
      );
      
      const daysWorked = workerAttendance.length;
      const grossAmount = daysWorked * worker.daily_rate;
      const lunchTotal = workerAttendance.filter(a => a.lunch_taken).length * worker.lunch_allowance;
      const netAmount = grossAmount - lunchTotal;
      
      return sum + netAmount;
    }, 0);

    const workersWithAttendance = activeWorkersList.filter(worker => {
      const workerAttendance = attendance.filter(
        a => a.worker_id === worker.id && 
             a.date >= periodStartStr && 
             a.date <= periodEndStr &&
             a.status === 'present'
      );
      return workerAttendance.length > 0;
    }).length;

    return {
      weeklyPayroll: totalPayroll,
      workersOnPayroll: workersWithAttendance,
      payrollPeriods: stats.payrollPeriods, // Keep from DB stats
    };
  }, [filteredWorkers, attendance, selectedPeriod, stats.payrollPeriods]);

  const handleGeneratePayroll = async () => {
    try {
      setIsGenerating(true);
      await generatePayroll();
      // Refresh payroll data to update charts
      await refetchPayrolls();
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

  const handleTogglePaid = async (workerId: string) => {
    const periodStartStr = format(selectedPeriod.start, 'yyyy-MM-dd');
    const periodEndStr = format(selectedPeriod.end, 'yyyy-MM-dd');
    const isCurrentlyPaid = paidWorkers.has(workerId);
    
    try {
      const worker = workers.find(w => w.id === workerId);
      if (!worker) {
        toast.error('Worker not found');
        return;
      }

      // Calculate payroll details
      const workerAttendance = attendance.filter(
        a => a.worker_id === workerId && 
             a.date >= periodStartStr && 
             a.date <= periodEndStr &&
             a.status === 'present'
      );
      
      const daysWorked = workerAttendance.length;
      const grossAmount = daysWorked * worker.daily_rate;
      const lunchTotal = workerAttendance.filter(a => a.lunch_taken).length * worker.lunch_allowance;
      const netAmount = grossAmount - lunchTotal;

      if (isCurrentlyPaid) {
        // Mark as unpaid - update status to pending
        const { data, error } = await supabase
          .from('payroll')
          .update({ 
            status: 'pending',
            paid_at: null
          })
          .eq('worker_id', workerId)
          .eq('period_start', periodStartStr)
          .eq('period_end', periodEndStr)
          .select();

        if (error) throw error;

        // If no rows were updated, the record might not exist yet, but we'll just update state
        if (!data || data.length === 0) {
          console.warn('No payroll record found to update');
        }

        setPaidWorkers(prev => {
          const newSet = new Set(prev);
          newSet.delete(workerId);
          return newSet;
        });
        toast.success('Worker marked as unpaid');
      } else {
        // Mark as paid - first try to find existing record
        const { data: existingData, error: findError } = await supabase
          .from('payroll')
          .select('id, status')
          .eq('worker_id', workerId)
          .eq('period_start', periodStartStr)
          .eq('period_end', periodEndStr)
          .maybeSingle();

        if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Find error:', findError);
          throw findError;
        }

        let result;
        if (existingData) {
          // Update existing record
          console.log('Updating existing payroll record:', existingData.id);
          const { data, error } = await supabase
            .from('payroll')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString(),
              days_worked: daysWorked,
              gross_amount: grossAmount,
              lunch_total: lunchTotal,
              net_amount: netAmount
            })
            .eq('id', existingData.id)
            .select();

          if (error) {
            console.error('Update error:', error);
            throw error;
          }
          result = data;
        } else {
          // Insert new record
          console.log('Creating new payroll record');
          const { data, error } = await supabase
            .from('payroll')
            .insert({
              worker_id: workerId,
              period_start: periodStartStr,
              period_end: periodEndStr,
              days_worked: daysWorked,
              daily_rate: worker.daily_rate,
              lunch_deduction: worker.lunch_allowance,
              gross_amount: grossAmount,
              lunch_total: lunchTotal,
              net_amount: netAmount,
              status: 'paid',
              paid_at: new Date().toISOString()
            })
            .select();

          if (error) {
            console.error('Insert error:', error);
            throw error;
          }
          result = data;
        }

        if (result && result.length > 0) {
          console.log('Payroll updated successfully:', result[0]);
        }

        setPaidWorkers(prev => {
          const newSet = new Set(prev);
          newSet.add(workerId);
          return newSet;
        });
        toast.success('Worker marked as paid');
      }
      
      // Always refresh payroll data to update charts and history
      await refetchPayrolls();
    } catch (error: any) {
      console.error('Error updating payroll status:', error);
      toast.error(`Failed to update payment status: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteWorker = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      setExcludedWorkers(prev => {
        const newSet = new Set(prev);
        newSet.add(workerId);
        return newSet;
      });
      toast.success(`${worker.name} removed from payroll`);
    }
  };

  const handleDateRangeChange = (period: 'week' | 'lastWeek' | 'month') => {
    const today = new Date();
    switch (period) {
      case 'week':
        setSelectedPeriod({
          start: startOfWeek(today),
          end: endOfWeek(today),
        });
        break;
      case 'lastWeek':
        const lastWeekStart = startOfWeek(subWeeks(today, 1));
        const lastWeekEnd = endOfWeek(subWeeks(today, 1));
        setSelectedPeriod({
          start: lastWeekStart,
          end: lastWeekEnd,
        });
        break;
      case 'month':
        setSelectedPeriod({
          start: subMonths(today, 1),
          end: today,
        });
        break;
    }
  };

  const handleExportPayrollPDF = () => {
    try {
      const periodStartStr = format(selectedPeriod.start, 'yyyy-MM-dd');
      const periodEndStr = format(selectedPeriod.end, 'yyyy-MM-dd');

      // Calculate worker payroll for the selected period
      const workerPayrollData = filteredWorkers
        .filter(w => w.is_active)
        .map(worker => {
          const workerAttendance = attendance.filter(
            a => a.worker_id === worker.id && 
                 a.date >= periodStartStr && 
                 a.date <= periodEndStr &&
                 a.status === 'present'
          );

          const daysWorked = workerAttendance.length;
          const grossAmount = daysWorked * worker.daily_rate;
          const lunchTotal = workerAttendance.filter(a => a.lunch_taken).length * worker.lunch_allowance;
          const netAmount = grossAmount - lunchTotal;
          const isPaid = paidWorkers.has(worker.id);

          return {
            name: worker.name,
            role: worker.role,
            daysWorked,
            dailyRate: worker.daily_rate,
            grossAmount,
            lunchDeductions: lunchTotal,
            netAmount,
            status: isPaid ? 'paid' as const : 'pending' as const,
          };
        });

      // Calculate summary
      const summary = {
        totalWorkers: workerPayrollData.length,
        totalGross: workerPayrollData.reduce((sum, w) => sum + w.grossAmount, 0),
        totalLunchDeductions: workerPayrollData.reduce((sum, w) => sum + w.lunchDeductions, 0),
        netPayroll: workerPayrollData.reduce((sum, w) => sum + w.netAmount, 0),
        averagePerWorker: workerPayrollData.length > 0 
          ? workerPayrollData.reduce((sum, w) => sum + w.netAmount, 0) / workerPayrollData.length 
          : 0,
      };

      // Generate PDF
      generatePayrollPDF({
        period: selectedPeriod,
        workers: workerPayrollData,
        summary,
      });

      toast.success('Payroll PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating payroll PDF:', error);
      toast.error('Failed to generate payroll report');
    }
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
        <div className="flex items-center gap-4 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {format(selectedPeriod.start, 'MMM d')} - {format(selectedPeriod.end, 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Quick Filters</p>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDateRangeChange('week')}
                      className="justify-start"
                    >
                      This Week
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDateRangeChange('lastWeek')}
                      className="justify-start"
                    >
                      Last Week
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDateRangeChange('month')}
                      className="justify-start"
                    >
                      Last 30 Days
                    </Button>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Custom Range</p>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                      <Input
                        type="date"
                        value={format(selectedPeriod.start, 'yyyy-MM-dd')}
                        onChange={(e) => setSelectedPeriod(prev => ({ ...prev, start: new Date(e.target.value) }))}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                      <Input
                        type="date"
                        value={format(selectedPeriod.end, 'yyyy-MM-dd')}
                        onChange={(e) => setSelectedPeriod(prev => ({ ...prev, end: new Date(e.target.value) }))}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button 
            onClick={handleGeneratePayroll} 
            disabled={isGenerating}
            className="bg-purple-500 hover:bg-purple-600 gap-2"
          >
            + Generate Payroll
          </Button>
          <Button 
            onClick={handleExportPayrollPDF}
            variant="outline"
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Export PDF Report
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
            <PayrollStats {...dynamicStats} />
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
              paidWorkers={paidWorkers}
              onTogglePaid={handleTogglePaid}
              onDelete={handleDeleteWorker}
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