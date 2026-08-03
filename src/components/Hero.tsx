import { Fragment, useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { site } from '../content/site'
import { GoldLink } from './ui/GoldButton'
import ScrollSequence from './ui/ScrollSequence'

/**
 * The hero copy, shared by both hero variants. The entrance below is CSS,
 * not JS: this markup is prerendered, so the headline paints on the first
 * frame rather than waiting for React to hydrate — the difference between
 * a slow LCP and an instant one.
 *
 * When `progress` is supplied (the scrub hero), the sub-line and CTAs bow
 * out while the footage takes the stage mid-scrub, then return for the
 * hand-off into the page. The headline itself never dims — it is the LCP
 * element and the page's one fixed point.
 */
function HeroCopy({ progress }: { progress?: MotionValue<number> }) {
  const reduced = useReducedMotion()
  const words = site.hero.headline.split(' ')

  // A stable stand-in keeps the hook unconditional when there is no scrub.
  const still = useMotionValue(0)
  const supportOpacity = useTransform(
    progress ?? still,
    [0, 0.28, 0.52, 0.86, 0.98],
    progress && !reduced ? [1, 1, 0, 0, 1] : [1, 1, 1, 1, 1],
  )
  const supportEvents = useTransform(supportOpacity, (o) =>
    o < 0.5 ? ('none' as const) : ('auto' as const),
  )

  return (
    <div className="shell flex h-full items-center pb-10 pt-28 sm:pt-32">
      <div className="max-w-4xl">
        <p className="eyebrow hero-rise">{site.hero.eyebrow}</p>

        <h1 className="display mt-5 text-paper">
          {words.map((word, i) => (
            // The separator sits *between* the spans, never inside them:
            // a trailing space within an inline-block gets collapsed away,
            // which runs the words together.
            <Fragment key={`${word}-${i}`}>
              <span
                className="hero-rise inline-block"
                // Kept tight on purpose: the headline is the LCP element,
                // so a long stagger literally scores as a slower page.
                style={{ animationDelay: `${0.06 + i * 0.05}s` }}
              >
                {word}
              </span>
              {i < words.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </h1>

        <motion.div style={{ opacity: supportOpacity, pointerEvents: supportEvents }}>
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
        </motion.div>
      </div>
    </div>
  )
}

/**
 * The scrub hero. Jelani's own footage — one unbroken shot from the Soluna
 * event recap — drawn frame by frame under the visitor's scroll. The point
 * is the demonstration: on every other site a sequence like this shows a
 * product; here the footage IS the product.
 *
 * Scroll speed is never touched. Reduced-motion visitors get a static
 * poster frame at normal height, with the full copy.
 */
function SequenceHero() {
  const seq = site.hero.sequence!

  return (
    <ScrollSequence
      id="top"
      framePath={(i) => `${seq.base}/${String(i).padStart(4, '0')}.webp`}
      frameCount={seq.frameCount}
      framePathSm={
        seq.baseSm ? (i) => `${seq.baseSm}/${String(i).padStart(4, '0')}.webp` : undefined
      }
      frameCountSm={seq.frameCountSm}
      poster={seq.poster}
      posterSm={seq.posterSm}
      scrollLengthVh={300}
      eagerFrames={12}
    >
      {(progress) => (
        <>
          {/* Footage needs a heavy veil to keep the headline above 4.5:1. */}
          <div className="absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/55 to-ink" />
          <div className="grain absolute inset-0" />
          <HeroCopy progress={progress} />
        </>
      )}
    </ScrollSequence>
  )
}

/**
 * The pre-sequence hero, kept whole as the fallback: it renders when
 * `site.hero.sequence` is null, and its reel/ambient logic is unchanged.
 */
function Backdrop() {
  const reduced = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!site.hero.reel || reduced) return
    const id = window.requestAnimationFrame(() => setReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [reduced])

  useEffect(() => {
    if (ready && videoRef.current && site.hero.reel) {
      videoRef.current.src = site.hero.reel
    }
  }, [ready])

  if (site.hero.reel) {
    return (
      <video
        ref={videoRef}
        className="size-full object-cover"
        poster={site.hero.reelPoster ?? undefined}
        muted
        loop
        playsInline
        autoPlay
        preload="none"
        aria-hidden="true"
      />
    )
  }

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

function ClassicHero() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '15%'])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduced ? 1 : 0.35])

  return (
    <section
      ref={ref}
      id="top"
      className="relative grid min-h-[100svh] grid-rows-[1fr_auto] overflow-hidden"
    >
      <motion.div style={{ y, opacity: fade }} className="absolute inset-0 -z-10">
        <Backdrop />
      </motion.div>

      {/*
        Legibility scrim. Footage needs a heavy veil to keep the headline
        above 4.5:1; the ambient backdrop is already dark, so veiling it
        that hard would just erase the atmosphere.
      */}
      <div
        className={`absolute inset-0 -z-10 bg-gradient-to-b ${
          site.hero.reel ? 'from-ink/75 via-ink/60 to-ink' : 'from-ink/40 via-ink/20 to-ink'
        }`}
      />
      <div className="grain absolute inset-0 -z-10" />

      <HeroCopy />
    </section>
  )
}

export function Hero() {
  return site.hero.sequence ? <SequenceHero /> : <ClassicHero />
}
