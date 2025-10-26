import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { History, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { usePayroll } from '@/hooks/usePayroll';

interface PayrollHistoryProps {
  onGeneratePayroll: () => void;
  showNoData?: boolean;
}

export function PayrollHistory({ onGeneratePayroll, showNoData = true }: PayrollHistoryProps) {
  const { payrolls } = usePayroll();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'approved':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  if (showNoData) {
    return (
      <Card className="bg-white dark:bg-[#111827] rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <History className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Payroll History</h2>
        </div>
        <div className="h-[200px] flex flex-col items-center justify-center text-center">
          <TrendingUp className="h-12 w-12 mb-4 text-slate-300 dark:text-slate-700" />
          <p className="text-slate-700 dark:text-slate-300 font-medium">No payroll records</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Generate your first weekly payroll to get started.</p>
          <Button onClick={onGeneratePayroll} className="bg-orange-500 hover:bg-orange-600">
            Generate First Payroll
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#111827] rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
          <History className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Payroll History</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{payrolls.length} payroll records</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Worker</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Daily Rate</TableHead>
              <TableHead>Gross</TableHead>
              <TableHead>Lunch</TableHead>
              <TableHead>Net Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrolls.map((payroll, index) => (
              <motion.tr
                key={payroll.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="group hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <TableCell>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {payroll.worker?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {payroll.worker?.role || 'N/A'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div className="text-sm">
                      <div>{format(new Date(payroll.period_start), 'MMM d')}</div>
                      <div className="text-slate-500 dark:text-slate-400">
                        {format(new Date(payroll.period_end), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{payroll.days_worked}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">RWF {payroll.daily_rate.toLocaleString()}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">RWF {payroll.gross_amount.toLocaleString()}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-green-600 dark:text-green-400">
                    +RWF {payroll.lunch_total.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-purple-500" />
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      RWF {payroll.net_amount.toLocaleString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${getStatusColor(payroll.status)} capitalize`}>
                    {payroll.status}
                  </Badge>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
