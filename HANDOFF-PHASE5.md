# Phase 5 Handoff — YouTube IDs & Card Artwork (Opus builds this)

**Roles:** Opus — builder. Fable — engineering owner (architecture, review,
QA sign-off). Deviations go through the engineering owner.
**Read first:** `HANDOFF.md` (brief, design system, **locked decisions**),
`HANDOFF-PHASE3.md` §1 (the local Windows environment — unchanged, still
applies), `README.md`.
**Prime directive:** integrate, don't redesign. This phase closes Phase 1's
oldest open item — the YouTube IDs — and gives six work cards real artwork.

---

## 1. ⚠️ Read this before touching `site.ts`

James supplied eight URLs. **One of them must not ship.**

`KuuIsQKZmw4` resolves to **"JelaniWoodsTV Cover Letter"**. The Cover Letter
video is a **locked stakeholder cut** (`HANDOFF.md` §4a.5 and §8: *"Cuts
approved: Cover Letter video and gaming GFX banners are off the site"* — it
reads as job-seeker material, not vendor material). There is already a
passing assertion in `tests/smoke.spec.ts` that the string `Cover Letter`
appears **zero** times on the page.

Do not add it, do not create a card for it, do not weaken that test. If
James wants it reinstated, that reopens a locked decision and goes through
the engineering owner first. Its ID is recorded here only so nobody has to
re-resolve it later and wonder why it was skipped.

## 2. Verified mapping (resolved via YouTube oEmbed, 2026-08-02)

Every title below was fetched from YouTube, not inferred. Item IDs refer to
entries in `site.work.groups` in `src/content/site.ts`.

| YouTube ID | Actual title | Channel | → `site.ts` item | kind |
|---|---|---|---|---|
| `CavSj2reqa4` | Duane Notice's Battle Back From Injury \| Black History Month | **SPORTSNET** | `sportsnet-duane-notice` | video (featured) |
| `MhNHciOVE1w` | August Week 3 - 2021 | **Camp Dreamwood** | `camp-dreamwood` | video |
| `IRGQXQKWEek` | cinematic short | JelaniWoodsTV | `cinematic-short` | short |
| `LTD6Zqn1vq0` | promise | JelaniWoodsTV | `promise` | short |
| `VdbsVKasgBI` | Star Villas Costa Rica | JelaniWoodsTV | `star-v` | short |
| `agP4vz_HjYw` | Luxury Villa UGC | JelaniWoodsTV | `luxury-short` | short |
| ~~`KuuIsQKZmw4`~~ | ~~JelaniWoodsTV Cover Letter~~ | JelaniWoodsTV | **NONE — see §1** | — |

Notes that matter:
- `IRGQXQKWEek` was supplied twice (once as `/watch`, once as `/shorts`).
  Same video. It is a genuine Short (vertical) — the existing `kind: 'short'`
  is correct.
- **Two credits are published on third-party channels** (Sportsnet's own
  channel, Camp Dreamwood's own channel). That is *stronger* proof than a
  self-upload, not weaker. Keep the `client` attribution exactly as it is;
  do not imply the channels are Jelani's.

**Retitles** — the site's placeholder titles are now known to be wrong:
- `star-v`: `'Star V'` → **`'Star Villas Costa Rica'`**
- `luxury-short`: `'Luxury'` → **`'Luxury Villa UGC'`**
- Leave `cinematic-short` and `promise` as they are (they match).
- The featured Sportsnet card title already matches its real title — do not
  restyle it to the thumbnail's key-art wording ("The Game of Fortitude").

## 3. Embedding is verified — do not re-investigate

All six shipping videos were confirmed to embed successfully via
`youtube-nocookie.com` from a real http origin.

**Known red herring:** navigating a browser *directly* to
`youtube-nocookie.com/embed/<id>` returns **Error 153** for every video,
including ones that embed perfectly. That is a null-parent-origin artifact,
not a per-video block. If you write an embed test, load the iframe inside a
page served from `localhost`, never by navigating straight to the embed URL.

## 4. Card artwork — self-host, never hotlink

Six cards currently render gradient plates. Give them real posters.

**Rule: never reference `i.ytimg.com` at runtime.** The page's defining
property is that it makes zero third-party requests until a visitor clicks
(there is a passing test enforcing no iframes at rest). Hotlinking
thumbnails would quietly break that property and add a tracking vector.
Download at build time, convert to WebP, commit the outputs.

Add `scripts/media/build-thumbs.mjs`, following the conventions already
established in `scripts/media/` (see `build-posters.mjs` for the house
style — module docstring explaining *why*, table of inputs, size report):

**Landscape videos** (`CavSj2reqa4`, `MhNHciOVE1w`):
- Source `https://i.ytimg.com/vi/<id>/maxresdefault.jpg` — verified 1280x720
  for both.
- Output 1280x720 WebP q80 → `public/media/yt-<id>.webp`.

**Shorts** (`IRGQXQKWEek`, `LTD6Zqn1vq0`, `VdbsVKasgBI`, `agP4vz_HjYw`):
- Source **`https://i.ytimg.com/vi/<id>/oar2.jpg`** — this serves the *true
  vertical* frame (verified 1080x1920 / 720x1280). Use it.
- Do **not** use `maxresdefault` for shorts: it is 16:9 pillarboxed, with
  the real content squeezed into the middle ~400px and blurred filler on
  both sides.
- Do **not** use `oardefault.jpg`: it 404s on at least one of these
  (`IRGQXQKWEek`). `oar2` returned 200 on all of them.
- Resize to max 720x1280, WebP q80 → `public/media/yt-<id>.webp`. Keep each
  file **≤300 KB** (`npm run assets:check` enforces this and will fail the
  build if you overshoot — drop quality, not dimensions).
- If `oar2` ever 404s for a future ID, fall back to `maxresdefault` with a
  centre crop to 9:16, and log that it happened.

Then set `poster: '/media/yt-<id>.webp'` on each of the six items alongside
its `ytId`.

**Visual risk to check with your eyes (§6):** the Sportsnet thumbnail is
designed broadcast key art with **baked-in text** ("DUANE NOTICE / THE GAME
OF FORTITUDE" plus the Sportsnet logo, text sitting centre-right). The
featured card overlays *its own* title and eyebrow at bottom-left over a
gradient. Phase 1 shipped a "doubled featured title" bug that only a
screenshot caught — this is the same failure mode waiting to happen. Look
at the rendered featured card at desktop **and** 360px before calling it
done. If the two texts collide or read as duplicated, the fix is to deepen
the card's bottom scrim, not to delete the card title (the title is what
the section's heading outline depends on).

## 5. What is still unlinked after this

These keep `ytId: null` and their current presentation — that is correct,
not an oversight:

- `cinematography-reel`, `editors-reel-2020`, `editors-reel-pt2` — no IDs
  supplied. They still render as "Film linking soon" plates.
- `soluna`, `bioderma` — real posters already (Phase 3), no public YouTube
  link yet.
- Campaign and photography items — stills, no video by design.

Ask James for the three reel IDs; they are the last video gap, and the
Reels row is the "can he shoot / can he cut" answer.

## 6. Tests (extend `tests/smoke.spec.ts`)

1. Each of the six items renders a real poster (`img`/background referencing
   `/media/yt-`), and no element anywhere references `i.ytimg.com`.
2. The six cards are interactive: `button` with `aria-label="Play <title>"`.
3. Clicking the featured card mounts exactly one `youtube-nocookie` iframe
   whose `src` contains `CavSj2reqa4` — and the existing "no third-party
   embed at rest" test still passes before that click.
4. `Cover Letter` and `KuuIsQKZmw4` both appear **zero** times in the
   served HTML (extend the existing cut-content assertion to cover the ID).
5. `Star Villas Costa Rica` and `Luxury Villa UGC` render as card titles.
6. Existing suite stays green — Phase 3's 28 assertions plus any Phase 4
   pricing additions, both projects.

## 7. Gates (re-verify before pushing)

- `npm run test:e2e` — all green, desktop + mobile.
- `npm run assets:check` — must still pass with the six new files
  (`media` bucket has ~3.8 MB of headroom; each file ≤300 KB).
- Lighthouse mobile: parity with Phase 3 (local control ≈ 83–84). Posters
  are lazy below the fold — if performance drops, check you did not mark
  them eager or oversize them.
- CLS 0. axe zero critical/serious. No horizontal overflow at 360px.
- Screenshots desktop + mobile, with the featured card inspected per §4.

## 8. Build order

1. `scripts/media/build-thumbs.mjs`; run it; `assets:check`.
2. `site.ts`: six `ytId` values, six `poster` paths, two retitles.
3. Tests (§6), full gate pass (§7).
4. Commit to `claude/jelanitv-sales-website-lfqi04`, push. Screenshots +
   Lighthouse summary to the engineering owner.

## 9. Blocked / open

| # | Item | State |
|---|---|---|
| 1 | Cinematography + two editors reel IDs | Ask James — last video gap |
| 2 | Reinstating the Cover Letter video | Locked as cut; needs a decision reversal, not a build change |
| 3 | Soluna / Bioderma public links | Posters ship now; `ytId` when available |
| — | Carried: LinkedIn text, headshot, testimonials + permission, booking link, `FORM_ENDPOINT`, domain, Glorious Athletica naming, weddings, Canergy/Reset/Kilani/Soluna naming, MLSE mention on the brief page, pricing currency | Unchanged |

---

*Spec by Fable (engineering owner), 2026-08-02. Titles, embeddability, and
thumbnail sources in §2–§4 were all verified against YouTube directly —
build against them, don't re-derive.*
