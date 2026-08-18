/**
 * Unit tests for the enquiry route. These run without a browser or a
 * network: `node --test`, via `npm run test:server`.
 *
 * The behaviour that matters here is not the happy path — it is that a lead
 * is never silently swallowed. Every failure mode must produce a non-OK
 * status, because that is the signal the card uses to stop claiming success
 * and show the visitor their answers with the address to send them to.
 *
 * Since FormSubmit became the always-present channel, every submission
 * makes a request whether or not anything is configured, so `fetch` is
 * mocked in every test that gets as far as delivery.
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

/** FormSubmit's own success shape: 200, and `"true"` as a string, not a boolean. */
const formSubmitOk = { ok: true, status: 200, json: async () => ({ success: 'true' }) }

/** Everything posted to FormSubmit, from a run's recorded calls. */
const toFormSubmit = (calls) => calls.filter((c) => String(c.url).includes('formsubmit.co'))
const toWebhook = (calls) => calls.filter((c) => !String(c.url).includes('formsubmit.co'))

test('an unconfigured deployment still delivers, through FormSubmit', async (t) => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) })
    return formSubmitOk
  })

  // No environment variables at all — the state a fresh Railway deploy is in.
  const handler = await loadHandler()
  const res = fakeRes()

  await handler(
    req({
      email: 'lead@brand.com',
      need: 'Event recap',
      for: 'Paid ads',
      when: 'This month',
      note: 'Aug 20',
    }),
    res,
  )

  assert.equal(res.statusCode, 200)
  assert.equal(res.body.ok, true)

  const [call] = toFormSubmit(calls)
  assert.ok(call, 'FormSubmit is in the channel list with nothing configured')
  assert.equal(call.url, 'https://formsubmit.co/ajax/xoxoksh05@gmail.com')

  // The relay has to arrive readable, and reply-to has to be the visitor so
  // answering the notification answers the lead.
  assert.equal(call.body._subject, 'New enquiry — Event recap')
  assert.equal(call.body._replyto, 'lead@brand.com')
  assert.equal(call.body._captcha, 'false')
  assert.equal(call.body._template, 'box')
  assert.equal(call.body['What they need'], 'Event recap')
  assert.equal(call.body["What it's for"], 'Paid ads')
  assert.equal(call.body.Timing, 'This month')
  assert.equal(call.body.Note, 'Aug 20')
})

test('ENQUIRY_TO redirects the FormSubmit relay', async (t) => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) })
    return formSubmitOk
  })

  const handler = await loadHandler({ ENQUIRY_TO: 'bookings@studioimpetus.ca' })
  await handler(req({ email: 'lead@brand.com' }), fakeRes())

  assert.equal(toFormSubmit(calls)[0].url, 'https://formsubmit.co/ajax/bookings@studioimpetus.ca')
})

test('FormSubmit answering 200 with success:"false" is a failure, not a delivery', async (t) => {
  // What an address that has never been activated actually returns.
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    status: 200,
    json: async () => ({ success: 'false', message: 'The email address is not activated' }),
  }))

  const handler = await loadHandler()
  const res = fakeRes()

  await handler(req({ email: 'lead@brand.com' }), res)

  assert.equal(res.statusCode, 502)
})

test('a non-2xx from FormSubmit is a failure too', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: false,
    status: 429,
    json: async () => ({ success: 'false' }),
  }))

  const handler = await loadHandler()
  const res = fakeRes()

  await handler(req({ email: 'lead@brand.com' }), res)

  assert.equal(res.statusCode, 502)
})

test('a configured channel runs alongside FormSubmit, not instead of it', async (t) => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) })
    return formSubmitOk
  })

  const handler = await loadHandler({ ENQUIRY_WEBHOOK_URL: 'https://hooks.example.com/x' })
  const res = fakeRes()

  await handler(
    req({ email: 'lead@brand.com', need: 'Event recap', when: 'This month', note: 'Aug 20' }),
    res,
  )

  assert.equal(res.statusCode, 200)
  assert.equal(toWebhook(calls).length, 1)
  assert.equal(toFormSubmit(calls).length, 1)
  assert.equal(toWebhook(calls)[0].body.email, 'lead@brand.com')
  assert.match(toWebhook(calls)[0].body.text, /Event recap/)
})

test('the qualifying answer reaches every channel', async (t) => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) })
    return formSubmitOk
  })

  const handler = await loadHandler({ ENQUIRY_WEBHOOK_URL: 'https://hooks.example.com/x' })
  await handler(req({ email: 'lead@brand.com', for: 'Organic social' }), fakeRes())

  assert.equal(toWebhook(calls)[0].body.for, 'Organic social')
  assert.match(toWebhook(calls)[0].body.text, /What it's for: Organic social/)
  assert.equal(toFormSubmit(calls)[0].body["What it's for"], 'Organic social')
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
    return formSubmitOk
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
  t.mock.method(globalThis, 'fetch', async () => formSubmitOk)

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
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) })
    return formSubmitOk
  })

  const handler = await loadHandler({ ENQUIRY_WEBHOOK_URL: 'https://hooks.example.com/x' })
  const res = fakeRes()

  await handler(req({ email: 'lead@brand.com', note: 'x'.repeat(5000), for: 'y'.repeat(500) }), res)

  assert.equal(res.statusCode, 200)
  assert.equal(toWebhook(calls)[0].body.note.length, 2000)
  assert.equal(toWebhook(calls)[0].body.for.length, 80)
})

test('Discord and Slack each get the payload shape they accept', async (t) => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) })
    return formSubmitOk
  })

  for (const url of [
    'https://discord.com/api/webhooks/1/abc',
    'https://hooks.slack.com/services/T/B/x',
  ]) {
    const handler = await loadHandler({ ENQUIRY_WEBHOOK_URL: url })
    await handler(req({ email: 'lead@brand.com' }), fakeRes())
  }

  // FormSubmit rides along on every submission now, so pick out the two
  // webhook posts rather than trusting call order.
  const shapes = toWebhook(calls).map((c) => c.body)
  assert.equal(shapes.length, 2)
  assert.ok(shapes[0].content, 'Discord takes `content`')
  assert.equal(shapes[0].text, undefined)
  assert.ok(shapes[1].text, 'Slack takes `text`')
  assert.equal(shapes[1].content, undefined)
})
