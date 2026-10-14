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
import { recordKey } from '../src/lib/csv.ts'
import { summariseSponsors } from '../src/lib/metrics.ts'
import {
  DEFINITION_OF_DONE_STATUS,
  DOD_CRITERIA,
  RECORDED_DOD_IDS,
  SIX_RECORD_FIXTURE,
  SPRINT,
  SPRINT_BACKLOG,
  VERIFICATION_CHECKS_STATUS,
  checkCounts,
  conditionCounts,
  conditionStatus,
  overallStatus,
  validateSprintBacklog,
  type BacklogItem,
  type ChecksStatus,
  type DefinitionOfDoneStatus,
  type RecordedDodId,
  type RecordedResult,
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

const repoFile = (p: string) => readFileSync(fileURLToPath(new URL(`../${p}`, import.meta.url)), 'utf8')

describe('Sprint 1 backlog: proposed measurable checks and Definition of Done', () => {
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

  test('each story requires all of its checks: 5/5, 5/5, 4/4, 6/6', () => {
    assert.deepEqual(
      SPRINT_BACKLOG.map((s) => [s.id, checkCounts(s).required, s.verificationChecks.length]),
      [
        ['US04', 5, 5],
        ['US01', 5, 5],
        ['US02', 4, 4],
        ['US03', 6, 6],
      ],
    )
  })

  test('check wording is the requested measurable wording', () => {
    const text = (id: string) => SPRINT_BACKLOG.find((s) => s.id === id)!.verificationChecks.map((c) => c.text)
    assert.deepEqual(text('US04'), [
      'Selecting Enter Demo as MLAI Staff enters the application and displays the Staff role.',
      'Before signing in, the four main application screens are inaccessible through normal navigation.',
      'Switching to Viewer disables sample-data loading and data clearing.',
      'Switching back to Staff restores those actions without reloading.',
      'Logout returns to the login screen and the interface clearly identifies authentication as simulated.',
    ])
    assert.deepEqual(text('US01'), [
      'Loading the built-in dataset imports exactly 11 event records across three sponsors.',
      'Uploading a valid CSV with six new nonduplicate event records imports all six without validation errors.',
      'Reimporting that CSV adds zero duplicate records and displays an appropriate message.',
      'Invalid records or malformed CSV input generate clear validation errors; invalid data is not silently accepted.',
      'Imported records remain available after navigating away from and back to the Import page.',
    ])
    assert.deepEqual(text('US02'), [
      'All three built-in sample sponsors appear in the directory.',
      'Searching Acme returns Acme Technology and excludes unrelated sponsors.',
      'Selecting Acme displays only its four event records.',
      'Switching to Northstar displays only its four event records, without records from Acme.',
    ])
    assert.equal(text('US03').length, 6)
    assert.match(text('US03')[4], /zero discrepancies/)
    assert.match(text('US03')[5], /event-based.*labelled fictional/)
  })

  test('the seven shared DoD conditions use the measurable wording', () => {
    assert.deepEqual(
      DOD_CRITERIA.map((c) => [c.title, c.text]),
      [
        ['Acceptance Criteria', '100% of agreed story-specific checks pass.'],
        ['Functional Testing', '100% of applicable tests pass and zero critical defects remain.'],
        ['Integration', 'The relevant full Sprint 1 workflow completes once with zero failed required interactions.'],
        ['Data Accuracy', 'Zero applicable record or metric discrepancies; for US04, correct simulated session and role state.'],
        ['Usability', 'One teammate other than the implementer completes the relevant workflow without assistance.'],
        ['Team Verification', 'A designated team member records Pass, name, and date.'],
        ['Demo Readiness', 'One successful rehearsal with zero failed required actions.'],
      ],
    )
  })

  test('everything starts Not Verified: checks proposed, DoD proposed, nothing passed, Done or Accepted', () => {
    // Guards against committing invented verification. Change deliberately when the team records real results.
    assert.deepEqual(VERIFICATION_CHECKS_STATUS, { state: 'proposed' })
    assert.deepEqual(DEFINITION_OF_DONE_STATUS, { state: 'proposed' })
    for (const item of SPRINT_BACKLOG) {
      assert.deepEqual(item.checkResults, {}, item.id)
      assert.deepEqual(item.dodResults, {}, item.id)
      assert.deepEqual(checkCounts(item), { pass: 0, fail: 0, total: item.verificationChecks.length, required: item.verificationChecks.length }, item.id)
      assert.deepEqual(conditionCounts(item), { met: 0, fail: 0, total: 7 }, item.id)
      assert.equal(overallStatus(item), 'awaiting-verification', item.id)
      assert.equal(item.acceptance.state, 'pending', item.id)
    }
  })

  test('original Sprint Backlog acceptance criteria are preserved alongside the proposed checks', () => {
    for (const item of SPRINT_BACKLOG) assert.ok(item.backlogCriteria.length > 0, item.id)
  })

  test('recorded status follows the Done rules (validated on every build and deploy)', () => {
    assert.deepEqual(validateSprintBacklog(), [])
  })
})

describe('Objective facts behind the checks (built-in sample and verification file)', () => {
  const sample = parseImpactCsv(repoFile('public/sample-data/mlai-sample-sponsor-impact.csv'), 'sample.csv')
  const fixture = parseImpactCsv(repoFile(SIX_RECORD_FIXTURE), 'six.csv')
  const summaries = summariseSponsors(sample.valid)

  test('US01-1: built-in dataset is exactly 11 records across three sponsors', () => {
    assert.equal(sample.valid.length, 11)
    assert.equal(summaries.length, 3)
  })

  test('US01-2: the verification file has six valid records and no validation errors', () => {
    assert.equal(fixture.fatal, null)
    assert.deepEqual(fixture.errors, [])
    assert.equal(fixture.valid.length, 6)
  })

  test('US01-2: none of the six duplicates the built-in sample or the errors sample', () => {
    const existing = new Set([
      ...sample.valid.map(recordKey),
      ...parseImpactCsv(repoFile('public/sample-data/mlai-sample-with-errors.csv'), 'e.csv').valid.map(recordKey),
    ])
    assert.equal(fixture.valid.filter((r) => existing.has(recordKey(r))).length, 0)
  })

  test('US01-3: reimporting the six adds zero records (same rule the app uses)', () => {
    const loaded = new Set([...sample.valid, ...fixture.valid].map(recordKey))
    const fresh = fixture.valid.filter((r) => !loaded.has(recordKey(r)))
    assert.equal(fresh.length, 0)
  })

  test('US02-2: searching "Acme" matches Acme Technology only (directory search rule)', () => {
    const q = 'acme'
    assert.deepEqual(
      summaries.filter((s) => s.sponsor.toLowerCase().includes(q)).map((s) => s.sponsor),
      ['Acme Technology'],
    )
  })

  test('US02-3/4: Acme and Northstar each have four records, with no overlap', () => {
    const acme = sample.valid.filter((r) => r.sponsor === 'Acme Technology')
    const northstar = sample.valid.filter((r) => r.sponsor === 'Northstar Innovations')
    assert.equal(acme.length, 4)
    assert.equal(northstar.length, 4)
    assert.ok(!northstar.some((r) => acme.includes(r)))
  })

  const withExpected = SPRINT_BACKLOG.flatMap((s) => s.verificationChecks).filter((c) => c.expected)
  test('US03-2/3: expected values exist for Acme Technology and Northstar Innovations', () => {
    assert.deepEqual(
      withExpected.map((c) => c.expected!.sponsor),
      ['Acme Technology', 'Northstar Innovations'],
    )
  })
  for (const c of withExpected) {
    test(`US03: ${c.expected!.sponsor} check values equal the calculated sample totals and appear in the wording`, () => {
      const { sponsor, ...expected } = c.expected!
      const s = summaries.find((x) => x.sponsor === sponsor)!
      assert.deepEqual(
        { eventsFunded: s.eventsFunded, attendees: s.attendees, startupsSupported: s.startupsSupported, mediaReach: s.mediaReach, communityEngagement: s.communityEngagement },
        expected,
      )
      for (const n of Object.values(expected)) assert.ok(c.text.includes(n.toLocaleString('en-AU')), `${sponsor} text should mention ${n}`)
    })
  }
})

describe('Done rules (validator, on synthetic stories)', () => {
  const base: BacklogItem = { ...SPRINT_BACKLOG[1], checkResults: {}, dodResults: {}, implementedBy: [], completion: { state: 'awaiting-verification' }, acceptance: { state: 'pending' } }
  const agreed: DefinitionOfDoneStatus = { state: 'agreed', agreedBy: 'Team 0311', agreedOn: '2026-10-20' }
  const confirmed: ChecksStatus = { state: 'confirmed', confirmedBy: 'Team 0311', confirmedOn: '2026-10-20' }
  const pass = (by = 'Kai-Po Wang'): RecordedResult => ({ result: 'pass', checkedBy: by, checkedOn: '2026-10-20', evidence: 'Observed as expected' })
  const allChecks = Object.fromEntries(base.verificationChecks.map((c) => [c.id, pass()]))
  const allDod = Object.fromEntries(RECORDED_DOD_IDS.map((id) => [id, pass('Sabiuddin Ahmed Maheen')])) as Record<RecordedDodId, RecordedResult>
  const done = { state: 'done' as const, verifiedBy: 'Ian Wang', verifiedOn: '2026-10-21', confirmation: 'All required checks passed' }
  const complete: BacklogItem = { ...base, checkResults: allChecks, dodResults: allDod, implementedBy: ['Kai-Po Wang'], completion: done }
  const v = (items: BacklogItem[], dod: DefinitionOfDoneStatus = agreed, checks: ChecksStatus = confirmed) => validateSprintBacklog(items, dod, checks)

  test('a new story is Not Verified everywhere and valid', () => {
    assert.deepEqual(checkCounts(base), { pass: 0, fail: 0, total: 5, required: 5 })
    assert.deepEqual(conditionCounts(base), { met: 0, fail: 0, total: 7 })
    assert.deepEqual(v([base]), [])
  })

  test('a fully verified story passes, with conditions 1 and 6 derived', () => {
    assert.deepEqual(v([complete]), [])
    assert.equal(conditionStatus(complete, 'acceptance-criteria'), 'pass')
    assert.equal(conditionStatus(complete, 'team-verification'), 'pass')
    assert.deepEqual(conditionCounts(complete), { met: 7, fail: 0, total: 7 })
  })

  test('Done is rejected while the checks are still proposed', () => {
    assert.deepEqual(v([complete], agreed, { state: 'proposed' }), ['US01: marked Done while the verification checks are still proposed'])
  })

  test('Done is rejected while the DoD is only proposed', () => {
    assert.deepEqual(v([complete], { state: 'proposed' }), ['US01: marked Done before the team has agreed the Definition of Done'])
  })

  test('Done needs n/n required checks: 4/5 or a Fail is rejected', () => {
    const { 'us01-reimport': _r, ...four } = allChecks
    assert.deepEqual(v([{ ...complete, checkResults: four }]), ['US01: marked Done with 4/5 required checks passed'])
    const failing = { ...allChecks, 'us01-reimport': { ...pass(), result: 'fail' as const, evidence: 'Defect: duplicates added' } }
    const story = { ...complete, checkResults: failing }
    assert.deepEqual(v([story]), ['US01: marked Done with 4/5 required checks passed'])
    assert.equal(conditionStatus(story, 'acceptance-criteria'), 'fail')
  })

  test('every recorded result needs Pass/Fail, a name, a real date and evidence', () => {
    const story = {
      ...base,
      checkResults: {
        'us01-sample-11': { result: 'pass' as const, checkedBy: '', checkedOn: '2026-02-30', evidence: ' ' },
        'not-a-check': pass(),
      },
    }
    assert.deepEqual(v([story]), [
      'US01: check "us01-sample-11" needs "checkedBy"',
      'US01: check "us01-sample-11" needs "checkedOn" as a real YYYY-MM-DD date',
      'US01: check "us01-sample-11" needs an "evidence" description',
      'US01: result recorded for unknown check "not-a-check"',
    ])
    const badResult = { ...base, dodResults: { integration: { ...pass(), result: 'not-applicable' } as unknown as RecordedResult } }
    assert.deepEqual(v([badResult]), ['US01: DoD "integration" result must be "pass" or "fail"'])
  })

  test('Done is rejected if a recorded DoD condition is missing', () => {
    const { 'demo-readiness': _d, ...rest } = allDod
    assert.deepEqual(v([{ ...complete, dodResults: rest }]), ['US01: marked Done but DoD condition(s) not met: demo-readiness'])
  })

  test('Usability must be checked by someone other than the implementer', () => {
    const story = { ...complete, dodResults: { ...allDod, usability: pass('kai-po wang') } }
    assert.deepEqual(v([story]), ['US01: Usability must be checked by someone other than the implementer (kai-po wang implemented this story)'])
  })

  test('Done needs the implementer, a verifier, a real date and a confirmation', () => {
    const bad = { ...complete, implementedBy: [], completion: { state: 'done' as const, verifiedBy: '', verifiedOn: '2026-02-30', confirmation: ' ' } }
    assert.deepEqual(v([bad]), [
      'US01: Done needs "verifiedBy" (a designated team member)',
      'US01: Done needs "verifiedOn" as a real YYYY-MM-DD date',
      'US01: Done needs a "confirmation" that the required checks passed',
      'US01: marked Done but "implementedBy" is empty (needed for the Usability condition)',
    ])
  })

  test('verification date cannot be earlier than the checks it confirms', () => {
    assert.deepEqual(v([{ ...complete, completion: { ...done, verifiedOn: '2026-10-19' } }]), ['US01: "verifiedOn" is earlier than some recorded checks'])
  })

  test('derived conditions cannot be recorded directly', () => {
    const story = { ...base, dodResults: { 'team-verification': pass() } as unknown as BacklogItem['dodResults'] }
    assert.deepEqual(v([story]), ['US01: "team-verification" cannot be recorded directly (it is derived)'])
  })

  test('confirming checks or agreeing the DoD needs who and when', () => {
    assert.deepEqual(validateSprintBacklog([base], { state: 'agreed', agreedBy: '', agreedOn: 'soon' }, { state: 'confirmed', confirmedBy: '', confirmedOn: 'x' }), [
      'Definition of Done: "agreedBy" is required',
      'Definition of Done: "agreedOn" must be a real YYYY-MM-DD date',
      'Verification checks: "confirmedBy" is required',
      'Verification checks: "confirmedOn" must be a real YYYY-MM-DD date',
    ])
  })

  test('Accepted requires Done; Changes Requested can be recorded any time', () => {
    const accepted = { state: 'accepted' as const, confirmedBy: 'MLAI', confirmedOn: '2026-10-22' }
    assert.deepEqual(v([{ ...base, acceptance: accepted }]), ['US01: marked Accepted but not yet verified Done'])
    assert.deepEqual(v([{ ...complete, acceptance: accepted }]), [])
    const cr = { state: 'changes-requested' as const, confirmedBy: 'Tutor', confirmedOn: '2026-10-22', note: 'Show period filter' }
    assert.deepEqual(v([{ ...base, acceptance: cr }]), [])
  })

  test('a failed check shows as "failing", never as Done', () => {
    const story = { ...base, checkResults: { 'us01-sample-11': { ...pass(), result: 'fail' as const, evidence: 'Only 10 imported' } } }
    assert.equal(overallStatus(story), 'failing')
  })
})
