import type { ReactNode } from 'react'
import { AlertTriangle, ArrowRight, CheckCircle2, CircleDashed, ClipboardList, Eye, FileCheck2, Info, MonitorPlay, UserCheck } from 'lucide-react'
import { useAppState } from '../state/AppState'
import { computeTotals } from '../lib/metrics'
import { formatNumber } from '../lib/format'
import { FUTURE_WORK, SPRINT, SPRINT_BACKLOG, validateSprintBacklog, type AcceptanceStatus, type BacklogItem, type DodStatus, type EvidenceKey } from '../data/sprintStatus'
import { Badge, Button, Card, CardHeader, PageHeader } from '../components/ui'

/** The five things this page keeps apart, in the order a reviewer reads them. */
const LAYERS: { icon: typeof Eye; title: string; who: string; tone: string }[] = [
  { icon: ClipboardList, title: 'Sprint Backlog item', who: 'Selected by the team at Sprint Planning', tone: 'text-slate-700 bg-slate-100' },
  { icon: MonitorPlay, title: 'Demonstrated', who: 'What the prototype actually does', tone: 'text-blue-800 bg-blue-50' },
  { icon: Eye, title: 'Acceptance-criteria evidence', who: 'Observed automatically in this browser session', tone: 'text-teal-800 bg-teal-50' },
  { icon: FileCheck2, title: 'Definition of Done', who: 'Recorded by the team after verification', tone: 'text-amber-800 bg-amber-50' },
  { icon: UserCheck, title: 'Acceptance', who: 'Confirmed by the client / tutor', tone: 'text-violet-800 bg-violet-50' },
]

function DodPill({ dod }: { dod: DodStatus }) {
  if (dod.state === 'verified') return <Badge tone="green">Done · verified by team</Badge>
  if (dod.state === 'not-done') return <Badge tone="red">Not done</Badge>
  return <Badge tone="amber">Awaiting team confirmation</Badge>
}

function AcceptancePill({ acceptance }: { acceptance: AcceptanceStatus }) {
  if (acceptance.state === 'accepted') return <Badge tone="green">Accepted</Badge>
  if (acceptance.state === 'changes-requested') return <Badge tone="red">Changes requested</Badge>
  return <Badge tone="slate">Pending — not yet confirmed</Badge>
}

function statusDetail(s: DodStatus | AcceptanceStatus): string | null {
  if (s.state === 'verified') return `${s.verifiedBy}, ${s.verifiedOn}${s.note ? ` · ${s.note}` : ''}`
  if (s.state === 'accepted' || s.state === 'changes-requested') return `${s.confirmedBy}, ${s.confirmedOn}${s.note ? ` · ${s.note}` : ''}`
  if (s.state === 'not-done') return s.note
  return null
}

function Row({ label, icon: Icon, tone, children }: { label: string; icon: typeof Eye; tone: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 border-t border-slate-100 px-5 py-3.5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:px-6">
      <p className="flex items-start gap-2 text-sm font-semibold text-slate-700">
        <span className={`flex size-6 shrink-0 items-center justify-center rounded-md ${tone}`}>
          <Icon className="size-3.5" aria-hidden />
        </span>
        <span className="pt-0.5">{label}</span>
      </p>
      <div className="min-w-0 text-sm text-slate-700">{children}</div>
    </div>
  )
}

export default function SprintPage() {
  const { navigate, session, records, lastImport, selectedSponsor, viewedDashboards, sessionEvidence } = useAppState()
  const total = SPRINT_BACKLOG.reduce((s, x) => s + x.points, 0)
  const problems = validateSprintBacklog()

  // Evidence only: what has been observed in this browser session. It never sets Done or Accepted.
  const sponsorNames = new Set(records.map((r) => r.sponsor))
  const viewed = viewedDashboards.filter((v) => sponsorNames.has(v))
  const selectedTotals = selectedSponsor ? computeTotals(records.filter((r) => r.sponsor === selectedSponsor)) : null
  const evidence: Record<EvidenceKey, string | null> = {
    'signed-in': session ? `Entered through the simulated demo entry; profile shows “${session.name} · ${session.role === 'staff' ? 'MLAI Staff' : 'Viewer'}”.` : null,
    'viewer-restricted': sessionEvidence['viewer-restricted'] ?? null,
    'logged-out': sessionEvidence['logged-out'] ?? null,
    'data-imported':
      records.length > 0 && lastImport
        ? `${formatNumber(lastImport.added)} records imported from ${lastImport.fileName}; ${formatNumber(records.length)} records from ${sponsorNames.size} sponsors now loaded.`
        : null,
    'validation-shown': sessionEvidence['validation-shown'] ?? null,
    'sponsor-selected':
      selectedSponsor && selectedTotals
        ? `${selectedSponsor} selected: ${selectedTotals.eventsFunded} of ${records.length} records belong to this sponsor.`
        : sessionEvidence['sponsor-selected']
          ? `${sessionEvidence['sponsor-selected']} was selected earlier in this session.`
          : null,
    'dashboard-shown': viewed.length > 0 ? `Dashboard calculated for ${viewed.join(', ')}.` : null,
    'sponsor-switched':
      viewed.length > 1
        ? `Dashboard switched between ${viewed.length} sponsors.${selectedTotals ? ` Now ${selectedSponsor}: ${selectedTotals.eventsFunded} events, ${formatNumber(selectedTotals.attendees)} attendees.` : ''}`
        : null,
  }
  const observedCount = (item: BacklogItem) => item.criteria.filter((c) => c.evidence && evidence[c.evidence]).length
  const pointsWhere = (pred: (i: BacklogItem) => boolean) => SPRINT_BACKLOG.filter(pred).reduce((s, i) => s + i.points, 0)
  const donePoints = pointsWhere((i) => i.dod.state === 'verified')
  const acceptedPoints = pointsWhere((i) => i.acceptance.state === 'accepted')

  return (
    <>
      <PageHeader
        eyebrow="Sprint review"
        title={`${SPRINT.name} Completion Summary`}
        description={
          <>
            <span className="font-semibold text-slate-800">Sprint Goal:</span> {SPRINT.goal}
          </>
        }
      />

      {problems.length > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">The recorded sprint status is inconsistent (src/data/sprintStatus.ts):</p>
            <ul className="mt-1 list-disc pl-5">
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Key: five separate things, five separate owners */}
      <ol className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="How to read this page">
        {LAYERS.map(({ icon: Icon, title, who, tone }, i) => (
          <li key={title} className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-card">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                <Icon className="size-4" aria-hidden />
              </span>
              <span>
                <span className="text-slate-400">{i + 1}.</span> {title}
              </span>
            </p>
            <p className="mt-1.5 text-xs leading-snug text-slate-600">{who}</p>
          </li>
        ))}
      </ol>

      {/* Summary table: the slide for the closing of the demo */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader
          title="Completion summary"
          subtitle={`${total} of ${SPRINT.capacity} estimated capacity points selected · Done and Accepted are recorded by people, never by the app`}
        />
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Sprint 1 completion summary by user story</caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                <th scope="col" className="py-3 pl-5 pr-3 sm:pl-6">1 · Backlog item</th>
                <th scope="col" className="px-3 py-3 text-right">Points</th>
                <th scope="col" className="px-3 py-3">2 · Demonstrated</th>
                <th scope="col" className="px-3 py-3">3 · Criteria evidence</th>
                <th scope="col" className="px-3 py-3">4 · Definition of Done</th>
                <th scope="col" className="py-3 pl-3 pr-5 sm:pr-6">5 · Acceptance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SPRINT_BACKLOG.map((item) => {
                const observed = observedCount(item)
                return (
                  <tr key={item.id}>
                    <th scope="row" className="py-3.5 pl-5 pr-3 text-left font-normal sm:pl-6">
                      <span className="font-mono font-semibold text-slate-900">{item.id}</span>{' '}
                      <span className="font-medium text-slate-800">{item.title}</span>
                    </th>
                    <td className="px-3 py-3.5 text-right tabular-nums text-slate-700">{item.points}</td>
                    <td className="px-3 py-3.5">
                      <Badge tone="blue">In prototype</Badge>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className={`font-semibold tabular-nums ${observed === item.criteria.length ? 'text-teal-700' : 'text-slate-700'}`}>
                        {observed} / {item.criteria.length}
                      </span>{' '}
                      <span className="text-slate-500">observed this session</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <DodPill dod={item.dod} />
                    </td>
                    <td className="py-3.5 pl-3 pr-5 sm:pr-6">
                      <AcceptancePill acceptance={item.acceptance} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50/80 text-slate-900">
                <th scope="row" className="py-3 pl-5 pr-3 text-left font-semibold sm:pl-6">Total</th>
                <td className="px-3 py-3 text-right font-semibold tabular-nums">{total}</td>
                <td className="px-3 py-3 text-slate-600">{SPRINT_BACKLOG.length} stories</td>
                <td className="px-3 py-3 text-slate-600">Session evidence only</td>
                <td className="px-3 py-3 font-semibold tabular-nums">{donePoints} pts verified Done</td>
                <td className="py-3 pl-3 pr-5 font-semibold tabular-nums sm:pr-6">{acceptedPoints} pts accepted</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="flex items-start gap-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-600 sm:px-6">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            Using a screen produces <em>evidence</em> only. Done and Accepted change only when the team edits <code className="rounded bg-slate-100 px-1">src/data/sprintStatus.ts</code>{' '}
            after verifying the Definition of Done or receiving client/tutor confirmation.
          </span>
        </p>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          {SPRINT_BACKLOG.map((item) => {
            const dodDetail = statusDetail(item.dod)
            const accDetail = statusDetail(item.acceptance)
            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                  <h2 className="flex items-center gap-2.5 text-[1.05rem] font-semibold tracking-tight text-slate-900">
                    <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-sm text-white">{item.id}</span>
                    {item.title}
                    <Badge tone="slate">{item.points} pts</Badge>
                  </h2>
                  {item.page && (
                    <Button size="sm" variant="ghost" onClick={() => navigate(item.page!)}>
                      Open screen <ArrowRight className="size-3.5" aria-hidden />
                    </Button>
                  )}
                </div>
                <Row label="Demonstrated" icon={MonitorPlay} tone={LAYERS[1].tone}>
                  {item.demonstrated}
                </Row>
                <Row label="Criteria evidence" icon={Eye} tone={LAYERS[2].tone}>
                  {item.criteriaSource === 'draft' && (
                    <p className="mb-2 text-xs font-medium text-amber-800">Draft criteria from the Sprint 1 scope. Team to replace with the Product Backlog wording.</p>
                  )}
                  <ul className="space-y-2">
                    {item.criteria.map((c) => {
                      const ev = c.evidence ? evidence[c.evidence] : null
                      return (
                        <li key={c.text} className="flex items-start gap-2">
                          {ev ? (
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-teal-600" aria-label="Observed" />
                          ) : (
                            <CircleDashed className="mt-0.5 size-4 shrink-0 text-slate-400" aria-label="Not yet observed" />
                          )}
                          <span>
                            <span className="font-medium text-slate-900">{c.text}</span>
                            <span className={`block text-xs ${ev ? 'text-teal-800' : 'text-slate-500'}`}>
                              {ev ?? (c.evidence ? 'Not yet observed in this session.' : 'Check live during the demo.')}
                            </span>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </Row>
                <Row label="Definition of Done" icon={FileCheck2} tone={LAYERS[3].tone}>
                  <DodPill dod={item.dod} />
                  <span className="ml-2 text-xs text-slate-500">{dodDetail ?? 'Not recorded. The team verifies this against its Definition of Done.'}</span>
                </Row>
                <Row label="Acceptance" icon={UserCheck} tone={LAYERS[4].tone}>
                  <AcceptancePill acceptance={item.acceptance} />
                  <span className="ml-2 text-xs text-slate-500">{accDetail ?? 'Stays pending until the client or tutor confirms it.'}</span>
                </Row>
              </Card>
            )
          })}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Sprint 1 scope" />
            <div className="p-5">
              <p className="text-3xl font-semibold tabular-nums text-slate-900">
                {total} <span className="text-base font-normal text-slate-500">/ {SPRINT.capacity} story points</span>
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden>
                <div className="h-full rounded-full bg-brand-700" style={{ width: `${(total / SPRINT.capacity) * 100}%` }} />
              </div>
              <p className="mt-2 text-sm text-slate-600">Selected against an estimated team capacity of {SPRINT.capacity} points.</p>
              <p className="mt-4 text-sm text-slate-600">Team 0311 — Ian Wang, Kai-Po Wang, Sabiuddin Ahmed Maheen</p>
            </div>
          </Card>
          <Card>
            <CardHeader title="Not in Sprint 1 (future work)" subtitle="Intentionally not implemented in this prototype." />
            <ul className="space-y-2 p-5 text-sm text-slate-700">
              {FUTURE_WORK.map((f) => (
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
