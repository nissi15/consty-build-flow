import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';

const attendanceData = [
  { id: 1, name: 'John Smith', date: '2025-01-20', status: 'Present', hours: 8 },
  { id: 2, name: 'Sarah Johnson', date: '2025-01-20', status: 'Present', hours: 8 },
  { id: 3, name: 'Mike Davis', date: '2025-01-20', status: 'Present', hours: 9 },
  { id: 4, name: 'Emily Brown', date: '2025-01-20', status: 'Absent', hours: 0 },
  { id: 5, name: 'David Wilson', date: '2025-01-20', status: 'Present', hours: 8 },
  { id: 6, name: 'Lisa Anderson', date: '2025-01-20', status: 'Late', hours: 7 },
];

const Attendance = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Attendance</h1>
          <p className="text-muted-foreground">Track worker attendance and hours</p>
        </div>
        <Button className="gap-2" variant="outline">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Select Date
            </h3>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-4">Today's Attendance</h3>
            <div className="space-y-3">
              {attendanceData.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{record.name}</p>
                    <p className="text-sm text-muted-foreground">{record.hours} hours</p>
                  </div>
                  <Badge
                    variant={
                      record.status === 'Present'
                        ? 'default'
                        : record.status === 'Late'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {record.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Attendance;
