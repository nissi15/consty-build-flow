import { Edit2, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Attendance {
  id: string;
  worker_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  hours: number;
}

interface Worker {
  id: string;
  name: string;
  role: string;
  daily_rate: number;
  lunch_allowance: number;
  is_active: boolean;
  contact_info?: string;
  attendance?: Attendance;
  weeklyAttendance?: {
    days: number;
    marked: number;
  };
}

interface WorkerListProps {
  workers: Worker[];
  onEdit: (worker: Worker) => void;
  onDelete: (worker: Worker) => void;
}

export function WorkerList({ workers, onEdit, onDelete }: WorkerListProps) {
  const formatRwf = (value: number) => `RWF ${Number(value).toLocaleString('en-US')}`;
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const pageCount = Math.max(1, Math.ceil(workers.length / pageSize));
  const pageWorkers = workers.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [workers.length]);

  if (workers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#cfc8bc] bg-[#fbfaf7] px-6 py-14 text-center dark:border-[#344038] dark:bg-[#151a17]">
        <Users className="mx-auto h-6 w-6 text-[#73777f]" />
        <h2 className="mt-4 font-semibold">No workers match these filters</h2>
        <p className="mt-1 text-sm text-muted-foreground">Try a different name, date, or attendance status.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm">
        <h2 className="mb-1 text-lg font-semibold tracking-[-0.01em]">Team register</h2>
        <p className="text-muted-foreground">{workers.length} workers · showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, workers.length)}</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-xl border border-[#e2e4e7] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.025)] dark:border-[#292b2f] dark:bg-[#111214] md:block">
        <div className="grid grid-cols-7 gap-4 border-b border-[#e2e4e7] bg-[#f6f7f8] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#73777f] dark:border-[#292b2f] dark:bg-[#191a1d] dark:text-[#92969d]">
          <div className="col-span-2">Worker</div>
          <div>Role</div>
          <div>Daily Rate</div>
          <div>Today's Status</div>
          <div>This Week</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="divide-y">
          {pageWorkers.map((worker) => (
            <div key={worker.id} className="grid grid-cols-7 gap-4 px-5 py-4 items-center transition-colors hover:bg-[#fafafa] dark:hover:bg-[#17181a]">
              <div className="col-span-2 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-[#eef3ff] text-[#0066cc] dark:bg-[#15233a] dark:text-[#69a8ff]">
                    {worker.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium capitalize">{worker.name}</p>
                  <p className="text-sm text-muted-foreground">{worker.contact_info || 'No contact'}</p>
                </div>
              </div>

              <div>
                <Badge variant="outline" className="border-[#dfe2e7] bg-[#f5f6f8] capitalize text-[#4b515a] hover:bg-[#f5f6f8] dark:border-[#34363b] dark:bg-[#202226] dark:text-[#c5c7cc]">
                  {worker.role}
                </Badge>
              </div>

              <div>
                <p className="font-medium tabular-nums">{formatRwf(worker.daily_rate)}</p>
                <p className="text-sm text-muted-foreground">+ {formatRwf(worker.lunch_allowance)} lunch</p>
              </div>

              <div>
                {worker.attendance ? (
                  <Badge
                    variant="outline"
                    className={
                      worker.attendance.status === 'present'
                        ? 'border-[#c6d7c8] bg-[#e8f0e7] text-[#3f6848] hover:bg-[#e8f0e7]'
                        : worker.attendance.status === 'late'
                        ? 'border-[#dfd0ad] bg-[#f3ecd9] text-[#846a2f] hover:bg-[#f3ecd9]'
                        : 'border-[#dfc6c1] bg-[#f3e7e4] text-[#8c4941] hover:bg-[#f3e7e4]'
                    }
                  >
                    {worker.attendance.status.charAt(0).toUpperCase() + worker.attendance.status.slice(1)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-[#ddd6c9] bg-[#f0ede7] text-[#786f63] hover:bg-[#f0ede7]">
                    Not marked
                  </Badge>
                )}
              </div>

              <div>
                <p className="font-medium">{worker.weeklyAttendance?.days || 0} days</p>
                <p className="text-sm text-muted-foreground">{worker.weeklyAttendance?.marked || 0} marked</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(worker)}
                  className="hover:bg-[#eee9df] hover:text-[#7f5a3b]"
                  aria-label={`Edit ${worker.name}`}
                  title={`Edit ${worker.name}`}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(worker)}
                  className="hover:bg-[#f3e7e4] hover:text-[#8c4941]"
                  aria-label={`Delete ${worker.name}`}
                  title={`Delete ${worker.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {pageWorkers.map((worker) => (
          <div key={worker.id} className="space-y-3 rounded-xl border border-[#ded8cd] bg-[#fbfaf7] p-4 shadow-sm dark:border-[#28312c] dark:bg-[#151a17]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarFallback className="bg-[#eef3ff] text-[#0066cc] dark:bg-[#15233a] dark:text-[#69a8ff]">
                    {worker.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium capitalize">{worker.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{worker.contact_info || 'No contact'}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(worker)}
                  className="h-10 w-10 hover:bg-[#eee9df] hover:text-[#7f5a3b]"
                  aria-label={`Edit ${worker.name}`}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(worker)}
                  className="h-10 w-10 hover:bg-[#f3e7e4] hover:text-[#8c4941]"
                  aria-label={`Delete ${worker.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Role</p>
                <Badge variant="outline" className="border-[#cad3cc] bg-[#edf1ed] capitalize text-[#3f5d4b] hover:bg-[#edf1ed]">
                  {worker.role}
                </Badge>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Today's Status</p>
                {worker.attendance ? (
                  <Badge
                    variant="outline"
                    className={
                      worker.attendance.status === 'present'
                        ? 'border-[#c6d7c8] bg-[#e8f0e7] text-[#3f6848] hover:bg-[#e8f0e7]'
                        : worker.attendance.status === 'late'
                        ? 'border-[#dfd0ad] bg-[#f3ecd9] text-[#846a2f] hover:bg-[#f3ecd9]'
                        : 'border-[#dfc6c1] bg-[#f3e7e4] text-[#8c4941] hover:bg-[#f3e7e4]'
                    }
                  >
                    {worker.attendance.status.charAt(0).toUpperCase() + worker.attendance.status.slice(1)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-[#ddd6c9] bg-[#f0ede7] text-[#786f63] hover:bg-[#f0ede7]">
                    Not marked
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Daily Rate</p>
                <p className="text-sm font-medium tabular-nums">{formatRwf(worker.daily_rate)}</p>
                <p className="text-xs text-muted-foreground">+ {formatRwf(worker.lunch_allowance)} lunch</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">This Week</p>
                <p className="font-medium text-sm">{worker.weeklyAttendance?.days || 0} days</p>
                <p className="text-xs text-muted-foreground">{worker.weeklyAttendance?.marked || 0} marked</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t pt-4 text-sm">
          <span className="text-muted-foreground">Page {page} of {pageCount}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(value => Math.max(1, value - 1))}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage(value => Math.min(pageCount, value + 1))}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
