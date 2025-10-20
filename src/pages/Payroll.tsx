import { motion } from 'framer-motion';
import { DollarSign, Download, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const payrollData = [
  { id: 1, name: 'John Smith', rate: 35, hours: 160, gross: 5600, net: 4480, status: 'Paid' },
  { id: 2, name: 'Sarah Johnson', rate: 42, hours: 160, gross: 6720, net: 5376, status: 'Paid' },
  { id: 3, name: 'Mike Davis', rate: 38, hours: 168, gross: 6384, net: 5107, status: 'Pending' },
  { id: 4, name: 'Emily Brown', rate: 32, hours: 120, gross: 3840, net: 3072, status: 'On Hold' },
  { id: 5, name: 'David Wilson', rate: 40, hours: 160, gross: 6400, net: 5120, status: 'Paid' },
  { id: 6, name: 'Lisa Anderson', rate: 36, hours: 160, gross: 5760, net: 4608, status: 'Pending' },
];

const Payroll = () => {
  const totalPayroll = payrollData.reduce((sum, item) => sum + item.net, 0);

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Payroll</h1>
          <p className="text-muted-foreground">Process and manage payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">
            <Send className="h-4 w-4" />
            Process All
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 glass">
          <div className="flex items-center justify-between">
            <div>
          <p className="text-muted-foreground mb-1">Total Monthly Payroll</p>
          <h2 className="text-4xl font-bold">RWF {totalPayroll.toLocaleString()}</h2>
            </div>
            <div className="p-4 rounded-xl bg-gradient-primary">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 glass">
          <h3 className="text-lg font-semibold mb-4">Payroll Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Employee</th>
                  <th className="text-left py-3 px-4">Rate/Hr (RWF)</th>
                  <th className="text-left py-3 px-4">Hours</th>
                  <th className="text-left py-3 px-4">Gross (RWF)</th>
                  <th className="text-left py-3 px-4">Net Pay (RWF)</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.map((record, index) => (
                  <motion.tr
                    key={record.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium">{record.name}</td>
                    <td className="py-4 px-4">RWF {record.rate}</td>
                    <td className="py-4 px-4">{record.hours}</td>
                    <td className="py-4 px-4">RWF {record.gross.toLocaleString()}</td>
                    <td className="py-4 px-4 font-semibold">RWF {record.net.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          record.status === 'Paid'
                            ? 'default'
                            : record.status === 'Pending'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {record.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Button size="sm" variant="outline">
                        Process
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Payroll;
