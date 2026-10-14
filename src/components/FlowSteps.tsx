import { Check } from 'lucide-react'
import { useAppState } from '../state/AppState'
import type { Page } from '../types'

/** The core Sprint 1 flow, shown in the top bar so the audience always knows where we are. */
export function FlowSteps() {
  const { page, navigate, records, selectedSponsor } = useAppState()
  const steps: { page: Page; label: string; done: boolean; detail?: string }[] = [
    { page: 'import', label: 'Import data', done: records.length > 0, detail: records.length ? `${records.length} records` : undefined },
    { page: 'sponsors', label: 'Select sponsor', done: !!selectedSponsor, detail: selectedSponsor ?? undefined },
    { page: 'dashboard', label: 'View dashboard', done: false },
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
                <span className="whitespace-nowrap font-medium">{s.label}</span>
                {s.detail && (
                  <span className={`hidden max-w-40 truncate text-xs 2xl:inline ${current ? 'text-slate-300' : 'text-slate-500'}`}>· {s.detail}</span>
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
