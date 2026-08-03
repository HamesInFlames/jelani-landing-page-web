# Phase 2 Handoff — Asset Integration Session

**For:** the next Claude session, working in this repo with Jelani's downloaded
Dropbox assets available in a local folder.
**Read first:** `HANDOFF.md` (the brief, design system, and locked decisions)
and `README.md` (how the build works). This doc covers only what Phase 2 adds.
**Prime directive:** the site is live-quality already — every change must keep
the quality gates (§5 below). Do not redesign; integrate.

---

## 1. Where things stand

- Site is **built and pushed** on branch `claude/jelanitv-sales-website-lfqi04`
  (React 19 + Vite + TS strict + Tailwind 4 + `motion`, prerendered HTML with
  inlined CSS, Express + compression, Railway config fixed — Node 22 pinned).
- Lighthouse mobile **92 / 100 / 100 / 100**, CLS 0; 18 Playwright + axe
  assertions green (`npm run test:e2e`); 0 npm vulnerabilities.
- **All copy/links live in `src/content/site.ts`.** Components should not need
  edits for content work. `CONFIRM:` = wording awaiting Jelani's sign-off;
  `PENDING:` = slot awaiting an asset.
- Videos render as facade cards (`ui/LiteYouTube.tsx`); `ytId: null` shows an
  elegant plate. Photos with `poster: null` fall back to gradient plates.
- The hero supports a background reel via `site.hero.reel` / `reelPoster` —
  currently null, rendering animated ambient light instead.

## 2. The asset folder James is preparing

Expected contents (from Jelani's Discord drop, 2026-07-30 — see `HANDOFF.md`
§10 for full context):

| Source | Contents | Destination on site |
|---|---|---|
| `Socliq/` (renamed by event) | Event footage incl. `socliq live bioderma color audio blend.mov` | Bioderma card becomes real: `Bioderma · with Socliq` (§4.7.3) |
| `soluna youtube test.mp4` | Edit Jelani says "can be shortened and reused" | **Hero reel** first choice |
| `Valentines-Variation.pdf` (Kilani) | Post-payment creative-brief example | Process section visual + Kilani credit |
| `Jeff Gloria (Glorious Athletica)/` | Athletic branding content **Jelani owns** | Campaign visuals — naming the client needs his OK (§6) |
| `Elite Wedding Productions/` | Wedding work | Only if Jelani opts weddings onto this site (§6) |
| MZed storytelling course | Personal learning material | **Not for the site.** Separate task if James asks. |

Ask James where the folder is mounted before assuming a path.

## 3. Asset processing specs (budgets are hard limits)

**Hero reel** — target < 4 MB, ~10–20s, muted, 1080p max (720p is fine):
```bash
ffmpeg -i INPUT.mp4 -t 15 -an -vf "scale=1280:-2" -crf 30 -movflags +faststart public/media/reel.mp4
ffmpeg -i public/media/reel.mp4 -vframes 1 -q:v 3 public/media/reel-poster.jpg
```
Then set `site.hero.reel = '/media/reel.mp4'` and `reelPoster`. The hero
scrim automatically hardens when a reel is present (see `Hero.tsx`).
ffmpeg is NOT preinstalled in these containers; try `npx` alternatives or ask
James to run commands locally if installs are blocked.

**Card posters** — extract one strong frame per work item:
`ffmpeg -ss 00:00:03 -i INPUT -vframes 1 -q:v 3 poster.jpg` → resize to
~1280w (16:9), ~720w (9:16 shorts), ~1200w (photos). WebP or quality-80 JPEG.
Wire via `poster: '/media/<file>'` on the matching `site.work.groups` item.

**Photography grid** — 5+ images to `/public/media/photos/`, ≤ 300 KB each,
mapped onto the `photography` group items.

**Asset hygiene (KC standard):** total `/public/media` should stay in the low
single-digit MB. Never commit raw `.mov` files — process, then commit outputs
only. Add originals folder to `.gitignore` if placed inside the repo.

## 4. Build order for the session

1. Confirm asset folder location + inventory what actually arrived.
2. Hero reel + poster (biggest visual upgrade; test reduced-motion fallback).
3. Posters for existing work cards; photography grid.
4. Content updates in `site.ts`: Bioderma → real credit; add Socliq, Kilani,
   Soluna to marquee/campaigns; drop any `PENDING` markers now satisfied.
5. **Process section** (new component, pattern-match `Services.tsx`):
   Book a call → Creative brief (the Kilani example is the proof) → Shoot day
   → Fast delivery. Keep it four steps, gold numerals, one line each.
6. BTS bundle offer: add to Services copy + consider a "Video + Photo" chip in
   CTA step 1 (`site.cta.steps[0].options`) so bundle leads self-identify.
7. YouTube IDs if James has them by then (`ytId` fields).
8. Re-run gates (§5), commit, push to the SAME branch.

## 5. Quality gates (unchanged, re-verify before pushing)

- `npm run test:e2e` — all 18 pass, both projects. Add assertions for any new
  section (Process) and for the reel (`preload="none"`, poster present,
  reduced-motion shows poster/no autoplay).
- Lighthouse mobile ≥ 90 performance, 100/100/100 elsewhere. The reel is the
  main risk: keep it lazy (src attached post-first-paint — already implemented),
  keep LCP = headline/poster.
- CLS stays 0. No horizontal overflow at 360px. axe: zero critical/serious.
- Full-page screenshots (desktop + mobile) reviewed by eye — two bugs in
  Phase 1 were only caught visually ("brandevents." word-collapse, doubled
  featured title). Look at what you built.

## 6. Blocked on Jelani — do NOT proceed without answers

1. **Glorious Athletica**: use visuals only, or name the client? (He owns the
   content; the client never paid him. Recommend visuals-only.)
2. **Weddings** on this agency-facing site? (Recommend: at most a footer line.)
3. **Pricing**: publish numbers or stay quote-only? James must transcribe the
   voice memo either way. If published, anchor: standard rate beside current.
4. Still outstanding from Phase 1: YouTube IDs, LinkedIn text, headshot,
   testimonial quotes + permission, Calendly link, relay endpoint
   (`FORM_ENDPOINT`), domain.

## 7. Environment gotchas learned the hard way

- Outbound network is allowlisted: **Dropbox, Instagram, Fontshare, YouTube,
  isou.ca are all blocked.** npm registry + Google Fonts work. Don't burn time
  retrying blocked hosts; ask James to upload instead.
- `git push -u origin claude/jelanitv-sales-website-lfqi04` — never a new branch.
- Railway: build command is `npm run build` only (Nixpacks runs `npm ci`
  itself; duplicating it caused the EBUSY failure). Node pinned ≥ 22. Service
  needs a domain generated in Railway settings to be publicly reachable.
- Playwright Chromium lives at `/opt/pw-browsers/chromium`; never
  `playwright install`.
- The prerender step (`scripts/prerender.mjs`) runs inside `npm run build`;
  if you change `index.html`'s structure, keep the `<div id="root"></div>`
  replacement target intact.
