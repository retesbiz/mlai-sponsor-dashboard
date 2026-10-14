# MLAI Sponsor & Impact Reporting Dashboard — Sprint 1 Prototype

FIT2002 IT Project Management · Team 0311 — Ian Wang, Kai-Po Wang, Sabiuddin Ahmed Maheen

A front-end prototype of a centralised reporting layer for MLAI. An authorised user can import sponsor-impact records from a CSV file and view sponsor-specific metrics on a dashboard. It complements MLAI's existing tools and doesn't replace them.

> **Demonstration only.** All data is fictional. Sign-in is a simulated session, and nothing connects to any MLAI platform. See [PROTOTYPE_LIMITATIONS.md](PROTOTYPE_LIMITATIONS.md).

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
| `npm test` | Runs 22 data tests: CSV import/validation, KPI totals, sponsor switching, period filter. Needs Node 22.18+ (native TypeScript) |
| `npm run build` | Type-checks (`tsc -b`) and builds to `dist/` |
| `npm run typecheck` | Type-check only |
| `npm run preview` | Serves an existing production build |

The app makes no network or API calls at runtime, so it works offline once dependencies are installed.

## Screens

| Screen | User story | What it demonstrates |
|---|---|---|
| Login | US04 (3 pts) | Branded entry screen, **Enter Demo as MLAI Staff**, optional read-only Viewer session |
| App shell | US04 | Profile indicator (MLAI Staff / Viewer), top-bar step indicator (Import → Select sponsor → View dashboard), sidebar data status, simulated role toggle, logout, reset demo |
| Import Sponsor Data | US01 (5 pts) | CSV picker and drag-and-drop, **Load Sample Data**, sample CSV downloads, validation, preview, import confirmation, newly imported rows marked "New", export, clear |
| Sponsors | US02 (3 pts) | Searchable sponsor directory, sponsor selection, filtered event list, **View Dashboard** |
| Impact Dashboard | US03 (5 pts) | Sponsor header, one-click sponsor switcher, reporting period, five KPI cards with share of all sponsors, per-event chart with metric toggle, sponsor comparison chart (click a bar to switch), events table with totals, empty states |
| Sprint 1 Demo | — | Selected stories and story points (16 of 18 capacity), what each story covers, **live evidence from the current session** (e.g. which sponsor dashboards were shown), "Acceptance: pending review", and out-of-scope future work |

For the demo, see [DEMO_CHECKLIST.md](DEMO_CHECKLIST.md) (exact clicks, timings, expected numbers, story → evidence map) and [PRESENTER_GUIDE.md](PRESENTER_GUIDE.md) (talking points for each speaker).

## CSV format

Required columns (header names are case-insensitive; spaces or hyphens are treated as `_`):

`sponsor, event, date, attendees, startups_supported, media_reach, community_engagement`

Optional: `event_type, location`

- `date`: `YYYY-MM-DD` or `DD/MM/YYYY`
- Counts: whole numbers ≥ 0 (thousands separators such as `"1,200"` are accepted)
- Max 2 MB / 5,000 rows

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
| Startups Supported | Sum of `startups_supported` (per-event, so a startup at two events counts twice) |
| Media Reach | Sum of `media_reach` |
| Community Engagement | Sum of `community_engagement` |

To avoid double counting, a row with the same **sponsor + event + date** as another row is rejected, whether it repeats a row in the same file or a record that's already imported.

Expected sample totals (All dates): Acme Technology 4 events / 505 attendees; Horizon Ventures 3 / 205; Northstar Innovations 4 / 750.

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
  components/             layout shell, UI primitives, KPI card, chart, records table
  pages/                  Login, Import, Sponsors, Dashboard, Sprint
public/sample-data/       downloadable sample CSVs
```

Stack: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, lucide-react, and the Inter font bundled locally via `@fontsource-variable/inter` (no external font requests).

Display: layouts are tested at 1920×1080 (projector), 1280×720, 1024×768 and 375px phone width. From 1800px wide, text scales up slightly to make projection easier.
