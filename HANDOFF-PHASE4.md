# Phase 4 Handoff — Video-Editing Pricing Section (Opus builds this)

**Roles:** Opus — builder (implements this spec). Fable — engineering owner
(architecture, review, QA sign-off). Deviations go through the engineering
owner, not ad-hoc.
**Read first:** `HANDOFF.md` (brief, design system, locked decisions),
`README.md` (how the build works), `HANDOFF-PHASE3.md` §1 (the Windows/local
environment — unchanged and all of it still applies). This doc covers only
what Phase 4 adds.
**Prime directive:** integrate, don't redesign. Quality gates hold: all
Playwright + axe assertions green, Lighthouse at parity, CLS 0, no new media
weight (this phase ships zero images).

---

## 1. What changed — the pricing decision is resolved

James supplied Jelani's video-editing pricing on 2026-08-02 (transcribed from
the "Pricing for video" voice memo). This closes the "publish vs quote-only"
question that Phase 2 §6.3 and Phase 3 §10.7 left blocked: **publish, for
video editing only.** Event recaps, photo coverage, and second shooting stay
quote-per-project — that boundary is part of the spec, not an accident.

## 2. The pricing model (verbatim rules — never soften these)

**Per-edit packages:**
- **10 edits — $1,000**
- **20 edits — $2,000**
- These are the only two tiers. No smaller, no larger, no in-between
  quantities — a client who wants 15 buys the 20-pack. **No discounts on
  either tier.**

**Quarterly video package:**
- Minimum **10 videos per month**; minimum quarterly spend **$3,000**.
- Scales up freely — clients add videos per month as strategy requires.
- **The quarter's branding strategy is included, complimentary.**
- There is still **no discount** for going quarterly. The strategy is
  complimentary precisely so the editing keeps being charged at full worth.

**The copy spine (use it, it's the honest math):** every number above is the
same number — an edit costs **$100**. Ten of them, twenty of them, thirty a
month on the quarterly: the price of an edit never moves. What changes with
commitment is not the price — it's what arrives around the edits (the
strategy layer). This is how the section makes value legible *without*
fabricating anchor prices or discounts that Jelani's model explicitly
doesn't have.

**Hard rules for the builder:**
1. Never invent a discount, a "save $X" badge, a crossed-out price, or a
   "most popular" claim. The model's whole personality is that the math
   never changes.
2. Never price the other three services. A one-line footnote sends them to
   the enquiry card: coverage work is scoped per event.
3. Don't define what counts as "an edit" (length caps, revision rounds,
   raw-footage rules) — that scope is not in the memo. If copy needs a
   qualifier, keep it generic ("short-form and social edits") and mark it
   `CONFIRM:`.

## 3. Section spec — `Pricing.tsx`

**Placement:** between Proof and CtaSection in `App.tsx` — credibility, then
price, then the ask. Section `id="pricing"`. Do **not** add a nav link:
the nav is at capacity on 360px (verified in Phase 3); the marquee and CTA
already route people down the page.

**Layout:** pattern-match `Services.tsx` (eyebrow / title / gold rule /
blurb, then a card grid). Three cards, `sm:grid-cols-2 lg:grid-cols-3`
(quarterly full-width at `sm` via `sm:col-span-2 lg:col-span-1`):

1. **"10 edits" — $1,000.** One line: for a launch, a campaign burst, or a
   month of consistent posting.
2. **"20 edits" — $2,000.** One line: the same $100 an edit, doubled — for
   teams feeding more than one channel.
3. **"Quarterly" — from $3,000 / quarter** (featured). Ten-plus videos a
   month, room to scale, and the quarter's **branding strategy included,
   complimentary** — the only card with a gold hairline border
   (`border-gold/40`) and a small gold `Strategy included` tag. "Featured"
   here means visually distinguished, NOT labelled "best value" (rule 2.1).

Card anatomy (keep the Services card DNA): gold `font-quote` italic numeral
or price, title, one-line body, then a hairline-topped footer row like the
Services `promise` line — use it for `$100 per edit` / `$100 per edit` /
`Strategy included` respectively. Every card's footer CTA is a `GoldLink`
ghost to `#contact` labelled "Start with this" (or similar — one label, all
three cards; it's an anchor link, not a form mutation).

**Copy skeleton for `site.ts`** (Opus drafts final wording in the site's
competent-operator voice; keep the stance confident, not apologetic):

- Eyebrow: `Pricing`
- Title: something in the register of **"An edit costs $100. That's the
  whole model."**
- Blurb: two sentences max — fixed packages for video editing; no
  discounts, no in-between quantities, no negotiation theatre; event and
  photo coverage scoped per project through the enquiry card.
- Footnote under the grid, muted: `CONFIRM:` currency line ("Prices in
  CAD.") + "Event recaps, photo coverage, and second shooting are quoted
  per project."

**`site.ts` additions** (all copy there, components stay content-free):

```ts
pricing: {
  eyebrow: 'Pricing',
  title: '…',
  blurb: '…',
  tiers: [
    { id: 'ten', name: '10 edits', price: '$1,000', body: '…', foot: '$100 per edit', featured: false },
    { id: 'twenty', name: '20 edits', price: '$2,000', body: '…', foot: '$100 per edit', featured: false },
    { id: 'quarterly', name: 'Quarterly', price: 'From $3,000 / quarter', body: '…', foot: 'Branding strategy included', featured: true },
  ],
  cta: 'Start with this',
  // CONFIRM: currency presentation (assumed CAD, Toronto client base).
  footnote: '…',
},
```

**Semantics & a11y:** the grid is a `<ul>` (Reveal `as="li"`), prices are
real text (no pseudo-content), the featured tag is text not colour-only
(colour + the word "included"), and the whole section passes the existing
axe gate untouched.

## 4. Adjacent touches (small, deliberate)

- **CTA step 2 stays as-is.** The enquiry card already has an
  `Editing support` chip in step 1 — do not add a pricing-tier picker to
  the card; tiers resolve on the call, and the card's three-step shape is a
  locked decision (`HANDOFF.md` §4.8).
- **Services card 04 (“Quick-turnaround editing”):** append one short
  sentence pointing at the packages — e.g. "Fixed packages below — ten or
  twenty edits, $100 each." Keep the `CONFIRM:` comment style used by the
  Phase 3 BTS line.
- **Marquee: no change.** Numbers don't belong in the credit stream.

## 5. Tests (extend `tests/smoke.spec.ts`)

1. `#pricing` renders three tiers with the exact figures `$1,000`, `$2,000`
   and `$3,000` visible after `revealAll`.
2. Exactly one featured tier, and it contains the strategy-included text.
3. Each tier's CTA link resolves to `#contact`.
4. The words "discount" / "save" / "% off" appear **nowhere** in `#pricing`
   (guards rule 2.1 against future copy drift).
5. Existing suite stays green — 28 assertions from Phase 3 plus these, both
   projects (desktop + mobile).

## 6. Gates (unchanged, re-verify before pushing)

- `npm run test:e2e` — all green, both projects.
- Lighthouse mobile: parity with Phase 3 (local control ≈ 83–84; no new
  media, so any drop is a bug). CLS 0. axe: zero critical/serious.
- `npm run assets:check` — untouched, must still pass.
- Look at what you built: full-page screenshot desktop + mobile; check the
  featured card at 360px (the gold border must not cause overflow).

## 7. Build order

1. `site.ts` pricing object + Services 04 sentence.
2. `Pricing.tsx` + `App.tsx` placement.
3. Tests (§5), full gate pass (§6).
4. Commit to `claude/jelanitv-sales-website-lfqi04`, push. Screenshots to
   the engineering owner.

## 8. Blocked / CONFIRM (do not guess)

| # | Item | Default while waiting |
|---|---|---|
| 1 | Currency display (CAD assumed) | Bare `$` figures + `CONFIRM:`-marked "Prices in CAD." footnote |
| 2 | What counts as "an edit" (length, revisions, source footage) | Say nothing — generic "short-form and social edits" phrasing |
| 3 | Standalone worth of the branding strategy (for value copy) | Don't state a number; "included, complimentary" only |
| 4 | Jelani's final sign-off on public numbers | Ship it — stakeholder-supplied 2026-08-02; everything lives in `site.ts`, removable in one edit |
| — | Carried from Phase 3: YouTube IDs, LinkedIn text, headshot, testimonials, booking link, `FORM_ENDPOINT`, domain, Glorious Athletica naming, weddings, Canergy/Reset/Kilani/Soluna naming, MLSE mention on the brief page | Existing pending states stand |

---

*Spec by Fable (engineering owner), 2026-08-02. Supersedes the quote-only
default in `HANDOFF-PHASE3.md` §10.7 for video editing only.*
