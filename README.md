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
| Enquiry delivery | works with no setup — one activation tap, see below |

## Enquiries

The card posts to `/api/enquiry`, a route on our own server
(`server/enquiry.js`). The visitor's details go to Jelani, never to an
account we have to keep.

**Delivery works with no setup.** The route always relays through
[FormSubmit](https://formsubmit.co), which needs no key, no account, and no
environment variable — it emails `jelaniwoods@gmail.com` (or `ENQUIRY_TO`
when that is set).

The one step, and it can be done from a phone:

1. Deploy.
2. Submit the form once yourself, with any address.
3. FormSubmit mails an activation link to Jelani's inbox — tap **Activate**.

That is the whole setup. Every submission after it delivers straight
through. Until it is done, FormSubmit accepts the post and declines to
send, which the route reads as a failure (see below) rather than as a
delivered lead.

Two optional upgrades, for faster or more durable notification. Neither
replaces FormSubmit — they run **alongside** it, so a lead survives any one
channel failing:

| Variable | Effect |
|---|---|
| `ENQUIRY_WEBHOOK_URL` | Posts the enquiry to a Discord or Slack webhook, or any JSON endpoint (Zapier, Make). Arrives as a phone notification in seconds; a Discord channel webhook takes about a minute to set up. |
| `RESEND_API_KEY` + `ENQUIRY_TO` | Emails the enquiry, with the visitor's address as reply-to. `ENQUIRY_FROM` optional; a verified sending domain is required for anything but Resend's test sender. |
| `ENQUIRY_TO` (alone) | Also redirects the FormSubmit relay away from the default address. |

Behaviour worth knowing before it goes live:

- **Any channel succeeding** → `200`, and the card shows its success state.
  That state is shown on nothing else.
- **Every channel failing** (including an unactivated FormSubmit address)
  → `502`, and the card says so: it still tries the visitor's mail client,
  but it prints "couldn't send automatically", the email address, and every
  answer the visitor gave, so nothing is lost and nobody is told a lead
  landed when it did not.
- **Every enquiry is logged** to the deploy log as a `[enquiry]` line
  *before* delivery is attempted, so a lead is recoverable even if every
  channel is down.
- Submissions are capped at 5 per address per 10 minutes, and a hidden
  honeypot field drops bots without telling them.

## Media tooling and the deploy

`scripts/media/*` regenerates posters, previews, and the hero reel. Two of
its tools install badly on a deploy image, so they are **optional
dependencies**: `yt-dlp-exec` (its preinstall shells out to a Python
interpreter) and `ffmpeg-static` (downloads an ~80MB binary from GitHub).

Under `optionalDependencies` npm reports a failure and carries on instead
of aborting the whole install. That matters because a Railway Node image
has no Python, and the preinstall failing there took the entire build down
with it — `npm ci` never finished, so `npm run build` never ran.

Practically: a dev machine with Python installs everything and the media
scripts work as before. A deploy image skips what it cannot build and still
ships the site. If `npm run` of a media script reports a missing module,
that is this — install Python, then `npm install`.

## Quality gates

`npm test` runs both suites: `test:server` (14 Node assertions covering the
enquiry route's channel list, validation, honeypot, rate limit, and failure
modes) and `test:e2e` (48 Playwright assertions across desktop and mobile,
with `/api/enquiry` stubbed in the browser so no test run mails a lead).
Plus a
Lighthouse mobile run — current state: Performance 92, Accessibility 100,
Best Practices 100, SEO 100, CLS 0.

## Fonts

Clash Display, named in the handoff, is served only by Fontshare, which the
build environment blocks. The display face is Inter 800 at tight tracking —
the researched "Inter-Tight Poster" pairing — with Playfair Display Italic
reserved for pull quotes and numerals. All faces are self-hosted woff2,
latin subset, in `/public/fonts`.
