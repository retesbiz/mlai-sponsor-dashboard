# Prototype Limitations — Sprint 1

This is a classroom prototype for FIT2002 (Team 0311). It shows the intended Sprint 1 workflow. It is not a production system and has not been accepted by MLAI.

## Actually implemented (works in the browser)

| Area | Implemented behaviour |
|---|---|
| CSV import | Reads a local `.csv` chosen through the file picker or drag-and-drop, entirely in the browser |
| Parsing | Quoted fields (including commas and line breaks), escaped quotes, CRLF line endings, BOM, case-insensitive headers, correct line numbers for multi-line values |
| Validation | Required columns, required values, real calendar dates, whole non-negative numbers, 2 MB / 5,000-row limits, duplicate rows (sponsor + event + date) within a file and against existing data |
| Malformed CSV | Unmatched quotation marks, stray quotes, text after a closing quote, wrong number of values per row, malformed or duplicate headers, semicolon/tab-separated and binary files: each gets a specific message with the line number |
| Sprint status | Completion summary separates Demonstrated, Done and Accepted. It shows the proposed measurable Definition of Done (7 conditions), measurable verification checks per story (Pass / Fail / Not Verified), DoD conditions met, Done points out of 16, and client/tutor acceptance. Status comes only from `src/data/sprintStatus.ts`, and tests enforce the Done rules |
| Preview & confirmation | Row counts, per-line errors, preview table, explicit import step, append-or-replace choice, success confirmation |
| Persistence | Records, last import, selected sponsor, current page and demo session are kept in the browser's `localStorage` |
| Sponsor view | Search, selection, per-sponsor event table, sponsor summaries computed from records |
| Dashboard | Five KPIs (each with the sponsor's share of all sponsors), per-event chart, sponsor comparison chart and events table with totals. Everything is calculated from imported records for the chosen sponsor and quarter |
| Export / clear / reset | Export loaded data as CSV, clear data (staff only), full demo reset |

## Simulated (not real)

| Area | What's simulated | What production would need |
|---|---|---|
| Authentication (US04) | "Enter Demo" creates a local demo session. No passwords, accounts, tokens or server checks. Labelled **Simulated sign-in** in the app. | A real identity provider (e.g. MLAI's SSO), server-side sessions and authorisation |
| Roles | The Staff/Viewer switch (labelled **Simulated role · demo only**) only hides or disables controls in the UI. Anyone with the browser can change it. It is a demonstration, not security. | Server-enforced role-based access control |
| Data storage | Browser `localStorage` on one machine. Not shared, not backed up, and lost if site data is cleared. | A hosted database with backups and audit history |
| Data sources | Only manually supplied CSV files. **No connection** to Slack, Luma, Humanitix, Substack, the MLAI website or social media. | Agreed export formats or APIs per platform, with consent and data-handling review |
| Metric definitions | The team's working definitions (see README). Not yet confirmed with MLAI. | Definitions agreed with the client and documented |
| Data | All sponsors, events and figures are **fictional**. Acme Technology, Northstar Innovations and Horizon Ventures aren't real MLAI sponsors. | Real, consented sponsor-impact data |

## Not built (out of Sprint 1 scope)

- Automated quarterly sponsor reports, PDF or report generation
- Report review and approval workflows
- Production integrations with MLAI platforms
- A real user database, account management or password handling
- Payments, invoicing or sponsorship agreements
- CRM features (contact management, pipelines, email)
- Multi-sponsor (co-sponsored) events: each record currently belongs to one sponsor
- Editing or deleting individual records inside the app (re-import instead)

## Known constraints

- localStorage size limits (~5 MB) cap how much data the prototype can hold. The 5,000-row import limit stays well under this.
- Reporting periods are calendar quarters derived from event dates. MLAI's preferred reporting periods are still to be confirmed.
- **Startup Participations** (the A1.2 "Startups Supported" metric) is a per-event total: the same startup is counted once for every event it was involved in. The app labels it this way on the KPI card, table, sponsor cards and chart. A unique-startup count would need startup identifiers in the CSV, which the agreed fields don't include.
- Tested in current Chromium-based browsers. Older browsers aren't targeted.
- Automated tests (`npm test`, 59 tests) cover data logic only: CSV parsing, validation and malformed input, KPI totals, sponsor filtering, quarters, export round-trip, metric labelling, the measurable Definition of Done rules, and that the US03 expected values equal the sample-data calculations. UI interactions were checked by hand in the browser at 1920×1080, 1280×720, 1024×768 and 375px wide. There are no automated UI tests.
- The Sprint 1 Completion Summary's criteria evidence reflects only what was used in the current browser session, and Reset demo clears it. It is never treated as Done or Accepted.
- Definition of Done checks, Done status and acceptance are whatever the team commits to `src/data/sprintStatus.ts`. The app enforces the rules (all 7 checks, names, real dates, agreed DoD, Done before Accepted) but can't confirm the checks really happened. The seven DoD criteria are a **proposal** until the team records agreement. The acceptance criteria are drafts until replaced with the Product Backlog wording.
- The measurable DoD is a **proposed** team standard. It is not recorded as agreed at Sprint Planning. Several conditions can only be verified manually by the team: functional test cases, integration walkthrough, usability by a non-implementer, demo readiness and team sign-off. The app doesn't check these itself.
- The verification checks are suggested measurable checks. Where they differ from the original Sprint Backlog acceptance criteria, the backlog criteria are kept unchanged alongside them.
- There are no interactive checklists on the website. That's deliberate: visitors can't alter official status, and draft ticks can't be mistaken for verification.
- The CSV checks catch structural problems, but can't tell whether a correctly formatted number is the *right* number.
