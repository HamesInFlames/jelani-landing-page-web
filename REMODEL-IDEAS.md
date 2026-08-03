# Remodel Ideas — Phase 3: The Scroll-Cinematic Pass

**What this is:** the concept document for remodeling the built JelaniWoodsTV site
around the KC scroll-animation system, now that Jelani's real footage and stills
are on James's machine. The build spec that implements this lives in
`HANDOFF-PHASE3.md`. Read `HANDOFF.md` first for the brief and locked decisions —
nothing here reopens them.

**The thesis:** Jelani sells motion. The site currently *tells* that story with
copy and elegant placeholder plates; the remodel makes the page itself *show* it.
Scrolling becomes the showreel — his footage scrubs under the visitor's thumb,
his stills drift like a gallery wall, and every effect quietly demonstrates the
craft he's selling. This is the "$50k agency site" moment (KC Premium-tier
feature), done with KC restraint:

- **No scroll hijacking, ever.** Scroll speed belongs to the visitor.
- **One scrubbed sequence per page, maximum.**
- Reduced-motion visitors get a fully readable, static-composed page.
- The Lighthouse 92/100/100/100 baseline is a floor, not a memory.

---

## 1. What we now have (verified on disk, 2026-08-02)

All paths relative to `C:\Users\xoxok\Projects\Jelani Woods Web\`. Phase 2's
"Dropbox is blocked" constraint is gone — everything below is local.

| Asset | What it is | Remodel use |
|---|---|---|
| `Website refernece\socliq live bioderma color audio blend.mov` (630 MB) | Graded Bioderma event recap, shot with Socliq | **Hero scrub sequence source (recommended)** + real Bioderma card poster |
| `Website refernece\soluna youtube test.mp4` (173 MB) | Soluna edit — Jelani: "can be shortened and reused" | Hero-loop alternative, Soluna work card + poster |
| `Website refernece\Reset Studio\` (229 JPG, portrait, graded) | "Socliq x Reset Studio" brand-activation stills — supplement sampling at a pilates-studio event, warm editorial grade | Photography **parallax gallery** + campaigns group |
| `Canergy Exports\` (205 JPG, portrait, graded) | "Socliq x Canergy" activation stills, same studio world | Campaign posters + gallery selects |
| `Cellphone BTS\` (6 phone shots) | Behind-the-scenes of a live event shoot | **Process/BTS strip** — proof for the free-BTS bundle offer |
| `Website refernece\Run Club 2\` (2 MP4, 5.4 GB) | Run-club event footage + an interview clip ("jeff talking") | Events work card, **visuals only** — naming blocked (see §6) |
| `Website refernece\Valentines Variation.pdf` (Kilani) | Post-payment creative-brief example | Process section artifact |
| `Website refernece\Pricing for video.m4a` | Jelani's pricing voice memo | James task: transcribe → pricing decision. Not a site asset yet |
| `Website refernece\RAWs for Brandon\` (278 ARW, 23 GB) | Unedited Sony RAW client delivery | **Not site-ready** — raw, ungraded, client-owned selects. Skip |
| `Juliano & Sharon 6\` (2 MP4) | Wedding footage | Blocked on the weddings decision. Skip |

**Fitness-rule check (so nobody trips on it):** the pilates/supplement activation
stills are *client campaign work for wellness brands* — explicitly allowed under
`HANDOFF.md` §2's scope nuance. The excluded content is Jelani's personal
bodybuilding material, which none of this is.

---

## 2. Concept — "Hold the frame": the hero scroll scrub

The centerpiece. Replace the hero's ambient-light backdrop with the KC
canvas image-sequence scrub (`ScrollSequence`, already in the KC stack): ~100–120
WebP frames extracted from the Bioderma recap, drawn to a full-viewport canvas,
frame index driven by scroll through a sticky ~300vh hero.

Why it's right for *this* client: on every other site a scrub shows a product
turning. Here the product **is the footage** — the visitor literally holds
Jelani's shot in their hand and moves through it at their own pace. A DoP's
pitch, made physical. No autoplay video can make that point.

**How it stages (copy over the scrub):**

| Scroll progress | On screen |
|---|---|
| 0% | Frame 1 + full hero copy (eyebrow, headline, sub, CTAs) — identical first paint to today, prerendered, LCP unchanged |
| 0→40% | Copy holds pinned while the footage begins to move behind it — the "oh, I'm controlling this" beat |
| 40→75% | Sub + CTAs ease back; the frame takes the stage almost clean |
| 75→100% | "See the work ↓" cue returns; the page releases into the Marquee |

**Source choice — Bioderma over Soluna:** the Bioderma `.mov` is a color-graded
event recap — moving crowd, product, lights — the exact service the headline
sells ("Fast-turnaround creative for brand events"). Soluna is the better
*edit*; Bioderma is the better *scrub* (event motion reads even at 4 seconds).
James picks the exact 3–4s segment — brief in the handoff.

**What happens to the ambient hero:** it stays, demoted to the fallback state —
reduced-motion visitors, sequence-load failure, and any future no-asset client
preview all land on it. Nothing built gets thrown away.

**Alternative (Option B, if James prefers):** keep the hero as-is and wire the
existing `site.hero.reel` autoplay loop (Soluna, <4 MB), then place the scrub as
a mid-page band between About and Work ("One shot, held" — a single cinematic
beat mid-story). Costs a second heavy asset and dilutes the opening moment;
recommendation stays **Option A: scrub in the hero**.

Budgets (hard, from the KC playbook): 100–120 frames, ≤5 MB desktop set
(1600w WebP), ≤2 MB mobile set (800w), one sequence on the page, period.

---

## 3. Concept — stills in motion: the parallax gallery wall

The Photography group finally gets real work — and gets it *moving*:

- **Parallax columns.** The gallery becomes 2 (mobile) / 3 (desktop) columns of
  portrait stills from the Reset Studio + Canergy sets, each column drifting at
  a slightly different rate as the page scrolls (±6–10%, GPU transforms via
  Motion `useScroll`). The classic gallery-wall-in-motion effect: elegant,
  cheap to run, impossible to mistake for a template.
- **Curation over volume.** ~9–12 selects from the 434 available stills. Variety
  of subject (product-in-hand, space, candid) over repetition. James curates —
  ten minutes with the shortlist beats any auto-pick.
- **Campaigns get real posters.** The `campaigns` work group's plates are
  replaced with actual stills (Canergy / Reset Studio), captioned
  `with Socliq`. The BeeVibe product card stays pending original exports.
- **Optional filmstrip** (only if the perf budget laughs at us): a sticky band
  where vertical scroll slides a horizontal strip of stills — a contact sheet
  being scrubbed. Scroll-linked transform, *not* hijack. First thing cut if
  Lighthouse dips.

Every image ships as a ≤300 KB WebP with reserved aspect boxes — zero CLS.

---

## 4. Concept — the Process section, with receipts

Phase 2's planned Process section, now buildable with real artifacts:

**Book a call → Creative brief → Shoot day → Fast delivery** — four steps, gold
numerals, one line each (pattern-matches `Services.tsx`).

- **Creative brief** step shows a page of the Kilani "Valentines Variation" PDF —
  a real brief from a real engagement. This is the differentiator: nobody
  else's "process" section has evidence.
- **Shoot day** step carries a small BTS strip (3–4 of the phone shots, treated
  small and matter-of-fact — they're candids, not hero art, and honesty is the
  charm).
- The strip captions the standing offer: **video + photo bundle = complimentary
  BTS film** "for brand transparency." The offer also lands in Services copy
  and as a CTA step-1 chip (`Video + Photo bundle`) so bundle leads self-identify.

---

## 5. Concept — the connective tissue

Small moves that make the whole page feel of-a-piece:

- **Gold progress hairline** — 2px `--gold` bar at the very top, scaling with
  page scroll via pure CSS `animation-timeline: scroll(root)`. Compositor-thread,
  zero JS, invisible until you notice it — very KC.
- **CSS reveal upgrade** — existing `Reveal` (Motion `whileInView`) stays the
  cross-browser workhorse; simple entries additionally get the native
  `animation-timeline: view()` treatment inside `@supports`, wrapped in
  `prefers-reduced-motion: no-preference`. Firefox and reduced-motion visitors
  see content instantly, styled in its end state.
- **Marquee grows real names:** add `Socliq · Canergy · Reset Studio · Soluna ·
  Kilani` to the credit stream (marked `CONFIRM:` until Jelani blesses public
  naming — they live only in `site.ts`, removable in seconds).
- **Bioderma card goes real:** `Bioderma · with Socliq`, poster from the footage,
  "Coming soon" note dropped.
- **Run-club events card:** poster frame from the run-club footage, generic
  title ("Community run — event recap"), **no client name** until the §6
  decision lands.

---

## 6. Decisions needed (carried + new — do not build past these)

1. **Hero: Option A (scrub hero, recommended) or Option B (reel hero + mid-page
   scrub)?** — James can call this one.
2. **Bioderma segment selection** — James picks the 3–4 seconds to scrub (or
   delegates: "first strong move after the open").
3. **Public naming:** Canergy, Reset Studio (new); Glorious Athletica / run-club
   naming (carried); Kilani in the marquee. Jelani's call, `CONFIRM:` markers
   until then.
4. **Weddings on this site** — carried, still recommend at most a footer line.
5. **Pricing: publish vs quote-only** — carried; James transcribes the memo
   either way.
6. Still outstanding from Phase 1/2: YouTube IDs, LinkedIn text, headshot,
   testimonial quotes + permission, Calendly/booking link, `FORM_ENDPOINT`,
   domain.

---

*Concept by Fable (engineering owner). Build spec: `HANDOFF-PHASE3.md`.
KC scroll-animation playbook governs all technique decisions.*
