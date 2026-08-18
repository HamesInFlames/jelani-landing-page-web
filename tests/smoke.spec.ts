import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/** Scroll the page in instant jumps so every scroll-reveal fires. */
async function revealAll(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto'
    const step = Math.round(window.innerHeight * 0.6)
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 160))
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.waitForTimeout(900)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('prerendered markup hydrates without console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('/')
  await page.waitForTimeout(1500)

  expect(errors.filter((e) => /hydrat|did not match|mismatch/i.test(e))).toEqual([])
  expect(errors).toEqual([])
})

test('the page ships prerendered, not as an empty shell', async ({ request }) => {
  const html = await (await request.get('/')).text()

  // The headline is split one <span> per word for the entrance, so match a
  // word rather than the whole sentence.
  expect(html).toContain('activation')
  expect(html).toContain('Duane Notice')
  expect(html).toContain('Most event content never runs.')
  expect(html).toContain('Have an event coming up?')
  expect(html).not.toContain('<div id="root"></div>')

  // CSS is folded into the document, so no render-blocking stylesheet link.
  expect(html).not.toMatch(/<link rel="stylesheet"/)
})

test('hero renders the headline, the proof line, and both calls to action', async ({ page }) => {
  // Exact match, not `toContainText`: the headline is split per word for the
  // entrance animation, and a collapsed separator silently glues words
  // together ("brandevents.") while still passing a loose assertion.
  expect((await page.getByRole('heading', { level: 1 }).innerText()).replace(/\s+/g, ' ')).toBe(
    "Your activation is over in six hours. Your content shouldn't take three weeks.",
  )

  // The proof line rides the hero's CSS entrance, so it must be legible
  // without waiting on hydration or a scroll.
  await expect(
    page.getByText(
      'Bioderma · Soluna · Canergy · Reset Studio · Camp Dreamwood · Featured on Sportsnet',
    ),
  ).toBeVisible()

  await expect(page.getByRole('link', { name: 'Book a call' }).first()).toHaveAttribute(
    'href',
    '#contact',
  )
  await expect(page.getByRole('link', { name: /See the work/ })).toHaveAttribute('href', '#work')
})

test('every section is present and visible after scrolling', async ({ page }) => {
  await revealAll(page)

  for (const id of ['problem', 'work', 'services', 'why', 'about', 'contact']) {
    await expect(page.locator(`#${id}`)).toBeVisible()
  }

  // Nothing may be left stranded at opacity 0 by the reveal animation.
  const dim = await page.evaluate(() =>
    Array.from(document.querySelectorAll('h2, h3'))
      .filter((h) => (h as HTMLElement).getBoundingClientRect().width > 0)
      .map((h) => {
        let node: HTMLElement | null = h as HTMLElement
        let min = 1
        while (node && node !== document.body) {
          min = Math.min(min, parseFloat(getComputedStyle(node).opacity))
          node = node.parentElement
        }
        return { text: h.textContent?.slice(0, 40) ?? '', opacity: min }
      })
      .filter((r) => r.opacity < 0.9),
  )
  expect(dim).toEqual([])
})

test('the work gallery lists the real credits', async ({ page }) => {
  await revealAll(page)
  const work = page.locator('#work')

  await expect(work.getByText('Featured · Sportsnet')).toBeVisible()
  await expect(work.getByRole('heading', { name: "Duane Notice's Battle Back From Injury" })).toBeVisible()
  await expect(work.getByRole('heading', { name: 'Camp Dreamwood — Weekly Recap' })).toBeVisible()
  await expect(work.getByRole('heading', { name: 'Soluna — Event Recap' })).toBeVisible()
  await expect(work.getByRole('heading', { name: 'Canergy — Studio Activation' })).toBeVisible()

  // BeeVibe was removed 2026-08-05 — it was the only card with no artwork.
  // Asserting the name is absent catches a restore that brings back the
  // empty gradient plate along with it.
  expect(await page.content()).not.toContain('BeeVibe')

  // Stronger than the name check: every work card now ships a real image,
  // so no card should be falling back to the generated plate that
  // LiteYouTube paints when `poster` is null. One of these means a card was
  // added without its artwork.
  await expect(work.locator('[style*="linear-gradient"]')).toHaveCount(0)

  // The Reels group was pulled 2026-08-05 — the section header must be gone
  // too, not left behind as an empty heading.
  await expect(work.getByText('Shooting and cutting, in ninety seconds.')).toHaveCount(0)

  // Cut by client decision — must never reappear. KuuIsQKZmw4 is the Cover
  // Letter video's YouTube ID; asserting on it catches a re-wire that
  // dodges the title string.
  await expect(page.getByText(/BuildApe/i)).toHaveCount(0)
  await expect(page.getByText(/Cover Letter/i)).toHaveCount(0)
  expect(await page.content()).not.toContain('KuuIsQKZmw4')
})

test('every linked film plays through its own facade, never at rest', async ({ page }) => {
  await revealAll(page)

  // Every linked card is wired with self-hosted artwork; no element
  // anywhere references YouTube's image CDN.
  const cards = page.locator('#work button[aria-label^="Play"]')
  expect(await cards.count()).toBeGreaterThanOrEqual(5)
  expect(await page.content()).not.toContain('i.ytimg.com')

  // Cut for conflicting with the brief's no-fitness-content rule; its ID
  // must not reappear the way the Cover Letter video's must not.
  expect(await page.content()).not.toContain('LTD6Zqn1vq0')

  // The showreels were pulled 2026-08-05; their IDs must not come back by
  // way of a stale poster or a half-reverted group.
  for (const id of ['0BmqVLkam-g', '42abljCvlbc', 'rTFInFnpJa8']) {
    expect(await page.content()).not.toContain(id)
  }

  // Clicking the featured card mounts exactly one nocookie iframe.
  await page.getByRole('button', { name: "Play Duane Notice's Battle Back From Injury" }).click()
  const iframe = page.locator('iframe')
  await expect(iframe).toHaveCount(1)
  await expect(iframe).toHaveAttribute('src', /youtube-nocookie\.com\/embed\/CavSj2reqa4/)
})

test('the beauty strip renders its four portraits with descriptive alt', async ({ page }) => {
  await revealAll(page)
  const beauty = page.locator('#work img[src*="/media/photos/beauty-"]')
  expect(await beauty.count()).toBe(4)

  const bad = await beauty.evaluateAll((imgs) =>
    (imgs as HTMLImageElement[])
      .filter((img) => !img.alt.trim() || (img.complete && img.naturalWidth === 0))
      .map((img) => img.src),
  )
  expect(bad).toEqual([])

  await expect(page.getByRole('heading', { name: 'Star Villas Costa Rica' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Luxury Villa UGC' })).toBeVisible()
})

test('the problem and why-me sections carry the playbook argument', async ({ page }) => {
  await revealAll(page)

  const problem = page.locator('#problem')
  await expect(problem.getByRole('heading', { name: 'Most event content never runs.' })).toBeVisible()
  await expect(problem.getByText(/I work backwards from the post date/)).toBeVisible()

  const why = page.locator('#why')
  await expect(
    why.getByRole('heading', { name: 'A DP who came up as a project manager.' }),
  ).toBeVisible()
  await expect(why.getByText(/both sides of the brief/)).toBeVisible()
})

test('pricing states the fixed tiers and never discounts them', async ({ page }) => {
  await revealAll(page)
  const pricing = page.locator('#pricing')

  for (const figure of ['From $2,000 / day', 'From $1,000', 'From $3,000 / quarter']) {
    await expect(pricing.getByText(figure, { exact: true })).toBeVisible()
  }

  // The per-unit anchor came off on 2026-08-17 — a page that opens on $100
  // an edit teaches the buyer to argue about unit counts. It is a closing
  // tool on a call now, and must not creep back into public copy.
  const anchors = (await pricing.textContent())!
  expect(anchors).not.toContain('$100')
  expect(anchors).not.toMatch(/per edit|10 edits|20 edits/i)
  expect(await page.content()).not.toContain('$100')

  // Exactly one featured tier, distinguished by the included strategy.
  await expect(pricing.getByText('Strategy included', { exact: true })).toHaveCount(2) // tag + foot line
  await expect(pricing.getByRole('heading', { name: 'Quarterly partner' })).toBeVisible()

  // Guard against discount-language drift — the model's rule is no
  // discounts, ever, and copy edits must not soften it. Disclaiming them
  // ("no discounts") is the stance itself and stays allowed.
  const pricingText = (await pricing.textContent())!.replace(/no discounts?/gi, '')
  expect(pricingText).not.toMatch(/discount|% ?off|\bsave\b/i)

  // Every tier's ask lands on the enquiry card.
  const links = pricing.getByRole('link', { name: 'Start with this' })
  expect(await links.count()).toBe(3)
  for (let i = 0; i < 3; i += 1) {
    await expect(links.nth(i)).toHaveAttribute('href', '#contact')
  }
})

test('no third-party embed loads until a card is clicked', async ({ page }) => {
  await revealAll(page)
  expect(await page.locator('iframe').count()).toBe(0)
})

test('the CTA card walks through its four steps and keeps a stable height', async ({ page }) => {
  const card = page.locator('#contact .card')
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(700)

  const startHeight = (await card.boundingBox())?.height ?? 0

  await expect(page.getByRole('heading', { name: 'What do you need?' })).toBeVisible()
  await page.getByRole('button', { name: 'Event recap' }).click()

  // The qualifying step, added 2026-08-17: what the content is for is what
  // makes a quote possible before the call happens.
  await expect(page.getByRole('heading', { name: "What's the content for?" })).toBeVisible()
  await page.getByRole('button', { name: 'Paid ads' }).click()

  await expect(page.getByRole('heading', { name: 'When do you need it?' })).toBeVisible()
  await page.getByRole('button', { name: 'This month' }).click()

  await expect(page.getByRole('heading', { name: 'Where can I reach you?' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Send it' })).toBeVisible()

  const endHeight = (await card.boundingBox())?.height ?? 0
  expect(Math.abs(endHeight - startHeight)).toBeLessThanOrEqual(2)

  // Back returns to the previous question with the answer still selected.
  await page.getByRole('button', { name: '← Back' }).click()
  await expect(page.getByRole('heading', { name: 'When do you need it?' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'This month' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('the hero loops muted footage and reserves its staging runway', async ({ page }) => {
  const hero = page.locator('#top')
  const video = hero.locator('video')

  await expect(video).toHaveCount(1)
  await expect(video).toHaveAttribute('poster', /reel-poster/)
  // Lazy by construction: src is attached after first paint, so the LCP is
  // never the video download.
  await expect(video).toHaveAttribute('preload', 'none')
  expect(await video.evaluate((el: HTMLVideoElement) => el.muted)).toBe(true)
  expect(await video.evaluate((el: HTMLVideoElement) => el.loop)).toBe(true)

  // The staged section reserves its full runway up front — no CLS.
  const height = await hero.evaluate((el) => el.getBoundingClientRect().height)
  const viewport = page.viewportSize()!.height
  expect(height).toBeGreaterThanOrEqual(viewport * 2.5)
})

test('scrolling the hero swaps in the later information panels', async ({ page }) => {
  const hero = page.locator('#top')
  const runway = await hero.evaluate((el) => el.getBoundingClientRect().height)

  // Panel 3 carries the credibility strip; it must be invisible at the top
  // and legible once the visitor has scrolled through the hero.
  const proof = page.getByText(
    'Toronto + GTA · Founder, Studio Impetus · Former agency DP & project manager',
  )
  const opacityOf = async () =>
    Number(
      await proof.evaluate((el) => {
        let node: HTMLElement | null = el as HTMLElement
        let min = 1
        while (node && node !== document.body) {
          min = Math.min(min, parseFloat(getComputedStyle(node).opacity))
          node = node.parentElement
        }
        return String(min)
      }),
    )

  expect(await opacityOf()).toBeLessThan(0.1)

  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), runway * 0.92)
  await page.waitForTimeout(700)
  expect(await opacityOf()).toBeGreaterThan(0.8)
})

test('reduced motion gives a still hero, one viewport tall, with no autoplay', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForTimeout(800)

  const hero = page.locator('#top')
  const viewport = page.viewportSize()!.height
  const height = await hero.evaluate((el) => el.getBoundingClientRect().height)
  expect(height).toBeLessThanOrEqual(viewport * 1.2)

  // The poster carries the image; the clip is never fetched or played.
  const video = hero.locator('video')
  await expect(video).toHaveAttribute('poster', /reel-poster/)
  expect(await video.evaluate((el: HTMLVideoElement) => el.currentSrc)).toBe('')

  // Panel 1's full copy reads without any scrolling theatre.
  expect((await page.getByRole('heading', { level: 1 }).innerText()).replace(/\s+/g, ' ')).toBe(
    "Your activation is over in six hours. Your content shouldn't take three weeks.",
  )

  // No card preview plays either.
  await revealAll(page)
  const playing = await page.locator('#work video').evaluateAll((vids) =>
    (vids as HTMLVideoElement[]).filter((v) => !v.paused).length,
  )
  expect(playing).toBe(0)
})

test('card previews are silent, lazy, and paused when off screen', async ({ page }) => {
  await revealAll(page)

  // Five since the showreels came off on 2026-08-05: the two event recaps
  // and the three shorts. The floor exists so this test cannot quietly pass
  // by finding nothing at all.
  const previews = page.locator('#work video')
  expect(await previews.count()).toBeGreaterThanOrEqual(5)

  const offenders = await previews.evaluateAll((vids) =>
    (vids as HTMLVideoElement[])
      .filter((v) => !v.muted || v.getAttribute('preload') !== 'none' || !v.loop)
      .map((v) => v.currentSrc || '(no src)'),
  )
  expect(offenders).toEqual([])

  // Scrolled back to the top, nothing in the work gallery should be running.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(900)
  const stillPlaying = await previews.evaluateAll((vids) =>
    (vids as HTMLVideoElement[]).filter((v) => !v.paused).length,
  )
  expect(stillPlaying).toBe(0)
})

test('cards stay quiet at rest — no badges, no notes over the artwork', async ({ page }) => {
  await revealAll(page)
  const work = page.locator('#work')

  await expect(work.getByText('Film linking soon')).toHaveCount(0)
  await expect(work.getByText('Coming soon')).toHaveCount(0)

  // Context still reaches assistive tech through the button label even
  // though the resting card no longer prints the client name.
  await expect(
    page.getByRole('button', { name: 'Play Camp Dreamwood — Weekly Recap — Camp Dreamwood' }),
  ).toBeVisible()

  // Cards without a film (Soluna, Bioderma) are plates, not dead players.
  await expect(page.getByRole('button', { name: /Play Soluna/ })).toHaveCount(0)
})

test('the process section walks its four steps, and nothing else', async ({ page }) => {
  await revealAll(page)
  const process = page.locator('#process')

  await expect(process.getByRole('heading', { name: 'From first call to final cut.' })).toBeVisible()
  for (const step of ['Book a call', 'Creative brief', 'Shoot day', 'Fast delivery']) {
    await expect(process.getByRole('heading', { name: step })).toBeVisible()
  }

  // The evidence block (brief page, shoot-day phone strip, bundle line) was
  // removed 2026-08-05. The section is the four steps now — a stray image
  // here means a half-revert, and the files it would need are gone.
  await expect(process.locator('img[src*="brief-page"]')).toHaveCount(0)
  await expect(process.locator('img[src*="bts-"]')).toHaveCount(0)
  await expect(process.locator('img')).toHaveCount(0)
})

test('the photography wall ships real stills, fully loaded', async ({ page }) => {
  await revealAll(page)
  const photos = page.locator('#work img[src*="/media/photos/photo-"]')
  expect(await photos.count()).toBeGreaterThanOrEqual(9)

  const broken = await photos.evaluateAll((imgs) =>
    (imgs as HTMLImageElement[])
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.src),
  )
  expect(broken).toEqual([])
})

test('the enquiry flow offers the video + photo bundle', async ({ page }) => {
  const card = page.locator('#contact .card')
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(700)
  await expect(page.getByRole('button', { name: 'Video + Photo bundle' })).toBeVisible()
})

test('the enquiry route is mounted and has a delivery channel with no env vars', async ({
  request,
}) => {
  // Deliberately invalid: validation runs *after* the channel check and
  // before any delivery, so a 400 proves the route is mounted (not 404),
  // proves a channel is configured (a 501 would mean the list was empty —
  // FormSubmit is meant to make that impossible), and sends nothing to
  // anyone's inbox in the process.
  const res = await request.post('/api/enquiry', {
    data: { email: 'not-an-address', need: 'Event recap' },
  })

  expect(res.status()).toBe(400)
})

test('the card shows success only on a real 2xx from our server', async ({ page }) => {
  // Stubbed at the browser rather than let through: a live POST would relay
  // an invented lead to Jelani's actual inbox.
  const posted: Record<string, string>[] = []
  await page.route('**/api/enquiry', async (route) => {
    posted.push(route.request().postDataJSON())
    await route.fulfill({ status: 200, json: { ok: true } })
  })

  const card = page.locator('#contact .card')
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(700)

  await page.getByRole('button', { name: 'Event recap' }).click()
  await page.getByRole('button', { name: 'Paid ads' }).click()
  await page.getByRole('button', { name: 'This month' }).click()
  await page.locator('#cta-email').fill('lead@brand.com')
  await page.getByRole('button', { name: 'Send it' }).click()

  await expect(page.getByText("Got it — I'll be in touch.")).toBeVisible()

  // Every answer reaches the server, including the qualifying step.
  expect(posted).toHaveLength(1)
  expect(posted[0]).toMatchObject({
    need: 'Event recap',
    for: 'Paid ads',
    when: 'This month',
    email: 'lead@brand.com',
  })
})

test('a failed send says so, and keeps the visitor’s answers on screen', async ({ page }) => {
  await page.route('**/api/enquiry', (route) =>
    route.fulfill({ status: 502, json: { ok: false, reason: 'delivery failed' } }),
  )

  const card = page.locator('#contact .card')
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(700)

  await page.getByRole('button', { name: 'Event recap' }).click()
  await page.getByRole('button', { name: 'Paid ads' }).click()
  await page.getByRole('button', { name: 'This month' }).click()
  await page.locator('#cta-email').fill('lead@brand.com')
  await page.locator('#cta-phone').fill('(416) 555-0134')
  await page.locator('#cta-note').fill('Launch night, Aug 20')

  // The mailto handoff would navigate the page away; intercept it so the
  // assertion is about the fallback state, not about the mail client.
  const handoff = page.waitForRequest((r) => r.url().startsWith('mailto:'), { timeout: 5000 })
  await page.getByRole('button', { name: 'Send it' }).click()

  // The honest state, not the tick: claiming success here is exactly the
  // bug this replaced.
  await expect(page.getByText("Couldn't send automatically.")).toBeVisible()
  await expect(page.getByText("Got it — I'll be in touch.")).toHaveCount(0)

  // The address is tappable, and nothing the visitor typed is lost.
  const fallback = page.locator('#contact .card').getByRole('link', {
    name: 'jelaniwoods@gmail.com',
  })
  await expect(fallback).toHaveAttribute('href', 'mailto:jelaniwoods@gmail.com')
  for (const answer of [
    'Event recap',
    'Paid ads',
    'This month',
    'lead@brand.com',
    '(416) 555-0134',
    'Launch night, Aug 20',
  ]) {
    await expect(card.getByText(answer, { exact: true })).toBeVisible()
  }

  await handoff.catch(() => {
    // Chromium may swallow the mailto rather than emit a request; the
    // fallback state above is the behaviour that matters to the visitor.
  })
})

test('page never scrolls horizontally', async ({ page }) => {
  await revealAll(page)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})

test('no critical or serious accessibility violations', async ({ page }) => {
  await revealAll(page)
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  const blocking = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  )
  expect(
    blocking.map((v) => `${v.impact}: ${v.id} — ${v.nodes.length} node(s)`),
  ).toEqual([])
})
