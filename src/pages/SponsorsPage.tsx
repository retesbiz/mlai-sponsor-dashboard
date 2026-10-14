import { useMemo, useState } from 'react'
import { ArrowRight, Building2, CalendarDays, Check, Database, MousePointerClick, Search, X } from 'lucide-react'
import { useAppState } from '../state/AppState'
import { summariseSponsors } from '../lib/metrics'
import { formatDate, formatNumber } from '../lib/format'
import { SponsorAvatar } from '../components/SponsorAvatar'
import { Button, Card, CardHeader, DemoDataLabel, EmptyState, PageHeader } from '../components/ui'
import { RecordsTable } from '../components/RecordsTable'

export default function SponsorsPage() {
  const { records, selectedSponsor, selectSponsor, navigate } = useAppState()
  const [query, setQuery] = useState('')

  const summaries = useMemo(() => summariseSponsors(records), [records])
  const filtered = summaries.filter((s) => s.sponsor.toLowerCase().includes(query.trim().toLowerCase()))
  const selected = summaries.find((s) => s.sponsor === selectedSponsor) ?? null
  const selectedRecords = useMemo(
    () => records.filter((r) => r.sponsor === selectedSponsor).sort((a, b) => b.date.localeCompare(a.date)),
    [records, selectedSponsor],
  )

  if (records.length === 0) {
    return (
      <>
        <PageHeader eyebrow="US02 · View sponsor-specific information" title="Sponsors" />
        <Card>
          <EmptyState
            icon={<Building2 className="size-6" />}
            title="No sponsors to show yet"
            description="Sponsors appear here once sponsor-impact records have been imported. Load the sample data to try the demo."
            actions={
              <Button variant="primary" onClick={() => navigate('import')}>
                <Database className="size-4" aria-hidden /> Go to Import Sponsor Data
              </Button>
            }
          />
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="US02 · View sponsor-specific information"
        title="Sponsors"
        description="Search the sponsor directory and select a sponsor to see only their events and impact records."
        actions={<DemoDataLabel />}
      />

      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <label htmlFor="sponsor-search" className="sr-only">
          Search sponsors
        </label>
        <input
          id="sponsor-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sponsors…"
          className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-9 text-[0.95rem] text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-600"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <p className="px-5 py-10 text-center text-sm text-slate-600">
            No sponsors match “{query}”.{' '}
            <button type="button" className="font-medium text-brand-700 underline" onClick={() => setQuery('')}>
              Clear search
            </button>
          </p>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Sponsor directory">
          {filtered.map((s) => {
            const active = s.sponsor === selectedSponsor
            return (
              <li key={s.sponsor}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectSponsor(s.sponsor)}
                  className={`group relative w-full rounded-2xl border bg-white p-5 text-left shadow-card transition-all duration-200 2xl:p-6 ${
                    active
                      ? 'border-brand-600 ring-4 ring-brand-600/10'
                      : 'border-slate-200/80 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card-hover'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="relative shrink-0">
                      <SponsorAvatar name={s.sponsor} size="md" className="size-12" />
                      {active && (
                        <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-brand-600 text-white ring-2 ring-white">
                          <Check className="size-3" strokeWidth={3.5} aria-hidden />
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold tracking-tight text-slate-900" title={s.sponsor}>
                        {s.sponsor}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500">
                        <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                        <span className="truncate">
                          {formatDate(s.firstDate)} – {formatDate(s.lastDate)}
                        </span>
                      </p>
                      <p className={`mt-1 text-xs font-semibold ${active ? 'text-brand-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                        {active ? 'Selected' : 'Click to select'}
                      </p>
                    </div>
                  </div>
                  <dl className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 px-4 py-3">
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Events</dt>
                      <dd className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">{s.eventsFunded}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Attendees</dt>
                      <dd className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">{formatNumber(s.attendees)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Startups</dt>
                      <dd className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">{formatNumber(s.startupsSupported)}</dd>
                    </div>
                  </dl>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <Card className="mt-6 overflow-hidden">
        {selected ? (
          <div key={selected.sponsor} className="animate-fade-in">
            <CardHeader
              title={
                <span className="flex items-center gap-2.5">
                  <SponsorAvatar name={selected.sponsor} size="sm" />
                  {selected.sponsor} — sponsored events
                </span>
              }
              subtitle={`${selected.eventsFunded} event${selected.eventsFunded === 1 ? '' : 's'} · ${formatDate(selected.firstDate)} to ${formatDate(selected.lastDate)}`}
              actions={
                <>
                  <Button size="sm" variant="ghost" onClick={() => selectSponsor(null)}>
                    Clear selection
                  </Button>
                  <Button variant="primary" size="lg" className="!h-11" onClick={() => navigate('dashboard')}>
                    View Dashboard <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </>
              }
            />
            <RecordsTable records={selectedRecords} showSponsor={false} showTotals caption={`Events sponsored by ${selected.sponsor}`} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <MousePointerClick className="size-6 text-slate-400" aria-hidden />
            <p className="text-sm font-medium text-slate-700">Select a sponsor card above</p>
            <p className="text-sm text-slate-500">Their events appear here, with a button to open their impact dashboard.</p>
          </div>
        )}
      </Card>
    </>
  )
}
