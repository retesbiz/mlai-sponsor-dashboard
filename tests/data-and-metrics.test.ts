/**
 * Sprint 1 data checks: CSV import/validation and KPI aggregation.
 * Run with `npm test` (uses Node's built-in test runner and native TypeScript support, Node 22.18+).
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parseCount, parseDate, parseImpactCsv, recordKey, recordsToCsv, tokenizeCsv } from '../src/lib/csv.ts'
import { availableQuarters, computeTotals, quarterOf, quarterRange, summariseSponsors } from '../src/lib/metrics.ts'

const root = (p: string) => fileURLToPath(new URL(`../${p}`, import.meta.url))
const SAMPLE = readFileSync(root('public/sample-data/mlai-sample-sponsor-impact.csv'), 'utf8')
const ERRORS = readFileSync(root('public/sample-data/mlai-sample-with-errors.csv'), 'utf8')

// Expected values worked out by hand from the sample CSV, independently of the app code.
const EXPECTED = {
  'Acme Technology': { eventsFunded: 4, attendees: 505, startupsSupported: 33, mediaReach: 32900, communityEngagement: 1540 },
  'Horizon Ventures': { eventsFunded: 3, attendees: 205, startupsSupported: 13, mediaReach: 12600, communityEngagement: 830 },
  'Northstar Innovations': { eventsFunded: 4, attendees: 750, startupsSupported: 63, mediaReach: 56700, communityEngagement: 2610 },
}

describe('sample data import (US01)', () => {
  const result = parseImpactCsv(SAMPLE, 'sample.csv')

  test('all 11 sample rows are valid', () => {
    assert.equal(result.fatal, null)
    assert.equal(result.totalRows, 11)
    assert.equal(result.valid.length, 11)
    assert.deepEqual(result.errors, [])
  })

  test('contains exactly the three fictional sponsors', () => {
    assert.deepEqual([...new Set(result.valid.map((r) => r.sponsor))].sort(), Object.keys(EXPECTED).sort())
  })

  test('bundled sample (used by Load Sample Data) matches the downloadable public file', () => {
    assert.equal(readFileSync(root('src/data/sample-sponsor-impact.csv'), 'utf8'), SAMPLE)
    assert.equal(readFileSync(root('src/data/sample-with-errors.csv'), 'utf8'), ERRORS)
  })
})

describe('KPI calculations (US03)', () => {
  const records = parseImpactCsv(SAMPLE, 'sample.csv').valid

  for (const [sponsor, expected] of Object.entries(EXPECTED)) {
    test(`${sponsor}: totals match hand-calculated values`, () => {
      assert.deepEqual(computeTotals(records.filter((r) => r.sponsor === sponsor)), expected)
    })
  }

  test('sponsor totals add up to the overall total (nothing counted twice or missed)', () => {
    const overall = computeTotals(records)
    assert.deepEqual(overall, { eventsFunded: 11, attendees: 1460, startupsSupported: 109, mediaReach: 102200, communityEngagement: 4980 })
    const summed = summariseSponsors(records).reduce(
      (t, s) => ({
        eventsFunded: t.eventsFunded + s.eventsFunded,
        attendees: t.attendees + s.attendees,
        startupsSupported: t.startupsSupported + s.startupsSupported,
        mediaReach: t.mediaReach + s.mediaReach,
        communityEngagement: t.communityEngagement + s.communityEngagement,
      }),
      computeTotals([]),
    )
    assert.deepEqual(summed, overall)
  })

  test('share of all sponsors shown on KPI cards (Northstar attendees ≈ 51%)', () => {
    const northstar = computeTotals(records.filter((r) => r.sponsor === 'Northstar Innovations'))
    assert.equal(Math.round((northstar.attendees / computeTotals(records).attendees) * 100), 51)
  })

  test('empty selection gives zeroes, not NaN', () => {
    assert.deepEqual(computeTotals([]), { eventsFunded: 0, attendees: 0, startupsSupported: 0, mediaReach: 0, communityEngagement: 0 })
  })
})

describe('sponsor switching and period filter (US02 / US03)', () => {
  const records = parseImpactCsv(SAMPLE, 'sample.csv').valid

  test('filtering by sponsor returns only that sponsor’s events', () => {
    for (const sponsor of Object.keys(EXPECTED)) {
      const rows = records.filter((r) => r.sponsor === sponsor)
      assert.ok(rows.every((r) => r.sponsor === sponsor))
      assert.equal(rows.length, EXPECTED[sponsor as keyof typeof EXPECTED].eventsFunded)
    }
  })

  test('switching sponsor changes every KPI (sample data is distinct per sponsor)', () => {
    const [a, b, c] = Object.values(EXPECTED)
    for (const key of ['attendees', 'startupsSupported', 'mediaReach', 'communityEngagement'] as const) {
      assert.equal(new Set([a[key], b[key], c[key]]).size, 3, key)
    }
  })

  test('Northstar Q3 2026 contains Demo Day and the Agents meetup only', () => {
    const q3 = records.filter((r) => r.sponsor === 'Northstar Innovations' && quarterOf(r.date) === '2026-Q3')
    assert.deepEqual(q3.map((r) => r.event).sort(), ['Agents in Production Meetup', 'MLAI Demo Day'])
    assert.equal(computeTotals(q3).attendees, 495)
  })

  test('quarters offered for a sponsor come from its own events', () => {
    assert.deepEqual(availableQuarters(records.filter((r) => r.sponsor === 'Horizon Ventures')), ['2026-Q1', '2026-Q2', '2026-Q3'])
  })

  test('quarter ranges cover whole calendar quarters', () => {
    assert.deepEqual(quarterRange('2026-Q1'), ['2026-01-01', '2026-03-31'])
    assert.deepEqual(quarterRange('2026-Q4'), ['2026-10-01', '2026-12-31'])
  })
})

describe('validation (US01)', () => {
  test('error sample: 2 valid rows, 3 invalid rows, 1 duplicate', () => {
    const r = parseImpactCsv(ERRORS, 'errors.csv')
    assert.equal(r.totalRows, 6)
    assert.equal(r.valid.length, 2)
    assert.equal(r.duplicatesInFile, 1)
    assert.deepEqual(
      r.errors.map((e) => [e.line, e.field ?? 'duplicate']),
      [
        [3, 'sponsor'],
        [4, 'date'],
        [5, 'attendees'],
        [7, 'duplicate'],
      ],
    )
  })

  test('file-level problems are reported, not partially imported', () => {
    assert.match(parseImpactCsv('', 'x').fatal ?? '', /empty/)
    assert.match(parseImpactCsv('sponsor,event\nA,B', 'x').fatal ?? '', /Missing required columns: date, attendees/)
    assert.match(parseImpactCsv('sponsor,event,date,attendees,startups_supported,media_reach,community_engagement\n', 'x').fatal ?? '', /no data rows/)
  })

  test('headers are matched case-insensitively with spaces', () => {
    const csv = 'Sponsor,Event,Date,Attendees,Startups Supported,Media Reach,Community Engagement\nA,B,2026-01-01,1,2,3,4'
    assert.equal(parseImpactCsv(csv, 'x').valid.length, 1)
  })

  test('dates: ISO and DD/MM/YYYY accepted, impossible dates rejected', () => {
    assert.equal(parseDate('2026-2-3'), '2026-02-03')
    assert.equal(parseDate('05/03/2026'), '2026-03-05')
    assert.equal(parseDate('29/02/2026'), null)
    assert.equal(parseDate('29/02/2028'), '2028-02-29')
    assert.equal(parseDate('2026-13-02'), null)
  })

  test('counts: whole non-negative numbers only', () => {
    assert.equal(parseCount('1,200'), 1200)
    assert.equal(parseCount(' 7 '), 7)
    assert.equal(parseCount('-5'), null)
    assert.equal(parseCount('3.5'), null)
    assert.equal(parseCount('ninety'), null)
  })

  test('quoted fields, escaped quotes, CRLF and BOM are handled', () => {
    assert.deepEqual(tokenizeCsv('﻿a,"b, c","say ""hi"""\r\n1,2,3'), [
      ['a', 'b, c', 'say "hi"'],
      ['1', '2', '3'],
    ])
  })

  test('duplicate key ignores case and surrounding spaces', () => {
    assert.equal(recordKey({ sponsor: ' Acme Technology', event: 'AI Builders Meetup ', date: '2026-02-12' }), recordKey({ sponsor: 'acme technology', event: 'ai builders meetup', date: '2026-02-12' }))
  })

  test('export → re-import round-trip keeps every value', () => {
    const records = parseImpactCsv(SAMPLE, 'sample.csv').valid
    const again = parseImpactCsv(recordsToCsv(records), 'export.csv').valid
    const strip = (rs: typeof records) => rs.map(({ id: _id, ...rest }) => rest)
    assert.deepEqual(strip(again), strip(records))
  })
})
