export type Role = 'staff' | 'viewer'

export interface DemoSession {
  name: string
  role: Role
  startedAt: string
}

/** One sponsor-impact record = one sponsored event. */
export interface ImpactRecord {
  id: string
  sponsor: string
  event: string
  /** ISO date, YYYY-MM-DD */
  date: string
  eventType?: string
  location?: string
  attendees: number
  startupsSupported: number
  mediaReach: number
  communityEngagement: number
}

export interface RowError {
  /** 1-based line number in the source file (header = line 1) */
  line: number
  field?: string
  message: string
}

export interface ParseResult {
  fileName: string
  totalRows: number
  valid: ImpactRecord[]
  errors: RowError[]
  /** Errors that stop the whole file (e.g. missing columns) */
  fatal: string | null
  /** Rows skipped because the same sponsor + event + date appeared earlier in the file */
  duplicatesInFile: number
}

export type Page = 'import' | 'sponsors' | 'dashboard' | 'sprint'

export type MetricKey = 'attendees' | 'startupsSupported' | 'mediaReach' | 'communityEngagement'
