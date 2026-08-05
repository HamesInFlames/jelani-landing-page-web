/**
 * Lead capture for the enquiry card.
 *
 * The card used to hand every enquiry to the visitor's mail client. That
 * works, but it loses any lead whose visitor never presses send in the
 * window that pops up — and on mobile it often opens nothing at all. This
 * endpoint takes the submission server-side instead.
 *
 * Delivery is deliberately configuration-driven, and the fallback is the
 * point: when nothing is configured the route answers 501 and the card
 * drops back to the mailto it uses today. Setting one environment variable
 * turns real capture on; setting none changes nothing. Either way the
 * enquiry is written to the process log first, so a lead survives even a
 * total delivery failure.
 *
 *   ENQUIRY_WEBHOOK_URL  Discord, Slack, or any JSON endpoint (Zapier etc.)
 *   RESEND_API_KEY       with ENQUIRY_TO (+ optional ENQUIRY_FROM) for email
 */

const MAX_FIELD = { email: 200, need: 80, when: 80, note: 2000 }

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
    `Timing: ${enquiry.when || '—'}`,
    `Reply to: ${enquiry.email}`,
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

function channels() {
  const list = []
  if (process.env.ENQUIRY_WEBHOOK_URL) {
    list.push({ name: 'webhook', send: (e) => postWebhook(process.env.ENQUIRY_WEBHOOK_URL, e) })
  }
  if (process.env.RESEND_API_KEY && process.env.ENQUIRY_TO) {
    list.push({ name: 'email', send: sendEmail })
  }
  return list
}

export function enquiryHandler(req, res) {
  const configured = channels()

  // Nothing wired up: say so plainly and let the card fall back to mailto.
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
    need: clean(payload.need, MAX_FIELD.need),
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
  // is a success, total failure sends the card back to its mailto path
  // with everything the visitor typed still filled in.
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
