# Prototype Limitations — Sprint 1

This is a classroom prototype for FIT2002 (Team 0311). It shows the intended Sprint 1 workflow. It is not a production system and has not been accepted by MLAI.

## Actually implemented (works in the browser)

| Area | Implemented behaviour |
|---|---|
| CSV import | Reads a local `.csv` chosen through the file picker or drag-and-drop, entirely in the browser |
| Parsing | Quoted fields, escaped quotes, CRLF line endings, BOM, case-insensitive headers |
| Validation | Required columns, required values, real calendar dates, whole non-negative numbers, 2 MB / 5,000-row limits, duplicate rows (sponsor + event + date) within a file and against existing data |
| Preview & confirmation | Row counts, per-line errors, preview table, explicit import step, append-or-replace choice, success confirmation |
| Persistence | Records, last import, selected sponsor, current page and demo session are kept in the browser's `localStorage` |
| Sponsor view | Search, selection, per-sponsor event table, sponsor summaries computed from records |
| Dashboard | Five KPIs (each with the sponsor's share of all sponsors), per-event chart, sponsor comparison chart and events table with totals. Everything is calculated from imported records for the chosen sponsor and quarter |
| Export / clear / reset | Export loaded data as CSV, clear data (staff only), full demo reset |

## Simulated (not real)

| Area | What's simulated | What production would need |
|---|---|---|
| Authentication (US04) | "Enter Demo" creates a local demo session. No passwords, accounts, tokens or server checks. | A real identity provider (e.g. MLAI's SSO), server-side sessions and authorisation |
| Roles | The Staff/Viewer switch only hides or disables controls in the UI. Anyone with the browser can change it. | Server-enforced role-based access control |
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
- "Startups Supported" is summed per event, so the same startup can be counted at several events. A distinct-startup count would need startup identifiers in the data.
- Tested in current Chromium-based browsers. Older browsers aren't targeted.
- Automated tests (`npm test`) cover data logic only: CSV parsing and validation, KPI totals, sponsor filtering, quarters and export round-trip. UI interactions were checked by hand in the browser at 1920×1080, 1280×720, 1024×768 and 375px wide. There are no automated UI tests.
- The Sprint 1 Demo page's "Shown in this session" evidence reflects what was used in the current browser session. It is not a record of acceptance, and Reset demo clears it.
