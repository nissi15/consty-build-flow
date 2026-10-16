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
  X,
  FileBarChart,
  Building2,
  ChevronDown,
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
  { icon: FileBarChart, label: 'Reports', path: '/reports' },
  { icon: Clock, label: 'Activity', path: '/activity' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface SidebarProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

const Sidebar = ({ mobileMenuOpen = false, setMobileMenuOpen }: SidebarProps) => {
  const isMobile = useIsMobile();

  const NavContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <nav className="space-y-1">
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
                'flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150',
                isActive
                  ? 'bg-[#eaf3ff] text-[#06f] dark:bg-[#0b2d52] dark:text-[#66aaff]'
                  : 'text-[#4d5156] hover:bg-[#f4f5f7] hover:text-black dark:text-[#a9adb4] dark:hover:bg-[#18191b] dark:hover:text-white'
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
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
        <SheetContent side="left" className="w-72 border-r border-[#e3e5e8] bg-white p-5 dark:border-[#252629] dark:bg-[#0f1011]">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-semibold tracking-tight">CONSTY</SheetTitle>
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
      className="sticky top-[65px] z-40 hidden h-[calc(100vh-65px)] w-56 shrink-0 border-r border-[#e3e5e8] bg-white p-4 dark:border-[#252629] dark:bg-[#0f1011] lg:flex lg:flex-col"
    >
      <NavContent />
      <div className="mt-auto rounded-xl border border-[#e3e5e8] bg-[#fafafa] p-3 dark:border-[#292b2f] dark:bg-[#151617]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f1f3] dark:bg-[#232529]">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">Project</p>
            <p className="truncate text-sm font-medium">Musanze Town Buildings</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Musanze District, Rwanda</p>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
