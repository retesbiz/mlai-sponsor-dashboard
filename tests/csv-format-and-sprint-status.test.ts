/**
 * Checks added with the Sprint 1 review fixes:
 * malformed-CSV detection, the Startup Participations metric, and the sprint status file.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { parseImpactCsv, scanCsv } from '../src/lib/csv.ts'
import { METRICS, computeTotals } from '../src/lib/metrics.ts'
import { SPRINT, SPRINT_BACKLOG, validateSprintBacklog, type BacklogItem } from '../src/data/sprintStatus.ts'

const HEADER = 'sponsor,event,date,attendees,startups_supported,media_reach,community_engagement'
const csv = (...rows: string[]) => [HEADER, ...rows].join('\n')

describe('malformed CSV input (US01)', () => {
  test('unmatched quotation mark stops the import with the line where it opened', () => {
    const r = parseImpactCsv(csv('Acme,Talk,2026-01-01,1,1,1,1', '"Acme,Talk,2026-01-02,1,1,1,1', 'Acme,Other,2026-01-03,1,1,1,1'), 'x.csv')
    assert.match(r.fatal ?? '', /Unmatched quotation mark/)
    assert.match(r.fatal ?? '', /starts on line 3/)
    assert.equal(r.valid.length, 0, 'nothing is imported from a file that cannot be read reliably')
  })

  test('a stray quote inside an unquoted value is reported for that row only', () => {
    const r = parseImpactCsv(csv('Acme,The "Big" Talk,2026-01-01,1,1,1,1', 'Acme,Fine Talk,2026-01-02,1,1,1,1'), 'x.csv')
    assert.equal(r.fatal, null)
    assert.equal(r.valid.length, 1)
    assert.equal(r.errors.length, 1)
    assert.equal(r.errors[0].line, 2)
    assert.equal(r.errors[0].field, 'csv format')
    assert.match(r.errors[0].message, /Unexpected quotation mark/)
  })

  test('text straight after a closing quote is reported', () => {
    const r = parseImpactCsv(csv('Acme,"Talk"s,2026-01-01,1,1,1,1'), 'x.csv')
    assert.equal(r.valid.length, 0)
    assert.match(r.errors[0].message, /after a closing quotation mark on line 2/)
  })

  test('rows with too many or too few values are reported, e.g. an unquoted 1,200', () => {
    const r = parseImpactCsv(csv('Acme,Talk,2026-01-01,1,200,1,1,1', 'Acme,Short,2026-01-02,1,1'), 'x.csv')
    assert.equal(r.valid.length, 0)
    assert.deepEqual(
      r.errors.map((e) => [e.line, e.field]),
      [
        [2, 'csv format'],
        [3, 'csv format'],
      ],
    )
    assert.match(r.errors[0].message, /has 8 values but the header has 7 columns/)
    assert.match(r.errors[1].message, /has 5 values but the header has 7 columns/)
  })

  test('correctly quoted values (commas, escaped quotes, line breaks) still import', () => {
    const r = parseImpactCsv(csv('"Acme, Inc","Talk ""AI"" night",2026-01-01,"1,200",1,1,1', ' "Acme, Inc" ,"Multi\nline event",2026-01-02,1,1,1,1'), 'x.csv')
    assert.equal(r.fatal, null)
    assert.deepEqual(r.errors, [])
    assert.deepEqual(
      r.valid.map((v) => [v.sponsor, v.event, v.attendees]),
      [
        ['Acme, Inc', 'Talk "AI" night', 1200],
        ['Acme, Inc', 'Multi\nline event', 1],
      ],
    )
  })

  test('line numbers stay correct after a quoted value that spans lines', () => {
    const r = parseImpactCsv(csv('Acme,"Two\nlines",2026-01-01,1,1,1,1', 'Acme,Bad,2026-99-01,1,1,1,1'), 'x.csv')
    assert.equal(r.errors.length, 1)
    assert.equal(r.errors[0].line, 4, 'header = 1, quoted row = lines 2–3, bad row = line 4')
  })

  test('scanner reports where each row starts', () => {
    const s = scanCsv('a,b\n"x\ny",z\nc,d')
    assert.equal(s.unclosedQuoteLine, null)
    assert.deepEqual(
      s.rows.map((r) => r.line),
      [1, 2, 4],
    )
  })

  test('semicolon- or tab-separated files get a helpful message', () => {
    assert.match(parseImpactCsv(HEADER.replaceAll(',', ';') + '\nA;B', 'x.csv').fatal ?? '', /semicolons/)
    assert.match(parseImpactCsv(HEADER.replaceAll(',', '\t') + '\nA\tB', 'x.csv').fatal ?? '', /tabs/)
  })

  test('duplicate column names are rejected', () => {
    assert.match(parseImpactCsv(HEADER + ',sponsor\nA,B,2026-01-01,1,1,1,1,C', 'x.csv').fatal ?? '', /“sponsor” appears more than once/)
  })

  test('a malformed header row is rejected', () => {
    assert.match(parseImpactCsv('sponsor,ev"ent,date\nA,B,C', 'x.csv').fatal ?? '', /header row is malformed/)
  })

  test('binary files are rejected', () => {
    assert.match(parseImpactCsv('PK\u0003\u0004\u0000\u0000', 'book.xlsx').fatal ?? '', /binary data/)
  })
})

describe('Startup Participations metric (US03, A1.2 “Startups Supported”)', () => {
  const meta = METRICS.find((m) => m.key === 'startupsSupported')!

  test('is labelled as a per-event total, not unique startups', () => {
    assert.equal(meta.label, 'Startup Participations')
    assert.match(meta.description, /A1\.2 “Startups Supported”/)
    assert.match(meta.description, /per-event/i)
    assert.match(meta.description, /counted twice/)
  })

  test('calculation is unchanged: per-event counts are added, so repeat startups count again', () => {
    const r = parseImpactCsv(csv('Acme,Event A,2026-01-01,10,3,0,0', 'Acme,Event B,2026-02-01,10,2,0,0'), 'x.csv')
    // Even if the same startups attended both events, the total is 3 + 2 = 5 participations.
    assert.equal(computeTotals(r.valid).startupsSupported, 5)
  })
})

describe('Sprint 1 backlog and status file', () => {
  test('backlog matches Sprint Planning: US04, US01, US02, US03 = 16 of 18 points', () => {
    assert.deepEqual(
      SPRINT_BACKLOG.map((s) => [s.id, s.points]),
      [
        ['US04', 3],
        ['US01', 5],
        ['US02', 3],
        ['US03', 5],
      ],
    )
    assert.equal(SPRINT.capacity, 18)
  })

  test('recorded status is consistent (names and dates present, nothing accepted before Done)', () => {
    assert.deepEqual(validateSprintBacklog(), [])
  })

  const base: BacklogItem = { ...SPRINT_BACKLOG[0], dod: { state: 'awaiting-team-confirmation' }, acceptance: { state: 'pending' } }

  test('validator rejects Done without who/when', () => {
    const bad = { ...base, dod: { state: 'verified' as const, verifiedBy: '', verifiedOn: 'next week' } }
    assert.deepEqual(validateSprintBacklog([bad]), ['US04: Done status needs "verifiedBy"', 'US04: Done status needs "verifiedOn" as YYYY-MM-DD'])
  })

  test('validator rejects acceptance that skips the Definition of Done', () => {
    const bad = { ...base, acceptance: { state: 'accepted' as const, confirmedBy: 'Tutor', confirmedOn: '2026-10-21' } }
    assert.deepEqual(validateSprintBacklog([bad]), ['US04: marked accepted but the team has not verified it as Done'])
  })

  test('validator accepts a fully recorded story', () => {
    const ok = {
      ...base,
      dod: { state: 'verified' as const, verifiedBy: 'Team 0311', verifiedOn: '2026-10-20' },
      acceptance: { state: 'accepted' as const, confirmedBy: 'Tutor', confirmedOn: '2026-10-21' },
    }
    assert.deepEqual(validateSprintBacklog([ok]), [])
  })
})
