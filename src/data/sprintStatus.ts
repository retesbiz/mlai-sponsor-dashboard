/**
 * Sprint 1 Backlog, the team's Definition of Done, and the official, git-tracked status of each story.
 *
 * ─── HOW TO RECORD VERIFICATION ──────────────────────────────────────────────
 * The website never changes these values. Visiting or demonstrating a screen only
 * produces *session evidence*. Official status changes only when a team member
 * edits this file and commits it (the hosted site updates on push).
 *
 * 1. Once the team has agreed the Definition of Done:
 *      DEFINITION_OF_DONE_STATUS = { state: 'agreed', agreedOn: '2026-10-20', agreedBy: 'Team 0311' }
 *
 * 2. Tick a DoD criterion for a story only after checking it, recording who and when:
 *      dodChecks: {
 *        functionality: { checkedBy: 'Kai-Po Wang', checkedOn: '2026-10-20' },
 *        testing: { checkedBy: 'Sabiuddin Ahmed Maheen', checkedOn: '2026-10-20', note: 'npm test, 40 passing' },
 *      },
 *
 * 3. Mark a story Done only when ALL seven criteria are checked and the DoD is agreed:
 *      completion: { state: 'done', verifiedBy: 'Ian Wang', verifiedOn: '2026-10-21' }
 *
 * 4. Client / tutor acceptance, only after actual feedback:
 *      acceptance: { state: 'accepted', confirmedBy: 'MLAI (client)', confirmedOn: '2026-10-22' }
 *      acceptance: { state: 'changes-requested', confirmedBy: '…', confirmedOn: '…', note: '…' }
 *
 * Acceptance criteria marked `criteriaSource: 'draft'` were written from the Sprint 1 scope.
 * Replace them with the Product Backlog wording and set `criteriaSource: 'product-backlog'`.
 *
 * `npm test` (and the GitHub Pages deploy) fails if any of these rules are broken.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { Page } from '../types'

// ── Definition of Done ───────────────────────────────────────────────────────

export const DOD_CRITERIA = [
  { id: 'functionality', title: 'Functionality', text: 'The feature is implemented in the prototype and demonstrates the intended interaction.' },
  { id: 'acceptance-criteria', title: 'Acceptance Criteria', text: 'All agreed acceptance criteria for the user story are satisfied.' },
  { id: 'testing', title: 'Testing', text: 'The feature has been successfully tested without critical errors.' },
  { id: 'integration', title: 'Integration', text: 'The feature works correctly with the other Sprint 1 features.' },
  { id: 'user-experience', title: 'User Experience', text: 'The interface is understandable and suitable for the intended user journey.' },
  { id: 'team-verification', title: 'Team Verification', text: 'The team has reviewed the feature and confirmed its completion.' },
  { id: 'demo-readiness', title: 'Demo Readiness', text: 'The feature can be demonstrated reliably using fictional sample data.' },
] as const

export type DodCriterionId = (typeof DOD_CRITERIA)[number]['id']

export type DefinitionOfDoneStatus = { state: 'proposed' } | { state: 'agreed'; agreedOn: string; agreedBy: string }

/** Stays 'proposed' until the team confirms it agreed this Definition of Done. */
export const DEFINITION_OF_DONE_STATUS: DefinitionOfDoneStatus = { state: 'proposed' }

// ── Backlog items ────────────────────────────────────────────────────────────

/** Evidence the app can observe in the current browser session (see SprintPage). */
export type EvidenceKey =
  | 'signed-in'
  | 'viewer-restricted'
  | 'logged-out'
  | 'data-imported'
  | 'validation-shown'
  | 'sponsor-selected'
  | 'dashboard-shown'
  | 'sponsor-switched'

export interface AcceptanceCriterion {
  text: string
  /** How the app can show evidence for it; null = check it live during the demo */
  evidence: EvidenceKey | null
}

/** One ticked DoD criterion: who checked it and when. Absent = not yet verified. */
export interface DodCheck {
  checkedBy: string
  checkedOn: string
  note?: string
}

export type CompletionStatus =
  | { state: 'awaiting-verification'; note?: string }
  | { state: 'done'; verifiedBy: string; verifiedOn: string; note?: string }

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
  criteriaSource: 'draft' | 'product-backlog'
  criteria: AcceptanceCriterion[]
  /** Ticked Definition of Done criteria. Empty until the team verifies each one. */
  dodChecks: Partial<Record<DodCriterionId, DodCheck>>
  completion: CompletionStatus
  acceptance: AcceptanceStatus
}

export const SPRINT = {
  name: 'Sprint 1',
  goal: 'A basic end-to-end prototype allowing an authorised MLAI user to import sample sponsor-impact data and view key sponsor metrics through a simple dashboard.',
  capacity: 18,
}

export const SPRINT_BACKLOG: BacklogItem[] = [
  {
    id: 'US04',
    title: 'Authorised Access',
    points: 3,
    demonstrated:
      'Branded login screen with a simulated demo session (no real authentication), profile showing user and role, simulated Staff/Viewer role switch, logout.',
    criteriaSource: 'draft',
    criteria: [
      { text: 'Only the login screen is available before entering', evidence: 'signed-in' },
      { text: 'The signed-in user and role are visible', evidence: 'signed-in' },
      { text: 'A non-staff role cannot import or clear data (simulated in the UI)', evidence: 'viewer-restricted' },
      { text: 'The user can log out', evidence: 'logged-out' },
    ],
    dodChecks: {},
    completion: { state: 'awaiting-verification' },
    acceptance: { state: 'pending' },
  },
  {
    id: 'US01',
    title: 'Sponsor-Impact Data Import',
    points: 5,
    demonstrated:
      'CSV upload (file picker or drag-and-drop) and a sample-data loader; checks required columns, values, dates, quoting and duplicates; preview before import; confirmation with record count; data kept after refresh.',
    page: 'import',
    criteriaSource: 'draft',
    criteria: [
      { text: 'A staff user can import a CSV with the agreed fields', evidence: 'data-imported' },
      { text: 'A confirmation shows how many records were imported', evidence: 'data-imported' },
      { text: 'Invalid or malformed rows are reported and not imported', evidence: 'validation-shown' },
    ],
    dodChecks: {},
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
    criteria: [
      { text: 'The user can find and select a sponsor', evidence: 'sponsor-selected' },
      { text: 'Only the selected sponsor’s records are shown', evidence: 'sponsor-selected' },
      { text: 'The user can open that sponsor’s dashboard', evidence: 'dashboard-shown' },
    ],
    dodChecks: {},
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
    criteria: [
      { text: 'The agreed metrics are shown for the selected sponsor and period', evidence: 'dashboard-shown' },
      { text: 'Switching sponsor updates every metric', evidence: 'sponsor-switched' },
      { text: 'Fictional demonstration data is clearly labelled', evidence: 'dashboard-shown' },
    ],
    dodChecks: {},
    completion: { state: 'awaiting-verification' },
    acceptance: { state: 'pending' },
  },
]

export const FUTURE_WORK = [
  'Automated quarterly sponsor reports',
  'Report review and approval workflow',
  'Live integrations with Slack, Luma, Humanitix, Substack, website and social media',
  'Real authentication and a managed user database',
  'Unique startup counts (needs startup identifiers in the data)',
  'Agreement with MLAI on final metric definitions',
]

// ── Rules ────────────────────────────────────────────────────────────────────

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
/** A real calendar date in YYYY-MM-DD form (rejects e.g. 2026-02-30, which Date.parse would roll over). */
const isDate = (s: string) => {
  if (!ISO_DATE.test(s)) return false
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

export function checkedCount(item: BacklogItem): number {
  return DOD_CRITERIA.filter((c) => item.dodChecks[c.id]).length
}

/**
 * Problems in the recorded status (empty = consistent). Used by tests, so a bad edit fails the
 * build and deploy, and shown on the Sprint page.
 */
export function validateSprintBacklog(items: BacklogItem[] = SPRINT_BACKLOG, dodStatus: DefinitionOfDoneStatus = DEFINITION_OF_DONE_STATUS): string[] {
  const problems: string[] = []
  if (dodStatus.state === 'agreed') {
    if (!dodStatus.agreedBy.trim()) problems.push('Definition of Done: "agreedBy" is required')
    if (!isDate(dodStatus.agreedOn)) problems.push('Definition of Done: "agreedOn" must be a YYYY-MM-DD date')
  }
  const validIds = new Set<string>(DOD_CRITERIA.map((c) => c.id))
  const ids = new Set<string>()
  for (const item of items) {
    if (ids.has(item.id)) problems.push(`${item.id}: duplicate story id`)
    ids.add(item.id)
    if (!(item.points > 0)) problems.push(`${item.id}: story points must be positive`)
    if (item.criteria.length === 0) problems.push(`${item.id}: needs at least one acceptance criterion`)

    for (const [key, check] of Object.entries(item.dodChecks)) {
      if (!validIds.has(key)) problems.push(`${item.id}: unknown DoD criterion "${key}"`)
      if (!check) continue
      if (!check.checkedBy.trim()) problems.push(`${item.id}: DoD "${key}" needs "checkedBy"`)
      if (!isDate(check.checkedOn)) problems.push(`${item.id}: DoD "${key}" needs "checkedOn" as YYYY-MM-DD`)
    }

    const { completion, acceptance } = item
    if (completion.state === 'done') {
      if (!completion.verifiedBy.trim()) problems.push(`${item.id}: Done needs "verifiedBy" (a team member's name)`)
      if (!isDate(completion.verifiedOn)) problems.push(`${item.id}: Done needs "verifiedOn" as YYYY-MM-DD`)
      const missing = DOD_CRITERIA.filter((c) => !item.dodChecks[c.id]).map((c) => c.title)
      if (missing.length > 0) problems.push(`${item.id}: marked Done but ${missing.length} DoD criteria are not verified (${missing.join(', ')})`)
      if (dodStatus.state !== 'agreed') problems.push(`${item.id}: marked Done before the team has agreed the Definition of Done`)
    }
    if (acceptance.state !== 'pending') {
      if (!acceptance.confirmedBy.trim()) problems.push(`${item.id}: acceptance needs "confirmedBy"`)
      if (!isDate(acceptance.confirmedOn)) problems.push(`${item.id}: acceptance needs "confirmedOn" as YYYY-MM-DD`)
    }
    if (acceptance.state === 'accepted' && completion.state !== 'done') {
      problems.push(`${item.id}: marked Accepted but not yet verified Done`)
    }
  }
  return problems
}
