/**
 * Unit tests for the enquiry route. These run without a browser or a
 * network: `node --test`, via `npm run test:server`.
 *
 * The behaviour that matters here is not the happy path — it is that a lead
 * is never silently swallowed. Every failure mode must produce a non-OK
 * status, because that is the signal the card uses to fall back to the
 * visitor's mail client with their answers still filled in.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

const ENV_KEYS = ['ENQUIRY_WEBHOOK_URL', 'RESEND_API_KEY', 'ENQUIRY_TO', 'ENQUIRY_FROM']

/** Fresh module per test: the rate limiter holds state across calls. */
async function loadHandler(env = {}) {
  for (const key of ENV_KEYS) delete process.env[key]
  Object.assign(process.env, env)
  const mod = await import(`../../server/enquiry.js?t=${Math.random()}`)
  return mod.enquiryHandler
}

function fakeRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
  return res
}

const req = (body, ip = '1.2.3.4') => ({ body, ip })

test('unconfigured deployment reports 501 so the card falls back to mailto', async () => {
  const handler = await loadHandler()
  const res = fakeRes()

  await handler(req({ email: 'lead@brand.com' }), res)

  assert.equal(res.statusCode, 501)
  assert.equal(res.body.ok, false)
})

test('a valid enquiry is delivered and acknowledged', async (t) => {
  const sent = []
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    sent.push({ url, body: JSON.parse(init.body) })
    return { ok: true, status: 200 }
  })

  const handler = await loadHandler({ ENQUIRY_WEBHOOK_URL: 'https://hooks.example.com/x' })
  const res = fakeRes()

  await handler(
    req({ email: 'lead@brand.com', need: 'Event recap', when: 'This month', note: 'Aug 20' }),
    res,
  )

  assert.equal(res.statusCode, 200)
  assert.equal(sent.length, 1)
  assert.equal(sent[0].body.email, 'lead@brand.com')
  assert.match(sent[0].body.text, /Event recap/)
})

test('a failed delivery reports 502 rather than a false success', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 500 }))

  const handler = await loadHandler({ ENQUIRY_WEBHOOK_URL: 'https://hooks.example.com/x' })
  const res = fakeRes()

  await handler(req({ email: 'lead@brand.com' }), res)

  assert.equal(res.statusCode, 502)
})

test('an unreachable webhook reports 502 rather than throwing', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('ECONNREFUSED')
  })

  const handler = await loadHandler({ ENQUIRY_WEBHOOK_URL: 'https://hooks.example.com/x' })
  const res = fakeRes()

  await handler(req({ email: 'lead@brand.com' }), res)

  assert.equal(res.statusCode, 502)
})

test('one channel succeeding is enough', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (String(url).includes('resend')) throw new Error('resend down')
    return { ok: true, status: 200 }
  })

  const handler = await loadHandler({
    ENQUIRY_WEBHOOK_URL: 'https://hooks.example.com/x',
    RESEND_API_KEY: 'test',
    ENQUIRY_TO: 'jelaniwoods@gmail.com',
  })
  const res = fakeRes()

  await handler(req({ email: 'lead@brand.com' }), res)

  assert.equal(res.statusCode, 200)
})

test('an unusable email address is rejected before delivery', async (t) => {
  const sent = []
  t.mock.method(globalThis, 'fetch', async () => {
    sent.push(1)
    return { ok: true, status: 200 }
  })

  const handler = await loadHandler({ ENQUIRY_WEBHOOK_URL: 'https://hooks.example.com/x' })
  const res = fakeRes()

  await handler(req({ email: 'not-an-address' }), res)

  assert.equal(res.statusCode, 400)
  assert.equal(sent.length, 0)
})

test('a filled honeypot is dropped silently and never delivered', async (t) => {
  const sent = []
  t.mock.method(globalThis, 'fetch', async () => {
    sent.push(1)
    return { ok: true, status: 200 }
  })

  const handler = await loadHandler({ ENQUIRY_WEBHOOK_URL: 'https://hooks.example.com/x' })
  const res = fakeRes()

  await handler(req({ email: 'bot@spam.com', company: 'ACME Marketing' }), res)

  // 200 on purpose: a bot that can tell it was blocked is a bot that tunes.
  assert.equal(res.statusCode, 200)
  assert.equal(sent.length, 0)
})

test('a flood from one address is capped, and other visitors are unaffected', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, status: 200 }))

  const handler = await loadHandler({ ENQUIRY_WEBHOOK_URL: 'https://hooks.example.com/x' })
  const codes = []

  for (let i = 0; i < 7; i++) {
    const res = fakeRes()
    await handler(req({ email: `flood${i}@spam.com` }, '9.9.9.9'), res)
    codes.push(res.statusCode)
  }

  assert.equal(codes.filter((c) => c === 200).length, 5)
  assert.ok(codes.slice(-2).every((c) => c === 429))

  const other = fakeRes()
  await handler(req({ email: 'real@brand.com' }, '5.5.5.5'), other)
  assert.equal(other.statusCode, 200)
})

test('overlong fields are truncated, not rejected', async (t) => {
  const sent = []
  t.mock.method(globalThis, 'fetch', async (_url, init) => {
    sent.push(JSON.parse(init.body))
    return { ok: true, status: 200 }
  })

  const handler = await loadHandler({ ENQUIRY_WEBHOOK_URL: 'https://hooks.example.com/x' })
  const res = fakeRes()

  await handler(req({ email: 'lead@brand.com', note: 'x'.repeat(5000) }), res)

  assert.equal(res.statusCode, 200)
  assert.equal(sent[0].note.length, 2000)
})

test('Discord and Slack each get the payload shape they accept', async (t) => {
  const shapes = []
  t.mock.method(globalThis, 'fetch', async (_url, init) => {
    shapes.push(JSON.parse(init.body))
    return { ok: true, status: 200 }
  })

  for (const url of [
    'https://discord.com/api/webhooks/1/abc',
    'https://hooks.slack.com/services/T/B/x',
  ]) {
    const handler = await loadHandler({ ENQUIRY_WEBHOOK_URL: url })
    await handler(req({ email: 'lead@brand.com' }), fakeRes())
  }

  assert.ok(shapes[0].content, 'Discord takes `content`')
  assert.equal(shapes[0].text, undefined)
  assert.ok(shapes[1].text, 'Slack takes `text`')
  assert.equal(shapes[1].content, undefined)
})
