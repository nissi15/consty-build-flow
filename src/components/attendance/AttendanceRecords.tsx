import { motion } from 'framer-motion';
import { Calendar, ArrowUpDown, User, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';

interface Worker {
  id: string;
  name: string;
  role: string;
}

interface AttendanceRecord {
  id: string;
  worker_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  hours: number;
  lunch_taken: boolean;
  check_in_time: string | null;
  check_out_time: string | null;
  lunch_money: number | null;
  workers: Worker;
}

interface AttendanceRecordsProps {
  attendance: AttendanceRecord[];
}

type SortDirection = 'asc' | 'desc';

export function AttendanceRecords({ attendance }: AttendanceRecordsProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Filter and sort attendance records
  const filteredAndSortedRecords = useMemo(() => {
    let records = [...attendance];

    // Filter by selected date
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      records = records.filter(record => record.date === dateStr);
    }

    // Sort by date
    records.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return records;
  }, [attendance, selectedDate, sortDirection]);

  const toggleSort = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const clearDateFilter = () => {
    setSelectedDate(undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'absent':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'late':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <Card className="bg-white dark:bg-[#111827] rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Attendance Records
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {filteredAndSortedRecords.length} records
              {selectedDate && ` for ${format(selectedDate, 'MMM d, yyyy')}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Filter by date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setIsCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {selectedDate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDateFilter}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Clear
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={toggleSort}
            className="gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}
          </Button>
        </div>
      </div>

      {filteredAndSortedRecords.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No Records Found
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            {selectedDate
              ? 'No attendance records for the selected date.'
              : 'No attendance records available yet.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Worker</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead className="text-right">Lunch Money</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedRecords.map((record, index) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="group hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-slate-200 dark:ring-slate-700">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-sm">
                          {record.workers?.name?.split(' ').map(n => n[0]).join('') || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {record.workers?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {record.workers?.role || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">
                        {format(new Date(record.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(record.status)} capitalize`}
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">{record.hours}h</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {record.check_in_time
                        ? format(new Date(record.check_in_time), 'h:mm a')
                        : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {record.check_out_time
                        ? format(new Date(record.check_out_time), 'h:mm a')
                        : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {record.lunch_money ? `RWF ${record.lunch_money.toLocaleString()}` : '-'}
                    </span>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}


