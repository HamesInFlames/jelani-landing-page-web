# Phase 6 Handoff — The Reels & the Beauty Set (Opus builds this)

**Roles:** Opus — builder. Fable — engineering owner (architecture, review,
QA sign-off).
**Read first:** `HANDOFF-PHASE5.md` (the thumbnail pipeline and the Cover
Letter warning — both still binding), `HANDOFF.md` (brief, locked
decisions), `HANDOFF-PHASE3.md` §1 (local Windows environment).
**Prime directive:** integrate, don't redesign. Gates hold.

This phase has **two halves and both are buildable now.** §2 wires the three
reels; §3 adds the beauty set, whose source files have been located and
staged (§3.1). Build §2 first — it is the higher-value fix — but there is
no longer a blocker on either.

---

## 1. What arrived (2026-08-02)

- **Three YouTube URLs** — these are exactly the three reels Phase 5 §5
  called "the last video gap." Resolving them closes the Work section's
  video coverage completely.
- **Four beauty/editorial photographs** — the long-pending "original photo
  exports for the beauty set", open since Phase 1 §8. Located in
  `Downloads` and staged for the build (§3.1), at chat resolution rather
  than full-size exports.

## 2. The reels — buildable now

### 2.1 Verified mapping (resolved via oEmbed, not inferred)

| YouTube ID | Actual title | → `site.ts` item |
|---|---|---|
| `0BmqVLkam-g` | JelaniWoodsTV - Cinematography Reel | `cinematography-reel` |
| `42abljCvlbc` | JelaniWoodsTV Editors Reel 2020 | `editors-reel-2020` |
| `rTFInFnpJa8` | JelaniWoodsTV Editors Reel \| ANOTHA ONE | `editors-reel-pt2` |

All three are on Jelani's own channel and **all three embed successfully**
from a real http origin (verified). The Phase 5 §3 Error-153 red herring
applies here too — do not test by navigating directly to an embed URL.

**Title note:** `editors-reel-pt2` currently reads *"Editors Reel — Part 2"*.
The real title is *"Editors Reel | ANOTHA ONE"*. Keep the site's
**"Editors Reel — Part 2"** — it is clearer to an agency buyer scanning a
row of three reels, and the section's job is legibility, not fidelity to a
YouTube title. Do not surface "ANOTHA ONE" as the card title. (Recorded
here so the mismatch is a decision, not a bug someone later "fixes".)

### 2.2 Artwork

Extend `scripts/media/build-thumbs.mjs` (created in Phase 5) with these
three. All are **landscape** — `maxresdefault.jpg` verified 1280x720 for
each; `oar2.jpg` correctly 404s (these are not Shorts), so the Phase 5
fallback logic should route them down the landscape path automatically.

Output 1280x720 WebP q80 → `public/media/yt-<id>.webp`, set `poster` on
each item alongside `ytId`. Same rule as Phase 5: **self-host, never
hotlink `i.ytimg.com`.**

### 2.3 Why this matters to the page

The Reels row is the "can he shoot / can he cut" answer — three cards, one
glance. Until now it was three empty plates sitting directly under the
Sportsnet feature, which is the weakest moment on the page. After this,
every card in the Reels row is live and every video item in the Work
section except `soluna` and `bioderma` is playable.

## 3. The beauty set — sources staged

### 3.1 Files located and staged — with one caveat

The four images were in `Downloads` under hash names. They are now staged,
identified, and renamed in
`C:\Users\xoxok\Projects\Jelani Woods Web\Beauty Set\` (outside the repo,
beside the other asset sources):

| Staged file | Was | Content |
|---|---|---|
| `01-editorial-chair.jpg` | `a21660b9.jpg` | B&W, woman reclining on a curved sculptural chair |
| `02-golden-hour.jpg` | `127e3f6c.jpg` | Colour, blonde woman outdoors, polka-dot top, dappled light |
| `03-beauty-studio.jpg` | `f8255b1c.jpg` | B&W, woman with hair wrapped in a towel |
| `04-duo-portrait.jpg` | `c7803692.jpg` | Colour, two women overhead, head to head |

**Caveat — these are chat-sized copies, not Lightroom originals: every one
is 503×630.** That is genuinely fine for the four-across layout in §3.3
and a gift on mobile, but it is tight for a desktop retina render (see
§3.4). Build with them; they are good enough to ship. If Jelani sends
full-size exports later, dropping them into the same folder and re-running
the script is the whole upgrade — no code changes.

### 3.2 What the four images are

Matching them against the placeholder titles that lived in `site.ts` before
Phase 3 replaced them, these are four of the original five beauty images:

| Staged file | Register | Suggested title |
|---|---|---|
| `01-editorial-chair.jpg` | B&W editorial | `Editorial — form and light` |
| `02-golden-hour.jpg` | Colour portrait | `Golden hour portrait` |
| `03-beauty-studio.jpg` | B&W beauty | `Beauty — studio` |
| `04-duo-portrait.jpg` | Colour duo portrait | `Duo portrait` |

The staged order is also the **display order**, and it is deliberate: it
alternates monochrome and colour (B&W → colour → B&W → colour) so the row
reads as a considered strip rather than two sets bolted together. Verify
it by eye and change it if something better presents itself.

The fifth original (`Editorial — white series`) was **not** supplied — do
not invent a fifth slot. Four is the set.

All four are ~4:5 portrait, which matches the existing photo card ratio —
no new aspect handling needed.

### 3.3 Where they go — a NEW group, not the existing wall

Do **not** mix these into the Phase 3 parallax wall. That wall is warm,
candid, event-coverage work; this is cool, composed, studio portraiture.
Merged, both sets get muddier. Kept apart, the Work section gains a real
claim: *he shoots events and he shoots beauty.*

Add a new `work.groups` entry **after** `photography`:

```ts
{
  id: 'beauty',
  eyebrow: 'Beauty & editorial',
  title: 'Portraiture, when the brief is the face.',   // Opus may improve
  blurb: 'Studio and location portrait work — beauty, fashion, editorial.',
  layout: 'beauty',
  items: [ /* four photo items, poster set, ytId null */ ],
}
```

**Layout — deliberately not parallax.** Add a `'beauty'` case to
`Work.tsx`'s `GroupBody`: a simple responsive row, `grid-cols-2` on mobile
and `grid-cols-4` on desktop, `aspect-[4/5]`, `Reveal` stagger at
`i * 0.08`, same card chrome as the wall (rounded, hairline border).

The reason to skip parallax here is mechanical, not aesthetic: parallax
drift needs tall columns to have travel to work with. A single four-across
row is barely taller than one tile, so drift would either be invisible or
would just shove tiles out of alignment. A clean contact-strip row is the
right form for four images.

### 3.4 Processing — do not upscale

Extend `scripts/media/build-stills.mjs` with a `BEAUTY` block (follow the
existing curation-comment style — say *why*, not just *what*):

- `sharp` → 4:5 cover → **`withoutEnlargement: true`** → WebP q82 →
  `public/media/photos/beauty-0N.webp`, in the staged file order above.
- **Target 500w, not the 900w used by the parallax wall.** The sources are
  503px wide; asking sharp for 900 would upscale, which adds bytes and
  softness and buys nothing. `withoutEnlargement` makes that a guarantee
  rather than an intention, and keeps the script correct if full-size
  originals replace these later.
- The maths: at four across on a 1248px shell the tiles land near 297 CSS
  px, so 503px covers 1x comfortably and lands a little under a 2x render.
  Slight softness on a desktop retina screen is the known, accepted cost —
  it is a secondary gallery row, and the alternative is shipping nothing.
  Do not try to sharpen or upscale your way out of it.
- ≤300 KB each (`npm run assets:check` enforces it — these will land far
  under).
- Two of the four are monochrome; do not colour-correct or "unify" them.
  The B&W/colour mix is the range being demonstrated.

**Alt text:** these are portraits of identifiable people. Write descriptive
alt for each (what the photograph shows), not decorative empty alt — they
are content, not chrome. Keep descriptions neutral and about the
photography.

## 4. Tests

Extend `tests/smoke.spec.ts`:
1. The three reel cards are playable buttons with real posters, and the
   Reels row contains zero "Film linking soon" plates.
2. Clicking a reel card mounts exactly one `youtube-nocookie` iframe
   containing that reel's ID.
3. (§3) The `beauty` group renders four images, all with non-empty `alt`,
   none broken (`naturalWidth > 0`) — mirror the Phase 3 stills-integrity
   assertion.
4. `Cover Letter` / `KuuIsQKZmw4` still appear zero times (Phase 5 §1).
5. Existing suite green, both projects.

## 5. Gates

- `npm run test:e2e` — all green, desktop + mobile.
- `npm run assets:check` — 9 new files across both halves; `media` bucket
  had ~3.8 MB headroom before Phase 5, each file ≤300 KB.
- Lighthouse mobile parity (local control ≈ 83–84). All new imagery is
  below the fold and lazy — a drop means something got marked eager.
- CLS 0, axe clean, no 360px overflow.
- Look at it: the Reels row and the beauty row both, desktop and mobile.

## 6. Build order

1. **Reels first** (§2) — thumbs, `site.ts`, tests, gates. Commit.
2. Beauty set (§3) — sources are staged in `Beauty Set\`; extend the stills
   script, add the group and its layout case, tests, gates. Commit.
3. Push to `claude/jelanitv-sales-website-lfqi04`; screenshots + Lighthouse
   to the engineering owner.

## 7. Blocked / open

| # | Item | State |
|---|---|---|
| 1 | Full-size Lightroom exports of the four beauty images | **Nice-to-have, not blocking.** Staged copies are 503×630 and ship fine; originals would sharpen the desktop retina render. Drop into `Beauty Set\` and re-run the script |
| 2 | Fifth beauty image (`Editorial — white series`) | Not supplied; four is the set |
| 3 | Model-release comfort for the four portraits | All four were already public on his carrd site; flag to Jelani only if he wants them off |
| 4 | Soluna / Bioderma public links | Posters ship; `ytId` when available |
| — | Carried: LinkedIn text, headshot, testimonials + permission, booking link, `FORM_ENDPOINT`, domain, Glorious Athletica naming, weddings, Canergy/Reset/Kilani/Soluna naming, MLSE mention, pricing currency | Unchanged |

---

*Spec by Fable (engineering owner), 2026-08-02. Titles, embeddability, and
thumbnail sources verified directly against YouTube — build against them,
don't re-derive.*
