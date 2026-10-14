# Sprint 1 Demo Checklist

Team 0311 · MLAI Sponsor & Impact Reporting Dashboard · FIT2002 Week 11

**Target: 3:40. Hard limit: 5:00.** Speaker notes are in [PRESENTER_GUIDE.md](PRESENTER_GUIDE.md).

**Core sequence:** Login → Load Sample Data → Select Sponsor → View Dashboard → Switch Sponsor → Sprint Completion Summary

---

## 1. The day before

- [ ] `npm install`, then `npm test` (40 tests), `npm run typecheck` and `npm run build` all pass.
- [ ] Choose how you'll run it:
  - **Hosted (no setup):** https://retesbiz.github.io/mlai-sponsor-dashboard/. Needs internet on the demo computer. The app makes no other network requests once it has loaded.
  - **Local (no internet needed):** `npm run demo` serves the production build at **http://localhost:4173**. `npm run dev` (port 5173) is a further fallback.
  - Keep the other option ready as a backup.
- [ ] **Record verified status, but only what the team has actually verified** (see section 6). If nothing has been verified, leave it: the summary will honestly show "Awaiting team confirmation".
- [ ] Do one full timed rehearsal with all three speakers, using a stopwatch.
- [ ] Decide who drives the mouse. Suggestion: one person drives the whole time, and speakers say "next" instead of swapping laptops.
- [ ] Agree on a backup in case the laptop or projector fails, such as screenshots or a short screen recording. **(Team to decide.)**
- [ ] Fill in every **[CONFIRM]** item in the presenter guide.

## 2. Ten minutes before

- [ ] Laptop on power.
- [ ] **Turn Do Not Disturb / Focus ON** (macOS Control Centre → Focus, Windows Notifications → Do not disturb) so **all notifications are silenced** during the demo.
- [ ] Quit Slack, Messages, email and any other apps or browser tabs that could pop up.
- [ ] Projector at **1920×1080** if possible. Browser zoom at **100%**. Text scales up automatically at this width.
- [ ] Open the hosted URL (or http://localhost:4173) and go full-screen (macOS `Ctrl+Cmd+F`, Windows `F11`).
- [ ] If you see anything other than the login screen, click **Reset demo** (sidebar, bottom), then **Reset demo** in the dialog.
- [ ] Check: login screen visible, no data loaded, mouse pointer visible on the projector.

---

## 3. Click sequence

"Expect" is what should be on screen after the click. If it isn't, see section 5. The top bar tracks progress: **Import data → Select sponsor → View dashboard → Sprint summary**.

| # | Time | Speaker | Click | Expect | Story |
|---|---|---|---|---|---|
| 0 | 0:00 | Ian | *(none: login screen showing)* | Left panel: **Sprint 1 goal**, the 4 stories, "16 story points selected (estimated capacity 18)" | Goal |
| 1 | 0:45 | Kai-Po | **Enter Demo as MLAI Staff** | Import page. Top right: "Demo Staff User · MLAI Staff · simulated session" and an amber **Simulated sign-in** label | US04 |
| 2 | 1:00 | Kai-Po | **Load Sample Data** | Green banner "11 sponsor-impact records imported" with the 3 sponsors. Sidebar **Data status**: 11 records · 3 sponsors. Step 1 ticked | US01 |
| 3 | 1:15 | Kai-Po | **Select a sponsor** (in the green banner) | Sponsors page, 3 cards: Acme 4 events / 505 attendees, Horizon 3 / 205, Northstar 4 / 750 | US02 |
| 4 | 1:20 | Kai-Po | Click the search box, type `acme` | Only the Acme Technology card remains | US02 |
| 5 | 1:25 | Kai-Po | **Acme Technology** card | Card shows "Selected". Table below: only Acme's 4 events, total row 505 attendees | US02 |
| 6 | 1:40 | Kai-Po | **View Dashboard** | Dashboard: "Acme Technology", All dates · 12 Feb 2026 – 20 Aug 2026 | US02 → US03 |
| 7 | 1:45 | Sabiuddin | *(point at KPI cards)* | **4 · 505 · 33 · 32,900 · 1,540**. The third card is **Startup Participations**, with the note "Not unique startups". Amber "Demonstration data" label | US03 |
| 8 | 2:15 | Sabiuddin | **Engagement** (button above the left chart) | Bars 340 / 260 / 510 / 430. Comparison chart shows Community Engagement | US03 |
| 9 | 2:30 | Sabiuddin | Under **Switch sponsor**: **Northstar Innovations** | Header, KPIs, charts and table all change: **4 · 750 · 63 · 56,700 · 2,610** | US03 |
| 10 | 2:50 | Sabiuddin | **Sprint summary →** (top right of the dashboard) | **Sprint 1 Completion Summary**: five-column key and a summary table. Criteria evidence counts appear. Definition of Done shows whatever the team recorded (default "Awaiting team confirmation"). Acceptance shows **Pending — not yet confirmed** | All |
| 11 | 3:30 | Sabiuddin | *(close)* | | |

**Optional extras (only if ahead of time):**
- **Simulated roles (US04, ~15s), after step 1:** sidebar → **Simulated role · demo only** → **Viewer**. A header note says "Viewer (simulated): read-only … not real access control", and **Load Sample Data** / **Choose file** are disabled. Switch back to **MLAI Staff**. The page doesn't shift, so the next click lands where you expect.
- **Validation (US01, ~20s), after step 2:** **Choose file** → `public/sample-data/mlai-sample-with-errors.csv` → 6 rows: 2 valid, 3 with errors, 1 duplicate, each with a line number → **Cancel**. Practise the file dialog first; it's the slowest part of the demo.
- **Reporting period (US03, ~10s), after step 9:** **Reporting period** → *Q3 2026* → Northstar shows 2 events, 495 attendees. Set it back to *All dates*.
- **Comparison chart (US03, ~5s):** click the **Horizon Ventures** bar in "How sponsors compare" to switch sponsor.

Using the optional extras also fills in more criteria evidence on the summary (e.g. US04 Viewer restriction, US01 validation). Without them, those criteria show "Not yet observed in this session". That's accurate, not an error.

## 4. Expected numbers (sample data, All dates)

| Sponsor | Events | Attendees | Startup participations* | Media reach | Engagement |
|---|---|---|---|---|---|
| Acme Technology | 4 | 505 | 33 | 32,900 | 1,540 |
| Horizon Ventures | 3 | 205 | 13 | 12,600 | 830 |
| Northstar Innovations | 4 | 750 | 63 | 56,700 | 2,610 |
| **All sponsors** | **11** | **1,460** | **109** | **102,200** | **4,980** |

\* The A1.2 "Startups Supported" metric, counted **per event**. A startup at two events is counted twice, so these are not unique startups (the data has no startup IDs).

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
| Summary shows a red "status is inconsistent" box | Someone edited `src/data/sprintStatus.ts` incorrectly. Fix it before the demo; `npm test` names the problem |
| Page refreshed by accident | Data, selected sponsor and page are kept. Carry on |
| Browser or server crashed | Reopen the hosted URL, or run `npm run demo` again (≈ 5 s) and open http://localhost:4173 |
| Classroom Wi-Fi is down | Use the local option: `npm run demo` → http://localhost:4173 |
| Running out of time at step 9 | Click **Sprint summary** and just show the summary table for 10 seconds |

---

## 6. Story → evidence map, and recording status

The **Sprint 1 Completion Summary** page keeps five things apart:

| # | Layer | Who decides | Where it comes from |
|---|---|---|---|
| 1 | Sprint Backlog item | Team (Sprint Planning) | `src/data/sprintStatus.ts`: id, title, points |
| 2 | Demonstrated | The prototype | What the app actually does, described per story |
| 3 | Acceptance-criteria evidence | Observed automatically | What was used in *this browser session* (e.g. sample loaded, two sponsors viewed). **Evidence only. It never marks anything Done or Accepted** |
| 4 | Definition of Done | Team, after verifying | `dod` in `src/data/sprintStatus.ts`. Default **Awaiting team confirmation** |
| 5 | Acceptance | Client / tutor | `acceptance` in `src/data/sprintStatus.ts`. Default **Pending — not yet confirmed** |

**To record a verified status** (only after it has really happened): edit `src/data/sprintStatus.ts`, e.g.

```ts
dod: { state: 'verified', verifiedBy: 'Ian Wang', verifiedOn: '2026-10-20', note: 'Checked against our DoD' },
```

Then run `npm test`. It rejects a missing name or date, and anything marked accepted before it's verified Done. Commit and push to update the hosted site. Leave `acceptance` as `{ state: 'pending' }` until the client or tutor actually confirms.

The acceptance criteria in that file are **drafts written from the Sprint 1 scope** (`criteriaSource: 'draft'`, shown on screen as "Draft criteria"). Replace them with your Product Backlog wording and set `criteriaSource: 'product-backlog'`. **[CONFIRM]**

| Story | Draft acceptance criteria | Evidence the audience sees | Step |
|---|---|---|---|
| **US04** Authorised access (3 pts) | Only the login screen is available before entering. User and role are visible. A non-staff role can't import (simulated). The user can log out. | Login is the only entry point. **Enter Demo** opens the app. The profile shows the role and "Simulated sign-in". Optional: Viewer disables import. **Log out** (top right) returns to login. | 0–1 (+ optional) |
| **US01** Import sponsor-impact data (5 pts) | A staff user can import a CSV with the agreed fields. A confirmation shows the count. Invalid or malformed rows are reported and not imported. | **Load Sample Data** → "11 sponsor-impact records imported". Optional: the errors file shows line-level validation. Malformed files, such as an unmatched quote, get a clear message. | 2 (+ optional) |
| **US02** View sponsor-specific information (3 pts) | The user can find and select a sponsor. Only that sponsor's records are shown. The user can open its dashboard. | Search "acme" → 1 card. Selecting it shows 4 Acme-only events. **View Dashboard**. | 3–6 |
| **US03** Display agreed sponsor-impact metrics (5 pts) | The agreed metrics are shown for the selected sponsor and period. Switching sponsor updates every metric. Fictional data is labelled. | Five KPI cards, including Startup Participations (A1.2, per event). The table total row matches the KPIs. Switching to Northstar changes everything. "Demonstration data" label. | 7–9 |
| All | Sprint Goal, backlog and completion shown honestly. | Login panel shows the goal. The summary page keeps evidence, Done and Acceptance separate. | 0, 10 |

## 7. Things not to say or show

- Don't say any story is **Done**, **accepted** or **production-ready** unless your team has verified it (and recorded it) or the client/tutor has actually confirmed it.
- Don't call the sign-in or roles **secure**. They're simulated for the demo, and the UI says so.
- Don't call Startup Participations **"unique startups"**. It's a per-event total.
- Don't say it **connects to** Slack, Luma, Humanitix, Substack or the website. It only reads CSV files.
- Don't say it **reduces reporting from two weeks to X** unless you've measured it. Say it *aims to* reduce the effort.
- Don't present the sample sponsors or numbers as real MLAI data.

## 8. Information the team must confirm (not in the project files)

- [ ] The real acceptance criteria for US04, US01, US02 and US03 (replace the drafts in `src/data/sprintStatus.ts`).
- [ ] Your Definition of Done, and which stories actually meet it. Record only verified ones, with who and when.
- [ ] Anything carried over to Sprint 2 (use `state: 'not-done'` with a note).
- [ ] Sprint progress evidence you want to mention: burndown, task board, hours, velocity.
- [ ] Any feedback or acceptance MLAI or your tutor has actually given, with dates.
- [ ] Who your Product Owner is.
- [ ] The exact wording of the A1.2 requirement, and whether MLAI is happy with "Startup Participations" (per event) for now, or needs unique startup counts later.
- [ ] Whether MLAI agrees with the other metric definitions (see README, "Metric definitions").
- [ ] Your inspect-and-adapt points from your own retrospective.
- [ ] Final speaker order and who drives the mouse.
