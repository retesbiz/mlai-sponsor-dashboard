import type { ImpactRecord } from '../types'
import { formatDate, formatNumber } from '../lib/format'
import { computeTotals } from '../lib/metrics'
import { SponsorAvatar } from './SponsorAvatar'

export function RecordsTable({
  records,
  showSponsor = true,
  showTotals = false,
  newIds,
  caption,
}: {
  records: ImpactRecord[]
  showSponsor?: boolean
  showTotals?: boolean
  /** Rows to mark as just imported */
  newIds?: ReadonlySet<string>
  caption: string
}) {
  const th = 'sticky top-0 z-[1] bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 whitespace-nowrap first:pl-5 sm:first:pl-6 last:pr-5 sm:last:pr-6'
  const thNum = `${th} !text-right`
  const td = 'px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap first:pl-5 sm:first:pl-6 last:pr-5 sm:last:pr-6'
  const tdNum = `${td} text-right tabular-nums`
  const totals = showTotals ? computeTotals(records) : null

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-slate-200">
            <th scope="col" className={th}>Date</th>
            <th scope="col" className={th}>Event</th>
            {showSponsor && <th scope="col" className={th}>Sponsor</th>}
            <th scope="col" className={th}>Type</th>
            <th scope="col" className={thNum}>Attendees</th>
            <th scope="col" className={thNum}>Startups</th>
            <th scope="col" className={thNum}>Media reach</th>
            <th scope="col" className={thNum}>Engagement</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.map((r) => {
            const isNew = newIds?.has(r.id)
            return (
              <tr key={r.id} className={`transition-colors ${isNew ? 'bg-emerald-50/60 hover:bg-emerald-50' : 'hover:bg-slate-50'}`}>
                <td className={`${td} tabular-nums text-slate-600`}>{formatDate(r.date)}</td>
                <td className={`${td} max-w-[22rem]`}>
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-slate-900" title={r.event}>
                      {r.event}
                    </span>
                    {isNew && <span className="rounded bg-emerald-600 px-1.5 py-px text-[0.65rem] font-semibold uppercase tracking-wide text-white">New</span>}
                  </div>
                  {r.location && <div className="mt-0.5 text-xs text-slate-500">{r.location}</div>}
                </td>
                {showSponsor && (
                  <td className={td}>
                    <span className="flex items-center gap-2">
                      <SponsorAvatar name={r.sponsor} size="sm" />
                      {r.sponsor}
                    </span>
                  </td>
                )}
                <td className={td}>
                  {r.eventType ? (
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{r.eventType}</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className={`${tdNum} font-medium text-slate-900`}>{formatNumber(r.attendees)}</td>
                <td className={tdNum}>{formatNumber(r.startupsSupported)}</td>
                <td className={tdNum}>{formatNumber(r.mediaReach)}</td>
                <td className={tdNum}>{formatNumber(r.communityEngagement)}</td>
              </tr>
            )
          })}
        </tbody>
        {totals && (
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50/80">
              <th scope="row" colSpan={showSponsor ? 4 : 3} className={`${td} text-left font-semibold text-slate-900`}>
                Total · {totals.eventsFunded} event{totals.eventsFunded === 1 ? '' : 's'}
              </th>
              <td className={`${tdNum} font-semibold text-slate-900`}>{formatNumber(totals.attendees)}</td>
              <td className={`${tdNum} font-semibold text-slate-900`}>{formatNumber(totals.startupsSupported)}</td>
              <td className={`${tdNum} font-semibold text-slate-900`}>{formatNumber(totals.mediaReach)}</td>
              <td className={`${tdNum} font-semibold text-slate-900`}>{formatNumber(totals.communityEngagement)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
