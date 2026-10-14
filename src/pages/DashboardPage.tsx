import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BarChart3, Building2, CalendarDays, Database, Info, Megaphone, MessagesSquare, Rocket, Users } from 'lucide-react'
import { useAppState } from '../state/AppState'
import { METRICS, availableQuarters, computeTotals, quarterLabel, quarterOf, quarterRange, summariseSponsors } from '../lib/metrics'
import { formatDate } from '../lib/format'
import type { MetricKey } from '../types'
import { Button, Card, CardHeader, DemoDataLabel, EmptyState, PageHeader } from '../components/ui'
import { KpiCard } from '../components/KpiCard'
import { ImpactChart, SponsorComparisonChart } from '../components/ImpactChart'
import { RecordsTable } from '../components/RecordsTable'
import { SponsorAvatar } from '../components/SponsorAvatar'

const ALL = 'all'
/** Above this many sponsors the switcher falls back to a dropdown. */
const MAX_PILLS = 5

function SponsorSwitcher({ sponsors, selected, onSelect }: { sponsors: string[]; selected: string; onSelect: (s: string) => void }) {
  if (sponsors.length > MAX_PILLS) {
    return (
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sponsor</span>
        <select
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm sm:w-72"
        >
          {sponsors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    )
  }
  return (
    <div className="min-w-0">
      <p id="sponsor-switch-label" className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Switch sponsor
      </p>
      <div role="group" aria-labelledby="sponsor-switch-label" className="flex flex-wrap gap-2">
        {sponsors.map((s) => {
          const active = s === selected
          return (
            <button
              key={s}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(s)}
              className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <SponsorAvatar name={s} size="sm" className="!rounded-full" />
              {s}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { records, selectedSponsor, selectSponsor, navigate, markDashboardViewed } = useAppState()
  const [period, setPeriod] = useState<string>(ALL)
  const [metric, setMetric] = useState<MetricKey>('attendees')

  const sponsors = useMemo(() => [...new Set(records.map((r) => r.sponsor))].sort((a, b) => a.localeCompare(b)), [records])
  const sponsorRecords = useMemo(() => records.filter((r) => r.sponsor === selectedSponsor), [records, selectedSponsor])
  const quarters = useMemo(() => availableQuarters(sponsorRecords), [sponsorRecords])

  // If the chosen quarter has no events for a newly selected sponsor, fall back to all dates.
  useEffect(() => {
    if (period !== ALL && !quarters.includes(period)) setPeriod(ALL)
  }, [quarters, period])

  const inPeriod = useMemo(
    () => (period === ALL ? records : records.filter((r) => quarterOf(r.date) === period)),
    [records, period],
  )
  const periodRecords = useMemo(() => inPeriod.filter((r) => r.sponsor === selectedSponsor), [inPeriod, selectedSponsor])

  useEffect(() => {
    if (selectedSponsor && periodRecords.length > 0) markDashboardViewed(selectedSponsor)
  }, [selectedSponsor, periodRecords.length, markDashboardViewed])
  const totals = useMemo(() => computeTotals(periodRecords), [periodRecords])
  const allTotals = useMemo(() => computeTotals(inPeriod), [inPeriod])
  const comparison = useMemo(() => summariseSponsors(inPeriod), [inPeriod])
  const recent = useMemo(() => [...periodRecords].sort((a, b) => b.date.localeCompare(a.date)), [periodRecords])

  const periodText = useMemo(() => {
    if (period !== ALL) {
      const [s, e] = quarterRange(period)
      return `${quarterLabel(period)} · ${formatDate(s)} – ${formatDate(e)}`
    }
    if (sponsorRecords.length === 0) return '—'
    const dates = sponsorRecords.map((r) => r.date).sort()
    return `All dates · ${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}`
  }, [period, sponsorRecords])

  const header = (
    <PageHeader
      eyebrow="US03 · Agreed sponsor-impact metrics"
      title="Impact Dashboard"
      actions={
        <>
          <Button onClick={() => navigate('sponsors')}>
            <ArrowLeft className="size-4" aria-hidden /> Sponsors
          </Button>
          <Button onClick={() => navigate('import')}>
            <Database className="size-4" aria-hidden /> Import data
          </Button>
        </>
      }
    />
  )

  if (records.length === 0) {
    return (
      <>
        {header}
        <Card>
          <EmptyState
            icon={<BarChart3 className="size-6" />}
            title="No sponsor-impact data imported"
            description="Every metric on this dashboard is calculated from imported records. Import a CSV or load the sample data to get started."
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

  if (!selectedSponsor) {
    return (
      <>
        {header}
        <Card>
          <EmptyState
            icon={<Building2 className="size-6" />}
            title="Choose a sponsor"
            description="Metrics are shown for one sponsor at a time. Pick a sponsor to open their dashboard."
            actions={sponsors.map((s) => (
              <Button key={s} onClick={() => selectSponsor(s)} className="!h-11 !pl-1.5">
                <SponsorAvatar name={s} size="sm" />
                {s}
              </Button>
            ))}
          />
        </Card>
      </>
    )
  }

  const metricMeta = METRICS.find((m) => m.key === metric)!
  const share = (k: keyof typeof totals) => (allTotals[k] > 0 ? totals[k] / allTotals[k] : null)
  const animKey = `${selectedSponsor}|${period}`

  return (
    <>
      {header}

      {/* Sponsor header: who and when we are looking at */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4 px-5 py-5 sm:px-6">
          <div key={selectedSponsor} className="flex min-w-0 flex-1 animate-fade-in items-center gap-4">
            <SponsorAvatar name={selectedSponsor} size="lg" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sponsor impact report</p>
              <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900 2xl:text-3xl">{selectedSponsor}</h2>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-slate-600">
                <CalendarDays className="size-4 shrink-0 text-slate-400" aria-hidden />
                <span>{periodText}</span>
              </p>
            </div>
          </div>
          <DemoDataLabel />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
          <SponsorSwitcher sponsors={sponsors} selected={selectedSponsor} onSelect={selectSponsor} />
          <label className="flex w-full flex-col gap-1.5 sm:w-48">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reporting period</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:border-slate-400"
            >
              <option value={ALL}>All dates</option>
              {quarters.map((q) => (
                <option key={q} value={q}>
                  {quarterLabel(q)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {periodRecords.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarDays className="size-6" />}
            title="No events in this period"
            description={`${selectedSponsor} has no imported events in ${quarterLabel(period)}.`}
            actions={<Button onClick={() => setPeriod(ALL)}>Show all dates</Button>}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:gap-5">
            <KpiCard label="Events Funded" value={totals.eventsFunded} icon={CalendarDays} hint="Sponsored events in period" share={share('eventsFunded')} animKey={animKey} />
            <KpiCard label="Total Attendees" value={totals.attendees} icon={Users} hint="Sum across events" share={share('attendees')} animKey={animKey} />
            <KpiCard label="Startups Supported" value={totals.startupsSupported} icon={Rocket} hint="Sum of per-event counts" share={share('startupsSupported')} animKey={animKey} />
            <KpiCard label="Media Reach" value={totals.mediaReach} icon={Megaphone} hint="Reported impressions" share={share('mediaReach')} animKey={animKey} />
            <KpiCard
              label="Community Engagement"
              value={totals.communityEngagement}
              icon={MessagesSquare}
              hint="Recorded interactions"
              share={share('communityEngagement')}
              animKey={animKey}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader
                title={`${metricMeta.short} by event`}
                subtitle={metricMeta.description}
                actions={
                  <div role="group" aria-label="Chart metric" className="flex flex-wrap gap-0.5 rounded-lg bg-slate-100 p-1">
                    {METRICS.map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        aria-pressed={metric === m.key}
                        onClick={() => setMetric(m.key)}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                          metric === m.key ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {m.short}
                      </button>
                    ))}
                  </div>
                }
              />
              <div className="px-3 pb-3 pt-4 sm:px-5">
                <ImpactChart records={periodRecords} metric={metric} metricLabel={metricMeta.label} />
              </div>
            </Card>

            <Card className="flex flex-col">
              <CardHeader title="How sponsors compare" subtitle={`${metricMeta.label} · ${period === ALL ? 'all dates' : quarterLabel(period)}`} />
              <div className="flex flex-1 flex-col justify-center px-4 py-5 sm:px-5">
                <SponsorComparisonChart
                  summaries={comparison}
                  metric={metric}
                  metricLabel={metricMeta.label}
                  selected={selectedSponsor}
                  onSelect={selectSponsor}
                />
                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Info className="size-3.5 shrink-0" aria-hidden />
                  Click a bar to switch sponsor.
                </p>
              </div>
            </Card>
          </div>

          <Card className="mt-6 overflow-hidden">
            <CardHeader
              title="Recent events"
              subtitle={`${recent.length} sponsored event${recent.length === 1 ? '' : 's'} · newest first · totals match the KPI cards`}
            />
            <RecordsTable records={recent} showSponsor={false} showTotals caption={`Recent events sponsored by ${selectedSponsor}`} />
          </Card>

          <p className="mt-5 max-w-5xl text-xs leading-relaxed text-slate-500">
            <span className="font-semibold text-slate-600">How metrics are calculated:</span> Events Funded counts imported records for this sponsor in the
            selected period (one record = one event; duplicate sponsor + event + date rows are rejected at import). Every other metric is the sum of the
            matching CSV column across those same records. "% of all sponsors" compares against all imported sponsors in the same period. All figures
            are fictional demonstration data.
          </p>
        </>
      )}
    </>
  )
}
