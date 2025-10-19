import { motion } from 'framer-motion';
import { Plus, Search, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const workers = [
  { id: 1, name: 'John Smith', role: 'Foreman', status: 'Active', phone: '555-0101', projects: 3 },
  { id: 2, name: 'Sarah Johnson', role: 'Electrician', status: 'Active', phone: '555-0102', projects: 2 },
  { id: 3, name: 'Mike Davis', role: 'Plumber', status: 'Active', phone: '555-0103', projects: 4 },
  { id: 4, name: 'Emily Brown', role: 'Carpenter', status: 'On Leave', phone: '555-0104', projects: 1 },
  { id: 5, name: 'David Wilson', role: 'Mason', status: 'Active', phone: '555-0105', projects: 2 },
  { id: 6, name: 'Lisa Anderson', role: 'Painter', status: 'Active', phone: '555-0106', projects: 3 },
];

const Workers = () => {
  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Workers</h1>
          <p className="text-muted-foreground">Manage your workforce</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Worker
        </Button>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4 glass">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search workers..." className="pl-10" />
          </div>
        </Card>
      </motion.div>

      <div className="grid gap-4">
        {workers.map((worker, index) => (
          <motion.div
            key={worker.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card className="p-6 glass hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                      {worker.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{worker.name}</h3>
                    <p className="text-sm text-muted-foreground">{worker.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{worker.phone}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-sm text-muted-foreground">Projects</p>
                    <p className="font-medium">{worker.projects}</p>
                  </div>
                  <Badge variant={worker.status === 'Active' ? 'default' : 'secondary'}>
                    {worker.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Workers;
