/**
 * Sprint 1 Backlog, the proposed measurable Definition of Done, and the official,
 * git-tracked verification record for each story.
 *
 * ─── HOW TO RECORD VERIFICATION ──────────────────────────────────────────────
 * The website never changes anything in this file. Visiting pages, clicking buttons
 * and passing automated tests only produce *evidence*. Official results change only
 * when a team member edits this file and commits it (the hosted site updates on push).
 *
 * 1. When the team has agreed the measurable DoD (not before):
 *      DEFINITION_OF_DONE_STATUS = { state: 'agreed', agreedOn: '2026-10-20', agreedBy: 'Team 0311' }
 *
 * 2. Record who implemented each story (needed for the Usability rule):
 *      implementedBy: ['Kai-Po Wang'],
 *
 * 3. Record each story verification check after running it (Fail needs a note):
 *      checkResults: {
 *        'us01-valid-import': { result: 'pass', checkedBy: 'Sabiuddin Ahmed Maheen', checkedOn: '2026-10-20' },
 *        'us01-duplicates':   { result: 'fail', checkedBy: '…', checkedOn: '…', note: 'Defect #3: …' },
 *      },
 *
 * 4. Record DoD conditions 2, 3, 4, 5 and 7 for the story (1 and 6 are derived — see below):
 *      dodResults: {
 *        'functional-testing': { result: 'pass', checkedBy: '…', checkedOn: '…', note: '12/12 test cases, 0 critical defects' },
 *        'usability':          { result: 'pass', checkedBy: '<not an implementer>', checkedOn: '…' },
 *        'data-accuracy':      { result: 'not-applicable', checkedBy: '…', checkedOn: '…', reason: 'No metrics shown' },
 *      },
 *
 * 5. Only when every check and condition passes, record the team verification (DoD condition 6):
 *      completion: { state: 'done', verifiedBy: 'Ian Wang', verifiedOn: '2026-10-21', confirmation: 'All required checks passed' }
 *
 * 6. Client / tutor acceptance, only after explicit feedback:
 *      acceptance: { state: 'accepted', confirmedBy: 'MLAI (client)', confirmedOn: '2026-10-22' }
 *
 * `npm test` (and therefore the GitHub Pages deploy) fails if any of these rules are broken.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { Page } from '../types'

// ── Definition of Done (proposed, measurable) ────────────────────────────────

/**
 * How each condition's result is obtained:
 * - 'checks': derived from the story's recorded verification check results (100% Pass)
 * - 'recorded': recorded by the team per story in `dodResults`
 * - 'verification-record': satisfied by the team's `completion` record (name, date, confirmation)
 */
export const DOD_CRITERIA = [
  {
    id: 'acceptance-criteria',
    title: 'Acceptance Criteria',
    text: '100% of the user story’s agreed acceptance criteria are satisfied and recorded as Pass.',
    source: 'checks',
  },
  {
    id: 'functional-testing',
    title: 'Functional Testing',
    text: '100% of relevant functional test cases pass, with zero unresolved critical defects.',
    source: 'recorded',
  },
  {
    id: 'integration',
    title: 'Integration',
    text: 'The feature works within the relevant Sprint 1 workflow (authorised access → data import → sponsor selection → impact dashboard), with no failed required interactions.',
    source: 'recorded',
  },
  {
    id: 'data-accuracy',
    title: 'Data Accuracy',
    text: 'All applicable displayed metrics and records match the expected results calculated from the fictional sample dataset.',
    source: 'recorded',
  },
  {
    id: 'usability',
    title: 'Usability',
    text: 'At least one team member other than the feature’s implementer successfully completes the relevant user workflow without assistance.',
    source: 'recorded',
  },
  {
    id: 'team-verification',
    title: 'Team Verification',
    text: 'At least one designated team member records their name, verification date, and confirmation that the required checks passed.',
    source: 'verification-record',
  },
  {
    id: 'demo-readiness',
    title: 'Demo Readiness',
    text: 'The feature can be demonstrated successfully using sample data, with zero broken required interactions.',
    source: 'recorded',
  },
] as const

export type DodCriterionId = (typeof DOD_CRITERIA)[number]['id']
/** Conditions the team records directly for each story. */
export type RecordedDodId = Extract<(typeof DOD_CRITERIA)[number], { source: 'recorded' }>['id']
export const RECORDED_DOD_IDS = DOD_CRITERIA.filter((c) => c.source === 'recorded').map((c) => c.id) as RecordedDodId[]
/** Only Data Accuracy may be marked not applicable (e.g. a story that displays no metrics or records). */
export const NOT_APPLICABLE_ALLOWED: RecordedDodId[] = ['data-accuracy']

export type DefinitionOfDoneStatus = { state: 'proposed' } | { state: 'agreed'; agreedOn: string; agreedBy: string }

/** A proposed team standard. Stays 'proposed' until the team confirms it was agreed. */
export const DEFINITION_OF_DONE_STATUS: DefinitionOfDoneStatus = { state: 'proposed' }

// ── Story records ────────────────────────────────────────────────────────────

/** Evidence the app can observe in the current browser session (Demonstrated, never Pass). */
export type EvidenceKey =
  | 'signed-in'
  | 'viewer-restricted'
  | 'logged-out'
  | 'data-imported'
  | 'validation-shown'
  | 'sponsor-selected'
  | 'dashboard-shown'
  | 'sponsor-switched'

export interface ExpectedTotals {
  sponsor: string
  eventsFunded: number
  attendees: number
  startupsSupported: number
  mediaReach: number
  communityEngagement: number
}

export interface VerificationCheck {
  id: string
  text: string
  /** Session evidence that the feature was demonstrated (shown as "Demonstrated", never as Pass) */
  evidence?: EvidenceKey
  /** Expected values for data-accuracy checks; `npm test` confirms they match the built-in sample */
  expected?: ExpectedTotals
}

export interface CheckResult {
  result: 'pass' | 'fail'
  checkedBy: string
  checkedOn: string
  /** Required for Fail: what went wrong / defect reference */
  note?: string
}

export type DodResult =
  | { result: 'pass' | 'fail'; checkedBy: string; checkedOn: string; note?: string }
  | { result: 'not-applicable'; checkedBy: string; checkedOn: string; reason: string }

export type CompletionStatus =
  | { state: 'awaiting-verification'; note?: string }
  | { state: 'done'; verifiedBy: string; verifiedOn: string; confirmation: string }

export type AcceptanceStatus =
  | { state: 'pending' }
  | { state: 'accepted'; confirmedBy: string; confirmedOn: string; note?: string }
  | { state: 'changes-requested'; confirmedBy: string; confirmedOn: string; note: string }

export interface BacklogItem {
  id: string
  title: string
  points: number
  /** What the prototype actually does for this story */
  demonstrated: string
  /** Screen where it can be seen (US04 is the login screen, so none) */
  page?: Page
  /**
   * Acceptance criteria as written in the Sprint Backlog. Kept unchanged as the reference; the
   * measurable checks below are the team's proposed way of verifying them.
   * `criteriaSource: 'draft'` = written from the Sprint 1 scope; replace with the Product Backlog wording.
   */
  criteriaSource: 'draft' | 'product-backlog'
  backlogCriteria: string[]
  /** Proposed measurable verification checks (suggested; the team may refine them) */
  verificationChecks: VerificationCheck[]
  checkResults: Partial<Record<string, CheckResult>>
  dodResults: Partial<Record<RecordedDodId, DodResult>>
  /** Team members who implemented the story (Usability must be checked by someone else) */
  implementedBy: string[]
  completion: CompletionStatus
  acceptance: AcceptanceStatus
}

export const SPRINT = {
  name: 'Sprint 1',
  goal: 'A basic end-to-end prototype allowing an authorised MLAI user to import sample sponsor-impact data and view key sponsor metrics through a simple dashboard.',
  capacity: 18,
}

/** Expected built-in sample totals (All dates, no extra imports, no period filter). */
const ACME: ExpectedTotals = { sponsor: 'Acme Technology', eventsFunded: 4, attendees: 505, startupsSupported: 33, mediaReach: 32900, communityEngagement: 1540 }
const NORTHSTAR: ExpectedTotals = {
  sponsor: 'Northstar Innovations',
  eventsFunded: 4,
  attendees: 750,
  startupsSupported: 63,
  mediaReach: 56700,
  communityEngagement: 2610,
}

export const SPRINT_BACKLOG: BacklogItem[] = [
  {
    id: 'US04',
    title: 'Authorised Access',
    points: 3,
    demonstrated:
      'Branded login screen with a simulated demo session (no real authentication), profile showing user and role, simulated Staff/Viewer role switch, logout.',
    criteriaSource: 'draft',
    backlogCriteria: [
      'Only the login screen is available before entering',
      'The signed-in user and role are visible',
      'A non-staff role cannot import or clear data (simulated in the UI)',
      'The user can log out',
    ],
    verificationChecks: [
      { id: 'us04-enter-session', text: 'A user can enter the simulated MLAI Staff session.', evidence: 'signed-in' },
      { id: 'us04-role-shown', text: 'The prototype displays the correct simulated role.', evidence: 'signed-in' },
      { id: 'us04-logout', text: 'A user can log out and return to the login screen.', evidence: 'logged-out' },
      { id: 'us04-role-restrictions', text: 'Simulated role restrictions behave as documented.', evidence: 'viewer-restricted' },
      { id: 'us04-not-production', text: 'The prototype clearly indicates this is not production authentication.', evidence: 'signed-in' },
    ],
    checkResults: {},
    dodResults: {},
    implementedBy: [],
    completion: { state: 'awaiting-verification' },
    acceptance: { state: 'pending' },
  },
  {
    id: 'US01',
    title: 'Data Import',
    points: 5,
    demonstrated:
      'CSV upload (file picker or drag-and-drop) and a sample-data loader; checks required columns, values, dates, quoting and duplicates; preview before import; confirmation with record count; data kept after refresh.',
    page: 'import',
    criteriaSource: 'draft',
    backlogCriteria: [
      'A staff user can import a CSV with the agreed fields',
      'A confirmation shows how many records were imported',
      'Invalid or malformed rows are reported and not imported',
    ],
    verificationChecks: [
      { id: 'us01-valid-import', text: 'A valid CSV can be imported successfully.', evidence: 'data-imported' },
      { id: 'us01-all-records', text: 'All valid records appear in the imported dataset (sample: 11 of 11).', evidence: 'data-imported' },
      { id: 'us01-validation-messages', text: 'Invalid records produce appropriate validation messages.', evidence: 'validation-shown' },
      { id: 'us01-duplicates', text: 'Duplicate records are handled according to the documented rules (same sponsor + event + date is skipped).' },
      { id: 'us01-persists', text: 'Imported data remains available when navigating between screens.', evidence: 'sponsor-selected' },
    ],
    checkResults: {},
    dodResults: {},
    implementedBy: [],
    completion: { state: 'awaiting-verification' },
    acceptance: { state: 'pending' },
  },
  {
    id: 'US02',
    title: 'Sponsor-Specific View',
    points: 3,
    demonstrated: 'Searchable sponsor directory, sponsor selection, event list filtered to the selected sponsor, “View Dashboard” action.',
    page: 'sponsors',
    criteriaSource: 'draft',
    backlogCriteria: [
      'The user can find and select a sponsor',
      'Only the selected sponsor’s records are shown',
      'The user can open that sponsor’s dashboard',
    ],
    verificationChecks: [
      { id: 'us02-all-sponsors', text: 'All sponsors in the sample dataset appear in the sponsor directory (sample: 3 of 3).', evidence: 'sponsor-selected' },
      { id: 'us02-only-selected', text: 'Selecting a sponsor displays only that sponsor’s records.', evidence: 'sponsor-selected' },
      { id: 'us02-switch', text: 'Switching sponsors updates the selected sponsor correctly.', evidence: 'sponsor-switched' },
      { id: 'us02-search', text: 'Sponsor searches return the expected matching records (e.g. “acme” → Acme Technology only).' },
    ],
    checkResults: {},
    dodResults: {},
    implementedBy: [],
    completion: { state: 'awaiting-verification' },
    acceptance: { state: 'pending' },
  },
  {
    id: 'US03',
    title: 'Impact Metrics Dashboard',
    points: 5,
    demonstrated:
      'Five KPI cards calculated from imported records (Events Funded, Total Attendees, Startup Participations, Media Reach, Community Engagement), per-event chart, sponsor comparison, events table with totals, sponsor and reporting-period switching.',
    page: 'dashboard',
    criteriaSource: 'draft',
    backlogCriteria: [
      'The agreed metrics are shown for the selected sponsor and period',
      'Switching sponsor updates every metric',
      'Fictional demonstration data is clearly labelled',
    ],
    verificationChecks: [
      { id: 'us03-five-metrics', text: 'The five agreed impact metric categories are displayed.', evidence: 'dashboard-shown' },
      {
        id: 'us03-acme-values',
        text: 'Acme Technology displays 4 events, 505 attendees, 33 startup participations, 32,900 media reach and 1,540 community engagement.',
        evidence: 'dashboard-shown',
        expected: ACME,
      },
      {
        id: 'us03-northstar-values',
        text: 'Northstar Innovations displays 4 events, 750 attendees, 63 startup participations, 56,700 media reach and 2,610 community engagement.',
        evidence: 'sponsor-switched',
        expected: NORTHSTAR,
      },
      { id: 'us03-switch-updates', text: 'Switching sponsors updates the cards, chart and event table.', evidence: 'sponsor-switched' },
      { id: 'us03-matches-data', text: 'Metrics match calculations from the imported data (KPI cards equal the event-table totals).', evidence: 'dashboard-shown' },
      {
        id: 'us03-startup-label',
        text: 'Startup Participations is clearly identified as an event-based count, not a unique startup count.',
        evidence: 'dashboard-shown',
      },
    ],
    checkResults: {},
    dodResults: {},
    implementedBy: [],
    completion: { state: 'awaiting-verification' },
    acceptance: { state: 'pending' },
  },
]

/** Shown under US03: when the example values apply. */
export const SAMPLE_VALUES_NOTE =
  'Example values apply only to the unchanged built-in sample dataset (Load Sample Data), with no extra imported records and the reporting period set to All dates.'

export const FUTURE_WORK = [
  'Automated quarterly sponsor reports',
  'Report review and approval workflow',
  'Live integrations with Slack, Luma, Humanitix, Substack, website and social media',
  'Real authentication and a managed user database',
  'Unique startup counts (needs startup identifiers in the data)',
  'Agreement with MLAI on final metric definitions',
]

// ── Derived status (from recorded results only) ─────────────────────────────

export type CheckStatus = 'pass' | 'fail' | 'not-verified'
export type ConditionStatus = CheckStatus | 'not-applicable'

export function checkStatus(item: BacklogItem, checkId: string): CheckStatus {
  return item.checkResults[checkId]?.result ?? 'not-verified'
}

export function checkCounts(item: BacklogItem) {
  const statuses = item.verificationChecks.map((c) => checkStatus(item, c.id))
  return {
    pass: statuses.filter((s) => s === 'pass').length,
    fail: statuses.filter((s) => s === 'fail').length,
    total: statuses.length,
  }
}

/** Status of one DoD condition for a story. Conditions 1 and 6 are derived from other recorded data. */
export function conditionStatus(item: BacklogItem, id: DodCriterionId): ConditionStatus {
  if (id === 'acceptance-criteria') {
    const { pass, fail, total } = checkCounts(item)
    if (fail > 0) return 'fail'
    return pass === total && total > 0 ? 'pass' : 'not-verified'
  }
  if (id === 'team-verification') return item.completion.state === 'done' ? 'pass' : 'not-verified'
  return item.dodResults[id]?.result ?? 'not-verified'
}

export function conditionCounts(item: BacklogItem) {
  const statuses = DOD_CRITERIA.map((c) => conditionStatus(item, c.id))
  return {
    met: statuses.filter((s) => s === 'pass' || s === 'not-applicable').length,
    fail: statuses.filter((s) => s === 'fail').length,
    total: statuses.length,
  }
}

/** Overall DoD status shown on the page. Only 'done' when the team's record says so (and the rules allow it). */
export function overallStatus(item: BacklogItem): 'done' | 'failing' | 'awaiting-verification' {
  if (item.completion.state === 'done') return 'done'
  return checkCounts(item).fail > 0 || conditionCounts(item).fail > 0 ? 'failing' : 'awaiting-verification'
}

// ── Rules ────────────────────────────────────────────────────────────────────

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
/** A real calendar date in YYYY-MM-DD form (rejects e.g. 2026-02-30, which Date.parse would roll over). */
const isDate = (s: string) => {
  if (!ISO_DATE.test(s)) return false
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}
const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/**
 * Problems in the recorded status (empty = consistent). Used by tests — so a bad edit fails
 * the build and deploy — and shown on the Sprint page.
 */
export function validateSprintBacklog(items: BacklogItem[] = SPRINT_BACKLOG, dodStatus: DefinitionOfDoneStatus = DEFINITION_OF_DONE_STATUS): string[] {
  const problems: string[] = []
  if (dodStatus.state === 'agreed') {
    if (!dodStatus.agreedBy.trim()) problems.push('Definition of Done: "agreedBy" is required')
    if (!isDate(dodStatus.agreedOn)) problems.push('Definition of Done: "agreedOn" must be a real YYYY-MM-DD date')
  }

  const storyIds = new Set<string>()
  for (const item of items) {
    const P = (msg: string) => problems.push(`${item.id}: ${msg}`)
    if (storyIds.has(item.id)) P('duplicate story id')
    storyIds.add(item.id)
    if (!(item.points > 0)) P('story points must be positive')
    if (item.backlogCriteria.length === 0) P('needs at least one acceptance criterion')
    if (item.verificationChecks.length === 0) P('needs at least one verification check')

    const checkIds = new Set<string>()
    for (const c of item.verificationChecks) {
      if (checkIds.has(c.id)) P(`duplicate verification check id "${c.id}"`)
      checkIds.add(c.id)
    }

    for (const [id, r] of Object.entries(item.checkResults)) {
      if (!r) continue
      if (!checkIds.has(id)) P(`result recorded for unknown check "${id}"`)
      if (!r.checkedBy.trim()) P(`check "${id}" needs "checkedBy"`)
      if (!isDate(r.checkedOn)) P(`check "${id}" needs "checkedOn" as a real YYYY-MM-DD date`)
      if (r.result === 'fail' && !r.note?.trim()) P(`check "${id}" is Fail and needs a note describing the defect`)
    }

    for (const [id, r] of Object.entries(item.dodResults) as [RecordedDodId, DodResult | undefined][]) {
      if (!r) continue
      if (!(RECORDED_DOD_IDS as string[]).includes(id)) {
        P(`"${id}" cannot be recorded directly (it is derived)`)
        continue
      }
      if (!r.checkedBy.trim()) P(`DoD "${id}" needs "checkedBy"`)
      if (!isDate(r.checkedOn)) P(`DoD "${id}" needs "checkedOn" as a real YYYY-MM-DD date`)
      if (r.result === 'not-applicable') {
        if (!NOT_APPLICABLE_ALLOWED.includes(id)) P(`DoD "${id}" cannot be marked not applicable`)
        if (!r.reason.trim()) P(`DoD "${id}" not applicable needs a reason`)
      }
      if (r.result === 'fail' && !r.note?.trim()) P(`DoD "${id}" is Fail and needs a note`)
      if (id === 'usability' && r.result === 'pass' && item.implementedBy.some((n) => sameName(n, r.checkedBy))) {
        P(`Usability must be checked by someone other than the implementer (${r.checkedBy} implemented this story)`)
      }
    }

    const { completion, acceptance } = item
    if (completion.state === 'done') {
      if (dodStatus.state !== 'agreed') P('marked Done before the team has agreed the Definition of Done')
      if (!completion.verifiedBy.trim()) P('Done needs "verifiedBy" (a designated team member)')
      if (!isDate(completion.verifiedOn)) P('Done needs "verifiedOn" as a real YYYY-MM-DD date')
      if (!completion.confirmation.trim()) P('Done needs a "confirmation" that the required checks passed')
      const notPassed = item.verificationChecks.filter((c) => checkStatus(item, c.id) !== 'pass').map((c) => c.id)
      if (notPassed.length > 0) P(`marked Done but ${notPassed.length} verification check(s) have not passed (${notPassed.join(', ')})`)
      const unmet = RECORDED_DOD_IDS.filter((id) => {
        const s = conditionStatus(item, id)
        return !(s === 'pass' || s === 'not-applicable')
      })
      if (unmet.length > 0) P(`marked Done but DoD condition(s) not met: ${unmet.join(', ')}`)
      if (item.implementedBy.length === 0) P('marked Done but "implementedBy" is empty (needed to check the Usability rule)')
      if (isDate(completion.verifiedOn)) {
        const dates = [...Object.values(item.checkResults), ...Object.values(item.dodResults)].map((r) => r?.checkedOn).filter((d): d is string => !!d && isDate(d))
        if (dates.some((d) => d > completion.verifiedOn)) P('"verifiedOn" is earlier than some recorded checks')
      }
    }
    if (acceptance.state !== 'pending') {
      if (!acceptance.confirmedBy.trim()) P('acceptance needs "confirmedBy"')
      if (!isDate(acceptance.confirmedOn)) P('acceptance needs "confirmedOn" as a real YYYY-MM-DD date')
    }
    if (acceptance.state === 'accepted' && completion.state !== 'done') P('marked Accepted but not yet verified Done')
  }
  return problems
}
