import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import type { WorkItem } from '../../content/site'

/** Deterministic dark plate used wherever a real poster has not landed yet. */
const PLATES = [
  'linear-gradient(135deg, #1a1a1d 0%, #101012 55%, #17140e 100%)',
  'linear-gradient(150deg, #16161a 0%, #0e0e10 60%, #1b1710 100%)',
  'linear-gradient(120deg, #131317 0%, #0d0d0f 50%, #191510 100%)',
  'linear-gradient(160deg, #191a1d 0%, #101013 55%, #15120d 100%)',
]

function plateFor(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return PLATES[h % PLATES.length]
}

export const ASPECT: Record<WorkItem['kind'], string> = {
  video: '16 / 9',
  short: '9 / 16',
  photo: '4 / 5',
}

function PlayGlyph({ small = false }: { small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid place-items-center rounded-full border border-gold/60 bg-ink/40 text-gold opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-hover:border-gold group-hover:bg-gold group-hover:text-ink ${
        small ? 'size-11' : 'size-14'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={small ? 'size-4 translate-x-px' : 'size-5 translate-x-0.5'}
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  )
}

/**
 * A silent, looping preview that only exists while the card is near the
 * viewport. Nine of these autoplaying from page load would be nine parallel
 * downloads competing with everything above the fold, so `src` is attached
 * on approach and playback stops the moment the card leaves.
 */
function Preview({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) {
          if (!video.src) video.src = src
          void video.play().catch(() => {})
          setVisible(true)
        } else {
          video.pause()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [src])

  return (
    <video
      ref={ref}
      className={`size-full object-cover transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      // No `poster` here on purpose: the <img> beneath already shows it, and
      // a video poster is fetched eagerly regardless of preload="none" —
      // nine of them turned every card's still into a duplicate early load.
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    />
  )
}

interface Props {
  item: WorkItem
  /** Larger type for the featured slot. */
  featured?: boolean
  /** Override the kind's default ratio. */
  aspect?: string
}

/**
 * A work card that is, at rest, the image and a small title — nothing else.
 * Client and context fade in on hover; the play affordance appears with
 * them. Only on click does a youtube-nocookie iframe mount, so the page
 * carries no third-party embed weight until someone asks for the film.
 *
 * Cards with no `ytId` are not interactive: their artwork is the content,
 * and a badge announcing a missing link would be noise.
 */
export function LiteYouTube({ item, featured = false, aspect: aspectProp }: Props) {
  const [active, setActive] = useState(false)
  const reduced = useReducedMotion()
  const aspect = aspectProp ?? ASPECT[item.kind]
  const small = item.kind === 'short'
  const playable = item.ytId !== null

  const Title = featured ? 'h3' : 'h4'

  const frame =
    'group relative w-full overflow-hidden rounded-2xl border border-[var(--hairline)] bg-surface transition-all duration-300 ease-out'

  if (active && item.ytId) {
    return (
      <div className={frame} style={{ aspectRatio: aspect }}>
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${item.ytId}?autoplay=1&rel=0&modestbranding=1`}
          title={item.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  const inner = (
    <>
      <div
        className="absolute inset-0 grain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        // A real lazy <img>, not background-image: browsers fetch CSS
        // backgrounds for every rendered element up front, which put every
        // below-fold poster on the initial-load network.
        style={item.poster ? undefined : { background: plateFor(item.id) }}
      >
        {item.poster && (
          <img
            src={item.poster}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        )}
        {/* Motion is an enhancement over the still, never a replacement:
            the poster stays underneath, so a refused autoplay or a
            reduced-motion visitor simply keeps the photograph. */}
        {item.preview && !reduced && (
          <div className="absolute inset-0">
            <Preview src={item.preview} />
          </div>
        )}
      </div>

      {/* The featured slot gets a heavier veil: its Sportsnet poster is
          broadcast key art with baked-in display text, and on narrow
          viewports the card's own title climbs into that region. */}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${
          featured ? 'from-ink/95 via-ink/40 to-transparent' : 'from-ink/80 via-ink/10 to-transparent'
        }`}
      />

      {playable && (
        <div className="absolute inset-0 grid place-items-center">
          <PlayGlyph small={small} />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        {/* Context is available, not advertised: it rises into view on
            hover so the resting state stays image-and-a-name. */}
        {item.client && (
          <p className="mb-1 translate-y-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-gold opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            {item.client}
          </p>
        )}
        <Title
          className={`font-medium leading-tight text-paper ${
            featured ? 'text-lg sm:text-2xl' : 'text-sm'
          }`}
        >
          {item.title}
        </Title>
      </div>
    </>
  )

  if (!playable) {
    return (
      <div className={frame} style={{ aspectRatio: aspect }}>
        {inner}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      // The label carries the full context the resting card no longer
      // prints, so nothing is lost to a screen reader by going quiet.
      aria-label={`Play ${item.title}${item.client ? ` — ${item.client}` : ''}`}
      className={`${frame} cursor-pointer text-left hover:border-gold/50`}
      style={{ aspectRatio: aspect }}
    >
      {inner}
    </button>
  )
}
