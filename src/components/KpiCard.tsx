import type { LucideIcon } from 'lucide-react'
import { formatNumber } from '../lib/format'

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  note,
  share,
  animKey,
}: {
  label: string
  value: number
  icon: LucideIcon
  hint: string
  /** Optional caveat shown under the hint, e.g. how a metric maps to the requirements */
  note?: string
  /** This sponsor's share of the same metric across all sponsors (0–1) */
  share: number | null
  /** Changing this replays the value animation, so sponsor switches are visible */
  animKey: string
}) {
  const pct = share === null ? null : Math.round(share * 100)
  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card-hover 2xl:p-6">
      <div className="flex min-h-10 items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100 transition-colors group-hover:bg-brand-100">
          <Icon className="size-[1.1rem]" aria-hidden />
        </span>
        <p className="text-sm font-semibold leading-tight text-slate-700">{label}</p>
      </div>
      <p key={animKey} className="mt-4 animate-value-in text-[2rem] font-bold leading-none tracking-tight text-slate-900 tabular-nums xl:text-[1.85rem] 2xl:text-[2.4rem]">
        {formatNumber(value)}
      </p>
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
      {note && <p className="mt-1 text-xs font-medium leading-snug text-amber-800">{note}</p>}
      {pct !== null && (
        <div className="mt-auto pt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
            <div className="h-full rounded-full bg-brand-600 transition-[width] duration-500 ease-out" style={{ width: `${Math.max(pct, 2)}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-900 tabular-nums">{pct}%</span> of all sponsors
          </p>
        </div>
      )}
    </div>
  )
}
