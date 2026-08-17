# Phase 8 — Funnel revamp + a CTA that works with zero setup

Directed by James, 17 Aug 2026, from the Studio Impetus 30-day playbook
(built 13 Aug). Two jobs, in priority order:

1. **Make the CTA actually capture leads with no deployment setup.** Today
   `/api/enquiry` answers 501 (no channel configured on Railway) and the card
   falls back to `mailto:` — which on most phones opens nothing. James cannot
   do env-var setup from his phone, so the fix must work with **zero
   configuration**.
2. **Rewrite the funnel copy per the playbook.** The current page describes
   what Jelani does; the playbook rewrites it around what happens to the
   buyer, and fixes the pricing anchor problem.

Read `HANDOFF.md` §1 (hard content rules — e.g. no fitness content) and
`README.md` first. All copy lives in `src/content/site.ts`; components should
not need edits for wording, only for new sections/steps.

---

## Part A — Lead capture with zero setup

### A1. Add FormSubmit as the built-in default delivery channel

In `server/enquiry.js`, add a third channel that is **always available**:
POST the enquiry server-side to `https://formsubmit.co/ajax/<email>` where
`<email>` is `process.env.ENQUIRY_TO || 'jelaniwoods@gmail.com'` (the same
address already public on the page). Send JSON:

- `_subject`: `New enquiry — <need>`
- `_replyto`: visitor email
- `_captcha`: `'false'`
- `_template`: `'box'`
- the enquiry fields (need, for, when, email, note) as readable keys

Rules:

- The FormSubmit channel is the **fallback of last resort in the channel
  list**: if `ENQUIRY_WEBHOOK_URL` or Resend is configured, those run too
  (current `Promise.allSettled` behaviour keeps working). FormSubmit is
  simply always in the list, so `channels()` is never empty → the 501 path
  and the client-side mailto dependency effectively disappear.
- Treat a FormSubmit response that is non-2xx **or** whose JSON `success`
  is not truthy (it returns `"true"`/`"false"` strings) as a failure.
- Keep the existing order: log first, honeypot, rate limit, validation.
- 8s timeout like the other channels.
- **First submission to an unactivated address triggers FormSubmit's
  activation email** to that inbox — one tap on the link and every later
  submission delivers. Note this in README §Enquiries: after deploy, submit
  the form once yourself, then tap "Activate" in Jelani's inbox. That is
  the entire setup, and it can be done from a phone.

### A2. Fix the visible failure mode on the card

In `CtaSection.tsx`, when the POST fails, do **not** only fire
`window.location.href = mailto` and claim success. Instead:

- Still attempt the mailto (it works on desktop),
- but show a distinct fallback state on the card (not the success state):
  "Couldn't send automatically — email me directly at
  jelaniwoods@gmail.com" with the address as a copyable/tappable link, and
  keep the visitor's answers on screen so nothing is lost.
- Only show the success state on a true 2xx from our server.

### A3. Tests

- Extend `tests/server/*.test.mjs`: FormSubmit channel present with no env
  vars (mock `fetch`); success + failure JSON shapes; existing tests keep
  passing.
- Update the Playwright CTA flow for the new step (Part B) and the new
  failure state.

---

## Part B — The playbook rewrite (all in `src/content/site.ts` unless a new
section needs a component)

Preserve the file's conventions: `CONFIRM:`/`PENDING:` markers, comments
explaining removals, client names only in this file. The playbook copy below
was signed off by James — the old "fixed by the brief" note on the headline
is superseded.

### B1. Hero

- Headline: **"Your activation is over in six hours. Your content shouldn't
  take three weeks."** (two sentences; layout may break them over two lines)
- Sub: "I shoot brand activations, launches, and influencer events across
  the GTA — and get you a finished recap in 48–72 hours, stills the same
  day, and vertical cuts built for paid from the start."
- Add a **proof line** directly under the sub (new slot, small type):
  "Bioderma · Soluna · Canergy · Reset Studio · Camp Dreamwood · Featured
  on Sportsnet" — keep the existing CONFIRM markers about public naming.
- Credibility strip / stages: "Toronto + GTA · Founder, Studio Impetus ·
  Former agency DP & project manager" can replace or fold into stage
  "proof".

### B2. New section: The problem (new component, placed after hero/marquee,
before Services)

> **Most event content never runs.**
> You spend the budget. The room looks incredible. Then the footage sits in
> an edit queue, the recap lands two or three weeks later, and by the time
> it's ready the campaign has moved on.
> The problem usually isn't the shooter. It's that nobody scoped the edit,
> nobody planned for vertical, and nobody was working to a deadline that
> matched how fast the moment actually expires.
> I work backwards from the post date. Stills the same night, recap in
> 48–72 hours, vertical delivered alongside the horizontal — not as an
> afterthought when someone asks a week later.

Style it like the existing sections (Reveal, eyebrow, section-title system).

### B3. New section: Why me (can live as a reframe of About's opening or a
distinct block above About)

> **A DP who came up as a project manager.**
> Toronto has no shortage of good shooters. What's harder to find is someone
> who scopes a job honestly, shows up early, and doesn't need managing on
> the day.
> I came up through agency production at Visual Smugglers as a project
> manager *and* a DP — so I've sat on both sides of the brief. I know what
> it costs an agency when a freelancer over-promises, goes quiet, and
> delivers late. I built how I work around not being that person.
> You get a written brief before the shoot. A real timeline, and I hit it.
> Horizontal and vertical from the same shoot, not a change order. And you
> can hand me a job and stop thinking about it.

### B4. Services — reframe to outcomes

- **Event video recaps** — "The recap your team can actually run. Cut so it
  works as paid, not just as a nice post." · 48–72 hours
- **Photo coverage** — "A stills library that lasts the quarter. Social,
  PR, and paid can all pull from it, so you're not re-shooting product in
  October." · Gallery in 72 hours. **Keep** the two-shooter scoping caveat
  from the 2026-08-05 revision (photo + video same day = second shooter).
- **Second shooting** — "A second camera that matches your lead shooter,
  arrives early, and doesn't need briefing twice." · Day rate, GTA-wide
- **Quick-turnaround editing** — "You shot it, I'll finish it. Real story,
  pacing, sound and colour — not a trim and a LUT." · Same week. **Remove
  the "$100 each" sentence.**

### B5. Pricing — the important change

Remove the per-unit anchor entirely: the "$100" title, the 10/20-edit tiers
and their "$100 per edit" feet. Replace with three tiers (keep the
no-discount house rules comment in the file — it still applies):

1. **Event coverage — from $2,000/day.** "Video, photo, or both. Recap in
   48–72 hours, stills same day. Vertical included, not extra."
2. **Content package — from $1,000.** "A block of finished cuts from
   footage you already have."
3. **Quarterly partner — from $3,000/quarter** — the **featured** tier.
   "10+ videos a month, priority booking on event dates, strategy included.
   For teams who've stopped wanting to re-scope this every time."

Blurb keeps the exact line "no discounts, no in-between quantities, no
negotiation theatre" (playbook: don't smooth that voice out). Footnote stays
CAD. Document the removal in a comment per house style ($100/edit becomes a
closing tool on calls, not public copy).

### B6. CTA form — add the qualifying step

Add a step between "What do you need?" and "When do you need it?":

- id `for`, question **"What's the content for?"**, options:
  Paid ads · Organic social · PR · Internal · Sales

Server accepts + relays the new `for` field (length-capped like the others);
mailto fallback and `format()` include it. Keep the existing `when` step
(that's the playbook's "When is it?" triage).

### B7. Testimonials

Playbook wants 3–5 named testimonials — **do not fabricate**. The hidden
`proof.testimonials` block already does the right thing; leave it and keep
the PENDING marker. James is collecting real quotes via the outreach
templates.

---

## Definition of done

- `npm run typecheck`, `npm run test:server`, `npm run build` all pass;
  Playwright e2e updated and passing (`npm run test:e2e`).
- With **no env vars set**, a form submission reaches the FormSubmit relay
  path (verified in server tests with a mocked fetch) and the card shows
  the honest failure state when everything fails.
- README §Enquiries updated: zero-setup default, the one-tap activation
  step, env vars now optional upgrades.
- No regressions to prerender/LCP: new sections use the existing Reveal
  system; hero stays CSS-animated first paint.
