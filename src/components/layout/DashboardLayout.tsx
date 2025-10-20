import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100">
      <Navbar showMenuButton={true} />
      <div className="flex w-full min-h-screen">
        <Sidebar />
        <main className="flex-1 bg-slate-50 dark:bg-[#0B1120]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
