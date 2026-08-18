# Phase 9 — Jelani's 18 Aug corrections: real turnarounds, the pay-first funnel, one AI-coded dash

Directed by James, 18 Aug 2026, from Jelani's Discord DMs sent ~1:13–1:23 PM
ET that afternoon. Jelani was reading the **deployed production site** (the
`live` branch as of the 09:42 UTC merge, i.e. Phase 8's funnel revamp plus
the same-morning hero refresh), so every screenshot he sent shows copy that
is still on the page now. Nothing in this feedback has been applied yet.

Three jobs, in priority order:

1. **Fix the turnaround promises.** The site says gallery in 72 hours and
   recap in 48–72. Jelani's real numbers are **gallery in 24, recap in 48**
   — and a *guaranteed* hard deadline is a premium booking, not the default.
2. **Rebuild the funnel around pay-first.** There is no free 20-minute
   discovery call. His flow: intake form → 5–10 minute sales call where
   payment is taken (Stripe) → creative brief session gets booked. The
   current "Book a call" CTA and process step 01 sell the opposite.
3. **Kill the em dash he flagged** in the Why-me copy, and thin the tic
   elsewhere without sterilizing the voice.

Read `HANDOFF.md` §1 (hard content rules — e.g. no fitness content),
`README.md`, and the conventions header of `src/content/site.ts` first.
All wording lives in `site.ts`; components change only where the funnel
rework needs it. House style: removals get a comment explaining why;
drafted language gets a `CONFIRM:` marker; never fabricate testimonials.

**Branch/deploy note:** production deploys from `live`. Build this phase on
the branch this file arrived on (it was cut from `live`, so you are on the
deployed lineage). Do **not** push to `live` — James reviews, then merges.

---

## §0 What Jelani actually said (verbatim, 2026-08-18)

Quoted in full because several lines are judgment fuel, not instructions.
He opened with "Typo?" over a screenshot of the hero deliver panel
("Event recaps in 48–72 hours. Edited galleries in 72. Vertical cuts
ready for paid.").

> Also depends on the booking but edited galleries is 24 hours
> Event recaps is 48
> But would def be for a premium service
> Like if I booked a shoot Wednesday and had to be at f45 Thursday
> The shoot would have to be so expensive I can take Thursday off so we can
> keep unrealistic turn around times because I can pump
> Just the turn around time promise will come with a price tag

Over the Photo-coverage card ("Gallery in 72 hours"):

> Gallery in 24
> Photo will always be our fastest service I was a photographer longest so
> I'm a demon on that it's so systematic I don't even have to think about
> I've left a shoot in Mexico 10am and had the photos ready to upload
> before the plane landed

Over the Why-me section:

> I feel like the "–" after DP is very AI coded

Over the Process section ("Book a call · Creative brief · …"):

> Ur call tho
> Not important to include but just FYI calls don't happen until they pay
> This shouldn't be a call I'm not wasting my time on ppl shopping around
> that's so 2018 for me personally. So we are talking money from the jump.
> You pay then we talk about the plan there can be an intake form or
> something that gets the details from them then we get on a 5-10 min sales
> call to take the payment via stripe and book in their creative brief
> session
> If they don't accept the price and pay in advance I'm hanging up in 5 min
> tbh
> The work is there this isn't a bidding game the client needs to lock tf
> in or they're not my client because I'm locked tf in
> Will work a bit different for agencies that are hiring a shooter but I'll
> handle that in the moment

Context, not site copy: he also said Socliq pays before he even finishes
editing, "so I just do whatever for them." That's relationship colour —
nothing on the page changes for it.

---

## Part A — Turnaround numbers, everywhere at once

The new truth: **edited gallery in 24 hours** (photo is his fastest,
most systematic service — let the copy be proud of that), **event recap in
48**. The old numbers appear in seven places plus the docs and tests. Change
them all in one commit so the page never half-promises.

In `src/content/site.ts` (line numbers as of this branch):

1. **`hero.sub` (~81)** — "…a finished recap in 48–72 hours, an edited
   gallery in 72…" → "…a finished recap in 48 hours, an edited gallery in
   24…". Keep the sentence shape; it also feeds `index.html` metadata (see
   item 7).
2. **`hero.stages` deliver panel (~121–122)** — currently
   `'Event recaps in *48–72 hours*.'` / `'Edited galleries in *72*.'`.
   Reorder to lead with the stronger claim:
   `'Edited galleries in *24 hours*.'` then `'Event recaps in *48*.'` then
   the vertical line unchanged. (`*…*` is the one-gold-span-per-line marker
   `Hero.tsx` parses — keep exactly one per line.)
3. **`problem.body[2]` (~155)** — "Recap in 48–72 hours, the edited gallery
   in 72…" → "The edited gallery in 24 hours, the recap in 48…".
4. **`services.items[0].promise` (~210)** — `'48–72 hours'` → `'48 hours'`.
5. **`services.items[1].promise` (~222)** — `'Gallery in 72 hours'` →
   `'Gallery in 24 hours'`. **Keep the two-shooter scoping caveat in the
   card body untouched** — Jelani did not retract the 2026-08-05 correction
   (photo + video same day = second-shooter booking); he only sped up the
   gallery.
6. **`pricing.tiers[0].body` (~603)** — "Recap in 48–72 hours, gallery in
   72." → "Recap in 48 hours, gallery in 24."
7. **`index.html`** — the `<title>` (line 7), meta description (10), and OG
   description (20) all carry 48–72/72. Update to match the hero exactly.

Also add **one** line carrying his "the turnaround promise comes with a
price tag" point — the page should not imply a next-morning guarantee is
included in the base rate. Best home: the Services blurb or the pricing
footnote. Suggested (mark `CONFIRM:`):

> Need it faster than that — a hard next-morning deadline? That's a rush
> booking, and it's priced like one.

One sentence, once. Do not hedge every promise with "depends on the
booking"; the 24/48 numbers are his standard claims and he wants them loud.

Comment archaeology: the 2026-08-18 comments in `site.ts` currently explain
why 72 hours was *right* (they cite the 2026-08-05 correction). Those
rationales are now superseded — rewrite each touched comment to record
today's correction (galleries 24, recaps 48, per Jelani's Discord
2026-08-18) so the file's history stays truthful. Same for the hero
comment block around `stages`.

Docs and tests that assert the old numbers:

- **`CONTENT-INTAKE.md` §2** quotes the hero sub and deliver panel verbatim
  (~lines 60, 71–72) and the services table row (~98) so Jelani signs off
  what the site actually says. Re-quote the new drafts; note the 2026-08-18
  correction in the changelog style the file already uses.
- **`WORKING-AGREEMENT.md`** delivery table (~99–100): "Event video recap
  48–72 hours / Photo gallery 72 hours" → 48 / 24. The agreement must
  never promise slower than the site.
- **`tests/smoke.spec.ts`** — the guard near line 306 currently treats
  "same-day stills" as the stale claim and 72 hours as the truth. Flip it:
  the stale claims are now `48–72` and `gallery/galleries in 72`; the
  expected copy is 24/48. Keep the guard style (assert the new copy is
  visible AND the old strings are absent).

## Part B — The em dash he called out (and the tic pass)

The flagged sentence is `whyMe.body[1]` (~169):

> I came up through agency production at Visual Smugglers as a project
> manager and a DP — so I've sat on both sides of the brief.

Rewrite without the dash, keeping his cadence. Suggested:

> I came up through agency production at Visual Smugglers as a project
> manager and a DP, so I've sat on both sides of the brief.

Then do a light page-wide pass: the copy leans on em dashes hard (hero sub,
problem body, services cards, pricing blurb all use them). Thin them where
two clauses can simply be two sentences or a comma. Judgment rules:

- Fix the flagged one unconditionally.
- Reduce density; do not eliminate. A dash that lands a punch stays.
- **Do not touch** "no discounts, no in-between quantities, no negotiation
  theatre" — the playbook explicitly says don't smooth that voice out.
- Anything you rewrite in `whyMe`/`about` gets re-quoted in
  `CONTENT-INTAKE.md` if that file quotes it.

## Part C — The pay-first funnel

His flow, restated: **intake form** gathers the details → **5–10 minute
sales call** where the price is accepted and payment is taken via Stripe →
the **creative brief session** is booked. No free discovery call. Agencies
hiring a shooter work differently, but he handles that himself — add **no**
agency-specific copy or flow.

**Decision (James's call, per Jelani's "Ur call tho"):** do **not** print
"no call until you pay" as a rule on the page — stated baldly it reads
hostile to a first-time visitor. Instead the flow implies it: nothing on
the page may promise a free consultation, a 20-minute chat, or "scoped on
the call before anyone talks money." Record this decision in a comment on
the process block so it isn't re-litigated.

Concrete changes:

1. **CTA label.** `nav.cta` (~63) and `hero.primary` (~92) both say
   "Book a call". Both buttons scroll to `#contact` — the intake card —
   which is already the right destination; only the label lies. Rename to
   **"Start a booking"** (suggested; `CONFIRM:`). `Pricing.tsx`'s tier CTA
   ("Start with this") already points at `#contact` and can stay.
2. **Process section** (`site.ts` ~528–570, rendered by `Process.tsx`,
   grid is `lg:grid-cols-4` — keep four steps). Retitle
   "From first call to final cut." → **"From enquiry to final cut."**
   Rewrite the blurb (~532): drop "before you have paid for anything";
   suggested: "Every engagement runs the same four steps — you know the
   price and the plan before the shoot is on the calendar." New steps:
   - **01 · Tell me what you need** — "The enquiry card below: what the
     event is, who the content is for, where it runs. Takes a minute."
   - **02 · Lock it in** — "A short call — ten minutes, not a pitch. We
     confirm the package, payment locks your date, and we book your
     creative brief session."
   - **03 · Creative brief** — keep the existing body verbatim.
   - **04 · Shoot and delivery** — merge the old steps 03/04: "I show up
     early, shoot the plan, and deliver fast — horizontal and vertical
     cuts from the same shoot, ready to run."
   Mark steps 01/02/04 `CONFIRM:`. Per the decision above, step 02 says
   payment locks the date; it does not say "you can't talk to me until you
   pay."
3. **Pricing blurb** (~594) — "Where a job needs scoping, it gets scoped on
   the call before anyone talks money." is the exact opposite of "money
   from the jump." Suggested replacement (`CONFIRM:`): "Fixed packages — no
   discounts, no in-between quantities, no negotiation theatre. Pick one,
   and a ten-minute call locks the date and the details." Document the
   removal in a comment per house style.
4. **CTA card copy** (~630–685). The card *is* the intake form, so it
   inherits step 01's job. Update `cta.sub` (~633) to set the pay-first
   expectation without the hostility — suggested: "Four quick questions.
   I'll come back within a business day with the price and a time to lock
   it in." Update `success.body` (~670) similarly: the next step after the
   reply is a short call that locks the date. Steps/fields themselves
   (need / for / when / email / phone / note) already collect the right
   intake — no server or component changes needed.
5. **Stripe is out of scope.** Payment happens *on the sales call*, not on
   the site. Do **not** build a checkout, payment link, or Stripe
   integration in this phase; `meta.bookingUrl` stays `null`/`PENDING:`.
   If James later wants pay-online, that's its own phase.
6. **Tests** (`tests/smoke.spec.ts`): the "Book a call" link-name
   assertions (~67, ~218) take the new label; the process-step list (~387)
   and section-title assertion (~386) take the new steps/title. Add the
   funnel guard: the strings "Book a call" and "scoped on the call before
   anyone talks money" must be absent from the rendered page.
7. **`CONTENT-INTAKE.md`** — re-quote every drafted line this part touches
   (CTA label, process steps, pricing blurb, cta sub) so Jelani signs off
   the funnel he actually asked for.

## Part D — Housekeeping

- `README.md`: if it describes the funnel or the CTA ("book a call"
  anywhere), align it.
- Keep client names in `site.ts` only, per the file header.
- Commit style: this repo writes commit messages about *why*, in plain
  sentences. Match it.

---

## Definition of done

- `npm run typecheck`, `npm run test:server`, `npm run build`, and
  `npm run test:e2e` all pass.
- `git grep -n "48–72\|galleries in 72\|gallery in 72\|Gallery in 72"` over
  `src/ index.html WORKING-AGREEMENT.md` returns only comment archaeology
  (explanations of what changed), never rendered copy or metadata.
- `git grep -n "Book a call"` over `src/` returns nothing rendered — only
  removal comments.
- No Stripe/checkout code anywhere in the diff.
- `CONTENT-INTAKE.md` quotes every new drafted line with `CONFIRM:` status
  so James can paste it to Jelani for sign-off in one message.
- Push to this branch only; James merges to `live` after review.
