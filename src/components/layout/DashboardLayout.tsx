import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
