# Phase 7 Handoff — The Minimal Cut (Opus builds this)

**Roles:** Opus — builder. Fable — engineering owner (architecture, review,
QA sign-off).
**Read first:** `HANDOFF.md` (brief, locked decisions), `HANDOFF-PHASE3.md`
§1 (local Windows environment), `README.md`.
**Companion:** `CONTENT-INTAKE.md` — the fill-in document for Jelani. Phase 7
is the *presentation* remodel; final wording lands when the intake comes
back. Build with current copy; do not wait on it.
**Prime directive:** the direction is **minimal**. Every change in this phase
removes something or quiets something. If a change adds visual noise, it is
wrong even if it adds capability.

Stakeholder direction (James, 2026-08-02, confirmed by choice prompts):
1. Hero: footage **plays on its own** as a muted loop; scrolling through the
   pinned hero **changes the information in stages**.
2. Cards: **title only, smaller** at rest — no notes, no client eyebrows, no
   badges; details on hover.
3. Card previews: **muted autoplay loops**, sourced from Jelani's own YouTube
   channel (his uploads only) plus the footage already on disk.
4. Photography + Beauty: **more scroll animation**.
5. Overall: less verbiage everywhere; "aesthetically minimal" is the read
   the page must produce.

---

## 1. Hero — autoplay loop + staged information

The scrub built in Phase 3 is **retired by client direction**, replaced by a
pinned autoplay hero. (History keeps the scrub — one revert away — and
`ScrollSequence` remains a KC asset elsewhere. Remove it cleanly here.)

### 1.1 The loop

Build `public/media/reel.mp4` from the Soluna master on disk
(`Website refernece\soluna youtube test.mp4`):

- 12–15s from the strongest continuous stretch (the 43.5–48.8s shot and the
  62.9–66.5s arch shot are both verified single takes — two or three shots
  cut together is fine for a loop; it plays, it does not scrub).
- 1280w, muted (`-an`), CRF ~30, `-movflags +faststart`, **< 4 MB** (the
  Phase 1 budget for exactly this file). Poster = first frame →
  `public/media/reel-poster.webp` (reuse/replace `hero-poster.webp`).
- `Hero.tsx` already has the full lazy `<video>` wiring from Phase 1
  (`site.hero.reel` / `reelPoster`: poster paints first, src attaches after
  first paint, reduced-motion shows poster). **Reuse it — do not rebuild.**

### 1.2 The staging

The hero section stays tall (~300vh) with a sticky viewport. The video loops
continuously; `scrollYProgress` drives which **information panel** is
showing. Three stages, crossfade + ≤24px translate, opacity/transform only:

| Stage | Range | Content (`site.hero.stages` in `site.ts`) |
|---|---|---|
| 1 | 0–35% | Current copy: eyebrow, headline, sub, both CTAs |
| 2 | 35–68% | What he delivers, one breath: "Event recaps in 48–72 hours. Stills the same day. Vertical cuts ready for paid." (drafted — intake may revise) |
| 3 | 68–100% | The ask + proof line: "Sportsnet-featured. Founder of Studio Impetus. Toronto." + **Book a call** |

- The **headline is the LCP element and stage 1 must remain prerendered and
  CSS-animated** — the staging mechanism may hide it *after* hydration, never
  before first paint. Stages 2–3 can be client-rendered.
- Only one stage is interactive at a time (`pointer-events` gated, as the
  Phase 3 overlay already does).
- Reduced motion: 100vh static hero, poster, stage 1 only — the existing CSS
  `.scroll-sequence`-style height override pattern (hydration never
  reconciles a mismatched inline style; keep the fix in CSS).
- No scroll hijacking. No snap points. Scroll speed is the visitor's.

### 1.3 Cleanup (asset hygiene is part of the spec)

- Delete `public/sequence/` and `public/sequence-sm/` (4.2 MB of frames),
  remove their entries from `scripts/media/check-budgets.mjs`, add a
  `media/previews` bucket (§3).
- Remove `src/components/ui/ScrollSequence.tsx` and the sequence branch of
  `Hero.tsx`; `site.hero.sequence` goes away, `reel`/`reelPoster` get real
  values. Update the two scrub tests (canvas/poster + reduced-motion
  collapse) to assert the new behavior instead: video element present with
  `preload="none"` + poster; reduced motion = no autoplay, poster shown,
  stage-1 copy visible.
- `scripts/media/build-sequence.mjs` stays (it documents how the frames were
  made) but gets a top comment noting the scrub was retired in Phase 7.

## 2. Cards — the quiet pass

`LiteYouTube` at rest becomes: **media, and one small title. Nothing else.**

- Remove at rest: client eyebrow, note line, "Film linking soon" and
  "Coming soon" badges (delete the badge concept entirely — an unlinked
  card is simply not interactive; its poster is the content).
- Title: keep as the existing heading element (outline depends on it) but
  quieter — `text-sm`, single line, truncated, bottom-left, over the
  existing gradient. Featured card may stay one size up.
- On hover/focus-visible (desktop): client + note fade in above the title,
  play glyph appears. On touch: tap plays (aria-labels already carry full
  context; keep them complete).
- The bottom scrim can lighten now that it carries less text — but verify
  the featured card at 360px against the key-art collision (Phase 5 §4;
  the deepened featured scrim likely still earns its keep).
- Group headers stay (eyebrow + title) but **cut every group blurb** in the
  Work section — the one-line descriptions read as filler against a minimal
  grid. (`blurb` fields: leave the type optional, set them undefined.)
- Update tests that asserted notes/badges; keep heading-visibility
  assertions.

## 3. Autoplay preview loops on the cards

Muted, looping, silent previews playing in the cards themselves — the
gallery becomes a wall of quiet motion.

### 3.1 Sources and rights (scoped deliberately)

| Item | Source | Preview? |
|---|---|---|
| Soluna, Bioderma | Masters on disk | ✅ build now |
| 3 reels + 4 shorts | **Jelani's own channel** (@jelaniwoodstv) — download his uploads, James-authorized 2026-08-02 | ✅ build now |
| Sportsnet featured, Camp Dreamwood | **Not his uploads** — Sportsnet's and Camp Dreamwood's channels | ❌ posters stay. Do not download other channels' uploads. |

The featured card keeping a still is also correct hierarchy: one composed
broadcast frame at the top, motion everywhere below it.

Downloader: `yt-dlp` via npm-vendored binary (`yt-dlp-exec` or download the
exe into a git-ignored `tools/` — do **not** commit binaries). Download
once into a git-ignored `originals/` staging dir, cut previews, never
commit sources. If downloads fail (throttling, tooling), ship §1–§2 and
list the gap — same fallback shape as every phase.

### 3.2 Preview spec

`scripts/media/build-previews.mjs`:

- 3–5s per item, from a visually strong stretch (frame-check with the
  existing contact-sheet script if unsure; don't guess timestamps blind).
- 16:9 → 640w · 9:16 → 480w. Muted, **no audio track** (`-an`), CRF 33–35,
  `+faststart`, h264 mp4 → `public/media/previews/<item-id>.mp4`.
- Budgets (add to `check-budgets.mjs`): **≤ 700 KB per file, ≤ 6 MB
  total** for the previews bucket.

### 3.3 Player behavior (`LiteYouTube`)

- New optional `preview` field on `WorkItem`. When set: a `<video>` layer
  over the poster, `muted playsInline loop preload="none"`.
- **Lazy by IntersectionObserver**: attach `src` when the card nears the
  viewport (~200px margin), `.play()` in view, `.pause()` out of view.
  Never all-play at once on page load.
- Poster stays underneath (paints first; video fades in over it when
  playing — no pop).
- `prefers-reduced-motion`: previews never load or play; posters only.
- Click still swaps to the real `youtube-nocookie` embed exactly as today
  (previews are ambience, not the film).
- Tests: preview videos are muted + `preload="none"`; none has an audio
  track… (encode-time guarantee; test asserts the `muted` attribute and
  that no video plays under reduced motion). Lighthouse must hold ≈ 82
  local — previews are below the fold and lazy, so a drop means eager
  loading snuck in.

## 4. Photography & Beauty — more scroll motion, still no spectacle

KC rules hold: opacity + small transforms, compositor-friendly, reduced
motion = static, no hijacking.

- **Photography wall:** widen the column drift (±4% → ±7%), and give each
  tile a `whileInView` settle (opacity 0→1, scale 0.97→1, y 16→0, stagger
  ~60ms). The wall should feel like it assembles as you arrive at it.
- **Beauty strip:** scroll-linked rise with alternating offsets — odd tiles
  drift up slightly faster than even ones as the row crosses the viewport
  (`useScroll` on the row + per-tile `useTransform`, ±12–20px), plus the
  same settle-in. Subtle B&W→colour rhythm does the rest.
- Both: gate with `useReducedMotion`, reserve aspect boxes (CLS stays 0),
  and confirm no horizontal overflow at 360px with drift active.

## 5. The minimal editorial pass (site-wide verbiage diet)

Cut or quiet, per section — copy changes only, all in `site.ts`:

- Work: group blurbs **gone** (§2). Section blurb → one short line.
- Services: card bodies stay (they sell), but check them against the intake
  when it returns.
- Photography/Beauty: titles exist for alt/captions but are **not rendered
  over images** (already true — keep it that way).
- Marquee: fine as is — it is already the minimal pattern.
- Process/Pricing/Proof: no structural change; wording waits on the intake.
- Anything marked `CONFIRM:` in `site.ts` remains marked until
  `CONTENT-INTAKE.md` comes back countersigned.

## 6. Gates

- `npm run test:e2e` — full suite green (update scrub + badge/note
  assertions; add reel, staging, and preview assertions), desktop + mobile.
- `npm run assets:check` — sequence buckets removed, previews bucket added;
  everything green.
- Lighthouse mobile ≈ 82 local (≥ 80 floor for this phase given the added
  video weight — but the reel is the only above-fold media and it lazy-
  attaches, so parity is the expectation, not the hope). CLS 0. axe clean.
- **Look at it**: hero staging at slow and fast scroll; a card grid with
  previews playing (and pausing off-screen — check in DevTools); featured
  card at 360px; beauty strip drift; reduced-motion pass end to end.

## 7. Build order

1. Hero: reel encode + staged panels + scrub retirement (§1). The page's
   first impression — get it perfect before anything else.
2. Card quiet pass (§2) — pure presentation, no new assets.
3. Previews: downloads → encodes → player behavior (§3).
4. Photography/Beauty motion (§4) + verbiage diet (§5).
5. Full gates (§6), commit per step or logically grouped, push to
   `claude/jelanitv-sales-website-lfqi04`, screenshots + Lighthouse to the
   engineering owner.

## 8. Blocked / open

| # | Item | State |
|---|---|---|
| 1 | `CONTENT-INTAKE.md` returned by Jelani | Final copy lands then; build with current text |
| 2 | Sportsnet / Camp Dreamwood preview clips | Only if Jelani supplies his own exports of those pieces — never from others' channels |
| 3 | Stage 2/3 hero copy | Drafted in §1.2; intake may revise |
| — | Carried: naming sign-offs (Canergy, Reset Studio, Kilani, Soluna, MLSE), testimonials, headshot, booking link, `FORM_ENDPOINT`, domain, currency | See intake |

---

*Spec by Fable (engineering owner), 2026-08-02. Direction: James's minimal
pass. The scrub hero this replaces lives at commit 84097e7 and earlier —
retire it cleanly, don't half-remove it.*
