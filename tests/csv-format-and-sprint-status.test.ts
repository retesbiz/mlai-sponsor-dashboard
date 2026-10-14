/**
 * Checks added with the Sprint 1 review fixes:
 * malformed-CSV detection, the Startup Participations metric, and the sprint status file.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { parseImpactCsv, scanCsv } from '../src/lib/csv.ts'
import { METRICS, computeTotals } from '../src/lib/metrics.ts'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { summariseSponsors } from '../src/lib/metrics.ts'
import {
  DEFINITION_OF_DONE_STATUS,
  DOD_CRITERIA,
  RECORDED_DOD_IDS,
  SPRINT,
  SPRINT_BACKLOG,
  checkCounts,
  conditionCounts,
  conditionStatus,
  overallStatus,
  validateSprintBacklog,
  type BacklogItem,
  type CheckResult,
  type DefinitionOfDoneStatus,
  type DodResult,
  type RecordedDodId,
} from '../src/data/sprintStatus.ts'

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

describe('Sprint 1 backlog and measurable Definition of Done', () => {
  test('backlog matches Sprint Planning: US04, US01, US02, US03 = 16 of 18 SP', () => {
    assert.deepEqual(
      SPRINT_BACKLOG.map((s) => [s.id, s.title, s.points]),
      [
        ['US04', 'Authorised Access', 3],
        ['US01', 'Data Import', 5],
        ['US02', 'Sponsor-Specific View', 3],
        ['US03', 'Impact Metrics Dashboard', 5],
      ],
    )
    assert.equal(SPRINT.capacity, 18)
  })

  test('the DoD has the seven measurable conditions, in order', () => {
    assert.deepEqual(
      DOD_CRITERIA.map((c) => c.title),
      ['Acceptance Criteria', 'Functional Testing', 'Integration', 'Data Accuracy', 'Usability', 'Team Verification', 'Demo Readiness'],
    )
    // Measurable wording: quantities or explicit pass conditions, not general statements.
    assert.match(DOD_CRITERIA[0].text, /100%.*Pass/)
    assert.match(DOD_CRITERIA[1].text, /100%.*zero unresolved critical defects/)
    assert.match(DOD_CRITERIA[2].text, /authorised access → data import → sponsor selection → impact dashboard/)
    assert.match(DOD_CRITERIA[4].text, /other than the feature’s implementer/)
    assert.match(DOD_CRITERIA[6].text, /zero broken required interactions/)
  })

  test('the DoD is still a proposal, and nothing is recorded as passed, Done or Accepted', () => {
    // Guard against accidentally committing invented verification. Update this test deliberately
    // when the team actually records results.
    assert.deepEqual(DEFINITION_OF_DONE_STATUS, { state: 'proposed' })
    for (const item of SPRINT_BACKLOG) {
      assert.deepEqual(item.checkResults, {}, item.id)
      assert.deepEqual(item.dodResults, {}, item.id)
      assert.equal(item.completion.state, 'awaiting-verification', item.id)
      assert.equal(item.acceptance.state, 'pending', item.id)
      assert.equal(overallStatus(item), 'awaiting-verification', item.id)
    }
  })

  test('story-specific checks match the requested measurable checks', () => {
    const count = Object.fromEntries(SPRINT_BACKLOG.map((s) => [s.id, s.verificationChecks.length]))
    assert.deepEqual(count, { US04: 5, US01: 5, US02: 4, US03: 6 })
    const all = SPRINT_BACKLOG.flatMap((s) => s.verificationChecks.map((c) => c.text)).join('\n')
    assert.match(all, /not production authentication/)
    assert.match(all, /Duplicate records are handled/)
    assert.match(all, /Sponsor searches return the expected matching records/)
    assert.match(all, /event-based count, not a unique startup count/)
  })

  test('original Sprint Backlog acceptance criteria are preserved alongside the checks', () => {
    for (const item of SPRINT_BACKLOG) assert.ok(item.backlogCriteria.length > 0, item.id)
  })

  test('recorded status follows the Done rules (validated on every build and deploy)', () => {
    assert.deepEqual(validateSprintBacklog(), [])
  })
})

describe('Data Accuracy: expected values in the checks match the built-in sample', () => {
  const sample = readFileSync(fileURLToPath(new URL('../public/sample-data/mlai-sample-sponsor-impact.csv', import.meta.url)), 'utf8')
  const summaries = summariseSponsors(parseImpactCsv(sample, 'sample.csv').valid)
  const withExpected = SPRINT_BACKLOG.flatMap((s) => s.verificationChecks).filter((c) => c.expected)

  test('US03 has expected values for Acme Technology and Northstar Innovations', () => {
    assert.deepEqual(
      withExpected.map((c) => c.expected!.sponsor),
      ['Acme Technology', 'Northstar Innovations'],
    )
  })

  for (const c of withExpected) {
    test(`${c.expected!.sponsor}: check values equal the calculated sample totals`, () => {
      const { sponsor, ...expected } = c.expected!
      const s = summaries.find((x) => x.sponsor === sponsor)!
      assert.deepEqual(
        { eventsFunded: s.eventsFunded, attendees: s.attendees, startupsSupported: s.startupsSupported, mediaReach: s.mediaReach, communityEngagement: s.communityEngagement },
        expected,
      )
      // The wording shown to the audience states the same numbers.
      for (const n of Object.values(expected)) assert.ok(c.text.includes(n.toLocaleString('en-AU')), `${sponsor} text should mention ${n}`)
    })
  }

  test('US01 and US02 count claims match the sample (11 records, 3 sponsors)', () => {
    assert.equal(parseImpactCsv(sample, 'sample.csv').valid.length, 11)
    assert.equal(summaries.length, 3)
  })
})

describe('Done rules (validator, on synthetic stories)', () => {
  const base: BacklogItem = { ...SPRINT_BACKLOG[1], checkResults: {}, dodResults: {}, implementedBy: [], completion: { state: 'awaiting-verification' }, acceptance: { state: 'pending' } }
  const agreed: DefinitionOfDoneStatus = { state: 'agreed', agreedBy: 'Team 0311', agreedOn: '2026-10-20' }
  const pass = (by = 'Kai-Po Wang'): CheckResult => ({ result: 'pass', checkedBy: by, checkedOn: '2026-10-20' })
  const allChecks = Object.fromEntries(base.verificationChecks.map((c) => [c.id, pass()]))
  const dodPass = (by = 'Sabiuddin Ahmed Maheen'): DodResult => ({ result: 'pass', checkedBy: by, checkedOn: '2026-10-20' })
  const allDod = Object.fromEntries(RECORDED_DOD_IDS.map((id) => [id, dodPass()])) as Record<RecordedDodId, DodResult>
  const done = { state: 'done' as const, verifiedBy: 'Ian Wang', verifiedOn: '2026-10-21', confirmation: 'All required checks passed' }
  const complete: BacklogItem = { ...base, checkResults: allChecks, dodResults: allDod, implementedBy: ['Kai-Po Wang'], completion: done }

  test('a new story is Not Verified everywhere and valid', () => {
    assert.deepEqual(checkCounts(base), { pass: 0, fail: 0, total: 5 })
    assert.deepEqual(conditionCounts(base), { met: 0, fail: 0, total: 7 })
    assert.deepEqual(validateSprintBacklog([base], agreed), [])
  })

  test('a fully verified story passes all rules, with conditions 1 and 6 derived', () => {
    assert.deepEqual(validateSprintBacklog([complete], agreed), [])
    assert.equal(conditionStatus(complete, 'acceptance-criteria'), 'pass')
    assert.equal(conditionStatus(complete, 'team-verification'), 'pass')
    assert.deepEqual(conditionCounts(complete), { met: 7, fail: 0, total: 7 })
  })

  test('Done is rejected while the DoD is only proposed', () => {
    assert.deepEqual(validateSprintBacklog([complete], { state: 'proposed' }), ['US01: marked Done before the team has agreed the Definition of Done'])
  })

  test('Done is rejected if any verification check is Not Verified or Fail', () => {
    const { 'us01-duplicates': _d, ...four } = allChecks
    assert.deepEqual(validateSprintBacklog([{ ...complete, checkResults: four }], agreed), [
      'US01: marked Done but 1 verification check(s) have not passed (us01-duplicates)',
    ])
    const failing = { ...allChecks, 'us01-duplicates': { result: 'fail' as const, checkedBy: 'Kai-Po Wang', checkedOn: '2026-10-20', note: 'Duplicate imported twice' } }
    const story = { ...complete, checkResults: failing }
    assert.deepEqual(validateSprintBacklog([story], agreed), ['US01: marked Done but 1 verification check(s) have not passed (us01-duplicates)'])
    assert.equal(conditionStatus(story, 'acceptance-criteria'), 'fail')
  })

  test('Done is rejected if a recorded DoD condition is missing', () => {
    const { usability: _u, ...rest } = allDod
    assert.deepEqual(validateSprintBacklog([{ ...complete, dodResults: rest }], agreed), ['US01: marked Done but DoD condition(s) not met: usability'])
  })

  test('Usability must be checked by someone other than the implementer', () => {
    const story = { ...complete, dodResults: { ...allDod, usability: dodPass('kai-po wang') } }
    assert.deepEqual(validateSprintBacklog([story], agreed), [
      'US01: Usability must be checked by someone other than the implementer (kai-po wang implemented this story)',
    ])
  })

  test('Done needs the implementer recorded, a verifier, a real date and a confirmation', () => {
    const bad = { ...complete, implementedBy: [], completion: { state: 'done' as const, verifiedBy: '', verifiedOn: '2026-02-30', confirmation: ' ' } }
    assert.deepEqual(validateSprintBacklog([bad], agreed), [
      'US01: Done needs "verifiedBy" (a designated team member)',
      'US01: Done needs "verifiedOn" as a real YYYY-MM-DD date',
      'US01: Done needs a "confirmation" that the required checks passed',
      'US01: marked Done but "implementedBy" is empty (needed to check the Usability rule)',
    ])
  })

  test('verification date cannot be earlier than the checks it confirms', () => {
    const early = { ...complete, completion: { ...done, verifiedOn: '2026-10-19' } }
    assert.deepEqual(validateSprintBacklog([early], agreed), ['US01: "verifiedOn" is earlier than some recorded checks'])
  })

  test('every recorded result needs who and when; Fail needs a note', () => {
    const story = {
      ...base,
      checkResults: { 'us01-valid-import': { result: 'fail' as const, checkedBy: '', checkedOn: 'today' }, 'not-a-check': pass() },
    }
    assert.deepEqual(validateSprintBacklog([story], agreed), [
      'US01: check "us01-valid-import" needs "checkedBy"',
      'US01: check "us01-valid-import" needs "checkedOn" as a real YYYY-MM-DD date',
      'US01: check "us01-valid-import" is Fail and needs a note describing the defect',
      'US01: result recorded for unknown check "not-a-check"',
    ])
  })

  test('only Data Accuracy may be not applicable, and it needs a reason', () => {
    const na = (reason: string): DodResult => ({ result: 'not-applicable', checkedBy: 'Ian Wang', checkedOn: '2026-10-20', reason })
    assert.deepEqual(validateSprintBacklog([{ ...base, dodResults: { 'data-accuracy': na('No metrics displayed') } }], agreed), [])
    assert.deepEqual(validateSprintBacklog([{ ...base, dodResults: { usability: na('n/a'), 'data-accuracy': na('') } }], agreed), [
      'US01: DoD "usability" cannot be marked not applicable',
      'US01: DoD "data-accuracy" not applicable needs a reason',
    ])
  })

  test('derived conditions cannot be recorded directly', () => {
    const story = { ...base, dodResults: { 'team-verification': dodPass() } as unknown as BacklogItem['dodResults'] }
    assert.deepEqual(validateSprintBacklog([story], agreed), ['US01: "team-verification" cannot be recorded directly (it is derived)'])
  })

  test('Accepted requires Done; Changes Requested can be recorded any time', () => {
    const accepted = { state: 'accepted' as const, confirmedBy: 'MLAI', confirmedOn: '2026-10-22' }
    assert.deepEqual(validateSprintBacklog([{ ...base, acceptance: accepted }], agreed), ['US01: marked Accepted but not yet verified Done'])
    assert.deepEqual(validateSprintBacklog([{ ...complete, acceptance: accepted }], agreed), [])
    const cr = { state: 'changes-requested' as const, confirmedBy: 'Tutor', confirmedOn: '2026-10-22', note: 'Show period filter' }
    assert.deepEqual(validateSprintBacklog([{ ...base, acceptance: cr }], agreed), [])
  })

  test('an agreed DoD needs who agreed it and when', () => {
    assert.deepEqual(validateSprintBacklog([base], { state: 'agreed', agreedBy: '', agreedOn: 'soon' }), [
      'Definition of Done: "agreedBy" is required',
      'Definition of Done: "agreedOn" must be a real YYYY-MM-DD date',
    ])
  })

  test('failed checks show as "failing", never as Done', () => {
    const story = { ...base, checkResults: { 'us01-valid-import': { result: 'fail' as const, checkedBy: 'Ian Wang', checkedOn: '2026-10-20', note: 'Upload crashed' } } }
    assert.equal(overallStatus(story), 'failing')
  })
})
