import { Outlet } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { seedDemoPortfolio } from '@/lib/demo-data';
import { toast } from 'sonner';

const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const reconciliationStarted = useRef(false);

  useEffect(() => {
    const key = 'consty-portfolio-reconciled-july-2026-v2';
    if (reconciliationStarted.current || localStorage.getItem(key)) return;
    reconciliationStarted.current = true;
    toast.info('Synchronising project figures through July 2026…');
    seedDemoPortfolio()
      .then(() => {
        localStorage.setItem(key, 'complete');
        toast.success('Project figures are synchronised and activity history now ends on 16 July 2026.');
      })
      .catch((error) => {
        reconciliationStarted.current = false;
        console.error('Portfolio reconciliation failed:', error);
        toast.error('Portfolio synchronisation could not finish. Use Settings to retry.');
      });
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#f7f8fa] text-[#111] dark:bg-[#090a0b] dark:text-[#f5f5f7]">
      <Navbar showMenuButton={true} onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <div className="flex w-full min-h-screen">
        <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <main className="w-full flex-1 overflow-x-hidden bg-[#f7f8fa] dark:bg-[#090a0b]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
