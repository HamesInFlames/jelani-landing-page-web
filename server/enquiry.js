/**
 * Lead capture for the enquiry card.
 *
 * The card used to hand every enquiry to the visitor's mail client. That
 * works, but it loses any lead whose visitor never presses send in the
 * window that pops up — and on mobile it often opens nothing at all. This
 * endpoint takes the submission server-side instead.
 *
 * Delivery needs no configuration. FormSubmit is always in the channel
 * list, so a fresh deployment with no environment variables at all still
 * relays every enquiry to Jelani's inbox — the setup is one tap on the
 * activation email FormSubmit sends the first time, which can be done from
 * a phone. The environment variables below are upgrades, not requirements,
 * and they run *alongside* FormSubmit rather than instead of it, so a lead
 * survives any one channel failing.
 *
 *   ENQUIRY_WEBHOOK_URL  Discord, Slack, or any JSON endpoint (Zapier etc.)
 *   RESEND_API_KEY       with ENQUIRY_TO (+ optional ENQUIRY_FROM) for email
 *   ENQUIRY_TO           also redirects the FormSubmit relay away from the
 *                        default address
 *
 * Either way the enquiry is written to the process log before any delivery
 * is attempted, so a lead survives even a total delivery failure.
 */

/**
 * Where FormSubmit relays to when nothing is configured.
 *
 * TEMPORARY (2026-08-18): pointed at James's address so he can complete the
 * one-time FormSubmit activation himself and prove the pipeline end to end,
 * rather than waiting on Jelani to tap a link in his own inbox. Once that
 * test passes this goes back to the address the page prints publicly —
 * 'jelaniwoods@gmail.com' — or is set per deployment via ENQUIRY_TO.
 */
const DEFAULT_ENQUIRY_TO = 'xoxoksh05@gmail.com'

const MAX_FIELD = { email: 200, phone: 40, need: 80, for: 80, when: 80, note: 2000 }

// One visitor, one enquiry, is the normal case; the allowance is set well
// above that so a genuine second thought never hits a wall, and far below
// what would make the webhook worth abusing.
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 }
const hits = new Map()

function rateLimited(ip, now) {
  const seen = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs)
  seen.push(now)
  hits.set(ip, seen)

  // The map only grows while traffic does; prune expired buckets opportunistically.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_LIMIT.windowMs)) hits.delete(key)
    }
  }

  return seen.length > RATE_LIMIT.max
}

function clean(value, max) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, max)
}

/** Deliberately permissive: rejecting odd-but-valid addresses costs a lead. */
function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function format(enquiry) {
  return [
    '**New enquiry from the website**',
    `What they need: ${enquiry.need || '—'}`,
    `What it's for: ${enquiry.for || '—'}`,
    `Timing: ${enquiry.when || '—'}`,
    `Reply to: ${enquiry.email}`,
    `Phone: ${enquiry.phone || '(not given)'}`,
    '',
    enquiry.note || '(no additional note)',
  ].join('\n')
}

async function postWebhook(url, enquiry) {
  const message = format(enquiry)
  const { hostname } = new URL(url)

  // Discord and Slack each accept exactly one shape; anything else is
  // assumed to be a generic automation endpoint that would rather have the
  // fields than the prose, so it gets both.
  const body = hostname.endsWith('slack.com')
    ? { text: message }
    : hostname.endsWith('discord.com') || hostname.endsWith('discordapp.com')
      ? { content: message }
      : { text: message, ...enquiry }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) throw new Error(`webhook responded ${res.status}`)
}

async function sendEmail(enquiry) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.ENQUIRY_FROM || 'Website <onboarding@resend.dev>',
      to: [process.env.ENQUIRY_TO],
      reply_to: enquiry.email,
      subject: `New enquiry — ${enquiry.need || 'website'}`,
      text: format(enquiry),
    }),
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) throw new Error(`resend responded ${res.status}`)
}

/**
 * The zero-setup channel. FormSubmit relays a JSON post to an email address
 * with no account, no API key, and no environment variable — the only setup
 * is the activation link it mails to that address the first time something
 * is submitted, which is one tap from a phone.
 *
 * Readable keys, not our field names: whatever comes out the other end is
 * what Jelani reads in his inbox.
 */
async function postFormSubmit(enquiry, origin) {
  // The address goes into the path unescaped, as FormSubmit documents it —
  // `@` is legal in a path segment, and percent-encoding it is not something
  // their endpoint promises to undo.
  const to = (process.env.ENQUIRY_TO || DEFAULT_ENQUIRY_TO).trim()

  const res = await fetch(`https://formsubmit.co/ajax/${to}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // FormSubmit refuses any request that arrives without browser origin
      // headers, answering "Make sure you open this page through a web
      // server, FormSubmit will not work in pages browsed as HTML files."
      // That message is about a missing Referer, not about HTML files, and
      // a server-to-server fetch never sends one. We forward the origin the
      // visitor actually submitted from, so the header names the real
      // deployment rather than anything hardcoded here.
      ...(origin ? { Origin: origin, Referer: `${origin}/` } : {}),
    },
    body: JSON.stringify({
      _subject: `New enquiry — ${enquiry.need || 'website'}`,
      _replyto: enquiry.email,
      _captcha: 'false',
      _template: 'box',
      'What they need': enquiry.need || '—',
      "What it's for": enquiry.for || '—',
      Timing: enquiry.when || '—',
      Email: enquiry.email,
      Phone: enquiry.phone || '(not given)',
      Note: enquiry.note || '(no additional note)',
    }),
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) throw new Error(`formsubmit responded ${res.status}`)

  // A 200 is not proof of delivery: FormSubmit answers 200 with
  // {"success":"false"} when the address has never been activated, and it
  // sends those flags as strings rather than booleans. Anything we cannot
  // read as an explicit success counts as a failure, because the visitor
  // must not be shown a success screen the lead did not earn.
  let payload = null
  try {
    payload = await res.json()
  } catch {
    payload = null
  }

  if (String(payload?.success).toLowerCase() !== 'true') {
    throw new Error(`formsubmit declined: ${payload?.message ?? 'no success flag in the response'}`)
  }
}

/**
 * The URL the visitor submitted from, for FormSubmit's benefit.
 *
 * A browser sends `Origin` on a cross-document POST, but we cannot rely on
 * it, so the host header is the fallback — behind Railway's TLS termination
 * the scheme only survives in `x-forwarded-proto`.
 */
function siteOrigin(req) {
  const headers = req.headers ?? {}
  if (headers.origin) return headers.origin
  if (!headers.host) return null
  const proto = String(headers['x-forwarded-proto'] || 'https').split(',')[0].trim()
  return `${proto}://${headers.host}`
}

function channels(origin) {
  const list = []
  if (process.env.ENQUIRY_WEBHOOK_URL) {
    list.push({ name: 'webhook', send: (e) => postWebhook(process.env.ENQUIRY_WEBHOOK_URL, e) })
  }
  if (process.env.RESEND_API_KEY && process.env.ENQUIRY_TO) {
    list.push({ name: 'email', send: sendEmail })
  }
  // Always last, and always present: the configured channels are the fast
  // ones, FormSubmit is the one that works on a deployment nobody has
  // touched. Its presence is what keeps this list from ever being empty.
  list.push({ name: 'formsubmit', send: (e) => postFormSubmit(e, origin) })
  return list
}

export function enquiryHandler(req, res) {
  const configured = channels(siteOrigin(req))

  // Unreachable while FormSubmit sits in the list, and kept anyway: if a
  // future change ever makes every channel conditional again, 501 is the
  // honest answer and the card already knows how to handle it.
  if (configured.length === 0) {
    return res.status(501).json({ ok: false, reason: 'no delivery channel configured' })
  }

  if (rateLimited(req.ip || 'unknown', Date.now())) {
    return res.status(429).json({ ok: false, reason: 'too many submissions' })
  }

  const payload = req.body ?? {}

  // Honeypot. A real visitor never sees this field, so anything in it is a
  // bot — accepted with a 200 so the bot has no signal to tune against.
  if (clean(payload.company, 100)) return res.status(200).json({ ok: true })

  const enquiry = {
    email: clean(payload.email, MAX_FIELD.email),
    // Optional: offered because a number closes an event booking faster,
    // never required, and never validated — see the card for why.
    phone: clean(payload.phone, MAX_FIELD.phone),
    need: clean(payload.need, MAX_FIELD.need),
    // Added with the qualifying step in the card ("What's the content
    // for?") — it is the field that tells Jelani how to quote.
    for: clean(payload.for, MAX_FIELD.for),
    when: clean(payload.when, MAX_FIELD.when),
    note: clean(payload.note, MAX_FIELD.note),
  }

  if (!looksLikeEmail(enquiry.email)) {
    return res.status(400).json({ ok: false, reason: 'a valid email address is required' })
  }

  // Logged before any delivery is attempted: if every channel is down, the
  // lead is still recoverable from the deploy logs.
  console.log(`[enquiry] ${JSON.stringify({ at: new Date().toISOString(), ...enquiry })}`)

  // Answering before delivery would be faster, but a webhook that quietly
  // failed would leave the visitor looking at a success screen and the
  // enquiry nowhere Jelani checks. Wait, then tell the truth: any success
  // is a success, total failure returns non-OK and the card says so on
  // screen with everything the visitor typed still in front of them.
  return Promise.allSettled(configured.map((c) => c.send(enquiry).then(() => c.name))).then(
    (results) => {
      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          console.error(`[enquiry] ${configured[i].name} delivery failed: ${result.reason.message}`)
        }
      })

      if (results.some((r) => r.status === 'fulfilled')) {
        return res.status(200).json({ ok: true })
      }
      return res.status(502).json({ ok: false, reason: 'delivery failed' })
    },
  )
}
