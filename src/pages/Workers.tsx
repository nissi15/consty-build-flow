import { motion } from 'framer-motion';
import { Plus, Search, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useWorkers } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import toast from 'react-hot-toast';

const Workers = () => {
  const { workers, loading } = useWorkers();
  const [search, setSearch] = useState('');
  const [isAddingWorker, setIsAddingWorker] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    role: '',
    daily_rate: '',
    lunch_allowance: '50',
  });

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddWorker = async () => {
    if (!newWorker.name || !newWorker.role || !newWorker.daily_rate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsAddingWorker(true);
    const { error } = await supabase.from('workers').insert({
      name: newWorker.name,
      role: newWorker.role,
      daily_rate: parseFloat(newWorker.daily_rate),
      lunch_allowance: parseFloat(newWorker.lunch_allowance),
    });

    if (error) {
      toast.error('Failed to add worker');
      console.error(error);
    } else {
      toast.success(`Worker ${newWorker.name} added successfully!`);
      setNewWorker({ name: '', role: '', daily_rate: '', lunch_allowance: '50' });
      
      await supabase.from('activity_log').insert({
        message: `New worker added: ${newWorker.name}`,
        action_type: 'worker',
      });
    }
    setIsAddingWorker(false);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

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
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Worker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Worker</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={newWorker.role}
                  onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value })}
                  placeholder="Foreman, Electrician, etc."
                />
              </div>
              <div>
                <Label htmlFor="daily_rate">Daily Rate ($) *</Label>
                <Input
                  id="daily_rate"
                  type="number"
                  value={newWorker.daily_rate}
                  onChange={(e) => setNewWorker({ ...newWorker, daily_rate: e.target.value })}
                  placeholder="350"
                />
              </div>
              <div>
                <Label htmlFor="lunch_allowance">Lunch Allowance ($)</Label>
                <Input
                  id="lunch_allowance"
                  type="number"
                  value={newWorker.lunch_allowance}
                  onChange={(e) => setNewWorker({ ...newWorker, lunch_allowance: e.target.value })}
                  placeholder="50"
                />
              </div>
              <Button onClick={handleAddWorker} disabled={isAddingWorker} className="w-full">
                {isAddingWorker ? 'Adding...' : 'Add Worker'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4 glass">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search workers..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Card>
      </motion.div>

      <div className="grid gap-4">
        {filteredWorkers.map((worker, index) => (
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
                    <p className="text-sm text-muted-foreground">Daily Rate</p>
                    <p className="font-medium">${worker.daily_rate}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-sm text-muted-foreground">Lunch</p>
                    <p className="font-medium">${worker.lunch_allowance}</p>
                  </div>
                  <Badge variant={worker.is_active ? 'default' : 'secondary'}>
                    {worker.is_active ? 'Active' : 'Inactive'}
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
