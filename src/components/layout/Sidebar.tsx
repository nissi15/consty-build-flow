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
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors duration-200',
                isActive
                  ? 'bg-[#2f493b] text-[#f7f3eb] dark:bg-[#d6ad83] dark:text-[#171a18]'
                  : 'text-[#59635d] hover:bg-[#eee9df] hover:text-[#1c241f] dark:text-[#aeb7b1] dark:hover:bg-[#1b211e] dark:hover:text-white'
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
        <SheetContent side="left" className="w-72 border-r border-[#ded8cd] bg-[#f8f6f1] p-6 dark:border-[#27302c] dark:bg-[#111512]">
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
      className="sticky top-0 z-40 hidden h-screen w-64 border-r border-[#ded8cd] bg-[#f8f6f1] p-5 dark:border-[#27302c] dark:bg-[#111512] lg:block"
    >
      <NavContent />
    </motion.aside>
  );
};

export default Sidebar;
