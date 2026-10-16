import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, BarChart3, Bell, Box, CalendarDays, ChevronRight,
  ClipboardCheck, FileBarChart, FileText, HardHat, MapPin, Menu, PlayCircle,
  Search, Settings, Users, X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const featureStrip = [
  { icon: HardHat, title: 'Workforce & Attendance', text: "Know who's on site, in real time" },
  { icon: FileText, title: 'Payroll', text: 'Accurate and compliant' },
  { icon: Box, title: 'Materials', text: 'Track usage and stock' },
  { icon: BarChart3, title: 'Budget & Costs', text: 'Keep projects on track' },
];

const lowerCards = [
  { icon: Users, title: 'Workforce Management', text: 'Track teams, skills and attendance directly from site.' },
  { icon: FileText, title: 'Payroll', text: 'Process wages, deductions and reports with confidence.' },
  { icon: Box, title: 'Materials Tracking', text: 'Control stock, usage and procurement.' },
  { icon: BarChart3, title: 'Budget & Reporting', text: 'Get real-time costs and keep projects on track.' },
];

const dashboardNav = [
  [ClipboardCheck, 'Projects', true], [Users, 'Workforce', false], [CalendarDays, 'Attendance', false],
  [FileText, 'Payroll', false], [Box, 'Materials', false], [BarChart3, 'Budget', false], [FileBarChart, 'Reports', false],
] as const;

function DashboardPreview() {
  return (
    <div className="mx-auto w-full max-w-[1030px] overflow-hidden rounded-t-[28px] border border-black/20 bg-white shadow-[0_28px_80px_rgba(0,0,0,.13)]">
      <div className="flex h-9 items-center gap-2 border-b bg-[#fafafa] px-4"><i className="h-2.5 w-2.5 rounded-full border border-black/15" /><i className="h-2.5 w-2.5 rounded-full border border-black/15" /><i className="h-2.5 w-2.5 rounded-full border border-black/15" /></div>
      <div className="grid min-h-[390px] grid-cols-[150px_1fr] sm:grid-cols-[170px_1fr]">
        <aside className="border-r bg-[#fbfbfc] p-4 sm:p-5">
          <div className="mb-7 text-lg font-bold tracking-tight">CONSTY</div>
          <nav className="space-y-1">{dashboardNav.map(([Icon, label, active]) => <div key={label} className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-[10px] sm:text-xs ${active ? 'bg-[#eaf2ff] text-[#0071e3]' : 'text-[#565a61]'}`}><Icon className="h-3.5 w-3.5" /><span>{label}</span></div>)}</nav>
          <div className="mt-14 flex items-center gap-2 px-2.5 text-xs text-[#565a61]"><Settings className="h-3.5 w-3.5" /> Settings</div>
        </aside>
        <div className="min-w-0 p-4 sm:p-5">
          <div className="flex items-center justify-between border-b pb-3"><div className="text-[9px] text-[#8a8e95]">Projects　›　Musanze Town Buildings</div><div className="flex items-center gap-3"><div className="hidden h-7 w-40 items-center gap-2 rounded-md border px-2 text-[9px] text-[#8a8e95] sm:flex"><Search className="h-3 w-3" /> Search...</div><Bell className="h-3.5 w-3.5" /><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e9eaec] text-[10px] font-semibold">C</span></div></div>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-3"><div><h3 className="text-lg font-semibold tracking-[-.03em] sm:text-xl">Musanze Town Buildings</h3><div className="mt-2 flex flex-wrap items-center gap-3 text-[9px] text-[#73777f]"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Rwanda / Musanze District</span><span className="rounded-full bg-[#eaf2ff] px-2 py-1 text-[#0071e3]">● In Progress</span><span>Jan 2024 – Dec 2025</span></div></div><button className="rounded-md border px-3 py-2 text-[9px]">Project settings</button></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{[
            ['Total Budget', 'RWF 450,000,000', '65% spent'], ['Workforce on Site', '90', '78 present · 12 absent'], ['Materials This Month', 'RWF 18,320,000', '↗ 12% from last month'], ['Project Progress', '62%', '██████░░░░'],
          ].map(([label, value, note]) => <div key={label} className="rounded-lg border p-3"><p className="text-[8px] text-[#777b82]">{label}</p><p className="mt-1 text-xs font-semibold sm:text-sm">{value}</p><p className={`mt-2 text-[8px] ${note.includes('↗') ? 'text-[#15945c]' : 'text-[#777b82]'}`}>{note}</p></div>)}</div>
          <div className="mt-3 grid gap-2 lg:grid-cols-[1fr_1.1fr_.95fr]">
            <div className="rounded-lg border p-3"><div className="mb-3 flex justify-between text-[9px] font-semibold"><span>Site Attendance</span><span>View all →</span></div>{[['Today, 16 Oct 2026', '78 / 90'], ['Skilled workers', '28 / 32'], ['General workers', '42 / 50'], ['Supervisors', '8 / 8']].map(([label, count], index) => <div key={label} className="flex items-center justify-between border-t py-2 text-[8px]"><span>{label}</span><strong>{count}</strong><span className="h-1 w-14 rounded-full bg-[#eceef1]"><i className="block h-full rounded-full bg-[#0071e3]" style={{ width: `${[87, 88, 84, 100][index]}%` }} /></span></div>)}</div>
            <div className="rounded-lg border p-3"><div className="mb-3 flex justify-between text-[9px] font-semibold"><span>Recent Materials</span><span>View all →</span></div>{[['Cement (50kg)', 'RWF 5,040,000'], ['Steel Rebar (12mm)', 'RWF 3,180,000'], ['Blocks (15cm)', 'RWF 1,140,000'], ['River Sand', 'RWF 870,000']].map(([item, price]) => <div key={item} className="grid grid-cols-[1fr_auto] border-t py-2 text-[8px]"><span>{item}</span><strong>{price}</strong></div>)}</div>
            <div className="rounded-lg border p-3"><div className="flex justify-between text-[9px] font-semibold"><span>Budget Overview</span><span>View details →</span></div><div className="mt-4 flex items-center gap-4"><div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#0071e3_0_42%,#aeb3bb_42%_70%,#e3e5e8_70%)]"><div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-white"><b className="text-xs">65%</b><span className="text-[7px]">used</span></div></div><div className="space-y-1.5 text-[7px]"><p>● Materials　42%</p><p className="text-[#777b82]">● Labour　28%</p><p className="text-[#777b82]">● Equipment　12%</p><p className="text-[#777b82]">● Other　18%</p></div></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const openProduct = () => navigate(user ? '/dashboard' : '/auth');

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#090a0b] selection:bg-black selection:text-white">
      <header className="relative z-50 border-b border-black/[.05] bg-white/95 backdrop-blur-xl">
        <nav className="mx-auto flex h-[62px] max-w-[1290px] items-center justify-between px-5 lg:px-8">
          <button onClick={() => navigate('/')} className="text-lg font-bold tracking-[-.03em]">CONSTY</button>
          <div className="hidden items-center gap-10 text-sm md:flex"><a href="#product">Product</a><a href="#solutions">Solutions</a><a href="#pricing">Pricing</a><a href="#resources">Resources</a><a href="#company">Company</a></div>
          <div className="hidden items-center gap-7 md:flex"><button onClick={() => navigate('/auth')} className="text-sm">Sign in</button><button onClick={openProduct} className="flex items-center gap-3 rounded-lg bg-[#090a0b] px-5 py-3 text-sm font-medium text-white">Get started <ArrowRight className="h-4 w-4" /></button></div>
          <button className="rounded-md border p-2 md:hidden" onClick={() => setMobileMenuOpen(value => !value)}>{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </nav>
        {mobileMenuOpen && <div className="border-t bg-white p-5 md:hidden"><div className="flex flex-col gap-4 text-sm"><a href="#product">Product</a><a href="#solutions">Solutions</a><a href="#pricing">Pricing</a><button onClick={openProduct} className="rounded-lg bg-black px-5 py-3 text-white">Open workspace</button></div></div>}
      </header>

      <main>
        <section id="product" className="relative min-h-[850px] overflow-hidden pt-10 sm:pt-12 lg:min-h-[805px]">
          <img src="/images/musanze-construction-hero.png" alt="Musanze construction site beneath the Virunga mountains" className="pointer-events-none absolute inset-x-0 bottom-0 h-[76%] w-full object-cover object-bottom" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-white/25 to-transparent" />
          <div className="relative z-10 mx-auto max-w-[1290px] px-5 text-center lg:px-8">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3.5 py-2 text-xs shadow-sm backdrop-blur"><MapPin className="h-3.5 w-3.5" /> Rwanda / Musanze District</div>
            <h1 className="mx-auto mt-5 max-w-[900px] text-5xl font-semibold leading-[.98] tracking-[-.065em] sm:text-6xl lg:text-[68px]">Construction, under control.</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-7 text-[#62666d] sm:text-xl">Manage your workforce, attendance, payroll, materials and budget<br className="hidden sm:block" /> in one simple system — built for construction in Rwanda.</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row"><button onClick={openProduct} className="flex min-w-48 items-center justify-center gap-3 rounded-lg bg-black px-6 py-3.5 text-sm font-medium text-white shadow-lg">Open workspace <ArrowRight className="h-4 w-4" /></button><button className="flex min-w-40 items-center justify-center gap-3 rounded-lg bg-[#f0f1f2] px-6 py-3.5 text-sm font-medium"><PlayCircle className="h-5 w-5" /> Watch demo</button></div>
            <div className="mx-auto mt-8 grid max-w-[780px] grid-cols-2 divide-x border-y border-black/10 bg-white/35 py-4 text-left backdrop-blur-sm lg:grid-cols-4">{featureStrip.map(({ icon: Icon, title, text }) => <div key={title} className="flex items-center gap-3 px-4"><Icon className="h-6 w-6 shrink-0" strokeWidth={1.8} /><div><p className="text-xs font-semibold">{title}</p><p className="mt-0.5 text-[9px] text-[#62666d]">{text}</p></div></div>)}</div>
            <div className="mt-6"><DashboardPreview /></div>
          </div>
        </section>

        <section id="solutions" className="relative z-20 border-y bg-white"><div className="mx-auto grid max-w-[1290px] gap-3 px-5 py-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">{lowerCards.map(({ icon: Icon, title, text }) => <article key={title} className="group flex min-h-24 items-center gap-4 rounded-xl border border-black/[.08] p-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f2f3f5]"><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs leading-5 text-[#73777f]">{text}</p></div><ChevronRight className="h-4 w-4 text-[#777b82]" /></article>)}</div></section>

        <section id="pricing" className="bg-[#f5f5f7]"><div className="mx-auto grid max-w-[1290px] gap-12 px-5 py-24 lg:grid-cols-[.75fr_1.25fr] lg:px-8"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#777b82]">Built for real operations</p><h2 className="mt-5 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">Every project number, connected.</h2></div><div className="grid gap-4 sm:grid-cols-3">{[['90', 'workers in the demo portfolio'], ['11', 'months of operating history'], ['RWF 450M', 'tracked project budget']].map(([value, label]) => <div key={label} className="rounded-2xl border bg-white p-6"><strong className="text-3xl tracking-[-.04em]">{value}</strong><p className="mt-6 text-sm leading-6 text-[#656970]">{label}</p></div>)}</div></div></section>

        <section id="resources" className="bg-black text-white"><div className="mx-auto flex max-w-[1290px] flex-col justify-between gap-8 px-5 py-20 lg:flex-row lg:items-center lg:px-8"><div><p className="text-xs uppercase tracking-[.18em] text-white/50">Rwanda · Musanze District</p><h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-.045em] sm:text-5xl">Keep the site moving and the numbers honest.</h2></div><button onClick={openProduct} className="flex items-center justify-center gap-3 rounded-lg bg-white px-7 py-4 font-medium text-black">Get started <ArrowRight className="h-4 w-4" /></button></div></section>
      </main>

      <footer id="company" className="border-t"><div className="mx-auto flex max-w-[1290px] flex-col gap-5 px-5 py-9 text-sm text-[#777b82] sm:flex-row sm:items-center sm:justify-between lg:px-8"><strong className="text-black">CONSTY</strong><span>© {new Date().getFullYear()} Consty. Construction operations, clearly managed.</span><a href="https://github.com/nissi15/consty-build-flow" target="_blank" rel="noreferrer">View project</a></div></footer>
    </div>
  );
}
