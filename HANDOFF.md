# JelaniWoodsTV — Sales Website: Engineering Handoff

**Project:** One-page sales site for Jelani Woods (brand: **JelaniWoodsTV**), freelance video/photo creative, GTA.
**Repo:** `HamesInFlames/jelani-landing-page-web` · branch `claude/jelanitv-sales-website-lfqi04`
**Roles:** Opus 5 — builder (implements this spec). Fable 5 — engineering owner (architecture, review, QA sign-off). Deviations from this spec go through the engineering owner, not ad-hoc.

> **Status: built (2026-07-30).** The site is implemented against this spec — see `README.md` for how it is put together and where pending assets drop in. Quality gates met: **Lighthouse mobile 92 / 100 / 100 / 100**, CLS 0, 18 Playwright + axe assertions passing on desktop and mobile, 0 npm vulnerabilities. Remaining work is client-supplied material (§8), not engineering.
>
> **Three spec deviations, all forced and all documented:**
> 1. **Clash Display → Inter 800.** Fontshare is blocked by the build environment's network policy. The ritual's own top typography result ("Inter-Tight Poster": Inter 600–800, tight tracking, Playfair Display Italic for pull quotes) is what shipped — self-hosted woff2, latin subset.
> 2. **Hero background video → animated ambient light.** No ffmpeg and no licensed clip available, and ripping footage was not an option. The `<video>` layer is built and wired; `site.hero.reel` is a one-file swap. The fallback is deliberate atmosphere, not a placeholder.
> 3. **Prerendering added (not in the original spec).** An SPA paints nothing until React boots, which capped Performance at 74–77. The build now renders static HTML and inlines the CSS, and the hero entrance is CSS rather than JS so it animates before hydration. This is what carried Performance to 92 — and it makes `compression()` in the Express server load-bearing, since the inlined-CSS document is ~80 KB raw.
>
> **Known gap:** LCP is 3.0s against the §6 target of 2.5s (Lighthouse's simulated slow 4G). The category still scores 92. Closing it further means trimming the `motion` dependency out of the initial bundle — worth doing only if the target is firm.

---

## 1. Goal & positioning

One job: get brands and agencies to **enquire**. Every section funnels to the CTA.

> **Superseded 2026-08-18 (Phase 9).** This line read "get brands and agencies to **book a call**" until Jelani rejected that funnel outright: he does not take free discovery calls, and money is discussed before a call is booked. The page now runs enquiry card → short call that takes payment → creative brief. The goal is unchanged; the ask is an enquiry, not a call. See `HANDOFF-PHASE9.md`.

- **Audience:** brands/agencies running influencer-marketing events needing fast-turnaround video/photo recaps; agencies hiring second shooters; in-house teams needing overflow creative.
- **Scope:** creative services only. **No fitness/bodybuilding content anywhere on the page.** (Client's public social footprint is gym-heavy; this site is the deliberate commercial front door that repositions him.)
- **Tone:** first-person, polished, competent-operator. Confident, not hype. Commercial/agency-facing.

## 2. Verified proof points (use these; don't invent)

- **Sportsnet** — "Duane Notice's Battle Back From Injury | Black History Month" (broadcast-brand credit; featured on his current site). **Lead proof point** — a national broadcaster beats everything else on the page.
- **Visual Smugglers** (Toronto production agency, King St W) — Project Manager & Director of Photography. The agency does social content, event video, brand promos — exactly what Jelani sells.
- **Camp Dreamwood** — recurring weekly recap videos ("August Week 3 – 2021") — direct evidence of the *event-recap* service.
- **JelaniWoodsTV** (self-employed) — social media marketing, lead gen, video editing, graphic design, photo retouching; photography across events, fashion, portraits, headshots, weddings. Positions himself as **Director of Photography — Storytelling | Production | Social Media Strategy** (current site hero; keep this identity).
- **Toolset:** Adobe CC (Premiere Pro, Lightroom, Photoshop) + **DaVinci Resolve**, cinematography, color correction, camera operation.
- **Studio Impetus** (@studioimpetus, "Impetus Social" — Toronto media creators) — **founded by Jelani**. Bio: "Compelling Campaigns That Capture YOUR Brand's Personality." Its grid (reviewed via screenshot 2026-07) shows brand-campaign reels, fitness-apparel campaign shoots, **product photography (BeeVibe Juicery)**, and lifestyle content — plus IG highlights for **Testimonials**, Q&A, and "The Code." Use "Founder of Studio Impetus" as a credibility line in About/Proof, and its campaign work in §4.7.
- **Scope nuance:** the no-fitness rule (§1) applies to Jelani's *personal bodybuilding content*, not to **commercial campaigns for fitness/wellness brands** (apparel shoots, juice product work) — those are client work and belong in the Work section.
- **Sales background:** ~4 years at Koodo Mobile (Sales Rep + Store Manager). Angle: *a creative who understands commercial goals* — use one line, don't dwell.
- **Existing work inventory (from his current carrd — see §4a):** editors reels (2020 + Part 2), cinematography reel, UGC vertical shorts, beauty/fashion photography set, Sportsnet piece, Camp Dreamwood recaps, "promise" short film, GFX/banner design.
- **Additional portfolio placeholder:** Bioderma event recap (assets pending from client). ~~BuildApe~~ — dropped; Jelani is no longer with them. Do not reference BuildApe anywhere on the site.

`[AWAITING CLIENT]` — LinkedIn About/Experience full text, confirmed client list, YouTube URLs/IDs for each work item below (all are on youtube.com/@jelaniwoodstv — titles listed in §4a), original photo exports, headshot, background reel. Build with placeholders; never ship lorem ipsum — write real draft copy and mark unconfirmed facts with `<!-- CONFIRM -->`.

## 3. Design direction

**References:** isou.ca — minimal, first-person, fullscreen **background video**, ambient animation, aesthetic-forward. @studioimpetus (IG) — dark, campaign-driven content-studio energy; note this is **Jelani's own studio** (see §2), so its look is also brand continuity, not just inspiration. Target feel: **modern, clean, cinematic-dark** — big type, generous space, motion that feels expensive but restrained. Not a template look.

### Design tokens (client brand — black & gold; this is *not* the KC house brand)

```css
:root {
  --ink:        #0A0A0B;  /* page background */
  --surface:    #141416;  /* cards, nav scrim */
  --line:       #2A2A2E;  /* hairline borders */
  --gold:       #D4AF37;  /* accent — CTAs, key figures, rules */
  --gold-soft:  #E8CD7A;  /* hover / highlight */
  --paper:      #F5F2EA;  /* primary text on dark */
  --muted:      #9A968C;  /* secondary text */
}
```

Gold is an **accent** (buttons, underlines, numerals, hairlines) — never large fills. Dark theme only; no theme toggle.

### Typography

- **Display:** Clash Display (Fontshare) — headlines, name, section titles. Tight tracking, weights 500/600.
- **Body/UI:** Inter — 400/500. Base 16–18px, line-height 1.6.
- **Self-host** both as woff2 in `/public/fonts` with `@font-face` + `font-display: swap`. No CDN font links (build/deploy environments may block them, and it's faster).
- Scale: hero display `clamp(2.75rem, 8vw, 6.5rem)`; section titles `clamp(2rem, 4vw, 3.25rem)`.

### Motion language

Library: **`motion` package (`motion/react`)** — NOT framer-motion (KC standard).

- Reveal-on-scroll: fade + translateY(24px), 0.6s, easing `cubic-bezier(0.22, 1, 0.36, 1)`, `viewport={{ once: true, margin: "-15%" }}`; stagger children 80ms.
- Hero: slow parallax on the video layer (`useScroll` + `useTransform`, ~0.85 scroll speed); headline words stagger in on load (100ms/word).
- Marquee: infinite CSS-transform loop, ~40s/cycle, pause on hover.
- Buttons: 150ms color/border transitions; subtle 1.02 scale on hover. No magnetic-cursor gimmicks.
- **`prefers-reduced-motion`: all reveals become opacity-only, marquee stops, video swaps to poster.** Non-negotiable.

### Background video (hero)

- Muted, looped, `playsinline`, autoplay, `poster` set. One `<video>` with WebM + MP4 sources, target **< 4 MB**, 1080p max, ~10–20s loop.
- 60% black overlay + slight top-down gradient so the headline always passes contrast.
- Until the client's reel arrives: ship `/public/media/reel-placeholder.mp4` (dark abstract/grain loop — generate or use a licensed stock clip; do NOT rip content) and keep the swap a one-file replacement.
- Lazy-init: set `preload="none"`, attach `src` after first paint; render poster immediately (LCP is the poster/headline, never the video).

## 4a. Current site audit — what "more polished" means

His live site (jelaniwoodstv.carrd.co, reviewed via screenshots 2026-07) is a dark Carrd one-pager: hero ("JELANI-ISSA WOODS / Director of Photography / Storytelling | Production | Social Media Strategy"), anchor pills (UGC, Cover Letter, Video Editing, Beauty, GFX Design), then stacked raw YouTube embeds, a beauty-photo grid on a jarring **white** background, gaming GFX banners, and a "Lets chat." social-icon footer.

**Keep** (it's working): dark theme, wide-tracked hero typography, category-based work organization, real embedded work, the DoP identity line.

**Fix** (the polish gap — each is a build requirement):
1. **Raw YouTube embeds everywhere** → replace with styled facade cards (§4.7): our own poster frames, hover states, gold accents; player loads only on click. Kills the wall-of-red-play-buttons look and the iframe performance tax.
2. **White beauty section breaks the theme** → one continuous dark system; photography sits on `--ink` with generous gutters, like a gallery wall.
3. **No hierarchy** → Sportsnet is buried mid-page. The strongest credit leads the Work section as a featured wide card.
4. **No CTA / no funnel** → current site has zero ask. Every section now funnels to **Book a call**.
5. **Job-seeker artifacts** → "Cover Letter" video/pill reads as résumé, not vendor. **Cut from this site** (it can live on LinkedIn).
6. **Off-target content** → gaming GFX banners ("DefaultADC" Twitch-style art) don't speak to agency buyers. **Cut by default**; the "Stills & Motion — Dreams Become Reality" poster may survive inside the photography set if it fits the grid. Flag for client sign-off.
7. **Carrd template tells** ("Made with Carrd", default type, pill buttons) → gone by nature of the custom build.

## 4. Page structure & copy skeleton

Single long-scroll page. Section order and copy intent (Opus drafts final copy in the tone above; hero one-liner is fixed):

1. **Nav** — fixed, transparent → `--surface` scrim after 40px scroll. Left: "JELANIWOODSTV" wordmark (text, Clash Display). Right: anchor links (Work, Services, About) + gold **Book a call** button.
2. **Hero** — fullscreen video bg. Eyebrow: `JELANI-ISSA WOODS · DIRECTOR OF PHOTOGRAPHY · GTA` (keeps his current-site identity). H1: **"Fast-turnaround creative for brand events."** Sub: one line naming the buyer ("I help brands and agencies turn events into content — recaps delivered while the moment still matters."). Primary CTA **Book a call**, secondary ghost link **See work ↓**.
3. **Marquee strip** — now has real names: `SPORTSNET · VISUAL SMUGGLERS · CAMP DREAMWOOD` + `[AWAITING CLIENT]` slots, interleaved with capability words (`EVENT RECAPS · SECOND SHOOTER · SAME-WEEK EDITS`), muted caps with gold separators.
4. **Services** — 4 cards on `--surface`, hairline borders, gold numerals 01–04: Event video recaps · Photo coverage · Second shooting / overflow support · Quick-turnaround editing. Each: 2-line description + concrete turnaround promise.
5. **About** — split layout: portrait (placeholder frame until headshot arrives) + short first-person bio built from §2. One sentence on the sales background as commercial fluency.
6. **Proof / Experience** — vertical timeline or stat-style entries: **Founder, Studio Impetus** (Toronto media-creator studio) · Visual Smugglers (PM & DoP) · JelaniWoodsTV independent work · toolset line. Gold hairline connectors. Below the timeline: 1–3 **testimonial pull-quotes** in italic serif-feel display type with gold quote marks — source: the Studio Impetus IG "Testimonials" highlight (`[AWAITING CLIENT]` exact quotes + attribution permission; omit the block entirely until real quotes land — never fabricate). `[AWAITING CLIENT]` slots for numbers/names.
7. **Work** (`#work`) — the centerpiece section, built from his real portfolio. One continuous dark gallery, sub-grouped with small gold-numbered subheads. Every video is a **facade card**: our own dark frame, poster thumbnail, title + client caption, subtle gold border on hover with slight (1.03) zoom; clicking swaps in a lazy `youtube-nocookie.com` iframe (`ui/LiteYouTube.tsx`). No raw embeds, no red YouTube chrome at rest.
   - **7.1 Featured** — full-width 16:9 card: *Sportsnet — "Duane Notice's Battle Back From Injury" (Black History Month)*. Eyebrow: `FEATURED · SPORTSNET`.
   - **7.2 Reels** — three 16:9 cards: Cinematography Reel · Editors Reel 2020 · Editors Reel Pt. 2. This row answers "can he shoot / can he cut" in one glance.
   - **7.3 Event & recap work** — Camp Dreamwood weekly recap (+ Bioderma card as *Coming soon* until assets land). Caption each with the turnaround story where known.
   - **7.4 Brand campaigns & product** — from Studio Impetus: campaign reels (fitness-apparel shoots, lifestyle) + product photography (BeeVibe Juicery bottle work). Eyebrow: `CAMPAIGNS · STUDIO IMPETUS`. Mixed 16:9 video cards and square/4:5 photo tiles. `[AWAITING CLIENT]` original exports + client-name confirmations.
   - **7.5 Short-form / UGC** — horizontal row of 9:16 vertical cards (`ui/ShortsCard.tsx`), scroll-snap on mobile: the luxury short, cinematic short, "promise", travel/bridge short. This is the format influencer-marketing buyers are buying — label it `SHORT-FORM & UGC`.
   - **7.6 Photography** — beauty/fashion set (5 images from current site, re-exported at quality; `[AWAITING CLIENT]` originals) in an asymmetric masonry-style grid on `--ink`, generous whitespace, no borders; lightbox optional (skip if it threatens the perf budget).
   - Video sources: all on youtube.com/@jelaniwoodstv — exact IDs `[AWAITING CLIENT]`; wire cards to `content/site.ts` entries `{ id, title, client, kind: 'video'|'short'|'photo', ytId?, poster }` so IDs paste straight in.
   - Cut from current site (per §4a): Cover Letter video, gaming GFX banners.
8. **CTA — conversational card flow** (stakeholder decision: **no traditional form**). Full-width closer on `--ink`, display-size "Have an event coming up?" above a single centered card (`--surface`, hairline border, gold accents) that asks one question at a time:
   - **Step 1** — "What do you need?" → four option chips: `Event recap` / `Photo coverage` / `Second shooter` / `Editing support`.
   - **Step 2** — "When do you need it?" → chips: `This month` / `Next month` / `Just exploring`.
   - **Step 3** — "Where can I reach you?" → single email input + optional one-line note + gold **Send it** button.
   - Steps transition with a slide/fade (`motion` AnimatePresence, 300ms); gold progress dots; back affordance; card keeps fixed min-height (no CLS). Selections are chips, not radio buttons — tapping advances immediately.
   - Submission: relay the three answers via a free email-relay service (Formspree-class) to `jelaniwoods@gmail.com`, with graceful mailto fallback (body prefilled from answers) if the relay fails. No custom backend. Keep the whole widget dependency-free beyond `motion`.
   - Below the card, one quiet line: "Prefer email? jelaniwoods@gmail.com". Swap in Calendly link later if one arrives (`[AWAITING CLIENT]`).
   - Fully keyboard-navigable; chips are buttons with visible focus rings; step changes announced via `aria-live="polite"`.
9. **Footer** — wordmark, email, Instagram/LinkedIn links, "Toronto / GTA", year.

## 5. Stack & scaffold (KC ritual — run in order, don't re-derive)

React 19 + Vite + TypeScript (**strict**) + Tailwind + `motion` + Express (static server) → **Railway**.

```bash
npm create vite@latest . -- --template react-ts
npm install
npm install motion
npm install tailwindcss @tailwindcss/vite
```

Ritual step 2: clone `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git` (outside the repo) and use its `search.py` to sanity-check the type/color decisions above **before** component code. Ritual step 3 (21st.dev components): optional here — this page is small enough to hand-roll; use only if a component genuinely fits the aesthetic.

### File tree

```
src/
  main.tsx / App.tsx            # App = ordered section list
  styles/index.css              # tokens, @font-face, base
  components/
    Nav.tsx  Hero.tsx  Marquee.tsx  Services.tsx  About.tsx
    Proof.tsx  Work.tsx  CtaSection.tsx  Footer.tsx
    ui/Reveal.tsx               # shared scroll-reveal wrapper
    ui/GoldButton.tsx
    ui/LiteYouTube.tsx          # facade card → lazy nocookie iframe on click
    ui/ShortsCard.tsx           # 9:16 vertical variant for UGC row
  content/site.ts               # ALL copy + links in one typed object
server/index.ts                 # Express: serve dist/, SPA fallback
public/fonts/  public/media/    # self-hosted woff2, video + posters
```

**All copy lives in `src/content/site.ts`** (typed) — client revisions and the LinkedIn paste-in must never require touching components.

## 6. Quality gates (engineering owner signs off against these)

- **Lighthouse ≥ 90** across the board (mobile). LCP < 2.5s, CLS < 0.05, total JS < 150 KB gz.
- **QA harness before delivery:** Playwright smoke (renders, anchors scroll, CTA hrefs correct) + axe (0 critical) + Lighthouse — KC standard as on Grodzinski.
- Contrast: all text ≥ 4.5:1 over video/overlay; verify gold-on-ink for small text (use `--gold-soft` where it fails).
- Asset hygiene: lean repo, 0 npm vulnerabilities, no unused media.
- Fully responsive 360px → 1920px; marquee and timeline degrade gracefully on mobile.
- `<title>`, meta description, OG image (1200×630, black/gold card), favicon (gold "JW" on ink).

## 7. Build order

1. Scaffold + ritual + tokens/fonts/base styles
2. `content/site.ts` with full draft copy
3. Nav + Hero (with video layer + reduced-motion fallback) — get this section *perfect first*; it sets the bar
4. Remaining sections top-to-bottom
5. Motion pass (Reveal wrapper, marquee, hovers)
6. Express server + Railway config
7. QA harness + fixes → hand to engineering owner for review

## 8. Open items (client-blocked, do not wait on them to build)

- LinkedIn About/Experience text, confirmed client list → §4.3/§4.6 slots
- YouTube video IDs for every §4.7 work item (titles known; channel: youtube.com/@jelaniwoodstv) → paste into `content/site.ts`
- Original photo exports for the beauty set (screenshots are not shippable quality)
- Background reel, headshot, Bioderma assets → drop-in swaps
- Studio Impetus campaign/product asset exports
- Testimonial quotes from the Studio Impetus IG highlight, with permission to attribute

### Decisions locked (2026-07-30, stakeholder-confirmed — do not reopen)

- **Brand framing:** site is JelaniWoodsTV; Studio Impetus appears as a founder credential, not the lead brand.
- **CTA:** conversational card flow per §4.8 — explicitly *not* a traditional form.
- **Cuts approved:** Cover Letter video and gaming GFX banners are off the site.
- **Client naming:** name Sportsnet, Camp Dreamwood, Visual Smugglers publicly for now — pending Jelani's final say; keep names easily removable (they live only in `content/site.ts`). Kilani was signed off 2026-08-05. **BeeVibe Juicery was removed from the site 2026-08-05** — its card had no artwork; do not re-add the name without a real product image.
- **BuildApe:** removed entirely (relationship ended).
- Calendly (or booking) link → replaces `#book`
- Domain (likely `jelaniwoods.tv` or similar) — not blocking; Railway URL for staging

## 9. Research notes (context for the builder)

- isou.ca was **not directly fetchable** from this environment (network policy); its direction is from stakeholder description: fullscreen bg video, ambient animation, minimal first-person structure. The client's current carrd **was reviewed via full-page screenshots (2026-07)** — §4a and the §4.7 work inventory come from that review.
- Client's public social presence (TikTok "Gym Edits", YouTube "Road to Pro") is fitness-branded — reinforcing why this page must stand alone as the commercial identity and why fitness content is excluded by client decision.
- Visual Smugglers verified as a real Toronto production agency (visualsmugglers.com) — safe to name as experience, pending client confirmation of exact title/dates.

## 10. Phase 2 — asset integration plan (from Jelani's Discord drop, 2026-07-31)

Jelani shared Dropbox folders + context via Discord (reviewed as screenshots; Dropbox itself is blocked from this environment — files must be re-uploaded into the session or committed to the repo by James).

**New verified client intel:**
- **Socliq** — agency client; "Socliq Live" **Bioderma** event footage exists (`socliq live bioderma color audio blend.mov`). Bioderma card becomes real work, credited `Bioderma · with Socliq`.
- **Kilani** — brand; the "Valentines Variation" PDF is his **post-payment creative-brief process example** — evidence for a Process section.
- **Soluna** — `soluna youtube test.mp4`; Jelani: "can be shortened and reused" → hero-reel candidate.
- **Elite Wedding Productions** — wedding portfolio folder. Jelani: weddings = long-term revenue, booking *next* summer.
- **Jeff Gloria (Glorious Athletica)** — athletic-branding content Jelani owns outright (client never paid; he confirmed ownership). Visuals usable; whether to *name* them needs his call.
- **Pricing** exists (voice memo, not yet transcribed) + a standing offer: **video + photo bundle = no discount, but a complimentary BTS film** "for brand transparency."

**2A — buildable now (no files needed):** update `content/site.ts` credits (Bioderma real, add Socliq/Kilani/Soluna to marquee + campaigns group); add a **Process** section (Book a call → Creative brief → Shoot day → Fast delivery, with the brief step as the differentiator); fold the BTS-bundle offer into Services/CTA copy; optionally add "Video + Photo bundle" as a CTA step-1 chip.

**2B — needs uploads:** hero reel (trim/compress Soluna or Bioderma footage to <4MB loop + poster — if ffmpeg is unavailable in-session, James runs the documented command locally and uploads the small outputs); poster stills for every work card; photography-grid images from the folders; pricing numbers once the memo is transcribed.

**2C — decisions for Jelani (do not guess):** name Glorious Athletica publicly or use visuals uncredited; weddings on this agency-facing site (even as a footnote) or kept separate; publish pricing vs. keep quote-only (if published, always anchor: standard rate beside current rate).
