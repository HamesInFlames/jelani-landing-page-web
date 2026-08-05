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
  expect(html).toContain('Fast-turnaround')
  expect(html).toContain('Duane Notice')
  expect(html).toContain('Have an event coming up?')
  expect(html).not.toContain('<div id="root"></div>')

  // CSS is folded into the document, so no render-blocking stylesheet link.
  expect(html).not.toMatch(/<link rel="stylesheet"/)
})

test('hero renders the headline and both calls to action', async ({ page }) => {
  // Exact match, not `toContainText`: the headline is split per word for the
  // entrance animation, and a collapsed separator silently glues words
  // together ("brandevents.") while still passing a loose assertion.
  expect((await page.getByRole('heading', { level: 1 }).innerText()).replace(/\s+/g, ' ')).toBe(
    'Fast-turnaround creative for brand events.',
  )
  await expect(page.getByRole('link', { name: 'Book a call' }).first()).toHaveAttribute(
    'href',
    '#contact',
  )
  await expect(page.getByRole('link', { name: /See the work/ })).toHaveAttribute('href', '#work')
})

test('every section is present and visible after scrolling', async ({ page }) => {
  await revealAll(page)

  for (const id of ['work', 'services', 'about', 'contact']) {
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
  await expect(work.getByRole('heading', { name: 'BeeVibe Juicery — Product' })).toBeVisible()

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

test('pricing states the fixed tiers and never discounts them', async ({ page }) => {
  await revealAll(page)
  const pricing = page.locator('#pricing')

  for (const figure of ['$1,000', '$2,000', 'From $3,000 / quarter']) {
    await expect(pricing.getByText(figure)).toBeVisible()
  }

  // Exactly one featured tier, distinguished by the included strategy.
  await expect(pricing.getByText('Strategy included', { exact: true })).toHaveCount(2) // tag + foot line
  await expect(pricing.getByRole('heading', { name: 'Quarterly' })).toBeVisible()

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

test('the CTA card walks through its three steps and keeps a stable height', async ({ page }) => {
  const card = page.locator('#contact .card')
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(700)

  const startHeight = (await card.boundingBox())?.height ?? 0

  await expect(page.getByRole('heading', { name: 'What do you need?' })).toBeVisible()
  await page.getByRole('button', { name: 'Event recap' }).click()

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

  // Panel 3 carries the proof line; it must be invisible at the top and
  // legible once the visitor has scrolled through the hero.
  const proof = page.getByText('Sportsnet-featured. Founder of Studio Impetus. Toronto.')
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
    'Fast-turnaround creative for brand events.',
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

test('the enquiry route is mounted, and says so when no channel is configured', async ({
  request,
}) => {
  const res = await request.post('/api/enquiry', {
    data: { email: 'lead@brand.com', need: 'Event recap' },
  })

  // 404 would mean the route never mounted and the card's fallback is
  // covering for a bug. 501 is the honest "not configured yet" the card is
  // built to handle — see server/enquiry.js.
  expect(res.status()).toBe(501)
})

test('the enquiry card keeps working while delivery is unconfigured', async ({ page }) => {
  const card = page.locator('#contact .card')
  await card.scrollIntoViewIfNeeded()
  await page.waitForTimeout(700)

  await page.getByRole('button', { name: 'Event recap' }).click()
  await page.getByRole('button', { name: 'This month' }).click()
  await page.locator('#cta-email').fill('lead@brand.com')

  // The mailto handoff would navigate the page away; intercept it so the
  // assertion is about the fallback firing, not about the mail client.
  const handoff = page.waitForRequest((r) => r.url().startsWith('mailto:'), { timeout: 5000 })
  await page.getByRole('button', { name: 'Send it' }).click()

  await expect(page.getByText("Got it — I'll be in touch.")).toBeVisible()
  await handoff.catch(() => {
    // Chromium may swallow the mailto rather than emit a request; the
    // success state above is the behaviour that matters to the visitor.
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
