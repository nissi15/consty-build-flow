import { Moon, Sun, Menu, LogOut, Building2, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const Navbar = ({ onMenuClick, showMenuButton = false }: NavbarProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin, signOut } = useAuth();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 h-[65px] border-b border-[#e3e5e8] bg-white/95 px-4 backdrop-blur-xl dark:border-[#252629] dark:bg-[#0f1011]/95 sm:px-6"
    >
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          {showMenuButton && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-[0.08em] sm:text-lg">CONSTY</span>
          </div>
          {user && isAdmin && (
            <span className="rounded-full bg-[#f1f2f4] px-2 py-1 text-xs font-medium text-[#555b63] dark:bg-[#222428] dark:text-[#bac0c8]">
              Admin
            </span>
          )}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777d85]" />
            <input aria-label="Search" placeholder="Search workers, expenses, reports…" className="h-9 w-80 rounded-lg border border-[#e0e2e5] bg-[#fafafa] pl-9 pr-3 text-sm outline-none transition focus:border-[#9fc8ff] focus:ring-2 focus:ring-[#06f]/10 dark:border-[#303236] dark:bg-[#17181a]" />
          </div>
          <Button variant="ghost" size="icon" aria-label="Notifications"><Bell className="h-[18px] w-[18px]" /></Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative overflow-hidden"
          >
            <motion.div
              initial={false}
              animate={{ rotate: theme === 'dark' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </motion.div>
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#eceef1] text-sm font-medium text-[#26292d] dark:bg-[#282a2e] dark:text-white">
                      {user?.email?.[0].toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {isAdmin ? 'Administrator' : 'Worker'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
