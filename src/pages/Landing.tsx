import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, BarChart3, Box, ChevronRight, FileText, HardHat,
  MapPin, Menu, Users, X,
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

const navItems = [
  { label: 'Product', section: 'product' },
  { label: 'Capabilities', section: 'solutions' },
  { label: 'Results', section: 'results' },
];

function DashboardPreview() {
  return (
    <img
      src="/images/consty-dashboard-preview.svg"
      alt="Consty project dashboard for Musanze Town Buildings"
      className="mx-auto block h-auto w-full"
      style={{ maxWidth: 1030 }}
    />
  );
}

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const openProduct = () => navigate(user ? '/dashboard' : '/auth');
  const scrollToSection = (section: string) => {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${section}`);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const section = window.location.hash.slice(1);
    if (!section) return;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(section)?.scrollIntoView({ block: 'start' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#090a0b] selection:bg-black selection:text-white">
      <header className="relative z-50 border-b border-black/[.05] bg-white/95 backdrop-blur-xl">
        <nav className="mx-auto flex h-[62px] max-w-[1290px] items-center justify-between px-5 lg:px-8">
          <button onClick={() => navigate('/')} className="text-lg font-bold tracking-[-.03em]">CONSTY</button>
          <div className="hidden items-center gap-10 text-sm md:flex">
            {navItems.map(item => (
              <button key={item.section} onClick={() => scrollToSection(item.section)} className="transition-colors hover:text-black/55">
                {item.label}
              </button>
            ))}
          </div>
          <div className="hidden items-center gap-7 md:flex"><button onClick={() => navigate('/auth')} className="text-sm">Sign in</button><button onClick={openProduct} className="flex items-center gap-3 rounded-lg bg-[#090a0b] px-5 py-3 text-sm font-medium text-white">Get started <ArrowRight className="h-4 w-4" /></button></div>
          <button className="rounded-md border p-2 md:hidden" onClick={() => setMobileMenuOpen(value => !value)}>{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </nav>
        {mobileMenuOpen && <div className="border-t bg-white p-5 md:hidden"><div className="flex flex-col gap-4 text-sm">{navItems.map(item => <button key={item.section} onClick={() => scrollToSection(item.section)} className="text-left">{item.label}</button>)}<button onClick={openProduct} className="rounded-lg bg-black px-5 py-3 text-white">Open workspace</button></div></div>}
      </header>

      <main>
        <section id="product" className="relative min-h-[850px] overflow-hidden pt-10 sm:pt-12 lg:min-h-[805px]">
          <img src="/images/musanze-construction-hero.png" alt="Musanze construction site beneath the Virunga mountains" className="pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom" />
          <div className="relative z-10 mx-auto max-w-[1290px] px-5 text-center lg:px-8">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3.5 py-2 text-xs shadow-sm backdrop-blur"><MapPin className="h-3.5 w-3.5" /> Rwanda / Musanze District</div>
            <h1 className="mx-auto mt-5 max-w-[900px] text-5xl font-semibold leading-[.98] tracking-[-.065em] sm:text-6xl lg:text-[68px]">Construction, under control.</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-7 text-[#62666d] sm:text-xl">Manage your workforce, attendance, payroll, materials and budget<br className="hidden sm:block" /> in one simple system — built for construction in Rwanda.</p>
            <div className="mt-6 flex items-center justify-center"><button onClick={openProduct} className="flex min-w-48 items-center justify-center gap-3 rounded-lg bg-black px-6 py-3.5 text-sm font-medium text-white shadow-lg">Open workspace <ArrowRight className="h-4 w-4" /></button></div>
            <div className="mx-auto mt-8 grid max-w-[780px] grid-cols-2 divide-x border-y border-black/10 bg-white/35 py-4 text-left backdrop-blur-sm lg:grid-cols-4">{featureStrip.map(({ icon: Icon, title, text }) => <div key={title} className="flex items-center gap-3 px-4"><Icon className="h-6 w-6 shrink-0" strokeWidth={1.8} /><div><p className="text-xs font-semibold">{title}</p><p className="mt-0.5 text-[9px] text-[#62666d]">{text}</p></div></div>)}</div>
            <div className="mt-6"><DashboardPreview /></div>
          </div>
        </section>

        <section id="solutions" className="relative z-20 border-y bg-white"><div className="mx-auto grid max-w-[1290px] gap-3 px-5 py-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">{lowerCards.map(({ icon: Icon, title, text }) => <article key={title} className="group flex min-h-24 items-center gap-4 rounded-xl border border-black/[.08] p-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f2f3f5]"><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs leading-5 text-[#73777f]">{text}</p></div><ChevronRight className="h-4 w-4 text-[#777b82]" /></article>)}</div></section>

        <section id="results" className="scroll-mt-6 bg-[#f5f5f7]"><div className="mx-auto grid max-w-[1290px] gap-12 px-5 py-24 lg:grid-cols-[.75fr_1.25fr] lg:px-8"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#777b82]">Built for real operations</p><h2 className="mt-5 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">Every project number, connected.</h2></div><div className="grid gap-4 sm:grid-cols-3">{[['90', 'workers in the demo portfolio'], ['11', 'months of operating history'], ['RWF 450M', 'tracked project budget']].map(([value, label]) => <div key={label} className="rounded-2xl border bg-white p-6"><strong className="text-3xl tracking-[-.04em]">{value}</strong><p className="mt-6 text-sm leading-6 text-[#656970]">{label}</p></div>)}</div></div></section>

        <section id="resources" className="bg-black text-white"><div className="mx-auto flex max-w-[1290px] flex-col justify-between gap-8 px-5 py-20 lg:flex-row lg:items-center lg:px-8"><div><p className="text-xs uppercase tracking-[.18em] text-white/50">Rwanda · Musanze District</p><h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-.045em] sm:text-5xl">Keep the site moving and the numbers honest.</h2></div><button onClick={openProduct} className="flex items-center justify-center gap-3 rounded-lg bg-white px-7 py-4 font-medium text-black">Get started <ArrowRight className="h-4 w-4" /></button></div></section>
      </main>

      <footer id="company" className="border-t"><div className="mx-auto flex max-w-[1290px] flex-col gap-5 px-5 py-9 text-sm text-[#777b82] sm:flex-row sm:items-center sm:justify-between lg:px-8"><strong className="text-black">CONSTY</strong><span>© {new Date().getFullYear()} Consty. Construction operations, clearly managed.</span><a href="https://github.com/nissi15/consty-build-flow" target="_blank" rel="noreferrer">View project</a></div></footer>
    </div>
  );
}
