import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#f3f0e9] text-[#1a211d] dark:bg-[#0e1210] dark:text-[#f2eee6]">
      <Navbar showMenuButton={true} onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <div className="flex w-full min-h-screen">
        <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <main className="w-full flex-1 overflow-x-hidden bg-[#f3f0e9] dark:bg-[#0e1210]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
