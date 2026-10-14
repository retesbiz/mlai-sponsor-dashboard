import { Check } from 'lucide-react'
import { useAppState } from '../state/AppState'
import type { Page } from '../types'

/** The core Sprint 1 flow, shown in the top bar so the audience always knows where we are. */
export function FlowSteps() {
  const { page, navigate, records, selectedSponsor, viewedDashboards } = useAppState()
  // Labels only: record counts and the selected sponsor are already shown in the sidebar and page headers.
  const steps: { page: Page; label: string; short: string; done: boolean }[] = [
    { page: 'import', label: 'Import data', short: 'Import', done: records.length > 0 },
    { page: 'sponsors', label: 'Select sponsor', short: 'Sponsor', done: !!selectedSponsor },
    { page: 'dashboard', label: 'View dashboard', short: 'Dashboard', done: viewedDashboards.length > 0 },
    { page: 'sprint', label: 'Sprint summary', short: 'Summary', done: false },
  ]

  return (
    <nav aria-label="Demo flow" className="hidden min-w-0 md:block">
      <ol className="flex items-center gap-1">
        {steps.map((s, i) => {
          const current = page === s.page
          return (
            <li key={s.page} className="flex min-w-0 items-center gap-1">
              {i > 0 && <span className={`h-px w-4 shrink-0 xl:w-6 ${steps[i - 1].done ? 'bg-brand-600' : 'bg-slate-300'}`} aria-hidden />}
              <button
                type="button"
                onClick={() => navigate(s.page)}
                aria-current={current ? 'step' : undefined}
                className={`group flex min-w-0 items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm transition-colors ${
                  current ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    s.done
                      ? 'bg-brand-600 text-white'
                      : current
                        ? 'bg-white text-slate-900'
                        : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                  }`}
                >
                  {s.done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : i + 1}
                </span>
                {/* Short labels on laptops so all four steps fit beside the profile; full labels on wide screens/projectors */}
                <span className="whitespace-nowrap font-medium 2xl:hidden">{s.short}</span>
                <span className="hidden whitespace-nowrap font-medium 2xl:inline">{s.label}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
