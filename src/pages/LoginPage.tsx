import { ArrowRight, BarChart3, Building2, Database, Eye, FlaskConical, Info, ShieldCheck } from 'lucide-react'
import { useAppState } from '../state/AppState'
import { Button, MlaiMark } from '../components/ui'

const STEPS = [
  { icon: Database, title: 'Import sponsor data', text: 'Upload a CSV of agreed sponsor-impact records, or load the sample.' },
  { icon: Building2, title: 'Select a sponsor', text: 'Filter to one sponsor and their sponsored events.' },
  { icon: BarChart3, title: 'View the impact dashboard', text: 'See the agreed metrics, calculated from the imported records.' },
]

const TEAM = 'FIT2002 IT Project Management · Team 0311 — Ian Wang, Kai-Po Wang, Sabiuddin Ahmed Maheen'

export default function LoginPage() {
  const { login } = useAppState()
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-navy-900 px-12 py-10 text-slate-300 lg:flex 2xl:px-20 2xl:py-14">
        {/* faint dot grid for texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{ backgroundImage: 'radial-gradient(rgb(148 163 184 / 0.18) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
          aria-hidden
        />
        <div className="relative flex items-center gap-3">
          <MlaiMark className="size-11" />
          <div className="leading-tight">
            <p className="text-lg font-semibold tracking-tight text-white">MLAI Sponsor Impact</p>
            <p className="text-sm text-slate-400">Reporting dashboard · Sprint 1 prototype</p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <h2 className="text-[2.1rem] font-bold leading-[1.15] tracking-tight text-white 2xl:text-[2.6rem]">
            One place for the sponsor-impact numbers MLAI already collects.
          </h2>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-slate-300">
            A centralised reporting layer that sits alongside MLAI's existing tools. It consolidates agreed sponsor-impact data and doesn't replace any
            platform.
          </p>
          <div className="mt-8 rounded-xl border border-brand-400/25 bg-brand-400/[0.06] px-4 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">Sprint 1 goal</p>
            <p className="mt-1 text-[0.95rem] leading-relaxed text-slate-200">
              A basic end-to-end prototype: an authorised MLAI user imports sample sponsor-impact data and views key sponsor metrics on a simple
              dashboard.
            </p>
            <p className="mt-2 text-xs text-slate-400">US04 · US01 · US02 · US03 · 16 story points selected (estimated capacity 18)</p>
          </div>
          <ol className="mt-6 space-y-3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex items-start gap-4 rounded-xl bg-white/[0.04] p-4 ring-1 ring-white/[0.06]">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-400/10 text-brand-400">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold text-white">
                    <span className="mr-2 text-slate-500">{i + 1}.</span>
                    {title}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-400">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="relative text-sm text-slate-500">{TEAM}</p>
      </section>

      <section className="flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-8">
        <div className="w-full max-w-md animate-fade-in 2xl:max-w-lg">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <MlaiMark className="size-10" />
            <div className="leading-tight">
              <p className="font-semibold text-slate-900">MLAI Sponsor Impact</p>
              <p className="text-sm text-slate-500">Sprint 1 prototype</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xl shadow-slate-900/[0.04] sm:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider text-brand-800 ring-1 ring-inset ring-brand-100">
                <ShieldCheck className="size-3.5" aria-hidden /> US04 · Authorised access
              </span>
            </div>
            <h1 className="mt-5 text-[1.7rem] font-bold tracking-tight text-slate-900">Sign in to the sponsor dashboard</h1>
            <p className="mt-2 leading-relaxed text-slate-600">
              Internal tool for authorised MLAI staff and volunteers. In this prototype you get in through a simulated demo session.
            </p>

            <Button variant="primary" size="lg" className="mt-8 w-full !h-13 text-[1.05rem]" onClick={() => login('staff')} autoFocus>
              Enter Demo as MLAI Staff
              <ArrowRight className="size-5" aria-hidden />
            </Button>
            <Button variant="secondary" className="mt-3 w-full !h-11" onClick={() => login('viewer')}>
              <Eye className="size-4" aria-hidden />
              Enter as Viewer (simulated read-only)
            </Button>

            <div className="mt-8 space-y-2.5 border-t border-slate-100 pt-6 text-sm leading-relaxed text-slate-600">
              <p className="flex gap-2.5">
                <Info className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
                <span>
                  <span className="font-semibold text-slate-800">Simulated session, not real authentication.</span> No passwords or accounts. The Staff and
                  Viewer roles only demonstrate how access could differ.
                </span>
              </p>
              <p className="flex gap-2.5">
                <FlaskConical className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
                <span>All sponsors and figures are fictional demonstration data.</span>
              </p>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-slate-500 lg:hidden">{TEAM}</p>
        </div>
      </section>
    </div>
  )
}
