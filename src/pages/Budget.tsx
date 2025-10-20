import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const projects = [
  { 
    id: 1, 
    name: 'Downtown Tower', 
    budget: 250000, 
    spent: 180000, 
    remaining: 70000,
    status: 'On Track'
  },
  { 
    id: 2, 
    name: 'Riverside Complex', 
    budget: 180000, 
    spent: 150000, 
    remaining: 30000,
    status: 'Warning'
  },
  { 
    id: 3, 
    name: 'Highway Bridge', 
    budget: 420000, 
    spent: 280000, 
    remaining: 140000,
    status: 'On Track'
  },
  { 
    id: 4, 
    name: 'Shopping Mall', 
    budget: 350000, 
    spent: 340000, 
    remaining: 10000,
    status: 'Critical'
  },
];

const Budget = () => {
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const totalRemaining = projects.reduce((sum, p) => sum + p.remaining, 0);

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Budget</h1>
          <p className="text-muted-foreground">Monitor project budgets and spending</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 glass">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground">Total Budget</p>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-3xl font-bold">RWF {totalBudget.toLocaleString()}</h3>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-6 glass">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground">Total Spent</p>
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <h3 className="text-3xl font-bold">RWF {totalSpent.toLocaleString()}</h3>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 glass">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground">Remaining</p>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-3xl font-bold">RWF {totalRemaining.toLocaleString()}</h3>
          </Card>
        </motion.div>
      </div>

      <div className="space-y-4">
        {projects.map((project, index) => {
          const percentSpent = (project.spent / project.budget) * 100;
          const isWarning = percentSpent > 85;
          const isCritical = percentSpent > 95;

          return (
            <motion.div
              key={project.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Card className="p-6 glass hover:shadow-lg transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Budget: RWF {project.budget.toLocaleString()}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isCritical 
                        ? 'bg-destructive/20 text-destructive' 
                        : isWarning 
                        ? 'bg-secondary/20 text-secondary-foreground' 
                        : 'bg-primary/20 text-primary'
                    }`}>
                      {project.status}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spent: RWF {project.spent.toLocaleString()}</span>
                      <span>Remaining: RWF {project.remaining.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={percentSpent} 
                      className="h-3"
                    />
                    <p className="text-sm text-muted-foreground text-right">
                      {percentSpent.toFixed(1)}% used
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Budget;
