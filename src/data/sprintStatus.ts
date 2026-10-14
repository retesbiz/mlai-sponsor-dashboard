/**
 * Sprint 1 Backlog and the team-maintained status of each item.
 *
 * ─── HOW TO RECORD STATUS ────────────────────────────────────────────────────
 * The app never marks a story Done or Accepted by itself. Visiting pages only
 * produces *evidence* (shown separately). To record a verified status, edit the
 * `dod` and `acceptance` fields below and commit — the hosted site updates on push.
 *
 *   Definition of Done, after the team has checked it:
 *     dod: { state: 'verified', verifiedBy: 'Ian Wang', verifiedOn: '2026-10-20', note: 'Checked against DoD v1' }
 *   or, if it is not done:
 *     dod: { state: 'not-done', note: 'Carried over to Sprint 2: …' }
 *
 *   Client / tutor acceptance, only once actually confirmed:
 *     acceptance: { state: 'accepted', confirmedBy: 'MLAI (Product Owner)', confirmedOn: '2026-10-21' }
 *     acceptance: { state: 'changes-requested', confirmedBy: '…', confirmedOn: '…', note: '…' }
 *
 * Acceptance criteria marked `criteriaSource: 'draft'` were written from the Sprint 1
 * scope, not copied from the Product Backlog. Replace them with your backlog wording
 * and set `criteriaSource: 'product-backlog'`.
 * `npm test` checks this file for missing names/dates and inconsistent states.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { Page } from '../types'

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

export type DodStatus =
  | { state: 'awaiting-team-confirmation' }
  | { state: 'verified'; verifiedBy: string; verifiedOn: string; note?: string }
  | { state: 'not-done'; note: string }

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
  dod: DodStatus
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
    title: 'Authorised access',
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
    dod: { state: 'awaiting-team-confirmation' },
    acceptance: { state: 'pending' },
  },
  {
    id: 'US01',
    title: 'Import sponsor-impact data',
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
    dod: { state: 'awaiting-team-confirmation' },
    acceptance: { state: 'pending' },
  },
  {
    id: 'US02',
    title: 'View sponsor-specific information',
    points: 3,
    demonstrated: 'Searchable sponsor directory, sponsor selection, event list filtered to the selected sponsor, “View Dashboard” action.',
    page: 'sponsors',
    criteriaSource: 'draft',
    criteria: [
      { text: 'The user can find and select a sponsor', evidence: 'sponsor-selected' },
      { text: 'Only the selected sponsor’s records are shown', evidence: 'sponsor-selected' },
      { text: 'The user can open that sponsor’s dashboard', evidence: 'dashboard-shown' },
    ],
    dod: { state: 'awaiting-team-confirmation' },
    acceptance: { state: 'pending' },
  },
  {
    id: 'US03',
    title: 'Display agreed sponsor-impact metrics',
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
    dod: { state: 'awaiting-team-confirmation' },
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

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** Problems in the status data (empty = consistent). Used by tests and shown on the Sprint page. */
export function validateSprintBacklog(items: BacklogItem[] = SPRINT_BACKLOG): string[] {
  const problems: string[] = []
  const ids = new Set<string>()
  for (const item of items) {
    if (ids.has(item.id)) problems.push(`${item.id}: duplicate story id`)
    ids.add(item.id)
    if (!(item.points > 0)) problems.push(`${item.id}: story points must be positive`)
    if (item.criteria.length === 0) problems.push(`${item.id}: needs at least one acceptance criterion`)
    const { dod, acceptance } = item
    if (dod.state === 'verified') {
      if (!dod.verifiedBy.trim()) problems.push(`${item.id}: Done status needs "verifiedBy"`)
      if (!ISO_DATE.test(dod.verifiedOn)) problems.push(`${item.id}: Done status needs "verifiedOn" as YYYY-MM-DD`)
    }
    if (dod.state === 'not-done' && !dod.note.trim()) problems.push(`${item.id}: "not-done" needs a note (e.g. carried over)`)
    if (acceptance.state !== 'pending') {
      if (!acceptance.confirmedBy.trim()) problems.push(`${item.id}: acceptance needs "confirmedBy"`)
      if (!ISO_DATE.test(acceptance.confirmedOn)) problems.push(`${item.id}: acceptance needs "confirmedOn" as YYYY-MM-DD`)
    }
    if (acceptance.state === 'accepted' && dod.state !== 'verified') {
      problems.push(`${item.id}: marked accepted but the team has not verified it as Done`)
    }
  }
  return problems
}
