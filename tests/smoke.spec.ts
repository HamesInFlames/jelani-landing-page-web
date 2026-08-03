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
  await expect(work.getByRole('heading', { name: 'Cinematography Reel' })).toBeVisible()
  await expect(work.getByRole('heading', { name: 'BeeVibe Juicery — Product' })).toBeVisible()

  // Cut by client decision — must never reappear. KuuIsQKZmw4 is the Cover
  // Letter video's YouTube ID; asserting on it catches a re-wire that
  // dodges the title string.
  await expect(page.getByText(/BuildApe/i)).toHaveCount(0)
  await expect(page.getByText(/Cover Letter/i)).toHaveCount(0)
  expect(await page.content()).not.toContain('KuuIsQKZmw4')
})

test('every linked film plays through its own facade, never at rest', async ({ page }) => {
  await revealAll(page)

  // All six Phase 5 IDs plus the three reels are wired with self-hosted
  // artwork; no element anywhere references YouTube's image CDN.
  const cards = page.locator('#work button[aria-label^="Play"]')
  expect(await cards.count()).toBeGreaterThanOrEqual(9)
  expect(await page.content()).not.toContain('i.ytimg.com')

  // The reels row specifically has no unlinked plates left.
  const reels = page.locator('#work section', { hasText: 'Shooting and cutting' })
  await expect(reels.getByText('Film linking soon')).toHaveCount(0)

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

test('the hero scrub renders its canvas over a prerendered poster', async ({ page }) => {
  const hero = page.locator('#top')
  await expect(hero.locator('canvas')).toHaveCount(1)
  await expect(hero.locator('picture img')).toHaveAttribute('src', /hero-poster/)

  // The scrub section reserves its full scroll runway up front — no CLS.
  const height = await hero.evaluate((el) => el.getBoundingClientRect().height)
  const viewport = page.viewportSize()!.height
  expect(height).toBeGreaterThanOrEqual(viewport * 2.9)
})

test('reduced motion collapses the scrub to a static poster hero', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForTimeout(600)

  const hero = page.locator('#top')
  const viewport = page.viewportSize()!.height
  const height = await hero.evaluate((el) => el.getBoundingClientRect().height)
  // Normal-height section: nothing to scrub, poster carries the image.
  expect(height).toBeLessThanOrEqual(viewport * 1.2)
  await expect(hero.locator('picture img')).toHaveAttribute('src', /hero-poster/)

  // The full copy is present and readable without any scrolling theatre.
  expect((await page.getByRole('heading', { level: 1 }).innerText()).replace(/\s+/g, ' ')).toBe(
    'Fast-turnaround creative for brand events.',
  )
})

test('the process section walks its four steps with the brief as evidence', async ({ page }) => {
  await revealAll(page)
  const process = page.locator('#process')

  await expect(process.getByRole('heading', { name: 'From first call to final cut.' })).toBeVisible()
  for (const step of ['Book a call', 'Creative brief', 'Shoot day', 'Fast delivery']) {
    await expect(process.getByRole('heading', { name: step })).toBeVisible()
  }
  await expect(process.locator('img[src*="brief-page"]')).toBeVisible()
  expect(await process.locator('img[src*="bts-"]').count()).toBeGreaterThanOrEqual(3)
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
