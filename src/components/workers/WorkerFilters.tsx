import { Search, Calendar, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface WorkerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  status: string;
  onStatusChange: (status: string) => void;
}

export function WorkerFilters({
  search,
  onSearchChange,
  date,
  onDateChange,
  status,
  onStatusChange,
}: WorkerFiltersProps) {
  return (
    <Card className="border-[#ded8cd] bg-[#fbfaf7] p-4 shadow-[0_1px_2px_rgba(29,33,31,0.04)] dark:border-[#28312c] dark:bg-[#151a17]">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workers..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-[#d8d1c6] bg-[#f8f6f1] pl-10 focus-visible:ring-[#31483a] dark:border-[#344038] dark:bg-[#111512]"
          />
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 border-[#d8d1c6] bg-[#f8f6f1] dark:border-[#344038] dark:bg-[#111512]">
                <Calendar className="h-4 w-4" />
                {date ? format(date, 'MMM d, yyyy') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={onDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[140px] gap-2 border-[#d8d1c6] bg-[#f8f6f1] dark:border-[#344038] dark:bg-[#111512]">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="not_marked">Not Marked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
