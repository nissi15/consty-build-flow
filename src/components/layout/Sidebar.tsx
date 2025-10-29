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
  Settings,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

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

interface SidebarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

const Sidebar = ({ mobileMenuOpen = false, setMobileMenuOpen }: SidebarProps) => {
  const isMobile = useIsMobile();

  const NavContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <nav className="space-y-2">
      {navItems.map((item, index) => (
        <motion.div
          key={item.path}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: isMobile ? 0 : 0.1 + index * 0.05 }}
        >
          <NavLink
            to={item.path}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        </motion.div>
      ))}
    </nav>
  );

  // Mobile: Use Sheet component
  if (isMobile) {
    return (
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-6 bg-white dark:bg-[#111827] border-r border-slate-300 dark:border-slate-800">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold">Consty</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen?.(false)}
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>
          <NavContent onLinkClick={() => setMobileMenuOpen?.(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Fixed sidebar
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="w-64 h-screen sticky top-0 bg-white dark:bg-[#111827] border-r border-slate-300 dark:border-slate-800 p-6 hidden lg:block shadow-sm z-40"
    >
      <NavContent />
    </motion.aside>
  );
};

export default Sidebar;
