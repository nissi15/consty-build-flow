import { Edit2, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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
  return (
    <div className="space-y-4">
      <div className="text-sm">
        <h2 className="font-semibold text-lg mb-2">Team Members</h2>
        <p className="text-muted-foreground">Manage worker details and track attendance</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg border">
        <div className="grid grid-cols-7 gap-4 p-4 bg-muted/50 rounded-t-lg">
          <div className="col-span-2">Worker</div>
          <div>Role</div>
          <div>Daily Rate</div>
          <div>Today's Status</div>
          <div>This Week</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="divide-y">
          {workers.map((worker) => (
            <div key={worker.id} className="grid grid-cols-7 gap-4 p-4 items-center hover:bg-muted/50">
              <div className="col-span-2 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {worker.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{worker.name}</p>
                  <p className="text-sm text-muted-foreground">{worker.contact_info || 'No contact'}</p>
                </div>
              </div>

              <div>
                <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-50">
                  {worker.role}
                </Badge>
              </div>

              <div>
                <p className="font-medium">RWF {worker.daily_rate}</p>
                <p className="text-sm text-muted-foreground">+ RWF {worker.lunch_allowance} lunch</p>
              </div>

              <div>
                {worker.attendance ? (
                  <Badge
                    variant="outline"
                    className={
                      worker.attendance.status === 'present'
                        ? 'bg-green-50 text-green-600 hover:bg-green-50'
                        : worker.attendance.status === 'late'
                        ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-50'
                        : 'bg-red-50 text-red-600 hover:bg-red-50'
                    }
                  >
                    {worker.attendance.status.charAt(0).toUpperCase() + worker.attendance.status.slice(1)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-600 hover:bg-red-50">
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
                  className="hover:text-orange-600"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(worker)}
                  className="hover:text-red-600"
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
        {workers.map((worker) => (
          <div key={worker.id} className="rounded-lg border p-4 space-y-3 hover:bg-muted/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {worker.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{worker.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{worker.contact_info || 'No contact'}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(worker)}
                  className="hover:text-orange-600 h-8 w-8"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(worker)}
                  className="hover:text-red-600 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Role</p>
                <Badge variant="outline" className="bg-blue-50 text-blue-600 hover:bg-blue-50">
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
                        ? 'bg-green-50 text-green-600 hover:bg-green-50'
                        : worker.attendance.status === 'late'
                        ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-50'
                        : 'bg-red-50 text-red-600 hover:bg-red-50'
                    }
                  >
                    {worker.attendance.status.charAt(0).toUpperCase() + worker.attendance.status.slice(1)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-600 hover:bg-red-50">
                    Not marked
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Daily Rate</p>
                <p className="font-medium text-sm">RWF {worker.daily_rate}</p>
                <p className="text-xs text-muted-foreground">+ RWF {worker.lunch_allowance} lunch</p>
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
    </div>
  );
}
