import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Worker {
  id: string;
  name: string;
  role: string;
}

interface PendingAttendanceProps {
  workers: Worker[];
  onMarkPresent: (workerId: string) => void;
  onMarkAbsent: (workerId: string) => void;
}

export function PendingAttendance({ workers, onMarkPresent, onMarkAbsent }: PendingAttendanceProps) {
  if (workers.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <p>No pending attendance to mark.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-semibold">Pending Attendance ({workers.length})</h2>
      </div>
      <Card className="divide-y">
        {workers.map((worker, index) => (
          <motion.div
            key={worker.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 flex items-center justify-between hover:bg-muted/50"
          >
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback className="bg-orange-100 text-orange-600">
                  {worker.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{worker.name}</p>
                <p className="text-sm text-muted-foreground">{worker.role}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                onClick={() => onMarkPresent(worker.id)}
              >
                Present
              </Button>
              <Button
                variant="outline"
                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                onClick={() => onMarkAbsent(worker.id)}
              >
                Absent
              </Button>
            </div>
          </motion.div>
        ))}
      </Card>
    </div>
  );
}
