import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportToCSV, prepareExpenseData, prepareAttendanceData, prepareBudgetData } from '@/lib/export-utils';
import { toast } from 'sonner';

interface ExportButtonProps {
  expenses: any[];
  attendance: any[];
  workers: any[];
  className?: string;
}

export function ExportButton({ expenses, attendance, workers, className }: ExportButtonProps) {
  const handleExport = (type: 'expenses' | 'attendance' | 'budget') => {
    try {
      switch (type) {
        case 'expenses':
          exportToCSV({
            data: prepareExpenseData(expenses),
            filename: 'expenses',
            headers: ['Date', 'Category', 'Amount', 'Description'],
          });
          break;
        
        case 'attendance':
          exportToCSV({
            data: prepareAttendanceData(attendance, workers),
            filename: 'attendance',
            headers: ['Date', 'Worker', 'Status', 'Check In', 'Check Out', 'Hours', 'Lunch Money'],
          });
          break;
        
        case 'budget':
          exportToCSV({
            data: prepareBudgetData(expenses),
            filename: 'budget_report',
            headers: ['Week', 'Total Expenses', 'Labor', 'Materials', 'Equipment', 'Transport', 'Miscellaneous'],
          });
          break;
      }
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('expenses')}>
          Export Expenses
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('attendance')}>
          Export Attendance
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('budget')}>
          Export Budget Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
