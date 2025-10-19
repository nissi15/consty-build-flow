import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  PiggyBank,
  Clock,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Workers', path: '/workers' },
  { icon: Calendar, label: 'Attendance', path: '/attendance' },
  { icon: DollarSign, label: 'Payroll', path: '/payroll' },
  { icon: TrendingUp, label: 'Expenses', path: '/expenses' },
  { icon: PiggyBank, label: 'Budget', path: '/budget' },
  { icon: Clock, label: 'Activity Logs', path: '/activity' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = () => {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="w-64 h-screen sticky top-0 glass border-r p-6 hidden lg:block"
    >
      <nav className="space-y-2">
        {navItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gradient-primary text-white shadow-lg'
                    : 'hover:bg-muted'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
