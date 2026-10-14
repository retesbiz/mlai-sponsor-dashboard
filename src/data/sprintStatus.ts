/**
 * Sprint 1 Backlog, the proposed measurable Definition of Done, and the official,
 * git-tracked verification record for each story.
 *
 * ─── HOW TO RECORD VERIFICATION ──────────────────────────────────────────────
 * The website never changes anything in this file. Visiting pages, clicking buttons
 * and passing automated tests only produce *demonstration evidence*. Formal results
 * change only when a team member edits this file and commits it (the site updates on push).
 * Every recorded result needs a name, a real date and an evidence description.
 *
 * 1. When the team has confirmed the proposed checks and agreed the DoD (not before):
 *      VERIFICATION_CHECKS_STATUS = { state: 'confirmed', confirmedOn: '2026-10-20', confirmedBy: 'Team 0311' }
 *      DEFINITION_OF_DONE_STATUS  = { state: 'agreed',    agreedOn:    '2026-10-20', agreedBy:    'Team 0311' }
 *
 * 2. Record who implemented each story (needed for the Usability condition):
 *      implementedBy: ['Kai-Po Wang'],
 *
 * 3. Record each story check after running it:
 *      checkResults: {
 *        'us01-sample-11': { result: 'pass', checkedBy: 'Sabiuddin Ahmed Maheen', checkedOn: '2026-10-20',
 *                            evidence: 'Load Sample Data → banner "11 sponsor-impact records imported", 3 sponsors' },
 *        'us01-reimport':  { result: 'fail', checkedBy: '…', checkedOn: '…', evidence: 'Defect #3: duplicates added' },
 *      },
 *
 * 4. Record DoD conditions 2, 3, 4, 5 and 7 (1 and 6 are derived — see DOD_CRITERIA):
 *      dodResults: {
 *        'functional-testing': { result: 'pass', checkedBy: '…', checkedOn: '…', evidence: 'TC-01..TC-05 pass; defect log: 0 critical' },
 *        'usability':          { result: 'pass', checkedBy: '<not an implementer>', checkedOn: '…', evidence: 'Completed unassisted' },
 *      },
 *
 * 5. Only when everything passes, record the team verification (DoD condition 6):
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
 * - 'checks': derived — Pass only when 100% of the story's required checks are recorded Pass
 * - 'recorded': recorded by the team per story in `dodResults`
 * - 'verification-record': the team's `completion` record (Pass, name, date)
 */
export const DOD_CRITERIA = [
  { id: 'acceptance-criteria', title: 'Acceptance Criteria', text: '100% of agreed story-specific checks pass.', source: 'checks' },
  { id: 'functional-testing', title: 'Functional Testing', text: '100% of applicable tests pass and zero critical defects remain.', source: 'recorded' },
  {
    id: 'integration',
    title: 'Integration',
    text: 'The relevant full Sprint 1 workflow completes once with zero failed required interactions.',
    source: 'recorded',
  },
  {
    id: 'data-accuracy',
    title: 'Data Accuracy',
    text: 'Zero applicable record or metric discrepancies; for US04, correct simulated session and role state.',
    source: 'recorded',
  },
  {
    id: 'usability',
    title: 'Usability',
    text: 'One teammate other than the implementer completes the relevant workflow without assistance.',
    source: 'recorded',
  },
  { id: 'team-verification', title: 'Team Verification', text: 'A designated team member records Pass, name, and date.', source: 'verification-record' },
  { id: 'demo-readiness', title: 'Demo Readiness', text: 'One successful rehearsal with zero failed required actions.', source: 'recorded' },
] as const

export type DodCriterionId = (typeof DOD_CRITERIA)[number]['id']
/** Conditions the team records directly for each story. */
export type RecordedDodId = Extract<(typeof DOD_CRITERIA)[number], { source: 'recorded' }>['id']
export const RECORDED_DOD_IDS = DOD_CRITERIA.filter((c) => c.source === 'recorded').map((c) => c.id) as RecordedDodId[]

export type DefinitionOfDoneStatus = { state: 'proposed' } | { state: 'agreed'; agreedOn: string; agreedBy: string }
/** A proposed team standard. Stays 'proposed' until the team confirms it was agreed. */
export const DEFINITION_OF_DONE_STATUS: DefinitionOfDoneStatus = { state: 'proposed' }

/**
 * The story-specific checks below are proposed verification checks. Where they differ from the
 * team's Sprint Backlog acceptance criteria, they stay 'proposed' until the team confirms them.
 */
export type ChecksStatus = { state: 'proposed' } | { state: 'confirmed'; confirmedOn: string; confirmedBy: string }
export const VERIFICATION_CHECKS_STATUS: ChecksStatus = { state: 'proposed' }

// ── Story records ────────────────────────────────────────────────────────────

/** Things the app can observe in the current browser session. Demonstration evidence only — never a Pass. */
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
  /** Demonstration evidence the app can observe (shown as "Demonstrated this session", never as Pass) */
  demo?: EvidenceKey
  /** Expected values for data checks; `npm test` confirms they match the built-in sample */
  expected?: ExpectedTotals
}

/** A formal, team-recorded result. Evidence is required: what was done or observed (test case, screenshot, defect ref). */
export interface RecordedResult {
  result: 'pass' | 'fail'
  checkedBy: string
  checkedOn: string
  evidence: string
}

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
   * Acceptance criteria as written in the Sprint Backlog — kept unchanged as the reference.
   * `criteriaSource: 'draft'` = written from the Sprint 1 scope; replace with the Product Backlog wording.
   */
  criteriaSource: 'draft' | 'product-backlog'
  backlogCriteria: string[]
  /** Proposed measurable verification checks. All are required: the story needs n/n Pass. */
  verificationChecks: VerificationCheck[]
  checkResults: Partial<Record<string, RecordedResult>>
  dodResults: Partial<Record<RecordedDodId, RecordedResult>>
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

/** Expected built-in sample totals (unchanged data, full reporting period). */
const ACME: ExpectedTotals = { sponsor: 'Acme Technology', eventsFunded: 4, attendees: 505, startupsSupported: 33, mediaReach: 32900, communityEngagement: 1540 }
const NORTHSTAR: ExpectedTotals = {
  sponsor: 'Northstar Innovations',
  eventsFunded: 4,
  attendees: 750,
  startupsSupported: 63,
  mediaReach: 56700,
  communityEngagement: 2610,
}

/** Fixture for US01 checks 2 and 3 (six new, non-duplicate fictional event records). */
export const SIX_RECORD_FIXTURE = 'public/sample-data/mlai-verification-six-new-records.csv'

const pending = () => ({
  checkResults: {},
  dodResults: {},
  implementedBy: [] as string[],
  completion: { state: 'awaiting-verification' } as CompletionStatus,
  acceptance: { state: 'pending' } as AcceptanceStatus,
})

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
      { id: 'us04-enter-staff', text: 'Selecting Enter Demo as MLAI Staff enters the application and displays the Staff role.', demo: 'signed-in' },
      { id: 'us04-screens-locked', text: 'Before signing in, the four main application screens are inaccessible through normal navigation.' },
      { id: 'us04-viewer-disables', text: 'Switching to Viewer disables sample-data loading and data clearing.', demo: 'viewer-restricted' },
      { id: 'us04-staff-restores', text: 'Switching back to Staff restores those actions without reloading.' },
      { id: 'us04-logout-simulated', text: 'Logout returns to the login screen and the interface clearly identifies authentication as simulated.', demo: 'logged-out' },
    ],
    ...pending(),
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
      { id: 'us01-sample-11', text: 'Loading the built-in dataset imports exactly 11 event records across three sponsors.', demo: 'data-imported' },
      { id: 'us01-six-new', text: 'Uploading a valid CSV with six new nonduplicate event records imports all six without validation errors.' },
      { id: 'us01-reimport', text: 'Reimporting that CSV adds zero duplicate records and displays an appropriate message.' },
      { id: 'us01-invalid', text: 'Invalid records or malformed CSV input generate clear validation errors; invalid data is not silently accepted.', demo: 'validation-shown' },
      { id: 'us01-persists', text: 'Imported records remain available after navigating away from and back to the Import page.' },
    ],
    ...pending(),
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
      { id: 'us02-three-sponsors', text: 'All three built-in sample sponsors appear in the directory.', demo: 'sponsor-selected' },
      { id: 'us02-search-acme', text: 'Searching Acme returns Acme Technology and excludes unrelated sponsors.' },
      { id: 'us02-acme-four', text: 'Selecting Acme displays only its four event records.', demo: 'sponsor-selected' },
      { id: 'us02-northstar-four', text: 'Switching to Northstar displays only its four event records, without records from Acme.', demo: 'sponsor-switched' },
    ],
    ...pending(),
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
      { id: 'us03-five-metrics', text: 'All five agreed metric categories are displayed.', demo: 'dashboard-shown' },
      {
        id: 'us03-acme-values',
        text: 'With unchanged built-in data and full reporting period, Acme displays 4 events, 505 attendees, 33 startup participations, 32,900 media reach, and 1,540 community engagement.',
        demo: 'dashboard-shown',
        expected: ACME,
      },
      {
        id: 'us03-northstar-values',
        text: 'Under the same conditions, Northstar displays 4 events, 750 attendees, 63 startup participations, 56,700 media reach, and 2,610 community engagement.',
        demo: 'sponsor-switched',
        expected: NORTHSTAR,
      },
      { id: 'us03-switch-updates', text: 'Switching sponsors updates all five cards, chart, and event table without a page refresh.', demo: 'sponsor-switched' },
      { id: 'us03-zero-discrepancies', text: 'All metric totals match calculations from the imported records, with zero discrepancies in the tested dataset.' },
      { id: 'us03-labels', text: 'Startup Participations is explained as event-based, and sample figures are clearly labelled fictional.', demo: 'dashboard-shown' },
    ],
    ...pending(),
  },
]

/** Shown under data checks: when the example values apply. */
export const SAMPLE_VALUES_NOTE =
  'Expected values apply only to the unchanged built-in sample (Reset demo → Load Sample Data), with no extra imported records and the reporting period set to All dates. Run US03 before importing the six-record verification file, or reset first.'

export const FUTURE_WORK = [
  'Automated quarterly sponsor reports',
  'Report review and approval workflow',
  'Live integrations with Slack, Luma, Humanitix, Substack, website and social media',
  'Real authentication and a managed user database',
  'Unique startup counts (needs startup identifiers in the data)',
  'Agreement with MLAI on final metric definitions',
]

// ── Derived status (from formally recorded results only) ─────────────────────

export type ResultStatus = 'pass' | 'fail' | 'not-verified'

export function checkStatus(item: BacklogItem, checkId: string): ResultStatus {
  return item.checkResults[checkId]?.result ?? 'not-verified'
}

export function checkCounts(item: BacklogItem) {
  const statuses = item.verificationChecks.map((c) => checkStatus(item, c.id))
  const total = statuses.length
  return {
    pass: statuses.filter((s) => s === 'pass').length,
    fail: statuses.filter((s) => s === 'fail').length,
    total,
    /** Every check is required */
    required: total,
  }
}

/** Status of one DoD condition for a story. Conditions 1 and 6 are derived from other recorded data. */
export function conditionStatus(item: BacklogItem, id: DodCriterionId): ResultStatus {
  if (id === 'acceptance-criteria') {
    const { pass, fail, required } = checkCounts(item)
    if (fail > 0) return 'fail'
    return pass === required && required > 0 ? 'pass' : 'not-verified'
  }
  if (id === 'team-verification') return item.completion.state === 'done' ? 'pass' : 'not-verified'
  return item.dodResults[id]?.result ?? 'not-verified'
}

export function conditionCounts(item: BacklogItem) {
  const statuses = DOD_CRITERIA.map((c) => conditionStatus(item, c.id))
  return {
    met: statuses.filter((s) => s === 'pass').length,
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

function validateResult(label: string, r: RecordedResult, P: (m: string) => void) {
  if (r.result !== 'pass' && r.result !== 'fail') P(`${label} result must be "pass" or "fail"`)
  if (!r.checkedBy?.trim()) P(`${label} needs "checkedBy"`)
  if (!isDate(r.checkedOn ?? '')) P(`${label} needs "checkedOn" as a real YYYY-MM-DD date`)
  if (!r.evidence?.trim()) P(`${label} needs an "evidence" description`)
}

/**
 * Problems in the recorded status (empty = consistent). Used by tests — so a bad edit fails
 * the build and deploy — and shown on the Sprint page.
 */
export function validateSprintBacklog(
  items: BacklogItem[] = SPRINT_BACKLOG,
  dodStatus: DefinitionOfDoneStatus = DEFINITION_OF_DONE_STATUS,
  checksStatus: ChecksStatus = VERIFICATION_CHECKS_STATUS,
): string[] {
  const problems: string[] = []
  if (dodStatus.state === 'agreed') {
    if (!dodStatus.agreedBy.trim()) problems.push('Definition of Done: "agreedBy" is required')
    if (!isDate(dodStatus.agreedOn)) problems.push('Definition of Done: "agreedOn" must be a real YYYY-MM-DD date')
  }
  if (checksStatus.state === 'confirmed') {
    if (!checksStatus.confirmedBy.trim()) problems.push('Verification checks: "confirmedBy" is required')
    if (!isDate(checksStatus.confirmedOn)) problems.push('Verification checks: "confirmedOn" must be a real YYYY-MM-DD date')
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
      validateResult(`check "${id}"`, r, P)
    }

    for (const [id, r] of Object.entries(item.dodResults)) {
      if (!r) continue
      if (!(RECORDED_DOD_IDS as string[]).includes(id)) {
        P(`"${id}" cannot be recorded directly (it is derived)`)
        continue
      }
      validateResult(`DoD "${id}"`, r, P)
      if (id === 'usability' && r.result === 'pass' && item.implementedBy.some((n) => sameName(n, r.checkedBy))) {
        P(`Usability must be checked by someone other than the implementer (${r.checkedBy} implemented this story)`)
      }
    }

    const { completion, acceptance } = item
    if (completion.state === 'done') {
      if (dodStatus.state !== 'agreed') P('marked Done before the team has agreed the Definition of Done')
      if (checksStatus.state !== 'confirmed') P('marked Done while the verification checks are still proposed')
      if (!completion.verifiedBy.trim()) P('Done needs "verifiedBy" (a designated team member)')
      if (!isDate(completion.verifiedOn)) P('Done needs "verifiedOn" as a real YYYY-MM-DD date')
      if (!completion.confirmation.trim()) P('Done needs a "confirmation" that the required checks passed')
      const { pass, required } = checkCounts(item)
      if (pass < required) P(`marked Done with ${pass}/${required} required checks passed`)
      const unmet = RECORDED_DOD_IDS.filter((id) => conditionStatus(item, id) !== 'pass')
      if (unmet.length > 0) P(`marked Done but DoD condition(s) not met: ${unmet.join(', ')}`)
      if (item.implementedBy.length === 0) P('marked Done but "implementedBy" is empty (needed for the Usability condition)')
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
