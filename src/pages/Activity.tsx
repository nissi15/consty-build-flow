import { motion } from 'framer-motion';
import { Clock, UserPlus, DollarSign, FileText, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const activities = [
  {
    id: 1,
    type: 'Added',
    description: 'New worker John Smith added',
    user: 'Admin',
    timestamp: '2 hours ago',
    icon: UserPlus,
    color: 'text-primary'
  },
  {
    id: 2,
    type: 'Updated',
    description: 'Payroll processed for 6 employees',
    user: 'System',
    timestamp: '4 hours ago',
    icon: DollarSign,
    color: 'text-primary'
  },
  {
    id: 3,
    type: 'Added',
    description: 'New expense: Steel Beams - $12,500',
    user: 'Manager',
    timestamp: '6 hours ago',
    icon: FileText,
    color: 'text-primary'
  },
  {
    id: 4,
    type: 'Updated',
    description: 'Budget updated for Downtown Tower project',
    user: 'Admin',
    timestamp: '8 hours ago',
    icon: FileText,
    color: 'text-secondary'
  },
  {
    id: 5,
    type: 'Removed',
    description: 'Worker Emily Brown marked as On Leave',
    user: 'Manager',
    timestamp: '10 hours ago',
    icon: Trash2,
    color: 'text-destructive'
  },
  {
    id: 6,
    type: 'Added',
    description: 'New project: Shopping Mall renovation',
    user: 'Admin',
    timestamp: '12 hours ago',
    icon: FileText,
    color: 'text-primary'
  },
  {
    id: 7,
    type: 'Updated',
    description: 'Attendance marked for 248 workers',
    user: 'System',
    timestamp: '1 day ago',
    icon: Clock,
    color: 'text-secondary'
  },
  {
    id: 8,
    type: 'Added',
    description: 'Equipment rental: Excavator - $3,500',
    user: 'Manager',
    timestamp: '1 day ago',
    icon: DollarSign,
    color: 'text-primary'
  },
];

const Activity = () => {
  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-4xl font-bold mb-2">Activity Logs</h1>
        <p className="text-muted-foreground">Track all system activities and changes</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 glass">
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
            
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="relative pl-12"
                >
                  <div className="absolute left-0 top-1 p-2 rounded-xl bg-gradient-primary">
                    <activity.icon className="h-4 w-4 text-white" />
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant={
                            activity.type === 'Added' 
                              ? 'default' 
                              : activity.type === 'Updated' 
                              ? 'secondary' 
                              : 'destructive'
                          }
                        >
                          {activity.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">by {activity.user}</span>
                      </div>
                      <p className="font-medium mb-1">{activity.description}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Activity;
