import { Moon, Sun, Menu, LogOut, HardHat, MapPin } from 'lucide-react';
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
      className="sticky top-0 z-50 border-b border-[#ded8cd] bg-[#f8f6f1]/95 px-4 py-3 backdrop-blur-md dark:border-[#27302c] dark:bg-[#111512]/95 sm:px-6"
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          {showMenuButton && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f493b] text-[#f6f1e8] dark:bg-[#d6ad83] dark:text-[#171a18]">
              <HardHat className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-[0.14em] sm:text-lg">CONSTY</span>
          </div>
          {user && isAdmin && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
              Admin
            </span>
          )}
        </div>

        <div className="hidden items-center gap-2 text-sm text-[#59635d] dark:text-[#aeb7b1] lg:flex">
          <MapPin className="h-4 w-4 text-[#9a6a45] dark:text-[#d6ad83]" />
          <span>Rwanda</span>
          <span className="text-[#aaa398]">/</span>
          <span>Musanze District</span>
          <span className="text-[#aaa398]">/</span>
          <span className="font-medium text-[#1d2721] dark:text-[#f1ece4]">Musanze Town Buildings</span>
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
                    <AvatarFallback className="bg-[#2f493b] text-[#f7f3eb] text-sm dark:bg-[#d6ad83] dark:text-[#171a18]">
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
