import { useEffect, useState, type ReactNode } from 'react'
import { BarChart3, Building2, ClipboardList, Database, LogOut, Menu, RotateCcw, ShieldCheck, X, CheckCircle2, Info, AlertCircle } from 'lucide-react'
import { useAppState } from '../state/AppState'
import type { Page, Role } from '../types'
import { Button, ConfirmDialog, MlaiMark } from './ui'
import { FlowSteps } from './FlowSteps'

const WORKFLOW: { page: Page; label: string; icon: typeof Database; story: string }[] = [
  { page: 'import', label: 'Import Data', icon: Database, story: 'US01' },
  { page: 'sponsors', label: 'Sponsors', icon: Building2, story: 'US02' },
  { page: 'dashboard', label: 'Impact Dashboard', icon: BarChart3, story: 'US03' },
]

export const PAGE_TITLES: Record<Page, string> = {
  import: 'Import Sponsor Data',
  sponsors: 'Sponsors',
  dashboard: 'Impact Dashboard',
  sprint: 'Sprint 1 Demo',
}

function NavItem({ page: p, label, icon: Icon, tag, onNavigate }: { page: Page; label: string; icon: typeof Database; tag?: string; onNavigate: () => void }) {
  const { page, navigate } = useAppState()
  const active = page === p
  return (
    <li>
      <button
        type="button"
        aria-current={active ? 'page' : undefined}
        onClick={() => {
          navigate(p)
          onNavigate()
        }}
        className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[0.92rem] font-medium transition-colors duration-150 ${
          active ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
        }`}
      >
        {active && <span className="absolute inset-y-2 -left-3 w-1 rounded-r-full bg-brand-400" aria-hidden />}
        <Icon className={`size-[1.15rem] shrink-0 transition-colors ${active ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}`} aria-hidden />
        <span className="flex-1 whitespace-nowrap">{label}</span>
        {tag && (
          <span
            className={`rounded px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold ${active ? 'bg-brand-400/15 text-brand-200' : 'bg-white/5 text-slate-500'}`}
          >
            {tag}
          </span>
        )}
      </button>
    </li>
  )
}

function Sidebar({ onNavigate, onReset }: { onNavigate: () => void; onReset: () => void }) {
  const { records, navigate, session, switchRole } = useAppState()
  const sponsorCount = new Set(records.map((r) => r.sponsor)).size
  return (
    <div className="flex h-full flex-col bg-navy-900 text-slate-300">
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-5">
        <MlaiMark className="size-10" />
        <div className="leading-tight">
          <p className="text-base font-semibold tracking-tight text-white">MLAI Sponsor Impact</p>
          <p className="mt-0.5 text-xs text-slate-400">Sprint 1 prototype</p>
        </div>
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Reporting</p>
        <ul className="space-y-1">
          {WORKFLOW.map((item) => (
            <NavItem key={item.page} {...item} tag={item.story} onNavigate={onNavigate} />
          ))}
        </ul>
        <p className="mt-7 px-3 pb-2 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-500">Project</p>
        <ul className="space-y-1">
          <NavItem page="sprint" label="Sprint 1 Demo" icon={ClipboardList} onNavigate={onNavigate} />
        </ul>
      </nav>

      <div className="space-y-3 border-t border-white/[0.06] p-4">
        <button
          type="button"
          onClick={() => {
            navigate('import')
            onNavigate()
          }}
          className="w-full rounded-xl bg-white/[0.04] p-3.5 text-left ring-1 ring-white/[0.06] transition-colors hover:bg-white/[0.07]"
        >
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span className={`size-2 rounded-full ${records.length ? 'bg-emerald-400 shadow-[0_0_0_3px_rgb(52_211_153/0.18)]' : 'bg-amber-400'}`} aria-hidden />
            Data status
          </p>
          <p className="mt-1.5 text-sm font-medium text-white">
            {records.length ? `${records.length} records · ${sponsorCount} sponsor${sponsorCount === 1 ? '' : 's'}` : 'No data imported'}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">{records.length ? 'Fictional demonstration data' : 'Import a CSV or load the sample'}</p>
        </button>
        {session && (
          <div>
            <p id="role-label" className="mb-1.5 px-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Simulated role
            </p>
            <div role="group" aria-labelledby="role-label" className="grid grid-cols-2 gap-1 rounded-lg bg-white/[0.04] p-1 ring-1 ring-white/[0.06]">
              {(['staff', 'viewer'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={session.role === r}
                  onClick={() => session.role !== r && switchRole(r)}
                  className={`rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
                    session.role === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  {r === 'staff' ? 'MLAI Staff' : 'Viewer'}
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-slate-500">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-slate-500" aria-hidden />
          Simulated session. No real sign-in or MLAI system connections.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <RotateCcw className="size-4" aria-hidden /> Reset demo
        </button>
      </div>
    </div>
  )
}

function ProfileIndicator() {
  const { session, logout } = useAppState()
  if (!session) return null
  const roleLabel = session.role === 'staff' ? 'MLAI Staff' : 'Viewer'
  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      <div className="flex shrink-0 items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3.5 shadow-sm" aria-label={`Signed in as ${session.name}, ${roleLabel}`}>
        <span
          className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white ${session.role === 'staff' ? 'bg-brand-700' : 'bg-slate-500'}`}
          aria-hidden
        >
          {session.role === 'staff' ? 'MS' : 'V'}
        </span>
        <span className="hidden leading-tight xl:block">
          <span className="block text-sm font-medium text-slate-900">{session.name}</span>
          <span className="block text-xs text-slate-500">{roleLabel} · demo session</span>
        </span>
        <span className="text-xs font-semibold text-slate-700 xl:hidden">{roleLabel}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={logout} aria-label="Log out of demo session" title="Log out">
        <LogOut className="size-4" aria-hidden />
        <span className="hidden 2xl:inline">Log out</span>
      </Button>
    </div>
  )
}

function Toasts() {
  const { toasts, dismissToast } = useAppState()
  const icon = { success: CheckCircle2, info: Info, error: AlertCircle }
  const tone = {
    success: 'border-emerald-200 text-emerald-900 [&_svg]:text-emerald-600',
    info: 'border-slate-200 text-slate-800 [&_svg]:text-brand-700',
    error: 'border-red-200 text-red-800 [&_svg]:text-red-600',
  }
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-5 z-50 flex flex-col items-end gap-2 sm:left-auto sm:right-6" role="status" aria-live="polite">
      {toasts.map((t) => {
        const Icon = icon[t.tone]
        return (
          <div key={t.id} className={`pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-xl border bg-white px-4 py-3.5 text-sm font-medium shadow-xl shadow-slate-900/10 ${tone[t.tone]}`}>
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p className="flex-1">{t.message}</p>
            <button type="button" onClick={() => dismissToast(t.id)} className="text-slate-400 hover:text-slate-700" aria-label="Dismiss notification">
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const { page, resetDemo } = useAppState()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  useEffect(() => {
    document.title = `${PAGE_TITLES[page]} · MLAI Sponsor Impact (Sprint 1 prototype)`
    window.scrollTo(0, 0)
  }, [page])

  const sidebar = <Sidebar onNavigate={() => setMobileOpen(false)} onReset={() => setConfirmReset(true)} />

  return (
    <div className="min-h-screen lg:pl-[17rem] 2xl:pl-72">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-[17rem] lg:block 2xl:w-72">{sidebar}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-slate-900/50" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw]" aria-label="Navigation menu">
            {sidebar}
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
        <button
          type="button"
          className="-ml-1 rounded-md p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
        >
          <Menu className="size-5" />
        </button>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 md:hidden">{PAGE_TITLES[page]}</p>
        <div className="hidden min-w-0 flex-1 md:block">
          <FlowSteps />
        </div>
        <ProfileIndicator />
      </header>

      <main id="main" className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 2xl:px-10">
        <div key={page} className="animate-fade-in">
          {children}
        </div>
      </main>

      <Toasts />
      <ConfirmDialog
        open={confirmReset}
        title="Reset the demo?"
        body="This clears all imported records, the selected sponsor and the simulated session, then returns to the login screen. Use it to start the class demo from a clean state."
        confirmLabel="Reset demo"
        tone="danger"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false)
          setMobileOpen(false)
          resetDemo()
        }}
      />
    </div>
  )
}
