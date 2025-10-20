import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, TrendingUp } from 'lucide-react';

interface PayrollHistoryProps {
  onGeneratePayroll: () => void;
  showNoData?: boolean;
}

export function PayrollHistory({ onGeneratePayroll, showNoData = true }: PayrollHistoryProps) {
  if (showNoData) {
    return (
      <Card className="p-6 glass">
        <div className="flex items-center gap-2 mb-6">
          <History className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Payroll History</h2>
        </div>
        <div className="h-[200px] flex flex-col items-center justify-center text-center text-muted-foreground">
          <TrendingUp className="h-12 w-12 mb-4 text-muted-foreground/50" />
          <p>No payroll records</p>
          <p className="text-sm mb-6">Generate your first weekly payroll to get started.</p>
          <Button onClick={onGeneratePayroll} className="bg-orange-500 hover:bg-orange-600">
            Generate First Payroll
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass">
      <div className="flex items-center gap-2 mb-6">
        <History className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-semibold">Payroll History</h2>
      </div>
      {/* Add payroll history list here when data is available */}
    </Card>
  );
}
