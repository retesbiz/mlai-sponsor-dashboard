import type { ImpactRecord, MetricKey } from '../types'

export interface ImpactTotals {
  eventsFunded: number
  attendees: number
  startupsSupported: number
  mediaReach: number
  communityEngagement: number
}

/**
 * Aggregate definitions (kept identical everywhere in the app):
 * - Events Funded: number of distinct records (each record is one sponsored event; duplicates are rejected on import).
 * - Every other metric: simple sum of that column across the same records.
 */
export function computeTotals(records: ImpactRecord[]): ImpactTotals {
  return records.reduce<ImpactTotals>(
    (t, r) => ({
      eventsFunded: t.eventsFunded + 1,
      attendees: t.attendees + r.attendees,
      startupsSupported: t.startupsSupported + r.startupsSupported,
      mediaReach: t.mediaReach + r.mediaReach,
      communityEngagement: t.communityEngagement + r.communityEngagement,
    }),
    { eventsFunded: 0, attendees: 0, startupsSupported: 0, mediaReach: 0, communityEngagement: 0 },
  )
}

export interface SponsorSummary extends ImpactTotals {
  sponsor: string
  firstDate: string
  lastDate: string
}

export function summariseSponsors(records: ImpactRecord[]): SponsorSummary[] {
  const groups = new Map<string, ImpactRecord[]>()
  for (const r of records) {
    const list = groups.get(r.sponsor) ?? []
    list.push(r)
    groups.set(r.sponsor, list)
  }
  return [...groups.entries()]
    .map(([sponsor, list]) => {
      const dates = list.map((r) => r.date).sort()
      return { sponsor, ...computeTotals(list), firstDate: dates[0], lastDate: dates[dates.length - 1] }
    })
    .sort((a, b) => a.sponsor.localeCompare(b.sponsor))
}

export function quarterOf(isoDate: string): string {
  const [y, m] = isoDate.split('-').map(Number)
  return `${y}-Q${Math.floor((m - 1) / 3) + 1}`
}

export function quarterLabel(q: string): string {
  const [y, qq] = q.split('-')
  return `${qq} ${y}`
}

export function quarterRange(q: string): [string, string] {
  const [y, qq] = q.split('-Q').map(Number)
  const startMonth = (qq - 1) * 3 + 1
  const endMonth = startMonth + 2
  const lastDay = new Date(Date.UTC(y, endMonth, 0)).getUTCDate()
  const pad = (n: number) => String(n).padStart(2, '0')
  return [`${y}-${pad(startMonth)}-01`, `${y}-${pad(endMonth)}-${pad(lastDay)}`]
}

export function availableQuarters(records: ImpactRecord[]): string[] {
  return [...new Set(records.map((r) => quarterOf(r.date)))].sort()
}

export const METRICS: { key: MetricKey; label: string; short: string; description: string }[] = [
  { key: 'attendees', label: 'Total Attendees', short: 'Attendees', description: 'Sum of recorded attendees across sponsored events.' },
  {
    key: 'startupsSupported',
    // A1.2 metric "Startups Supported". The data has no startup IDs, so this is a per-event total, not a unique count.
    label: 'Startup Participations',
    short: 'Startup participations',
    description:
      'Per-event total for the A1.2 “Startups Supported” metric: startups recorded at each event, added up. A startup at two events is counted twice, so this is not a count of unique startups.',
  },
  { key: 'mediaReach', label: 'Media Reach', short: 'Media reach', description: 'Sum of reported impressions/reach for event promotion and coverage.' },
  {
    key: 'communityEngagement',
    label: 'Community Engagement',
    short: 'Engagement',
    description: 'Sum of recorded community interactions (e.g. comments, RSVPs, follow-ups) per event.',
  },
]
