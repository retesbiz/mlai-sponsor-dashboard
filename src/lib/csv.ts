import type { ImpactRecord, ParseResult, RowError } from '../types'

export const REQUIRED_COLUMNS = [
  'sponsor',
  'event',
  'date',
  'attendees',
  'startups_supported',
  'media_reach',
  'community_engagement',
] as const

export const OPTIONAL_COLUMNS = ['event_type', 'location'] as const

export const MAX_FILE_BYTES = 2 * 1024 * 1024
export const MAX_ROWS = 5000

/** RFC 4180-style CSV tokenizer: handles quoted fields, escaped quotes, CRLF and a UTF-8 BOM. */
export function tokenizeCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, '')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
      continue
    }
    if (ch === '"') inQuotes = true
    else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += ch
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

export function normaliseHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s-]+/g, '_')
}

/** Accepts YYYY-MM-DD or DD/MM/YYYY (Australian format). Returns ISO date or null. */
export function parseDate(raw: string): string | null {
  const s = raw.trim()
  let y: number, m: number, d: number
  let match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s)
  if (match) {
    ;[y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])]
  } else if ((match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s))) {
    ;[d, m, y] = [Number(match[1]), Number(match[2]), Number(match[3])]
  } else {
    return null
  }
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** Whole, non-negative number. Thousands separators ("1,200") and surrounding spaces are allowed. */
export function parseCount(raw: string): number | null {
  const s = raw.trim().replace(/,/g, '')
  if (!/^\d+$/.test(s)) return null
  const n = Number(s)
  return Number.isSafeInteger(n) ? n : null
}

export function recordKey(r: Pick<ImpactRecord, 'sponsor' | 'event' | 'date'>): string {
  return `${r.sponsor.trim().toLowerCase()}|${r.event.trim().toLowerCase()}|${r.date}`
}

let idCounter = 0
function makeId(): string {
  idCounter += 1
  return `rec_${Date.now().toString(36)}_${idCounter}`
}

const NUMERIC_FIELDS = [
  ['attendees', 'attendees'],
  ['startups_supported', 'startupsSupported'],
  ['media_reach', 'mediaReach'],
  ['community_engagement', 'communityEngagement'],
] as const

export function parseImpactCsv(text: string, fileName: string): ParseResult {
  const result: ParseResult = { fileName, totalRows: 0, valid: [], errors: [], fatal: null, duplicatesInFile: 0 }
  const rows = tokenizeCsv(text)
  // Track original line numbers while dropping fully blank lines.
  const lines = rows
    .map((cells, idx) => ({ cells, line: idx + 1 }))
    .filter(({ cells }) => cells.some((c) => c.trim() !== ''))

  if (lines.length === 0) {
    result.fatal = 'The file is empty.'
    return result
  }

  const header = lines[0].cells.map(normaliseHeader)
  const missing = REQUIRED_COLUMNS.filter((c) => !header.includes(c))
  if (missing.length > 0) {
    result.fatal = `Missing required column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}.`
    return result
  }

  const dataLines = lines.slice(1)
  if (dataLines.length === 0) {
    result.fatal = 'The file has a header row but no data rows.'
    return result
  }
  if (dataLines.length > MAX_ROWS) {
    result.fatal = `The file has ${dataLines.length.toLocaleString()} rows; the prototype accepts up to ${MAX_ROWS.toLocaleString()}.`
    return result
  }

  const col = (name: string) => header.indexOf(name)
  const seen = new Set<string>()
  result.totalRows = dataLines.length

  for (const { cells, line } of dataLines) {
    const get = (name: string) => {
      const i = col(name)
      return i >= 0 ? (cells[i] ?? '').trim() : ''
    }
    const rowErrors: RowError[] = []

    const sponsor = get('sponsor')
    const event = get('event')
    if (!sponsor) rowErrors.push({ line, field: 'sponsor', message: 'Sponsor is required.' })
    if (!event) rowErrors.push({ line, field: 'event', message: 'Event name is required.' })

    const rawDate = get('date')
    const date = parseDate(rawDate)
    if (!date) {
      rowErrors.push({
        line,
        field: 'date',
        message: rawDate ? `"${rawDate}" is not a valid date (use YYYY-MM-DD).` : 'Date is required.',
      })
    }

    const counts: Partial<Record<(typeof NUMERIC_FIELDS)[number][1], number>> = {}
    for (const [csvName, key] of NUMERIC_FIELDS) {
      const raw = get(csvName)
      const n = parseCount(raw)
      if (n === null) {
        rowErrors.push({
          line,
          field: csvName,
          message: raw ? `"${raw}" must be a whole number of 0 or more.` : `${csvName} is required.`,
        })
      } else counts[key] = n
    }

    if (rowErrors.length > 0) {
      result.errors.push(...rowErrors)
      continue
    }

    const record: ImpactRecord = {
      id: makeId(),
      sponsor,
      event,
      date: date!,
      eventType: get('event_type') || undefined,
      location: get('location') || undefined,
      attendees: counts.attendees!,
      startupsSupported: counts.startupsSupported!,
      mediaReach: counts.mediaReach!,
      communityEngagement: counts.communityEngagement!,
    }

    const key = recordKey(record)
    if (seen.has(key)) {
      result.duplicatesInFile += 1
      result.errors.push({ line, message: `Duplicate of an earlier row (${sponsor} · ${event} · ${date}); skipped so it is not counted twice.` })
      continue
    }
    seen.add(key)
    result.valid.push(record)
  }

  return result
}

const CSV_HEADER = [...REQUIRED_COLUMNS.slice(0, 3), ...OPTIONAL_COLUMNS, ...REQUIRED_COLUMNS.slice(3)]

function escapeCell(v: string | number | undefined): string {
  const s = v === undefined ? '' : String(v)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function recordsToCsv(records: ImpactRecord[]): string {
  const lines = records.map((r) =>
    [r.sponsor, r.event, r.date, r.eventType, r.location, r.attendees, r.startupsSupported, r.mediaReach, r.communityEngagement]
      .map(escapeCell)
      .join(','),
  )
  return [CSV_HEADER.join(','), ...lines].join('\n') + '\n'
}

export function downloadText(fileName: string, text: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
