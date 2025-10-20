import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActivityLog } from '@/hooks/useActivityLog';
import { format } from 'date-fns';

const getActionIcon = (type: string) => {
  switch (type) {
    case 'worker':
      return '👷';
    case 'attendance':
      return '📅';
    case 'expense':
      return '💰';
    case 'budget':
      return '📊';
    default:
      return '📝';
  }
};

export function ActivityLog() {
  const { activities, loading } = useActivityLog(10);

  if (loading) {
    return (
      <Card className="p-6 glass">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Latest actions and updates</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 glass">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">Latest actions and updates</p>
      </div>
      {activities.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No recent activity found.</p>
          <p className="text-sm">Activity will appear here as you use the system.</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px] pr-4">
          <AnimatePresence mode="popLayout">
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex items-start gap-4 py-3 border-b last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-lg">
                  {getActionIcon(activity.action_type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(activity.created_at), 'MMM d, yyyy HH:mm')}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      )}
    </Card>
  );
}
