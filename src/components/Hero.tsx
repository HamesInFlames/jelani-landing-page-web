import { Fragment, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { site } from '../content/site'
import { GoldLink } from './ui/GoldButton'

/**
 * The hero: Jelani's footage plays on its own, muted and looping, while
 * scroll moves through three panels of information over it.
 *
 * Phase 7 retired the scroll-scrubbed canvas that lived here. The scrub made
 * the visitor drive the footage; the direction now is minimal — the film
 * simply runs, and scrolling changes what is said over it.
 *
 * The video is lazy: the poster paints from prerendered HTML and `src` is
 * attached only after first paint, so the LCP element is always the headline
 * or the poster, never a video download.
 */
function Backdrop() {
  const reduced = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [armed, setArmed] = useState(false)

  // Hold the clip until the browser is idle after `load`. The poster is
  // already painted from prerendered HTML, and a 2.5 MB download started any
  // earlier competes with fonts and the headline inside the LCP window —
  // measured as a full second of LCP on a throttled phone.
  useEffect(() => {
    if (!site.hero.reel || reduced) return

    let cancelled = false
    const arm = () => {
      if (cancelled) return
      const idle = window.requestIdleCallback as typeof window.requestIdleCallback | undefined
      if (idle) idle(() => !cancelled && setArmed(true), { timeout: 2000 })
      else window.setTimeout(() => !cancelled && setArmed(true), 300)
    }

    if (document.readyState === 'complete') arm()
    else window.addEventListener('load', arm, { once: true })

    return () => {
      cancelled = true
      window.removeEventListener('load', arm)
    }
  }, [reduced])

  useEffect(() => {
    const video = videoRef.current
    if (!armed || !video || !site.hero.reel) return
    video.src = site.hero.reel
    // Autoplay can still be refused (data saver, low power); the poster
    // stays underneath, so a refusal degrades to the still rather than black.
    void video.play().catch(() => {})
  }, [armed])

  if (site.hero.reel) {
    return (
      <video
        ref={videoRef}
        className="size-full object-cover"
        poster={site.hero.reelPoster ?? undefined}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
      />
    )
  }

  // No reel: slow-drifting ambient light. Same cinematic read, zero bytes.
  return (
    <div className="size-full bg-ink">
      <div
        className={`absolute -left-[12%] top-[-25%] size-[75vw] rounded-full opacity-[0.30] blur-[100px] ${
          reduced ? '' : 'animate-[drift-a_26s_ease-in-out_infinite_alternate]'
        }`}
        style={{ background: 'radial-gradient(circle, #d4af37 0%, transparent 66%)' }}
      />
      <div
        className={`absolute -right-[8%] top-[18%] size-[62vw] rounded-full opacity-[0.22] blur-[110px] ${
          reduced ? '' : 'animate-[drift-b_32s_ease-in-out_infinite_alternate]'
        }`}
        style={{ background: 'radial-gradient(circle, #a8802f 0%, transparent 68%)' }}
      />
      <div
        className={`absolute bottom-[-30%] left-[22%] size-[66vw] rounded-full opacity-[0.16] blur-[120px] ${
          reduced ? '' : 'animate-[drift-c_38s_ease-in-out_infinite_alternate]'
        }`}
        style={{ background: 'radial-gradient(circle, #e8cd7a 0%, transparent 70%)' }}
      />
    </div>
  )
}

export function Hero() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const words = site.hero.headline.split(' ')
  const [deliver, proof] = site.hero.stages

  // Three panels crossfading across the pinned section. Panel 1 holds while
  // the visitor reads, then hands over; the ranges overlap only slightly so
  // two panels are never legible at once.
  const panel1 = useTransform(scrollYProgress, [0, 0.3, 0.4], [1, 1, 0])
  const panel2 = useTransform(scrollYProgress, [0.36, 0.46, 0.62, 0.72], [0, 1, 1, 0])
  const panel3 = useTransform(scrollYProgress, [0.68, 0.78, 1], [0, 1, 1])

  const rise1 = useTransform(scrollYProgress, [0, 0.4], ['0px', '-24px'])
  const rise2 = useTransform(scrollYProgress, [0.36, 0.72], ['24px', '-24px'])
  const rise3 = useTransform(scrollYProgress, [0.68, 1], ['24px', '0px'])

  // Only the visible panel takes clicks; the others must not swallow them.
  // Computed unconditionally — these sit behind `reduced` checks in the
  // markup, and a hook called inside a ternary changes call order.
  const toEvents = (v: number) => (v < 0.5 ? ('none' as const) : ('auto' as const))
  const events1 = useTransform(panel1, toEvents)
  const events2 = useTransform(panel2, toEvents)
  const events3 = useTransform(panel3, toEvents)

  return (
    <section
      ref={ref}
      id="top"
      // Height override for reduced motion lives in CSS (.hero-staged), not
      // here: this markup is prerendered and React never reconciles a
      // mismatched inline style during hydration.
      className="hero-staged relative"
      style={{ height: '300vh' }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <Backdrop />
        </div>

        {/* Footage needs a heavy veil to keep white type above 4.5:1. */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/55 to-ink" />
        <div className="grain absolute inset-0" />

        {/*
          Panel 1 is the first paint: prerendered markup, CSS entrance, no
          JS required to become visible. Panels 2 and 3 start hidden and are
          revealed by scroll, so they never compete for the LCP.
        */}
        <motion.div
          style={reduced ? undefined : { opacity: panel1, y: rise1, pointerEvents: events1 }}
          className="absolute inset-0"
        >
          <div className="shell flex h-full items-center pb-10 pt-28 sm:pt-32">
            <div className="max-w-4xl">
              <p className="eyebrow hero-rise">{site.hero.eyebrow}</p>

              <h1 className="display mt-5 text-paper">
                {words.map((word, i) => (
                  // The separator sits *between* the spans, never inside
                  // them: a trailing space in an inline-block collapses,
                  // which runs the words together.
                  <Fragment key={`${word}-${i}`}>
                    <span
                      className="hero-rise inline-block"
                      style={{ animationDelay: `${0.06 + i * 0.05}s` }}
                    >
                      {word}
                    </span>
                    {i < words.length - 1 ? ' ' : null}
                  </Fragment>
                ))}
              </h1>

              <p
                className="hero-rise mt-7 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl"
                style={{ animationDelay: `${0.1 + words.length * 0.05}s` }}
              >
                {site.hero.sub}
              </p>

              <div
                className="hero-rise mt-10 flex flex-wrap items-center gap-3"
                style={{ animationDelay: `${0.2 + words.length * 0.05}s` }}
              >
                <GoldLink href="#contact">{site.hero.primary}</GoldLink>
                <GoldLink href="#work" variant="ghost">
                  {site.hero.secondary}
                  <span aria-hidden="true">↓</span>
                </GoldLink>
              </div>
            </div>
          </div>
        </motion.div>

        {!reduced && (
          <>
            <motion.div
              style={{ opacity: panel2, y: rise2, pointerEvents: events2 }}
              className="absolute inset-0"
              aria-hidden="true"
            >
              <div className="shell flex h-full items-center">
                <p className="max-w-3xl text-2xl font-semibold leading-snug tracking-tight text-paper sm:text-4xl">
                  {deliver?.line}
                </p>
              </div>
            </motion.div>

            <motion.div
              style={{ opacity: panel3, y: rise3, pointerEvents: events3 }}
              className="absolute inset-0"
            >
              <div className="shell flex h-full items-center">
                <div className="max-w-3xl">
                  <p className="text-2xl font-semibold leading-snug tracking-tight text-paper sm:text-4xl">
                    {proof?.line}
                  </p>
                  <div className="mt-9">
                    <GoldLink href="#contact">{site.hero.primary}</GoldLink>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
