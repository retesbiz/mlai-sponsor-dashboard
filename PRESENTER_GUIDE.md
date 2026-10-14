# Presenter Guide: Sprint 1 Demo

Team 0311 · about **3 minutes 40 seconds**, with a 5-minute hard limit.

These are talking points, not a script. Say them your own way. Anything marked **[CONFIRM]** has to come from the team. Don't fill it with a guess. For exact clicks, see [DEMO_CHECKLIST.md](DEMO_CHECKLIST.md).

| Speaker | Covers | Time | Screen |
|---|---|---|---|
| Ian | Intro, the problem, Sprint Goal, Sprint progress | 0:00–0:45 (45 s) | Login screen |
| Kai-Po | Authorised access, data import, sponsor selection | 0:45–1:55 (70 s) | Login → Import → Sponsors |
| Sabiuddin | Dashboard, user value, limitations, close | 1:55–3:40 (105 s) | Dashboard → Sprint 1 Demo |

That leaves about 80 seconds of buffer before the 5-minute limit. Use it for questions or one optional extra, not for longer talking.

---

## Ian (0:00–0:45): why this exists and what we planned

**On screen:** the login screen. The Sprint Goal box on the left is your visual aid.

- Hi, we're Team 0311. Our client is MLAI.
- MLAI's sponsors want to know what their money achieved: events, attendees, startups, reach.
- Right now that information is spread across Slack, Luma, Humanitix, Substack, the website and social media.
- Pulling it into a sponsor report takes about two weeks.
- Our project is a reporting layer that brings the agreed numbers into one place. It sits alongside MLAI's tools and doesn't replace them.
- Our Sprint 1 goal was a basic end-to-end prototype. An authorised MLAI user imports sample sponsor data and sees key sponsor metrics on a dashboard.
- We picked four stories for that: access, import, sponsor view and metrics. That's 16 story points against an estimated capacity of 18.
- **Sprint progress [CONFIRM]:** one or two sentences on how the sprint actually went, e.g. how many stories meet your Definition of Done, anything carried over, what the burndown showed. Only say what's true.
- Kai-Po will now walk through the first half of the flow.

**Handoff:** "Over to Kai-Po."

---

## Kai-Po (0:45–1:55): getting in, getting data in, picking a sponsor

**0:45: US04, authorised access (~25 s)**
- This is an internal tool, so the first story was authorised access.
- *Click* **Enter Demo as MLAI Staff.**
- We're now in as MLAI Staff. You can see it top right.
- To be upfront, this is a simulated session. There are no real passwords yet. Real sign-in is future work.
- *Sidebar → Viewer.* We also sketched roles. A viewer can look, but import is locked.
- *Sidebar → MLAI Staff.* Back to staff.

**1:10: US01, import data (~20 s)**
- Next is getting data in. Staff can upload a CSV, either by dragging it in or with the file picker.
- For a reliable demo we'll use our sample file. It's fictional data for three made-up sponsors.
- *Click* **Load Sample Data.**
- 11 records, 3 sponsors. The sidebar and the progress bar at the top update too.
- (If time allows: the app also checks each row and rejects bad dates, missing sponsors and duplicates, so nothing gets counted twice.)

**1:30: US02, sponsor view (~25 s)**
- *Click* **Select a sponsor.**
- Every sponsor in the data, with a quick summary.
- *Type "acme".* You can search. Handy once there are more than three.
- *Click Acme.* Now we only see Acme's four events, nobody else's.
- *Click* **View Dashboard.**

**Handoff:** "Sabiuddin will take you through Acme's dashboard."

---

## Sabiuddin (1:55–3:40): the numbers, why they matter, what's not real yet

**1:55: US03, metrics (~40 s)**
- This is the main view a staff member would bring to a sponsor conversation.
- These are the five metrics we scoped: events funded, attendees, startups supported, media reach and community engagement.
- Acme: 4 events, 505 attendees, 33 startups.
- They're calculated straight from the imported records, not typed in. The total row in the table matches the cards.
- The bar under each card shows Acme's share across all sponsors.
- *Click* **Engagement.** The chart breaks it down by event. On the right, Acme compared with the other sponsors.

**2:35: switching sponsor (~20 s)**
- *Click* **Northstar Innovations.**
- Everything updates at once: name, dates, cards, charts, table.
- Northstar: 4 events, 750 attendees, 63 startups.
- And this label says it plainly: demonstration data, not real MLAI reporting.

**2:55: user value (~15 s)**
- So for MLAI staff and volunteers, a sponsor's impact sits on one screen.
- No digging through six platforms for every report.
- We aim to cut down that two-week preparation time. We haven't measured it yet. That needs real data. **[CONFIRM: say more only if MLAI has given you something concrete]**

**3:10: limitations and what's next (~20 s)**
- *Sidebar →* **Sprint 1 Demo.** *Scroll slowly.*
- Here are the four stories with what we showed for each in this session.
- They're marked "pending review". Acceptance is decided at review, not by us.
- What's simulated: login, roles, and data that lives in the browser.
- What's not built yet: automated quarterly reports, approvals, and live connections to MLAI's platforms.
- **Inspect and adapt [CONFIRM]:** one thing you'd change in Sprint 2 from your retrospective. Suggestions based on the prototype itself:
  - We need MLAI to confirm the metric definitions.
  - We need to check which CSV exports MLAI can actually produce.
  - "Startups supported" currently counts per event, so the same startup can be counted twice.

**3:30: close (~10 s)**
- That's Sprint 1: access, import, sponsor view and metrics, end to end.
- Thanks. Happy to take questions.

---

## Likely questions and honest answers

| Question | Short answer |
|---|---|
| Is the login secure? | No. It's a simulated session to show the flow. Real authentication is planned future work. |
| Where does the data come from? | A CSV file. For the demo, a fictional sample. There are no live platform connections yet. |
| How do we know the numbers are right? | They're sums of the imported rows. The table total matches the cards, and our tests check every sponsor's totals against hand-calculated values. |
| What if the same event is uploaded twice? | Rows with the same sponsor, event and date are rejected, so they aren't counted twice. |
| Did MLAI accept these stories? | **[CONFIRM]** Answer only with what has actually happened. |
| Why calendar quarters? | It's a placeholder. MLAI's preferred reporting period still needs to be confirmed. |

## Timing tips

- Rehearse with a stopwatch. If you're past **2:00** when Sabiuddin starts, skip the Engagement click.
- If you're past **3:15** at the Sprint 1 Demo page, skip scrolling and just say the limitations.
- Don't read the screen aloud. Point to it and give the one number that matters.
