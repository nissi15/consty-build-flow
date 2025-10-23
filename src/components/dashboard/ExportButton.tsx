import { memo } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateWeeklyPDFReport } from '@/lib/pdf-export';
import { toast } from 'sonner';

interface ExportButtonProps {
  expenses: any[];
  attendance: any[];
  workers: any[];
  budget?: any;
  className?: string;
}

export const ExportButton = memo(function ExportButton({ expenses, attendance, workers, budget, className }: ExportButtonProps) {

  const handlePDFExport = async () => {
    try {
      console.log('Starting PDF export...', { expenses, attendance, workers, budget });
      toast.loading('Generating PDF report...');
      
      // Small delay to ensure toast shows
      await new Promise(resolve => setTimeout(resolve, 100));
      
      generateWeeklyPDFReport({
        expenses,
        attendance,
        workers,
        budget,
      });
      
      toast.dismiss();
      toast.success('PDF Weekly Report generated successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.dismiss();
      toast.error(`Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Button 
      onClick={handlePDFExport} 
      variant="default"
      className={`gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 ${className}`}
    >
      <FileText className="h-4 w-4" />
      Download Weekly Report
    </Button>
  );
});
