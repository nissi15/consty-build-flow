import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck2,
  Check,
  ChevronRight,
  Clock3,
  HardHat,
  MapPin,
  Menu,
  ShieldCheck,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const modules = [
  {
    icon: Users,
    number: '01',
    title: 'Workforce',
    description: 'Keep worker records, roles, rates, contacts, and site assignments in one dependable register.',
  },
  {
    icon: CalendarCheck2,
    number: '02',
    title: 'Attendance',
    description: 'Mark the day quickly, see who is missing, and preserve a clear history for every worker.',
  },
  {
    icon: WalletCards,
    number: '03',
    title: 'Payroll',
    description: 'Turn approved attendance into transparent RWF wage calculations, allowances, and reports.',
  },
  {
    icon: BarChart3,
    number: '04',
    title: 'Cost control',
    description: 'Compare budgets with actual expenses and catch cost drift before it becomes a project problem.',
  },
];

const workflow = [
  {
    step: 'Start the day',
    title: 'Know who is on site.',
    description: 'Supervisors record attendance from a phone while management sees the same status immediately.',
  },
  {
    step: 'Close the day',
    title: 'Approve time and allowances.',
    description: 'Review hours, lunch allowances, and exceptions before they become payroll entries.',
  },
  {
    step: 'Run the week',
    title: 'Pay accurately. Report clearly.',
    description: 'Generate RWF payroll and keep labour spending visible alongside the project budget.',
  },
];

const ProductPreview = () => (
  <div className="relative mx-auto w-full max-w-2xl">
    <div className="absolute -inset-8 rounded-[2.5rem] bg-[#a56f46]/10 blur-3xl" />
    <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#151918] shadow-[0_36px_90px_rgba(0,0,0,0.38)]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d6ad83] text-[#161917]">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#f4f0e8]">Musanze Town Buildings</p>
            <p className="text-xs text-[#8f9994]">Site operations overview</p>
          </div>
        </div>
        <span className="hidden rounded-full border border-white/10 px-3 py-1 text-[11px] text-[#aeb6b1] sm:inline-flex">
          Illustrative workspace
        </span>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
        {[
          ['Workers', '14', '12 active today'],
          ['Attendance', '86%', '2 entries pending'],
          ['Labour this week', 'RWF 482K', 'Within plan'],
        ].map(([label, value, note]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#79837e]">{label}</p>
            <p className="mt-2 text-xl font-semibold text-[#f4f0e8]">{value}</p>
            <p className="mt-1 text-xs text-[#9ea7a2]">{note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 px-4 pb-4 sm:grid-cols-[1.2fr_0.8fr] sm:px-6 sm:pb-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#e6e1d8]">Today’s workforce</p>
              <p className="mt-1 text-xs text-[#828d87]">Thursday · Musanze</p>
            </div>
            <span className="rounded-full bg-[#31483a] px-2.5 py-1 text-[11px] font-medium text-[#dbe8df]">Live</span>
          </div>
          <div className="mt-5 space-y-3">
            {[
              ['Foremen', 2, 'Present'],
              ['Skilled workers', 6, 'Present'],
              ['Assistants', 4, '2 pending'],
            ].map(([role, count, state]) => (
              <div key={role} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-t border-white/[0.07] pt-3 text-xs">
                <span className="text-[#bbc2be]">{role}</span>
                <span className="font-semibold text-[#f4f0e8]">{count}</span>
                <span className="w-16 text-right text-[#87918c]">{state}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-[#d7c09e] p-4 text-[#1d211f]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#675845]">Today’s priority</p>
          <p className="mt-3 text-lg font-semibold leading-snug">Finish attendance before payroll review.</p>
          <div className="mt-8 flex items-center gap-2 text-xs font-medium">
            <Clock3 className="h-4 w-4" />
            2 records need attention
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const openProduct = () => navigate(user ? '/dashboard' : '/auth');

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0c0f0e] text-[#f4f0e8] selection:bg-[#d6ad83] selection:text-[#171a18]">
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0c0f0e]/95 backdrop-blur-md">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-3" aria-label="Consty home">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d6ad83]/30 bg-[#d6ad83] text-[#171a18]">
              <HardHat className="h-4 w-4" />
            </span>
            <span className="text-lg font-semibold tracking-[0.18em]">CONSTY</span>
          </button>

          <div className="hidden items-center gap-8 text-sm text-[#aab2ae] md:flex">
            <a href="#product" className="transition-colors hover:text-white">Product</a>
            <a href="#workflow" className="transition-colors hover:text-white">Workflow</a>
            <a href="#modules" className="transition-colors hover:text-white">Modules</a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button onClick={() => navigate('/auth')} className="px-4 py-2 text-sm text-[#c6ccc8] transition-colors hover:text-white">Sign in</button>
            <button onClick={openProduct} className="rounded-lg bg-[#d6ad83] px-5 py-2.5 text-sm font-semibold text-[#171a18] transition-colors hover:bg-[#e2c49f]">
              {user ? 'Open workspace' : 'Get started'}
            </button>
          </div>

          <button
            className="rounded-lg border border-white/10 p-2 text-[#d8ddd9] md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="border-t border-white/[0.08] px-5 py-5 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-[#bcc3bf]">
              <a href="#product" onClick={() => setMobileMenuOpen(false)}>Product</a>
              <a href="#workflow" onClick={() => setMobileMenuOpen(false)}>Workflow</a>
              <a href="#modules" onClick={() => setMobileMenuOpen(false)}>Modules</a>
              <button onClick={openProduct} className="mt-2 rounded-lg bg-[#d6ad83] px-5 py-3 font-semibold text-[#171a18]">
                {user ? 'Open workspace' : 'Get started'}
              </button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative border-b border-white/[0.07]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.88fr_1.12fr] lg:py-32">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#b8bfbb]">
                <MapPin className="h-3.5 w-3.5 text-[#d6ad83]" />
                Built for construction operations in Rwanda
              </div>
              <h1 className="max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                Run the site. <span className="text-[#d6ad83]">Know the numbers.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#aeb6b1]">
                Consty brings workers, attendance, RWF payroll, expenses, and project budgets into one clear operating view.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button onClick={openProduct} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d6ad83] px-6 py-3.5 font-semibold text-[#171a18] transition-colors hover:bg-[#e2c49f]">
                  {user ? 'Open your workspace' : 'Create your workspace'}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a href="#workflow" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/12 px-6 py-3.5 font-medium text-[#d9dedb] transition-colors hover:bg-white/[0.05]">See how it works</a>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#8f9994]">
                {['RWF payroll', 'Field attendance', 'Budget control'].map((item) => (
                  <span key={item} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#d6ad83]" /> {item}</span>
                ))}
              </div>
            </div>
            <ProductPreview />
          </div>
        </section>

        <section id="product" className="border-b border-[#ddd6c9] bg-[#f1eee7] text-[#171a18]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c633f]">One operating record</p>
                <h2 className="mt-5 max-w-md text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Less chasing. Fewer surprises.</h2>
              </div>
              <div className="grid gap-8 sm:grid-cols-2">
                <p className="text-lg leading-8 text-[#515954]">Site information often lives across notebooks, messages, and spreadsheets. Consty keeps the daily record connected from attendance to payroll and cost reporting.</p>
                <div className="space-y-4 border-l border-[#d0c8ba] pl-6 text-sm text-[#515954]">
                  {['One source of truth for the project team', 'Clear RWF calculations and audit trails', 'Designed for phone and desktop use'].map((item) => (
                    <div key={item} className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#7f5a3b]" /><span>{item}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="bg-[#f8f6f1] text-[#171a18]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c633f]">A practical daily rhythm</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">From morning roll call to weekly payroll.</h2>
            </div>
            <div className="mt-14 grid border-y border-[#dcd6cc] lg:grid-cols-3">
              {workflow.map((item, index) => (
                <article key={item.step} className="border-b border-[#dcd6cc] py-8 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0">
                  <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7f5a3b]">{item.step}</span><span className="font-mono text-xs text-[#9a948b]">0{index + 1}</span></div>
                  <h3 className="mt-12 text-2xl font-semibold tracking-[-0.02em]">{item.title}</h3>
                  <p className="mt-4 leading-7 text-[#5e655f]">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="modules" className="border-y border-white/[0.07] bg-[#101412]">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d6ad83]">Core modules</p><h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">The essentials, connected.</h2></div>
              <p className="max-w-md leading-7 text-[#9fa8a3]">Each module works on its own. Together, they create a reliable operating picture for the entire site.</p>
            </div>
            <div className="mt-14 grid overflow-hidden rounded-2xl border border-white/10 sm:grid-cols-2">
              {modules.map((module) => (
                <article key={module.title} className="group border-b border-white/10 p-7 transition-colors hover:bg-white/[0.035] sm:p-9 sm:odd:border-r">
                  <div className="flex items-center justify-between"><module.icon className="h-5 w-5 text-[#d6ad83]" /><span className="font-mono text-xs text-[#657069]">{module.number}</span></div>
                  <h3 className="mt-12 text-2xl font-semibold">{module.title}</h3>
                  <p className="mt-3 max-w-md leading-7 text-[#99a29d]">{module.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#d7c09e] text-[#171a18]">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#73543a]">Rwanda › Musanze District › Musanze Town Buildings</p>
              <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Put your site operations into one clear view.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#554b3e]">Start with your workforce today. Add attendance, payroll, and project cost control as your operation grows.</p>
            </div>
            <button onClick={openProduct} className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#171a18] px-7 py-4 font-semibold text-[#f7f3eb] transition-colors hover:bg-[#2c312e]">
              {user ? 'Open workspace' : 'Get started'}<ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.08] bg-[#0c0f0e]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm text-[#7f8983] sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-[#d8ddd9]"><HardHat className="h-4 w-4 text-[#d6ad83]" /><span className="font-semibold tracking-[0.16em]">CONSTY</span></div>
          <p>© {new Date().getFullYear()} Consty. Construction operations, clearly managed.</p>
          <a href="https://github.com/nissi15/consty-build-flow" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">View project</a>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
