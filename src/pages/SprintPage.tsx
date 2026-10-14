import { ArrowRight, CheckCircle2, CircleDashed, ClipboardList, Info } from 'lucide-react'
import { useAppState } from '../state/AppState'
import type { Page } from '../types'
import { computeTotals } from '../lib/metrics'
import { formatNumber } from '../lib/format'
import { Badge, Button, Card, CardHeader, PageHeader } from '../components/ui'

const STORIES: { id: 'US04' | 'US01' | 'US02' | 'US03'; title: string; points: number; shown: string; page?: Page }[] = [
  {
    id: 'US04',
    title: 'Authorised access',
    points: 3,
    shown: 'Branded login screen, simulated MLAI Staff / Viewer session, profile indicator, logout. The Viewer role cannot import or clear data.',
  },
  {
    id: 'US01',
    title: 'Import sponsor-impact data',
    points: 5,
    shown: 'CSV upload (file picker or drag-and-drop), sample data loader, column and row validation, preview before import, duplicate protection, data kept after refresh.',
    page: 'import',
  },
  {
    id: 'US02',
    title: 'View sponsor-specific information',
    points: 3,
    shown: 'Searchable sponsor directory, sponsor selection, event list filtered to that sponsor, “View Dashboard” action.',
    page: 'sponsors',
  },
  {
    id: 'US03',
    title: 'Display agreed sponsor-impact metrics',
    points: 5,
    shown: 'Five KPI cards calculated from imported records, per-event chart, sponsor comparison, events table with totals, sponsor and reporting-period switching.',
    page: 'dashboard',
  },
]

const FUTURE = [
  'Automated quarterly sponsor reports',
  'Report review and approval workflow',
  'Live integrations with Slack, Luma, Humanitix, Substack, website and social media',
  'Real authentication and a managed user database',
  'Agreement with MLAI on final metric definitions',
]

export default function SprintPage() {
  const { navigate, session, records, lastImport, selectedSponsor, viewedDashboards } = useAppState()
  const total = STORIES.reduce((s, x) => s + x.points, 0)

  // Live evidence from this browser session — what has actually been shown, not a claim of acceptance.
  const sponsorNames = new Set(records.map((r) => r.sponsor))
  const viewed = viewedDashboards.filter((v) => sponsorNames.has(v))
  const selectedTotals = selectedSponsor ? computeTotals(records.filter((r) => r.sponsor === selectedSponsor)) : null
  const evidence: Record<(typeof STORIES)[number]['id'], { shown: boolean; text: string }> = {
    US04: {
      shown: !!session,
      text: session ? `Entered through the simulated demo session as ${session.role === 'staff' ? 'MLAI Staff' : 'Viewer'}.` : 'Not signed in.',
    },
    US01: {
      shown: records.length > 0,
      text:
        records.length > 0
          ? `${formatNumber(records.length)} records from ${sponsorNames.size} sponsor${sponsorNames.size === 1 ? '' : 's'} loaded${lastImport ? ` (last import: ${lastImport.fileName})` : ''}.`
          : 'No data imported yet in this session.',
    },
    US02: {
      shown: !!selectedSponsor,
      text: selectedSponsor
        ? `${selectedSponsor} selected: ${selectedTotals!.eventsFunded} of ${records.length} records belong to this sponsor.`
        : 'No sponsor selected yet.',
    },
    US03: {
      shown: viewed.length > 0,
      text:
        viewed.length > 0
          ? `Dashboard calculated for ${viewed.join(', ')}.${selectedTotals ? ` Current (${selectedSponsor}, all dates): ${selectedTotals.eventsFunded} events, ${formatNumber(selectedTotals.attendees)} attendees.` : ''}`
          : 'Dashboard not shown yet in this session.',
    },
  }
  const capacity = 18

  return (
    <>
      <PageHeader
        eyebrow="Sprint transparency"
        title="Sprint 1 Demo"
        description="Sprint goal: a basic end-to-end prototype allowing an authorised MLAI user to import sample sponsor-impact data and view key sponsor metrics through a simple dashboard."
      />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          The stories selected for Sprint 1, what the prototype does for each, and live evidence from this browser session. "Shown in this session"
          only means the feature was used here. Acceptance is decided at review, and nothing on this page claims a story has been
          accepted.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <ClipboardList className="size-4 text-slate-500" aria-hidden /> Selected user stories
              </span>
            }
            subtitle="Story points are the team’s Sprint 1 planning estimates."
          />
          <ul className="divide-y divide-slate-100">
            {STORIES.map((s) => (
              <li key={s.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
                <div className="flex shrink-0 items-center gap-2 sm:w-24 sm:flex-col sm:items-start">
                  <span className="font-mono text-sm font-semibold text-slate-900">{s.id}</span>
                  <Badge tone="slate">{s.points} pts</Badge>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{s.title}</p>
                  <p className="mt-2 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Shown in this prototype:</span> {s.shown}
                  </p>
                  <div
                    className={`mt-3 rounded-lg border px-3 py-2.5 text-sm ${
                      evidence[s.id].shown ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                      {evidence[s.id].shown ? <CheckCircle2 className="size-3.5" aria-hidden /> : <CircleDashed className="size-3.5" aria-hidden />}
                      {evidence[s.id].shown ? 'Shown in this session' : 'Not yet shown in this session'}
                    </p>
                    <p className="mt-1">{evidence[s.id].text}</p>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <Badge tone="slate">Acceptance: pending review</Badge>
                    {s.page && (
                      <Button size="sm" variant="ghost" onClick={() => navigate(s.page!)}>
                        Open screen <ArrowRight className="size-3.5" aria-hidden />
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Sprint 1 scope" />
            <div className="p-5">
              <p className="text-3xl font-semibold tabular-nums text-slate-900">
                {total} <span className="text-base font-normal text-slate-500">/ {capacity} story points</span>
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden>
                <div className="h-full rounded-full bg-brand-700" style={{ width: `${(total / capacity) * 100}%` }} />
              </div>
              <p className="mt-2 text-sm text-slate-600">Selected against an estimated team capacity of {capacity} points.</p>
              <p className="mt-4 text-sm text-slate-600">Team 0311 — Ian Wang, Kai-Po Wang, Sabiuddin Ahmed Maheen</p>
            </div>
          </Card>
          <Card>
            <CardHeader title="Not in Sprint 1 (future work)" subtitle="Intentionally not implemented in this prototype." />
            <ul className="space-y-2 p-5 text-sm text-slate-700">
              {FUTURE.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
