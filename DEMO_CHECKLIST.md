# Sprint 1 Demo Checklist

Team 0311 · MLAI Sponsor & Impact Reporting Dashboard · FIT2002 Week 11

**Target: 3:40. Hard limit: 5:00.** Speaker notes are in [PRESENTER_GUIDE.md](PRESENTER_GUIDE.md).

---

## 1. The day before

- [ ] `npm install` and `npm test` pass (22 tests: import, validation, KPI totals, sponsor switching).
- [ ] `npm run demo` builds and serves the app at **http://localhost:4173**. Use this production build for the demo: it loads faster than `npm run dev` and has no developer overlays. `npm run dev` (port 5173) is the fallback.
- [ ] Do one full timed rehearsal with all three speakers, using a stopwatch.
- [ ] Decide who drives the mouse. Suggestion: one person drives the whole time, and speakers say "next" instead of swapping laptops.
- [ ] Agree on a backup in case the laptop or projector fails, such as screenshots or a short screen recording. **(Team to decide.)**
- [ ] Fill in every **[CONFIRM]** item in the presenter guide.

## 2. Ten minutes before

- [ ] Laptop on power. Notifications and Do Not Disturb off. Close Slack, email and any other tabs.
- [ ] Projector at **1920×1080** if possible. Browser zoom at **100%**. Text scales up automatically at this width.
- [ ] Open http://localhost:4173 and go full-screen (macOS `Ctrl+Cmd+F`, Windows `F11`).
- [ ] If you see anything other than the login screen, click **Reset demo** (sidebar, bottom), then **Reset demo** in the dialog.
- [ ] Check: login screen visible, no data loaded, mouse pointer visible on the projector.

---

## 3. Click sequence

"Expect" is what should be on screen after the click. If it isn't, see section 5.

| # | Time | Speaker | Click | Expect | Story |
|---|---|---|---|---|---|
| 0 | 0:00 | Ian | *(none: login screen showing)* | Left panel shows the **Sprint 1 goal**, the 4 stories and "16 story points selected (estimated capacity 18)" | Goal |
| 1 | 0:45 | Kai-Po | **Enter Demo as MLAI Staff** | Import page. Top right: "Demo Staff User · MLAI Staff · demo session" | US04 |
| 2 | 0:55 | Kai-Po | Sidebar → **Simulated role** → **Viewer** | Grey "Viewer role is read-only" notice. **Load Sample Data** and **Choose file** are disabled. Profile says Viewer | US04 |
| 3 | 1:05 | Kai-Po | Sidebar → **Simulated role** → **MLAI Staff** | Buttons enabled again. Toast: "Simulated role switched to MLAI Staff." | US04 |
| 4 | 1:10 | Kai-Po | **Load Sample Data** | Spinner, then green banner "11 sponsor-impact records imported", chips for the 3 sponsors. Sidebar **Data status**: 11 records · 3 sponsors. Step 1 ticked in the top bar | US01 |
| 5 | 1:30 | Kai-Po | **Select a sponsor** (green banner) | Sponsors page with 3 cards: Acme 4 events / 505 attendees, Horizon 3 / 205, Northstar 4 / 750 | US02 |
| 6 | 1:35 | Kai-Po | Click the search box, type `acme` | Only the Acme Technology card remains | US02 |
| 7 | 1:40 | Kai-Po | **Acme Technology** card | Card outlined, "Selected". Table below shows only Acme's 4 events, with a total row of 505 attendees | US02 |
| 8 | 1:50 | Kai-Po | **View Dashboard** | Dashboard: "Acme Technology", All dates · 12 Feb 2026 – 20 Aug 2026 | US02 → US03 |
| 9 | 1:55 | Sabiuddin | *(point at KPI cards)* | **4 · 505 · 33 · 32,900 · 1,540**, amber "Demonstration data" label | US03 |
| 10 | 2:20 | Sabiuddin | **Engagement** (button above the left chart) | Bars 340 / 260 / 510 / 430. Comparison chart shows Community Engagement | US03 |
| 11 | 2:35 | Sabiuddin | Under **Switch sponsor**: **Northstar Innovations** | Header, KPIs, charts and table all change: **4 · 750 · 63 · 56,700 · 2,610** | US03 |
| 12 | 2:55 | Sabiuddin | Sidebar → **Sprint 1 Demo**, scroll down slowly | All four stories show "Shown in this session" with live evidence and "Acceptance: pending review". "Not in Sprint 1" list on the right | All |
| 13 | 3:40 | Sabiuddin | *(close)* | | |

**Optional extras (only if under 3:20 at step 12):**
- **Validation (US01, ~20s), after step 4:** **Choose file** → `public/sample-data/mlai-sample-with-errors.csv` → shows 6 rows: 2 valid, 3 with errors, 1 duplicate, each with a line number → **Cancel**. Practise the file dialog first; it's the slowest part of the demo.
- **Reporting period (US03, ~10s), after step 11:** **Reporting period** → *Q3 2026* → Northstar shows 2 events, 495 attendees. Set it back to *All dates*.
- **Comparison chart (US03, ~5s):** click the **Horizon Ventures** bar in "How sponsors compare" to switch sponsor.

## 4. Expected numbers (sample data, All dates)

| Sponsor | Events | Attendees | Startups | Media reach | Engagement |
|---|---|---|---|---|---|
| Acme Technology | 4 | 505 | 33 | 32,900 | 1,540 |
| Horizon Ventures | 3 | 205 | 13 | 12,600 | 830 |
| Northstar Innovations | 4 | 750 | 63 | 56,700 | 2,610 |
| **All sponsors** | **11** | **1,460** | **109** | **102,200** | **4,980** |

These are checked by hand and by `npm test`. The "% of all sponsors" lines divide the sponsor's value by the All sponsors row (e.g. Northstar attendees 750 / 1,460 = 51%).

If you also imported the 2 valid rows from the errors file, totals change: Acme 5 events / 565 attendees, Northstar 5 / 840. Avoid that before the main demo, or reset first.

## 5. If something goes wrong

| Symptom | Fix (≤ 10 seconds) |
|---|---|
| App opens on the wrong page, or with old data | **Reset demo** → confirm → **Enter Demo as MLAI Staff** → **Load Sample Data** |
| Load Sample Data is greyed out | You're in Viewer. Sidebar → Simulated role → **MLAI Staff** |
| Numbers don't match the table above | Extra data was imported. **Reset demo** and reload the sample |
| Dashboard says "Choose a sponsor" | Click a sponsor button in the empty state. It goes straight to the dashboard |
| Dashboard says "No events in this period" | Click **Show all dates** |
| Page refreshed by accident | Data, selected sponsor and page are kept. Carry on |
| Browser or server crashed | Run `npm run demo` again (≈ 5 s) and reopen http://localhost:4173, or switch to the backup |
| Running out of time at step 11 | Skip step 12. Say the limitations out loud (presenter guide, Sabiuddin) |

---

## 6. Story → evidence map

The **Suggested acceptance criteria** are drafts written from the Sprint 1 scope, **not your actual backlog**. Replace them with the acceptance criteria and Definition of Done in your Product Backlog before the demo, and only claim what those say. **[CONFIRM]**

| Story | Suggested acceptance criteria (draft) | Evidence the audience sees | Step |
|---|---|---|---|
| **US04** Authorised access (3 pts) | Unauthenticated users see only the login screen. An authorised user can enter the internal dashboard. The signed-in identity and role are visible. The user can log out. | Login screen is the only entry point. **Enter Demo as MLAI Staff** opens the app. The profile shows "MLAI Staff · demo session". Viewer mode disables import. **Log out** returns to the login screen (top right, not clicked in the main demo). | 0–3 |
| | *Honest scope:* access is a **simulated** session, not real authentication. | Login card and sidebar both say "Simulated session". | 1 |
| **US01** Import sponsor-impact data (5 pts) | A staff user can import a CSV with the agreed fields. Invalid rows are reported and not imported. The user sees a confirmation with the record count. Imported data persists while navigating. | **Load Sample Data** → "11 sponsor-impact records imported". Data status panel updates. Optional: the errors file shows line-level validation. Data stays on later pages (and survives a refresh). | 4 (+ optional) |
| **US02** View sponsor-specific information (3 pts) | The user can find and select a sponsor. Only that sponsor's records are shown. The user can open that sponsor's dashboard. | Search "acme" → 1 card. Selecting it shows 4 Acme-only events. **View Dashboard**. | 5–8 |
| **US03** Display agreed sponsor-impact metrics (5 pts) | Dashboard shows Events Funded, Total Attendees, Startups Supported, Media Reach and Community Engagement for the selected sponsor. Values are calculated from the imported data. Switching sponsor updates every metric. The reporting period is shown. Fictional data is labelled. | Five KPI cards. The table total row equals the KPI values. Switching sponsor changes everything. The header shows the period. Amber "Demonstration data" label. | 9–11 |
| All | Sprint Goal and selected stories visible. Completion shown honestly. | Login panel shows the goal and stories. The Sprint 1 Demo page shows live evidence per story, "Acceptance: pending review", and future work. | 0, 12 |

## 7. Things not to say or show

- Don't say any story is **accepted**, **done** or **production-ready** unless your team and Product Owner have actually agreed that. The app says "pending review" on purpose.
- Don't say it **connects to** Slack, Luma, Humanitix, Substack or the website. It only reads CSV files.
- Don't say it **reduces reporting from two weeks to X** unless you've measured it. Say it *aims to* reduce the effort.
- Don't present the sample sponsors or numbers as real MLAI data.

## 8. Information the team must confirm (not in the project files)

- [ ] The real acceptance criteria and Definition of Done for US04, US01, US02 and US03.
- [ ] Which stories actually meet your Definition of Done, and anything carried over to Sprint 2.
- [ ] Sprint progress evidence you want to mention: burndown, task board, hours, velocity.
- [ ] Any feedback MLAI has actually given (meetings, emails), with dates.
- [ ] Who your Product Owner is, and whether MLAI has reviewed the prototype.
- [ ] Whether MLAI agrees with the five metric definitions (see README, "Metric definitions").
- [ ] Your inspect-and-adapt points: what you'd change in Sprint 2 based on your own retrospective.
- [ ] Final speaker order and who drives the mouse.
