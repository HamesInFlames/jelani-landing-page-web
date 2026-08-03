# Phase 6 Handoff — The Reels & the Beauty Set (Opus builds this)

**Roles:** Opus — builder. Fable — engineering owner (architecture, review,
QA sign-off).
**Read first:** `HANDOFF-PHASE5.md` (the thumbnail pipeline and the Cover
Letter warning — both still binding), `HANDOFF.md` (brief, locked
decisions), `HANDOFF-PHASE3.md` §1 (local Windows environment).
**Prime directive:** integrate, don't redesign. Gates hold.

This phase has **two independent halves**. §2 is buildable right now. §3 is
blocked on four files landing on disk — **do not let it hold up §2.** Ship
the reels, then come back for the beauty set.

---

## 1. What arrived (2026-08-02)

- **Three YouTube URLs** — these are exactly the three reels Phase 5 §5
  called "the last video gap." Resolving them closes the Work section's
  video coverage completely.
- **Four beauty/editorial photographs**, supplied as chat attachments. They
  are the long-pending "original photo exports for the beauty set" open
  since Phase 1 §8. **They are not on disk yet** — see §3.1.

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

## 3. The beauty set — blocked on files

### 3.1 ⚠️ James: the four images are not on disk

They came through chat as attachments and exist nowhere on the filesystem
(searched Downloads, Desktop, Pictures, and the project tree). Opus cannot
build with them until they land.

**A folder is ready:** `C:\Users\xoxok\Projects\Jelani Woods Web\Beauty Set\`
(created, empty, sits beside the other source folders and outside the repo
— consistent with every other asset source).

Save the four files there at the **highest resolution available** — the
originals from Lightroom, not chat-sized copies. Naming does not matter;
the pipeline sorts and maps them. If higher-resolution originals exist,
use those: the chat copies are ~500px wide, which is **below** what the
gallery needs (900w) and would ship visibly soft.

### 3.2 What the four images are

Matching them against the placeholder titles that lived in `site.ts` before
Phase 3 replaced them, these are four of the original five beauty images:

| # | Description | Register | Suggested title |
|---|---|---|---|
| 1 | Woman reclining on a curved sculptural chair, interior, monochrome | B&W editorial | `Editorial — form and light` |
| 2 | Blonde woman outdoors in a polka-dot top, dappled natural light | Colour portrait | `Golden hour portrait` |
| 3 | Woman with hair wrapped in a towel, clean beauty lighting, monochrome | B&W beauty | `Beauty — studio` |
| 4 | Two women photographed from above, head to head | Colour duo portrait | `Duo portrait` |

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

### 3.4 Processing

Extend `scripts/media/build-stills.mjs` with a `BEAUTY` block (follow the
existing curation-comment style — say *why*, not just *what*):
- `sharp` → 4:5 cover → **900w** WebP q80 → `public/media/photos/beauty-0N.webp`
- ≤300 KB each (`npm run assets:check` enforces it)
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
2. Beauty set (§3) **only once files are in `Beauty Set\`**. If the folder
   is still empty, ship step 1 and report the block. Do not stub, do not
   downscale the chat copies into place.
3. Push to `claude/jelanitv-sales-website-lfqi04`; screenshots + Lighthouse
   to the engineering owner.

## 7. Blocked / open

| # | Item | State |
|---|---|---|
| 1 | Four beauty originals into `Beauty Set\` at full resolution | **James — blocks §3** |
| 2 | Fifth beauty image (`Editorial — white series`) | Not supplied; four is the set |
| 3 | Model-release comfort for the four portraits | All four were already public on his carrd site; flag to Jelani only if he wants them off |
| 4 | Soluna / Bioderma public links | Posters ship; `ytId` when available |
| — | Carried: LinkedIn text, headshot, testimonials + permission, booking link, `FORM_ENDPOINT`, domain, Glorious Athletica naming, weddings, Canergy/Reset/Kilani/Soluna naming, MLSE mention, pricing currency | Unchanged |

---

*Spec by Fable (engineering owner), 2026-08-02. Titles, embeddability, and
thumbnail sources verified directly against YouTube — build against them,
don't re-derive.*
