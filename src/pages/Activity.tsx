import { motion } from 'framer-motion';
import { Activity as ActivityIcon, Clock, UserPlus, DollarSign, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useActivityLog } from '@/hooks/useSupabaseData';
import { useProject } from '@/contexts/ProjectContext';
import { format } from 'date-fns';

const getActionIcon = (actionType: string | null) => {
  switch (actionType) {
    case 'worker':
      return <UserPlus className="h-5 w-5" />;
    case 'attendance':
      return <Calendar className="h-5 w-5" />;
    case 'expense':
      return <DollarSign className="h-5 w-5" />;
    default:
      return <ActivityIcon className="h-5 w-5" />;
  }
};

const getActionColor = (actionType: string | null) => {
  switch (actionType) {
    case 'worker':
      return 'bg-blue-500/10 text-blue-500';
    case 'attendance':
      return 'bg-green-500/10 text-green-500';
    case 'expense':
      return 'bg-orange-500/10 text-orange-500';
    default:
      return 'bg-gray-500/10 text-gray-500';
  }
};

const Activity = () => {
  const { currentProject } = useProject();
  const { activityLog, loading } = useActivityLog(currentProject?.id);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="text-4xl font-bold mb-2">Activity Log</h1>
        <p className="text-muted-foreground">Track all system activities and changes</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 glass">
          <div className="space-y-4">
            {activityLog.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No activity logs yet
              </div>
            ) : (
              activityLog.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all"
                >
                  <div className={`p-3 rounded-xl ${getActionColor(log.action_type)}`}>
                    {getActionIcon(log.action_type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-1">{log.message}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {format(new Date(log.created_at), 'PPp')}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {log.action_type || 'system'}
                  </Badge>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Activity;
