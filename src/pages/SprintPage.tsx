import { useState } from 'react'
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, CircleDashed, FileCheck2, Info, MonitorPlay, UserCheck, XCircle } from 'lucide-react'
import { useAppState } from '../state/AppState'
import { computeTotals } from '../lib/metrics'
import { formatDate, formatNumber } from '../lib/format'
import {
  DEFINITION_OF_DONE_STATUS,
  DOD_CRITERIA,
  FUTURE_WORK,
  SAMPLE_VALUES_NOTE,
  SPRINT,
  SPRINT_BACKLOG,
  SIX_RECORD_FIXTURE,
  VERIFICATION_CHECKS_STATUS,
  checkCounts,
  checkStatus,
  conditionCounts,
  conditionStatus,
  overallStatus,
  validateSprintBacklog,
  type AcceptanceStatus,
  type BacklogItem,
  type ResultStatus,
  type EvidenceKey,
} from '../data/sprintStatus'
import { Badge, Button, Card, CardHeader, PageHeader } from '../components/ui'

const iso = (d: string) => formatDate(d)

const RESULT_STYLE: Record<ResultStatus, { label: string; cls: string; icon: typeof Info }> = {
  pass: { label: 'Pass', cls: 'bg-emerald-50 text-emerald-800 ring-emerald-200', icon: CheckCircle2 },
  fail: { label: 'Fail', cls: 'bg-red-50 text-red-700 ring-red-200', icon: XCircle },
  'not-verified': { label: 'Not Verified', cls: 'bg-slate-100 text-slate-600 ring-slate-200', icon: CircleDashed },
}

function ResultPill({ status }: { status: ResultStatus }) {
  const { label, cls, icon: Icon } = RESULT_STYLE[status]
  return (
    <span className={`inline-flex w-[6.6rem] shrink-0 items-center justify-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${cls}`}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  )
}

function OverallPill({ item }: { item: BacklogItem }) {
  const s = overallStatus(item)
  if (s === 'done')
    return (
      <Badge tone="green">
        <CheckCircle2 className="size-3.5" aria-hidden /> Done
      </Badge>
    )
  if (s === 'failing') return <Badge tone="red">Not Done · failed checks</Badge>
  return <Badge tone="amber">Awaiting Verification</Badge>
}

function AcceptancePill({ acceptance }: { acceptance: AcceptanceStatus }) {
  if (acceptance.state === 'accepted') return <Badge tone="green">Accepted</Badge>
  if (acceptance.state === 'changes-requested') return <Badge tone="red">Changes Requested</Badge>
  return <Badge tone="slate">Pending</Badge>
}

/** Compact "3 Pass · 1 Fail · 2 Not Verified" with a segmented bar. */
function Tally({ pass, fail, total, label }: { pass: number; fail: number; total: number; label: string }) {
  const nv = total - pass - fail
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex gap-0.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-sm ${i < pass ? 'bg-emerald-600' : i < pass + fail ? 'bg-red-500' : 'bg-slate-200'}`} />
        ))}
      </span>
      <span className="whitespace-nowrap tabular-nums text-slate-700">
        <span className="font-semibold text-slate-900">{pass}</span>/{total}
        {fail > 0 && <span className="ml-1 font-semibold text-red-700">· {fail} fail</span>}
      </span>
      <span className="sr-only">
        {label}: {pass} pass, {fail} fail, {nv} not verified
      </span>
    </span>
  )
}

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
        {value} <span className="text-lg font-medium text-slate-500">/ {total} SP</span>
      </p>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
        <div className="h-full rounded-full bg-current" style={{ width: `${(value / total) * 100}%` }} />
      </div>
      <p className="mt-2 text-xs leading-snug text-slate-600">{caption}</p>
    </div>
  )
}

const SOURCE_NOTE: Record<string, string> = {
  checks: 'From the recorded verification checks',
  'verification-record': 'From the team verification record',
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
  const checksConfirmed = VERIFICATION_CHECKS_STATUS.state === 'confirmed'

  // Session evidence = "Demonstrated" only. It never counts as a Pass.
  const sponsorNames = new Set(records.map((r) => r.sponsor))
  const viewed = viewedDashboards.filter((v) => sponsorNames.has(v))
  const selectedTotals = selectedSponsor ? computeTotals(records.filter((r) => r.sponsor === selectedSponsor)) : null
  const evidence: Record<EvidenceKey, boolean> = {
    'signed-in': !!session,
    'viewer-restricted': !!sessionEvidence['viewer-restricted'],
    'logged-out': !!sessionEvidence['logged-out'],
    'data-imported': records.length > 0 && !!lastImport,
    'validation-shown': !!sessionEvidence['validation-shown'],
    'sponsor-selected': !!(selectedSponsor && selectedTotals) || !!sessionEvidence['sponsor-selected'],
    'dashboard-shown': viewed.length > 0,
    'sponsor-switched': viewed.length > 1,
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
            <p className="font-semibold">The recorded verification breaks the Done rules (src/data/sprintStatus.ts):</p>
            <ul className="mt-1 list-disc pl-5">
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 1 · Demonstrated ≠ Done ≠ Accepted */}
      <section aria-label="Sprint 1 story point summary" className="grid gap-4 md:grid-cols-3">
        <div className="text-emerald-600">
          <StatTile
            label="Done (verified)"
            value={donePoints}
            total={total}
            icon={FileCheck2}
            tone="bg-emerald-50 text-emerald-700"
            caption={`${doneStories} of ${SPRINT_BACKLOG.length} stories: all ${DOD_CRITERIA.length} DoD conditions verified and recorded by the team.`}
          />
        </div>
        <div className="text-blue-600">
          <StatTile
            label="Demonstrated"
            value={total}
            total={total}
            icon={MonitorPlay}
            tone="bg-blue-50 text-blue-700"
            caption="Functionality shown in the prototype. Demonstrated does not mean Done."
          />
        </div>
        <div className="text-violet-600">
          <StatTile
            label="Accepted"
            value={acceptedPoints}
            total={total}
            icon={UserCheck}
            tone="bg-violet-50 text-violet-700"
            caption="Explicitly accepted by the client or tutor after feedback."
          />
        </div>
      </section>
      <p className="mb-6 mt-3 flex items-start gap-2 text-sm text-slate-600">
        <Info className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
        <span>
          <span className="font-semibold text-slate-800">Demonstrated</span> = shown in the prototype. <span className="font-semibold text-slate-800">Done</span> = all
          agreed Definition of Done conditions verified and recorded by the team. <span className="font-semibold text-slate-800">Accepted</span> = explicitly
          accepted by the client or tutor. Page visits, clicks and automated test runs never change these on their own.
        </span>
      </p>

      {/* 2 · Measurable Definition of Done */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-[1.1rem] font-semibold tracking-tight text-slate-900">Sprint 1 Definition of Done — Measurable Criteria</h2>
            <p className="mt-0.5 text-sm text-slate-600">A user story is Done only when all seven conditions are satisfied.</p>
          </div>
          {DEFINITION_OF_DONE_STATUS.state === 'agreed' ? (
            <Badge tone="green">
              Agreed by {DEFINITION_OF_DONE_STATUS.agreedBy}, {iso(DEFINITION_OF_DONE_STATUS.agreedOn)}
            </Badge>
          ) : (
            <span className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-900">Proposed — Awaiting Team Confirmation</span>
          )}
        </div>
        <ol className="grid gap-x-8 gap-y-3.5 px-5 py-5 sm:px-6 lg:grid-flow-col lg:grid-cols-2 lg:grid-rows-4">
          {DOD_CRITERIA.map((c, i) => (
            <li key={c.id} className="flex items-start gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">{i + 1}</span>
              <p className="text-[0.95rem] leading-snug text-slate-700">
                <span className="font-semibold text-slate-900">{c.title}:</span> {c.text}
              </p>
            </li>
          ))}
        </ol>
        {!dodAgreed && (
          <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-600 sm:px-6">
            This is a proposed team standard. It is not recorded as agreed at Sprint Planning, and no story can be marked Done until the team confirms it.
          </p>
        )}
      </Card>

      {/* 3 · Story completion table */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader title="Story completion" subtitle="Official results from the team’s git-tracked record. Using this website never changes them." />
        {/* relative: keeps the table's screen-reader-only text inside this scroll box (otherwise it widens the page on phones) */}
        <div className="relative overflow-x-auto">
          <table className="min-w-full text-sm">
            <caption className="sr-only">Sprint 1 story completion</caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                <th scope="col" className="py-3 pl-5 pr-3 sm:pl-6">Story</th>
                <th scope="col" className="px-3 py-3 text-right">SP</th>
                <th scope="col" className="px-3 py-3">Checks passed</th>
                <th scope="col" className="px-3 py-3">DoD conditions met</th>
                <th scope="col" className="px-3 py-3">DoD status</th>
                <th scope="col" className="px-3 py-3">Verified by</th>
                <th scope="col" className="px-3 py-3">Date</th>
                <th scope="col" className="py-3 pl-3 pr-5 sm:pr-6">Client / tutor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SPRINT_BACKLOG.map((item) => {
                const cc = checkCounts(item)
                const dc = conditionCounts(item)
                return (
                  <tr key={item.id}>
                    <th scope="row" className="whitespace-nowrap py-3.5 pl-5 pr-3 text-left font-normal sm:pl-6">
                      <span className="font-mono font-semibold text-slate-900">{item.id}</span> <span className="font-medium text-slate-800">{item.title}</span>
                    </th>
                    <td className="px-3 py-3.5 text-right tabular-nums text-slate-700">{item.points}</td>
                    <td className="px-3 py-3.5">
                      <Tally pass={cc.pass} fail={cc.fail} total={cc.total} label="Verification checks" />
                    </td>
                    <td className="px-3 py-3.5">
                      <Tally pass={dc.met} fail={dc.fail} total={dc.total} label="DoD conditions" />
                    </td>
                    <td className="px-3 py-3.5">
                      <OverallPill item={item} />
                    </td>
                    <td className="px-3 py-3.5 text-slate-700">{item.completion.state === 'done' ? item.completion.verifiedBy : <span className="text-slate-400">—</span>}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-slate-700">
                      {item.completion.state === 'done' ? iso(item.completion.verifiedOn) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="py-3.5 pl-3 pr-5 sm:pr-6">
                      <AcceptancePill acceptance={item.acceptance} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50/80 font-semibold text-slate-900">
                <th scope="row" className="py-3 pl-5 pr-3 text-left sm:pl-6">Total</th>
                <td className="px-3 py-3 text-right tabular-nums">{total}</td>
                <td className="px-3 py-3" colSpan={2} />
                <td className="px-3 py-3 tabular-nums" colSpan={3}>
                  {donePoints} / {total} SP Done
                </td>
                <td className="py-3 pl-3 pr-5 tabular-nums sm:pr-6">
                  {acceptedPoints} / {total} SP accepted
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* 4 · Expandable per-story verification */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex flex-wrap items-center gap-2.5 text-[1.05rem] font-semibold tracking-tight text-slate-900">
          Story verification checks
          {checksConfirmed ? (
            <Badge tone="green">
              Confirmed by {VERIFICATION_CHECKS_STATUS.state === 'confirmed' && VERIFICATION_CHECKS_STATUS.confirmedBy}
            </Badge>
          ) : (
            <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">Proposed — awaiting team confirmation</span>
          )}
        </h2>
        <Button size="sm" onClick={() => setOpen(allOpen ? new Set() : new Set(SPRINT_BACKLOG.map((i) => i.id)))} aria-expanded={allOpen}>
          {allOpen ? 'Collapse all' : 'Expand all'}
        </Button>
      </div>
      <div className="mb-6 space-y-3">
        {SPRINT_BACKLOG.map((item) => {
          const cc = checkCounts(item)
          return (
            <details
              key={item.id}
              open={open.has(item.id)}
              onToggle={(e) => toggle(item.id, (e.currentTarget as HTMLDetailsElement).open)}
              className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card"
            >
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-slate-50 sm:px-6 [&::-webkit-details-marker]:hidden">
                <span className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-sm font-semibold text-white">{item.id}</span>
                <span className="min-w-0 flex-1 text-[1.02rem] font-semibold text-slate-900">
                  {item.title} <span className="font-normal text-slate-500">· {item.points} SP</span>
                </span>
                <Tally pass={cc.pass} fail={cc.fail} total={cc.total} label="Verification checks" />
                <OverallPill item={item} />
                <AcceptancePill acceptance={item.acceptance} />
                <ChevronDown className="size-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden />
              </summary>

              <div className="grid gap-6 border-t border-slate-100 px-5 py-5 sm:px-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
                <section>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {checksConfirmed ? 'Verification checks' : 'Proposed verification checks'}
                    </h3>
                    <p className="text-xs font-semibold text-slate-700">
                      Required: {cc.required}/{cc.required} Pass · <span className="tabular-nums">{cc.pass} recorded Pass</span>
                    </p>
                  </div>
                  <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {item.verificationChecks.map((c, n) => {
                      const r = item.checkResults[c.id]
                      const demo = c.demo ? evidence[c.demo] : false
                      return (
                        <li key={c.id} className="flex items-start gap-3 px-3.5 py-2.5 text-sm">
                          <ResultPill status={checkStatus(item, c.id)} />
                          <span className="min-w-0 flex-1">
                            <span className="text-slate-900">
                              <span className="mr-1 font-semibold text-slate-500">{n + 1}.</span>
                              {c.text}
                            </span>
                            <span className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500">
                              {r ? (
                                <span className={r.result === 'fail' ? 'text-red-700' : 'text-emerald-800'}>
                                  <span className="font-semibold">Evidence:</span> {r.evidence} · {r.checkedBy}, {iso(r.checkedOn)}
                                </span>
                              ) : (
                                <span>Evidence: none recorded</span>
                              )}
                              {demo && (
                                <span className="inline-flex items-center gap-1 text-blue-700">
                                  <MonitorPlay className="size-3" aria-hidden /> Demonstrated this session
                                </span>
                              )}
                            </span>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  {item.verificationChecks.some((c) => c.expected) && <p className="mt-2 text-xs text-slate-500">{SAMPLE_VALUES_NOTE}</p>}
                  {item.id === 'US01' && (
                    <p className="mt-2 text-xs text-slate-500">
                      Checks 2–3 use the fictional verification file <code className="rounded bg-slate-100 px-1">{SIX_RECORD_FIXTURE.replace('public/', '')}</code> (six new,
                      non-duplicate records).
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">“Demonstrated this session” is demonstration evidence only. It never records a Pass.</p>
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer font-medium text-slate-700 hover:text-slate-900">
                      Sprint Backlog acceptance criteria ({item.backlogCriteria.length})
                      {item.criteriaSource === 'draft' && <span className="ml-2 text-xs font-medium text-amber-800">draft: replace with Product Backlog wording</span>}
                    </summary>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
                      {item.backlogCriteria.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </details>
                </section>

                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Definition of Done conditions · required 7/7</h3>
                  <ul className="mt-3 space-y-2">
                    {DOD_CRITERIA.map((c, i) => {
                      const status = conditionStatus(item, c.id)
                      const rec = c.source === 'recorded' ? item.dodResults[c.id as keyof typeof item.dodResults] : undefined
                      return (
                        <li key={c.id} className="flex items-start gap-2.5 text-sm">
                          <ResultPill status={status} />
                          <span>
                            <span className="font-medium text-slate-900">
                              {i + 1}. {c.title}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {SOURCE_NOTE[c.source] ?? (rec ? `Evidence: ${rec.evidence} · ${rec.checkedBy}, ${iso(rec.checkedOn)}` : 'Evidence: none recorded')}
                            </span>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  {item.id !== 'US04' && item.implementedBy.length === 0 && (
                    <p className="mt-3 text-xs text-slate-500">Implementer not recorded yet (Usability must be checked by someone else).</p>
                  )}
                  {item.id === 'US04' && item.implementedBy.length === 0 && (
                    <p className="mt-3 text-xs text-slate-500">Implementer not recorded yet. Simulated access only, not production authentication.</p>
                  )}
                </section>

                <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-3 xl:col-span-2">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overall DoD status</dt>
                    <dd className="mt-1">
                      <OverallPill item={item} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Verified by · date</dt>
                    <dd className="mt-1 text-slate-800">
                      {item.completion.state === 'done'
                        ? `${item.completion.verifiedBy} · ${iso(item.completion.verifiedOn)} · ${item.completion.confirmation}`
                        : 'Not recorded'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">Client / tutor acceptance</dt>
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

                <div className="flex flex-wrap items-start justify-between gap-3 text-sm text-slate-600 xl:col-span-2">
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
              Results live in <code className="rounded bg-slate-100 px-1 text-[0.8rem]">src/data/sprintStatus.ts</code> and change only through a team commit.
              Visitors cannot change them.
            </p>
            <p>
              Each check is recorded as Pass or Fail with a name and date. A story can be Done only when every check and condition passes, the implementer is
              recorded, and a designated team member confirms it. The build fails if these rules are broken.
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
      <p className="mt-6 text-xs text-slate-500">
        All sponsors and figures are fictional demonstration data. {formatNumber(records.length)} records currently loaded in this browser.
      </p>
    </>
  )
}
