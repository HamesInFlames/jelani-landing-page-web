# Phase 3 Handoff — Scroll-Cinematic Remodel (Opus builds this)

**Roles:** Opus — builder (implements this spec). Fable — engineering owner
(architecture, review, QA sign-off). Deviations go through the engineering
owner, not ad-hoc.
**Read first:** `REMODEL-IDEAS.md` (the concept and the *why*), `HANDOFF.md`
(brief, design system, locked decisions), `README.md` (how the build works),
`HANDOFF-PHASE2.md` §3 (asset budgets — still binding).
**Prime directive:** integrate, don't redesign. The site is live-quality;
every change keeps the quality gates (§9). The KC scroll rules are law:
**no scroll hijacking, one scrubbed sequence per page, reduced-motion parity,
zero CLS.**

---

## 1. Environment — read this, it's all different from Phase 2

You are building on **James's Windows 11 machine**, not the cloud container:

- **Repo:** `C:\Users\xoxok\Projects\Jelani Woods Web\jelani-landing-page-web`
  — branch `claude/jelanitv-sales-website-lfqi04`. Push to this branch only.
- **Assets are LOCAL** (paths in §2). No Dropbox, no uploads, no blocked hosts.
- **Node 22 is installed. ffmpeg / cwebp / ImageMagick are NOT.** Do not ask
  James to install anything — use npm:
  ```bash
  npm i -D ffmpeg-static ffprobe-static sharp
  ```
  `ffmpeg-static` exposes the binary path via `require('ffmpeg-static')`;
  spawn it with `child_process`. `sharp` handles resize + WebP. Write the
  pipeline as Node scripts in `scripts/media/` (committed; they're the
  reproducible record of how every asset was made).
- Shell is PowerShell 5.1 — no `&&` chaining; quote every path (they contain
  spaces).
- **Never commit source media.** Raw `.mov`/`.mp4`/JPG originals stay outside
  the repo (they already are — sibling folders). Only processed outputs enter
  `public/`. `public/` additions for this whole phase stay under **~8 MB**
  total (sequence + posters + gallery).

## 2. Asset map (verified 2026-08-02)

Base: `C:\Users\xoxok\Projects\Jelani Woods Web\`

| Path | Contents | Destination |
|---|---|---|
| `Website refernece\socliq live bioderma color audio blend.mov` | 630 MB graded Bioderma event recap | Hero scrub frames (§4) + Bioderma poster |
| `Website refernece\soluna youtube test.mp4` | 173 MB Soluna edit | Soluna card poster; hero loop only if Option B |
| `Website refernece\Reset Studio\` | 229 portrait JPGs, "Socliq x Reset Studio" | Gallery selects + campaign posters (§5) |
| `Canergy Exports\` | 205 portrait JPGs, "Socliq x Canergy" | Campaign posters + gallery selects |
| `Cellphone BTS\` | 6 phone JPGs | Process BTS strip (§6) |
| `Website refernece\Run Club 2\main clips run club 2.mp4` | 2.7 GB event footage | One poster frame → unnamed events card |
| `Website refernece\Valentines Variation.pdf` | Kilani creative-brief example | Process section image (§6) |
| `Website refernece\RAWs for Brandon\`, `Juliano & Sharon 6\`, `Website refernece\Pricing for video.m4a`, `Website refernece\Run Club 2\jeff talking.mp4` | — | **Do not use** (unedited / blocked decisions / James task) |

## 3. Component: `ScrollSequence`

`src/components/ui/ScrollSequence.tsx` is already in the repo — the KC
standard scroll-scrubbed canvas sequence (sticky section, DPR-capped draws,
eager-first-frames preload, reduced-motion static). **Use as-is; do not
re-derive.** Two integration-time additions are allowed if needed:

1. A `poster` prop rendering frame 1 as a plain `<img>` behind the canvas so
   the backdrop paints pre-hydration (the page is prerendered — canvas can't
   draw until React boots; the `<img>` covers that window; keep it
   `aria-hidden`, absolutely positioned, object-cover).
2. A mobile frame-set switch: accept an optional `framePathSm` + breakpoint
   and pick the set once on mount (`matchMedia('(max-width: 768px)')`) — do
   not swap sets on resize mid-scrub.

## 4. Hero scrub (Option A — default unless James says B)

### 4.1 Frame pipeline (`scripts/media/build-sequence.mjs`)

1. Probe the `.mov` with ffprobe. James supplies the segment start time (§10
   Q2); if unanswered at build time, pick the strongest 3.5s of motion in the
   first minute yourself and note the timestamp in the commit message.
2. Extract at **30 fps**, two sizes:
   - desktop `scale=1600:-2` → `public/sequence/0001.webp …` (~105 frames for 3.5s)
   - mobile `scale=800:-2` → `public/sequence-sm/…`
   ffmpeg → PNG to a temp dir, then `sharp` → WebP `quality: 78` (desktop) /
   `72` (mobile). Identical dimensions across every frame of a set.
3. Also emit `public/media/bioderma-poster.webp` (one strong frame, 1280w,
   16:9) for the work card.
4. **Budget check** (`scripts/media/check-budgets.mjs`, runnable via
   `npm run assets:check`): fail loudly if `public/sequence` > 5 MB,
   `public/sequence-sm` > 2 MB, or any gallery image > 300 KB. If over
   budget: fewer frames first (down to ~90), then quality (down to 70) —
   never dimensions below 1600/800.

### 4.2 Wiring

`src/content/site.ts` — add to `hero`:

```ts
sequence: {
  base: '/sequence',        // frame files: `${base}/${String(i).padStart(4,'0')}.webp`
  baseSm: '/sequence-sm',
  frameCount: 105,          // whatever the pipeline produced
} as { base: string; baseSm?: string; frameCount: number } | null,
```

`Hero.tsx` — when `site.hero.sequence` is set, the section wraps in
`ScrollSequence` (`scrollLengthVh ≈ 300`); otherwise it renders exactly what
it renders today. Requirements:

- The existing copy block (eyebrow / staggered headline / sub / CTAs) becomes
  the ScrollSequence overlay child. **It stays prerendered and CSS-animated**
  — the headline is the LCP element and must paint on the first frame, before
  hydration. Do not convert the entrance to JS.
- Copy staging per `REMODEL-IDEAS.md` §2: pinned to 40%, sub+CTAs fade
  ~40→75% (Motion `useTransform` on the section's `scrollYProgress`,
  opacity/transform only), scroll cue returns at the end. Headline itself
  stays legible throughout — it never drops below ~0.9 opacity.
- Scrim: reuse the existing "footage" scrim variant (`from-ink/75 via-ink/60
  to-ink`) over the canvas. Verify 4.5:1 on the sub/muted text over the
  brightest frame (§9).
- Reduced motion: ScrollSequence already renders 100vh static frame 1 — the
  copy shows in full, nothing scrubs, ambient fallback unused. Sequence null /
  frames failing to load → today's ambient hero. Nothing is deleted.
- `preload` hint: none needed — the component's eager-frame batch is the
  loading strategy. Do not `<link rel="preload">` 100 frames.

**Option B (only if James chooses it):** hero stays as-is + Soluna processed to
`public/media/reel.mp4` (<4 MB, 12–15s, muted, `-movflags +faststart`, CRF ~30,
1280w) with `reelPoster`; the scrub becomes a standalone band component between
About and Work with a single line of overlay copy. Same budgets, same rules.

## 5. Gallery & campaign stills

`scripts/media/build-stills.mjs`:

- **Curation:** James picks ~9–12 gallery selects + 2 campaign posters
  (§10 Q3). If unanswered, shortlist 24 (visual variety: product-in-hand,
  space, candid; skim with spread indices, e.g. every ~20th file), copy the
  shortlist to the scratchpad for James, and ship a provisional 9 — swap
  later is a file-drop.
- Process: `sharp` → 4:5 center-crop where the frame allows → 900w WebP
  q80 → `public/media/photos/…` (≤300 KB each). Campaign posters 1280w 16:9
  or native 4:5 — match the card.
- `site.ts`: fill the `photography` group items' `poster` fields (titles
  become real captions, e.g. "Brand activation — with Socliq"); replace
  `campaigns` plate items with two real entries (`client: 'Canergy'`,
  `client: 'Reset Studio'`, both noted `with Socliq`, marked `CONFIRM:` for
  public naming). BeeVibe card stays pending.
- **Parallax columns** — new `ui/ParallaxGallery.tsx` used by the `gallery`
  layout in `Work.tsx`: 2 cols mobile / 3 desktop; each column wrapped in
  `motion.div` with `y` from `useScroll({ target })` + `useTransform`,
  offsets ±6–10%, middle column opposing. Transforms only; no layout
  animation; `useReducedMotion()` → static grid. Reserve aspect boxes
  (`aspect-[4/5]`) — CLS stays 0. Extra scroll travel from drift must not
  create horizontal overflow at 360px.
- The optional filmstrip from `REMODEL-IDEAS.md` §3: **build last, cut
  first.** Skip it entirely if Lighthouse perf drops below 92 with it in.

## 6. Process section (new component)

`src/components/Process.tsx`, pattern-matched to `Services.tsx` (eyebrow /
title / 4 numbered items), placed between About and Proof in `App.tsx`.
Content in `site.ts` under `process`:

1. **Book a call** — one line.
2. **Creative brief** — "Every shoot starts on paper." Artifact image: render
   page 1 of the Kilani PDF via `pdf-to-png-converter` (or `pdfjs-dist`
   script) → 1200w WebP, framed as a document card, caption
   `Creative brief — Kilani (CONFIRM: public naming)`. If PDF rendering
   fights you for more than ~30 min, ship the section without the image and
   log it as a follow-up — the section must not block on it.
3. **Shoot day** — BTS strip: 3–4 of the 6 phone shots → 640w WebP ≤120 KB
   each, small row, honest-candid treatment (no pretending they're hero art).
4. **Fast delivery** — reuse a turnaround promise line from Services.

Below the steps, one quiet line for the bundle offer: video + photo bundle
includes a complimentary BTS film "for brand transparency." Also: add the
offer sentence to the relevant Services card body, and add
`'Video + Photo bundle'` to `site.cta.steps[0].options`.

## 7. Content updates (`site.ts` only — components stay content-free)

- Marquee: append `Socliq`, `Canergy`, `Reset Studio`, `Soluna`, `Kilani`
  (all `CONFIRM:` public naming).
- Bioderma card: `client: 'Bioderma'`, note `'Event recap — with Socliq'`,
  real poster, drop "Coming soon".
- New events card: run-club recap, **no client name** (title like
  `'Community Run — Event Recap'`), poster frame from
  `main clips run club 2.mp4`. Blocked from naming per §10 Q4.
- New campaigns/work card: Soluna (`client: 'Soluna'`, poster frame from the
  mp4; `ytId` stays null until IDs land).
- Nav: Process anchor only if the nav doesn't crowd at 360px — check before
  adding.

## 8. Connective tissue

- **Progress hairline:** 2px fixed top bar, `--gold`, `transform-origin:
  left`, pure CSS `animation-timeline: scroll(root)` inside
  `@supports (animation-timeline: scroll())` and
  `@media (prefers-reduced-motion: no-preference)`. No JS fallback — absence
  is fine.
- **CSS `view()` reveals:** where a `Reveal` wraps plain content, add the
  native path per the KC playbook (`animation-range: entry 0% entry 60%`,
  `fill-mode: both`, `from` state only inside `@supports`). Keep Motion
  `whileInView` as the cross-browser behavior — don't remove it.
- Keyframes stay subtle: opacity + ≤24px translate. Nothing spins.

## 9. Quality gates (re-verify before every push)

- `npm run test:e2e` — all existing assertions green, plus new ones:
  hero sequence section present with reserved height; reduced-motion renders
  static (no canvas scrub, copy visible); Process section renders 4 steps;
  gallery images have dimensions/aspect boxes; no horizontal overflow at
  360px (with parallax active); CTA step-1 includes the bundle chip.
- Lighthouse mobile: **Performance ≥ 90** (baseline 92 — the sequence is the
  risk; its frames must not contend with LCP), others 100. CLS **0**.
- axe: zero critical/serious.
- `npm run assets:check` passes (§4.1 budgets).
- Contrast: hero sub/muted text ≥ 4.5:1 over the brightest sequence frame.
- **Look at what you built:** full-page screenshots desktop + mobile, plus a
  manual scrub-through of the hero. Phase 1's two visual bugs were only
  caught by eye. Test the scrub at both fast-flick and slow-drag speeds.
- Mid-range-device sanity: DevTools 4× CPU throttle + throttled 4G — the
  scrub must not jank or block first paint.

## 10. Blocked on James/Jelani — defaults if unanswered

| # | Question | Default while waiting |
|---|---|---|
| 1 | Hero Option A (scrub) or B (reel + band)? | **A** |
| 2 | Bioderma segment timestamps for the scrub? | Builder picks strongest 3.5s in the first minute, logs it |
| 3 | Gallery/poster selects from the 434 stills? | Builder shortlists 24, ships provisional 9 |
| 4 | Name the run-club client (Glorious Athletica / Jeff Gloria)? | Visuals only, generic title |
| 5 | Public naming: Canergy, Reset Studio, Kilani? | Include with `CONFIRM:` markers (removable in `site.ts` in seconds) |
| 6 | Weddings on site? | Off |
| 7 | Pricing publish vs quote-only? (memo untranscribed) | Quote-only; no pricing on site |
| — | Carried from Phase 1/2: YouTube IDs, LinkedIn text, headshot, testimonials + permission, booking link, `FORM_ENDPOINT`, domain | Existing pending states stand |

## 11. Build order

1. `npm i` + dev server up; confirm baseline gates still pass untouched.
2. Media deps + `scripts/media/` pipeline; produce sequence, posters, gallery,
   BTS, PDF page; `assets:check` green.
3. Hero scrub integration (§4) — **get this perfect before anything else**;
   verify prerender/LCP behavior and reduced motion.
4. Gallery parallax + campaign posters (§5).
5. Process section + bundle copy + CTA chip (§6).
6. Content updates (§7) and connective tissue (§8).
7. Full gate pass (§9). Fix, re-run.
8. Commit (processed outputs only — check `git status` for stray media),
   push to `claude/jelanitv-sales-website-lfqi04`. Hand to engineering owner
   with before/after screenshots and the Lighthouse JSON.

---

*Spec by Fable (engineering owner), 2026-08-02. Concept: `REMODEL-IDEAS.md`.
Technique authority: the KC scroll-animations playbook.*
