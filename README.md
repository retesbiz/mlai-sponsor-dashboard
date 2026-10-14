# MLAI Sponsor & Impact Reporting Dashboard — Sprint 1 Prototype

FIT2002 IT Project Management · Team 0311 — Ian Wang, Kai-Po Wang, Sabiuddin Ahmed Maheen

A front-end prototype of a centralised reporting layer for MLAI. An authorised user can import sponsor-impact records from a CSV file and view sponsor-specific metrics on a dashboard. It complements MLAI's existing tools and doesn't replace them.

> **Demonstration only.** All data is fictional. Sign-in is a simulated session, and nothing connects to any MLAI platform. See [PROTOTYPE_LIMITATIONS.md](PROTOTYPE_LIMITATIONS.md).

## Live demo

**https://retesbiz.github.io/mlai-sponsor-dashboard/**

The site is hosted on GitHub Pages and redeploys automatically on every push to `main` (see `.github/workflows/deploy.yml`, which installs, runs `npm test`, builds and publishes `dist/`). Each browser keeps its own demo data, so use **Reset demo** for a clean start.

## Requirements

- Node.js 20.19+ or 22.12+ to run the app; 22.18+ to run `npm test`
- npm

## Install and run

```bash
npm install
npm run dev
```

Open the URL Vite prints (normally <http://localhost:5173>).

Other scripts:

| Command | What it does |
|---|---|
| `npm run demo` | Builds and serves the production build at http://localhost:4173. **Use this for the class demo** |
| `npm test` | Runs 49 tests: CSV import, validation and malformed-input handling, KPI totals, sponsor switching, period filter, Startup Participations labelling, Definition of Done and sprint status rules. Needs Node 22.18+ (native TypeScript) |
| `npm run build` | Type-checks (`tsc -b`) and builds to `dist/` |
| `npm run typecheck` | Type-check the app, config and tests |
| `npm run preview` | Serves an existing production build |

The app makes no network or API calls at runtime, so it works offline once dependencies are installed.

## Screens

| Screen | User story | What it demonstrates |
|---|---|---|
| Login | US04 (3 pts) | Branded entry screen, **Enter Demo as MLAI Staff**, optional simulated read-only Viewer session. Clearly labelled as simulated, not real authentication |
| App shell | US04 | Profile indicator (MLAI Staff / Viewer), amber **Simulated sign-in** label, top-bar steps (Import → Sponsor → Dashboard → Sprint summary), sidebar data status, **Simulated role · demo only** toggle, logout, reset demo |
| Import Sponsor Data | US01 (5 pts) | CSV picker and drag-and-drop, **Load Sample Data**, sample CSV downloads, validation, preview, import confirmation, newly imported rows marked "New", export, clear |
| Sponsors | US02 (3 pts) | Searchable sponsor directory, sponsor selection, filtered event list, **View Dashboard** |
| Impact Dashboard | US03 (5 pts) | Sponsor header, one-click sponsor switcher, reporting period, five KPI cards with share of all sponsors, per-event chart with metric toggle, sponsor comparison chart (click a bar to switch), events table with totals, empty states, **Sprint summary** button |
| Sprint 1 Completion Summary | — | Headline **Verified Done x / 16 pts**, Demonstrated and Accepted tiles, a short Done-vs-Accepted explanation, the **Proposed Sprint 1 Definition of Done** (7 criteria, "Awaiting Team Confirmation" until agreed), a story completion table (DoD checklist progress, Awaiting Verification / Done, verified by, date, client acceptance), and expandable acceptance criteria + 7-item DoD checklists per story. Status is read-only on the site. See "Recording sprint status" below |

For the demo, see [DEMO_CHECKLIST.md](DEMO_CHECKLIST.md) (exact clicks, timings, expected numbers, story → evidence map) and [PRESENTER_GUIDE.md](PRESENTER_GUIDE.md) (talking points for each speaker).

## CSV format

Required columns (header names are case-insensitive; spaces or hyphens are treated as `_`):

`sponsor, event, date, attendees, startups_supported, media_reach, community_engagement`

Optional: `event_type, location`

- `date`: `YYYY-MM-DD` or `DD/MM/YYYY`
- Counts: whole numbers ≥ 0 (thousands separators such as `"1,200"` are accepted when quoted)
- Max 2 MB / 5,000 rows
- Values containing commas, quotes or line breaks must be wrapped in double quotes, with inner quotes doubled (`"Talk ""AI"" night"`)

The importer reports, with line numbers:
- **Whole-file problems (nothing imported):** an unmatched quotation mark, a malformed header row, duplicate or missing required columns, semicolon/tab-separated files, binary files (e.g. an `.xlsx` renamed to `.csv`), empty files.
- **Row problems (that row is skipped):** a stray quote inside an unquoted value, text after a closing quote, the wrong number of values (often an unquoted comma), missing or invalid values, and duplicates.

Sample files:

- `public/sample-data/mlai-sample-sponsor-impact.csv`: 11 valid events for 3 fictional sponsors
- `public/sample-data/mlai-sample-with-errors.csv`: a missing sponsor, an invalid date, a non-numeric count and a duplicate row. Use it to show validation; its 2 valid rows import cleanly.

Both files can also be downloaded from the Import page.

## Metric definitions

Every dashboard figure is calculated from imported records for the selected sponsor and reporting period:

| KPI | Definition |
|---|---|
| Events Funded | Count of records (one record = one sponsored event) |
| Total Attendees | Sum of `attendees` |
| Startup Participations | The A1.2 **“Startups Supported”** metric, as a **per-event total**: sum of `startups_supported`. A startup involved in two events is counted twice, so it is **not** a count of unique startups. The data has no startup identifiers; a unique count would need them |
| Media Reach | Sum of `media_reach` |
| Community Engagement | Sum of `community_engagement` |

To avoid double counting, a row with the same **sponsor + event + date** as another row is rejected, whether it repeats a row in the same file or a record that's already imported.

Expected sample totals (All dates): Acme Technology 4 events / 505 attendees; Horizon Ventures 3 / 205; Northstar Innovations 4 / 750.

## Recording sprint status

The site keeps three things separate:

- **Demonstrated**: functionality shown in the prototype. Using a screen adds session *evidence* next to the acceptance criteria. It never changes status.
- **Done**: verified by the team against all seven Definition of Done criteria, with a name and date.
- **Accepted**: confirmed by the client or tutor after actual feedback.

Official status is git-tracked in [`src/data/sprintStatus.ts`](src/data/sprintStatus.ts). Visitors can't change it, and there are no clickable checklists on the site. To record verification:

1. **Agree the Definition of Done.** Once the team has agreed the seven criteria, set
   `DEFINITION_OF_DONE_STATUS = { state: 'agreed', agreedOn: 'YYYY-MM-DD', agreedBy: '…' }`. Until then the page says **Proposed Sprint 1 Definition of Done — Awaiting Team Confirmation**.
2. **Tick DoD items per story, only after checking them**, recording who and when:
   `dodChecks: { functionality: { checkedBy: 'Kai-Po Wang', checkedOn: '2026-10-20' }, … }`. All checklists start empty.
3. **Mark a story Done only when all seven items are ticked and the DoD is agreed**:
   `completion: { state: 'done', verifiedBy: 'Ian Wang', verifiedOn: '2026-10-21' }`. Otherwise it stays `{ state: 'awaiting-verification' }`.
4. **Record client/tutor acceptance only after actual feedback**:
   `acceptance: { state: 'accepted' | 'changes-requested', confirmedBy, confirmedOn, note? }`. Default `{ state: 'pending' }`. Accepted requires Done.

`npm test`, and therefore the GitHub Pages deploy, fails if Done is recorded with a missing DoD item, name or date, before the DoD is agreed, or if Accepted comes before Done. Dates must be real calendar dates (YYYY-MM-DD).

`criteriaSource: 'draft'` marks acceptance criteria written from the Sprint 1 scope. Replace them with the Product Backlog wording. Commit and push to update the hosted site.

## Project structure

```
src/
  App.tsx                 page switch (login vs. app shell)
  state/AppState.tsx      session, records, selection, localStorage persistence
  lib/csv.ts              CSV tokenizer, validation, export
  lib/metrics.ts          KPI aggregation, sponsor summaries, quarters
  lib/format.ts           number/date formatting
  lib/storage.ts          safe localStorage helpers
  data/                   bundled sample CSVs (same content as public/sample-data)
  data/sprintStatus.ts    Sprint 1 backlog, draft acceptance criteria, team-recorded Done / acceptance status
  components/             layout shell, UI primitives, KPI card, chart, records table
  pages/                  Login, Import, Sponsors, Dashboard, Sprint
public/sample-data/       downloadable sample CSVs
```

Stack: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, lucide-react, and the Inter font bundled locally via `@fontsource-variable/inter` (no external font requests).

Display: layouts are tested at 1920×1080 (projector), 1280×720, 1024×768 and 375px phone width. From 1800px wide, text scales up slightly to make projection easier.
