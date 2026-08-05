# JelaniWoodsTV — sales site

One-page site for Jelani-Issa Woods (director of photography, Toronto / GTA).
Its single job is turning a visit into a booking enquiry.

Built to `HANDOFF.md` — read that first for the brief, the design direction,
and the decisions that are settled.

## Running it

```bash
npm install
npm run dev          # Vite dev server
npm run build        # client build → SSR build → prerender + inline CSS
npm start            # serve dist/ on :3000 (PORT to override)
npm run test:e2e     # Playwright + axe, desktop and mobile
```

## How the page is put together

**All copy and every link live in `src/content/site.ts`.** Client revisions,
the pending LinkedIn text, YouTube IDs, and asset paths go there — no
component should need editing for a content change. Two markers appear
throughout that file:

- `CONFIRM:` — drafted wording awaiting Jelani's sign-off (turnaround
  promises, bio, job titles).
- `PENDING:` — a slot waiting on an asset or URL.

**Videos never embed until asked.** `ui/LiteYouTube.tsx` renders each film as
our own artwork and only mounts a `youtube-nocookie` iframe once the visitor
clicks. Cards with `ytId: null` render as plates instead of dead players, so
the gallery is presentable before a single link lands.

**The page is prerendered.** `npm run build` renders the app to static HTML
and folds the stylesheet into the document, then the client hydrates that
markup. Without it the browser waits on a React bundle before painting
anything, which cost roughly 1.5s of Largest Contentful Paint on a throttled
phone. The hero's entrance is therefore CSS, not JS — it has to animate on
the first frame, before hydration.

**The server compresses.** Inlining CSS makes `index.html` ~80 KB, so
`compression()` in `server/index.js` is load-bearing, not a nicety: serving
it raw measured *worse* than not prerendering at all.

## Dropping in the pending assets

| What | Where |
|---|---|
| YouTube IDs | `ytId` on each item in `site.work.groups` |
| Showreel loop | `/public/media/reel.mp4` + set `site.hero.reel` / `reelPoster` |
| Headshot | `/public/media/` + set `site.about.portrait` |
| Photography | `/public/media/` + set `poster` on the gallery items |
| Testimonials | `site.proof.testimonials` — the block stays hidden while empty |
| Booking link | `site.meta.bookingUrl` |
| Enquiry delivery | one environment variable — see below |

## Enquiries

The card posts to `/api/enquiry`, a route on our own server
(`server/enquiry.js`) — no third-party form service, no per-submission
quota, and the visitor's details never leave the deployment.

Delivery is off until one of these is set on the Railway service. Set
either; setting both means a lead survives one of them failing:

| Variable | Effect |
|---|---|
| `ENQUIRY_WEBHOOK_URL` | Posts the enquiry to a Discord or Slack webhook, or any JSON endpoint (Zapier, Make). **Fastest to set up** — a Discord channel webhook takes about a minute and needs no domain or account. |
| `RESEND_API_KEY` + `ENQUIRY_TO` | Emails the enquiry, with the visitor's address as reply-to. `ENQUIRY_FROM` optional; a verified sending domain is required for anything but Resend's test sender. |

Behaviour worth knowing before it goes live:

- **Nothing configured** → the route answers `501` and the card falls back
  to opening the visitor's mail client with their answers prefilled, exactly
  as it did before. Shipping this without the variable changes nothing.
- **Delivery fails** → `502`, and the card takes the same mailto fallback.
  A lead is never shown a success screen it did not earn.
- **Every enquiry is logged** to the deploy log as a `[enquiry]` line
  *before* delivery is attempted, so a lead is recoverable even if every
  channel is down.
- Submissions are capped at 5 per address per 10 minutes, and a hidden
  honeypot field drops bots without telling them.

## Quality gates

`npm test` runs both suites: `test:server` (10 Node assertions covering the
enquiry route's validation, honeypot, rate limit, and failure modes) and
`test:e2e` (44 Playwright assertions across desktop and mobile). Plus a
Lighthouse mobile run — current state: Performance 92, Accessibility 100,
Best Practices 100, SEO 100, CLS 0.

## Fonts

Clash Display, named in the handoff, is served only by Fontshare, which the
build environment blocks. The display face is Inter 800 at tight tracking —
the researched "Inter-Tight Poster" pairing — with Playfair Display Italic
reserved for pull quotes and numerals. All faces are self-hosted woff2,
latin subset, in `/public/fonts`.
