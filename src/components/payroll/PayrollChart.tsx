import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PayrollChartProps {
  data: Array<{
    week: string;
    amount: number;
  }>;
  onExport?: () => void;
  showNoData?: boolean;
}

export function PayrollChart({ data, onExport, showNoData = false }: PayrollChartProps) {
  if (showNoData || data.length === 0) {
    return (
      <Card className="p-6 glass">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold">Weekly Payroll Trend</h2>
          </div>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
        <div className="h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground">
          <TrendingUp className="h-12 w-12 mb-4 text-muted-foreground/50" />
          <p>No payroll data available yet</p>
          <p className="text-sm">Generate your first payroll to see the trend.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Weekly Payroll Trend</h2>
        </div>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="week" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
              }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="hsl(var(--purple-500))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--purple-500))', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
