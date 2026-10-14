import { useState } from 'react'
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, CircleDashed, FileCheck2, Info, MonitorPlay, Square, SquareCheck, UserCheck } from 'lucide-react'
import { useAppState } from '../state/AppState'
import { computeTotals } from '../lib/metrics'
import { formatDate, formatNumber } from '../lib/format'
import {
  DEFINITION_OF_DONE_STATUS,
  DOD_CRITERIA,
  FUTURE_WORK,
  SPRINT,
  SPRINT_BACKLOG,
  checkedCount,
  validateSprintBacklog,
  type AcceptanceStatus,
  type BacklogItem,
  type CompletionStatus,
  type EvidenceKey,
} from '../data/sprintStatus'
import { Badge, Button, Card, CardHeader, PageHeader } from '../components/ui'

const TOTAL_DOD = DOD_CRITERIA.length

function StatusPill({ completion }: { completion: CompletionStatus }) {
  return completion.state === 'done' ? (
    <Badge tone="green">
      <CheckCircle2 className="size-3.5" aria-hidden /> Done
    </Badge>
  ) : (
    <Badge tone="amber">Awaiting Verification</Badge>
  )
}

function AcceptancePill({ acceptance }: { acceptance: AcceptanceStatus }) {
  if (acceptance.state === 'accepted') return <Badge tone="green">Accepted</Badge>
  if (acceptance.state === 'changes-requested') return <Badge tone="red">Changes Requested</Badge>
  return <Badge tone="slate">Pending</Badge>
}

function DodProgress({ item }: { item: BacklogItem }) {
  const n = checkedCount(item)
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex gap-0.5" aria-hidden>
        {DOD_CRITERIA.map((c) => (
          <span key={c.id} className={`h-2.5 w-2.5 rounded-sm ${item.dodChecks[c.id] ? 'bg-emerald-600' : 'bg-slate-200'}`} />
        ))}
      </span>
      <span className="tabular-nums text-slate-700">
        <span className="font-semibold text-slate-900">{n}</span>/{TOTAL_DOD}
      </span>
      <span className="sr-only">Definition of Done criteria verified</span>
    </span>
  )
}

const iso = (d: string) => formatDate(d)

function StatTile({ label, value, total, caption, tone, icon: Icon }: { label: string; value: number; total: number; caption: string; tone: string; icon: typeof Info }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className={`flex size-8 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="size-4" aria-hidden />
        </span>
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 tabular-nums 2xl:text-4xl">
        {value} <span className="text-lg font-medium text-slate-500">/ {total} pts</span>
      </p>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
        <div className="h-full rounded-full bg-current transition-[width]" style={{ width: `${(value / total) * 100}%` }} />
      </div>
      <p className="mt-2 text-xs leading-snug text-slate-600">{caption}</p>
    </div>
  )
}

export default function SprintPage() {
  const { navigate, session, records, lastImport, selectedSponsor, viewedDashboards, sessionEvidence } = useAppState()
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  const problems = validateSprintBacklog()

  const total = SPRINT_BACKLOG.reduce((s, x) => s + x.points, 0)
  const sumPoints = (pred: (i: BacklogItem) => boolean) => SPRINT_BACKLOG.filter(pred).reduce((s, i) => s + i.points, 0)
  const donePoints = sumPoints((i) => i.completion.state === 'done')
  const doneStories = SPRINT_BACKLOG.filter((i) => i.completion.state === 'done').length
  const acceptedPoints = sumPoints((i) => i.acceptance.state === 'accepted')
  const dodAgreed = DEFINITION_OF_DONE_STATUS.state === 'agreed'

  // Session evidence: what was demonstrated in this browser. It never changes Done or Accepted.
  const sponsorNames = new Set(records.map((r) => r.sponsor))
  const viewed = viewedDashboards.filter((v) => sponsorNames.has(v))
  const selectedTotals = selectedSponsor ? computeTotals(records.filter((r) => r.sponsor === selectedSponsor)) : null
  const evidence: Record<EvidenceKey, string | null> = {
    'signed-in': session ? `Entered through the simulated demo entry as ${session.role === 'staff' ? 'MLAI Staff' : 'Viewer'}.` : null,
    'viewer-restricted': sessionEvidence['viewer-restricted'] ?? null,
    'logged-out': sessionEvidence['logged-out'] ?? null,
    'data-imported':
      records.length > 0 && lastImport ? `${formatNumber(lastImport.added)} records imported from ${lastImport.fileName}.` : null,
    'validation-shown': sessionEvidence['validation-shown'] ?? null,
    'sponsor-selected':
      selectedSponsor && selectedTotals
        ? `${selectedSponsor} selected: ${selectedTotals.eventsFunded} of ${records.length} records shown.`
        : sessionEvidence['sponsor-selected']
          ? `${sessionEvidence['sponsor-selected']} was selected earlier in this session.`
          : null,
    'dashboard-shown': viewed.length > 0 ? `Dashboard calculated for ${viewed.join(', ')}.` : null,
    'sponsor-switched': viewed.length > 1 ? `Dashboard switched between ${viewed.length} sponsors.` : null,
  }

  const allOpen = open.size === SPRINT_BACKLOG.length
  const toggle = (id: string, isOpen: boolean) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (isOpen) next.add(id)
      else next.delete(id)
      return next
    })

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
            <p className="font-semibold">The recorded sprint status breaks the Done rules (src/data/sprintStatus.ts):</p>
            <ul className="mt-1 list-disc pl-5">
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 1 · Headline numbers: Demonstrated ≠ Done ≠ Accepted */}
      <section aria-label="Sprint 1 points summary" className="grid gap-4 md:grid-cols-3">
        <div className="text-emerald-600">
          <StatTile
            label="Verified Done"
            value={donePoints}
            total={total}
            icon={FileCheck2}
            tone="bg-emerald-50 text-emerald-700"
            caption={`${doneStories} of ${SPRINT_BACKLOG.length} stories verified by the team against all ${TOTAL_DOD} Definition of Done criteria.`}
          />
        </div>
        <div className="text-blue-600">
          <StatTile
            label="Demonstrated"
            value={total}
            total={total}
            icon={MonitorPlay}
            tone="bg-blue-50 text-blue-700"
            caption="Functionality shown in the prototype during the demo. Demonstrated does not mean Done."
          />
        </div>
        <div className="text-violet-600">
          <StatTile
            label="Accepted"
            value={acceptedPoints}
            total={total}
            icon={UserCheck}
            tone="bg-violet-50 text-violet-700"
            caption="Recorded only after actual client or tutor feedback."
          />
        </div>
      </section>
      <p className="mb-6 mt-3 flex items-start gap-2 text-sm text-slate-600">
        <Info className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
        <span>
          <span className="font-semibold text-slate-800">Done vs Accepted:</span> <em>Done</em> means the team has verified a story against every Definition of
          Done criterion and recorded who checked it and when. <em>Accepted</em> means the client or tutor has confirmed it meets their needs. A story can be
          Done but not yet Accepted.
        </span>
      </p>

      {/* 2 · Definition of Done */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-[1.05rem] font-semibold tracking-tight text-slate-900">
              {dodAgreed ? 'Sprint 1 Definition of Done' : 'Proposed Sprint 1 Definition of Done'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">A story is Done only when all seven are verified and a team member records their name and the date.</p>
          </div>
          {DEFINITION_OF_DONE_STATUS.state === 'agreed' ? (
            <Badge tone="green">
              Agreed by {DEFINITION_OF_DONE_STATUS.agreedBy}, {iso(DEFINITION_OF_DONE_STATUS.agreedOn)}
            </Badge>
          ) : (
            <span className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-900">Awaiting Team Confirmation</span>
          )}
        </div>
        <ol className="grid gap-x-8 gap-y-3 px-5 py-5 sm:px-6 lg:grid-flow-col lg:grid-cols-2 lg:grid-rows-4">
          {DOD_CRITERIA.map((c, i) => (
            <li key={c.id} className="flex items-start gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">{i + 1}</span>
              <p className="text-[0.95rem] leading-snug text-slate-700">
                <span className="font-semibold text-slate-900">{c.title}</span> — {c.text}
              </p>
            </li>
          ))}
        </ol>
      </Card>

      {/* 3 · Story completion table */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader title="Story completion" subtitle="Official status from the team’s git-tracked record. Using the website never changes it." />
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Sprint 1 story completion</caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                <th scope="col" className="py-3 pl-5 pr-3 sm:pl-6">Story</th>
                <th scope="col" className="px-3 py-3 text-right">Points</th>
                <th scope="col" className="px-3 py-3">DoD checklist</th>
                <th scope="col" className="px-3 py-3">Status</th>
                <th scope="col" className="px-3 py-3">Verified by</th>
                <th scope="col" className="px-3 py-3">Verification date</th>
                <th scope="col" className="py-3 pl-3 pr-5 sm:pr-6">Client acceptance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SPRINT_BACKLOG.map((item) => (
                <tr key={item.id}>
                  <th scope="row" className="whitespace-nowrap py-3.5 pl-5 pr-3 text-left font-normal sm:pl-6">
                    <span className="font-mono font-semibold text-slate-900">{item.id}</span> <span className="font-medium text-slate-800">{item.title}</span>
                  </th>
                  <td className="px-3 py-3.5 text-right tabular-nums text-slate-700">{item.points}</td>
                  <td className="px-3 py-3.5">
                    <DodProgress item={item} />
                  </td>
                  <td className="px-3 py-3.5">
                    <StatusPill completion={item.completion} />
                  </td>
                  <td className="px-3 py-3.5 text-slate-700">{item.completion.state === 'done' ? item.completion.verifiedBy : <span className="text-slate-400">—</span>}</td>
                  <td className="px-3 py-3.5 whitespace-nowrap text-slate-700">
                    {item.completion.state === 'done' ? iso(item.completion.verifiedOn) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="py-3.5 pl-3 pr-5 sm:pr-6">
                    <AcceptancePill acceptance={item.acceptance} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50/80 font-semibold text-slate-900">
                <th scope="row" className="py-3 pl-5 pr-3 text-left sm:pl-6">Total</th>
                <td className="px-3 py-3 text-right tabular-nums">{total}</td>
                <td className="px-3 py-3" />
                <td className="px-3 py-3 tabular-nums" colSpan={3}>
                  {donePoints} / {total} pts verified Done
                </td>
                <td className="py-3 pl-3 pr-5 tabular-nums sm:pr-6">
                  {acceptedPoints} / {total} pts accepted
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* 4 · Expandable per-story detail */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[1.05rem] font-semibold tracking-tight text-slate-900">Acceptance criteria and DoD checklists</h2>
        <Button size="sm" onClick={() => setOpen(allOpen ? new Set() : new Set(SPRINT_BACKLOG.map((i) => i.id)))} aria-expanded={allOpen}>
          {allOpen ? 'Collapse all' : 'Expand all'}
        </Button>
      </div>
      <div className="mb-6 space-y-3">
        {SPRINT_BACKLOG.map((item) => {
          const isOpen = open.has(item.id)
          return (
            <details
              key={item.id}
              open={isOpen}
              onToggle={(e) => toggle(item.id, (e.currentTarget as HTMLDetailsElement).open)}
              className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card"
            >
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-slate-50 sm:px-6 [&::-webkit-details-marker]:hidden">
                <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-sm font-semibold text-white">{item.id}</span>
                <span className="min-w-0 flex-1 text-[1.02rem] font-semibold text-slate-900">
                  {item.title} <span className="font-normal text-slate-500">· {item.points} pts</span>
                </span>
                <DodProgress item={item} />
                <StatusPill completion={item.completion} />
                <AcceptancePill acceptance={item.acceptance} />
                <ChevronDown className="size-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
              </summary>

              <div className="grid gap-6 border-t border-slate-100 px-5 py-5 sm:px-6 lg:grid-cols-2">
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Acceptance criteria</h3>
                  {item.criteriaSource === 'draft' && (
                    <p className="mt-1 text-xs font-medium text-amber-800">Draft from the Sprint 1 scope. Team to replace with the Product Backlog wording.</p>
                  )}
                  <ul className="mt-3 space-y-2.5">
                    {item.criteria.map((c) => {
                      const ev = c.evidence ? evidence[c.evidence] : null
                      return (
                        <li key={c.text} className="flex items-start gap-2 text-sm">
                          {ev ? (
                            <MonitorPlay className="mt-0.5 size-4 shrink-0 text-blue-600" aria-label="Demonstrated this session" />
                          ) : (
                            <CircleDashed className="mt-0.5 size-4 shrink-0 text-slate-400" aria-label="Not demonstrated this session" />
                          )}
                          <span>
                            <span className="font-medium text-slate-900">{c.text}</span>
                            <span className={`block text-xs ${ev ? 'text-blue-800' : 'text-slate-500'}`}>
                              {ev ? `Demonstrated: ${ev}` : 'Not demonstrated in this session yet.'}
                            </span>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  <p className="mt-3 text-xs text-slate-500">Demonstration evidence comes from this browser session only. It is not verification.</p>
                </section>

                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Definition of Done checklist · {checkedCount(item)}/{TOTAL_DOD} verified
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {DOD_CRITERIA.map((c) => {
                      const check = item.dodChecks[c.id]
                      return (
                        <li key={c.id} className="flex items-start gap-2.5 text-sm">
                          {check ? (
                            <SquareCheck className="mt-0.5 size-[1.1rem] shrink-0 text-emerald-600" role="img" aria-label="Verified" />
                          ) : (
                            <Square className="mt-0.5 size-[1.1rem] shrink-0 text-slate-400" role="img" aria-label="Not yet verified" />
                          )}
                          <span>
                            <span className="font-medium text-slate-900">{c.title}</span>
                            <span className={`block text-xs ${check ? 'text-emerald-800' : 'text-slate-500'}`}>
                              {check ? `Checked by ${check.checkedBy}, ${iso(check.checkedOn)}${check.note ? ` · ${check.note}` : ''}` : 'Not yet verified'}
                            </span>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </section>

                <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-3 lg:col-span-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completion status</dt>
                    <dd className="mt-1">
                      <StatusPill completion={item.completion} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Verified by · date</dt>
                    <dd className="mt-1 text-slate-800">
                      {item.completion.state === 'done' ? `${item.completion.verifiedBy} · ${iso(item.completion.verifiedOn)}` : 'Not recorded'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Client acceptance</dt>
                    <dd className="mt-1 flex flex-wrap items-center gap-2 text-slate-800">
                      <AcceptancePill acceptance={item.acceptance} />
                      {item.acceptance.state !== 'pending' && (
                        <span className="text-xs text-slate-600">
                          {item.acceptance.confirmedBy}, {iso(item.acceptance.confirmedOn)}
                          {item.acceptance.note ? ` · ${item.acceptance.note}` : ''}
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-wrap items-start justify-between gap-3 text-sm text-slate-600 lg:col-span-2">
                  <p className="max-w-3xl">
                    <span className="font-semibold text-slate-800">Demonstrated in the prototype:</span> {item.demonstrated}
                  </p>
                  {item.page && (
                    <Button size="sm" variant="ghost" onClick={() => navigate(item.page!)}>
                      Open screen <ArrowRight className="size-3.5" aria-hidden />
                    </Button>
                  )}
                </div>
              </div>
            </details>
          )
        })}
      </div>

      {/* 5 · How it is recorded, scope, future work */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="How verification is recorded" />
          <div className="space-y-2 p-5 text-sm text-slate-700">
            <p>
              Official status lives in <code className="rounded bg-slate-100 px-1 text-[0.8rem]">src/data/sprintStatus.ts</code> and changes only through a
              git commit by the team. Visitors to this site cannot change it.
            </p>
            <p>
              The team ticks each DoD item with a name and date. A story can be set to Done only when all seven are ticked. The build fails if these rules are
              broken.
            </p>
          </div>
        </Card>
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
            <p className="mt-3 text-sm text-slate-600">Team 0311 — Ian Wang, Kai-Po Wang, Sabiuddin Ahmed Maheen</p>
          </div>
        </Card>
        <Card>
          <CardHeader title="Not in Sprint 1" subtitle="Intentionally not implemented." />
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
    </>
  )
}
