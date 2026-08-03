import { useState } from 'react'
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
      className={`grid place-items-center rounded-full border border-gold/60 bg-ink/60 text-gold backdrop-blur-sm transition-all duration-200 group-hover:border-gold group-hover:bg-gold group-hover:text-ink ${
        small ? 'size-11' : 'size-16'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={small ? 'size-4 translate-x-px' : 'size-6 translate-x-0.5'}
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  )
}

interface Props {
  item: WorkItem
  /** Larger type + glyph for the featured slot. */
  featured?: boolean
  /** Override the kind's default ratio (used by the photo gallery). */
  aspect?: string
}

/**
 * A video card that renders as our own artwork until the visitor asks for
 * the player. Only on click does a youtube-nocookie iframe mount — so the
 * page carries no third-party embed weight at rest, and the gallery keeps
 * its own visual language instead of a wall of YouTube chrome.
 *
 * With no `ytId` yet, the card is a non-interactive plate rather than a
 * dead player.
 */
export function LiteYouTube({ item, featured = false, aspect: aspectProp }: Props) {
  const [active, setActive] = useState(false)
  const aspect = aspectProp ?? ASPECT[item.kind]
  const small = item.kind === 'short'
  const playable = item.ytId !== null

  // Stills never advertise a missing film; they simply read as artwork.
  const badge =
    item.note === 'Coming soon' ? 'Coming soon' : item.kind === 'photo' ? null : 'Film linking soon'

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
        // backgrounds for every rendered element up front, which put all
        // nine card posters on the initial-load network. Decorative here —
        // the adjacent text carries the card's meaning.
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
      </div>
      {/* The featured slot gets a heavier veil: its Sportsnet poster is
          broadcast key art with baked-in display text, and on narrow
          viewports the card's own title climbs into that region — the
          deeper mid-stop keeps it title-over-photo, not text-on-text. */}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${
          featured ? 'from-ink/95 via-ink/50 to-ink/10' : 'from-ink/85 via-ink/20 to-transparent'
        }`}
      />

      <div className="absolute inset-0 grid place-items-center">
        {playable ? (
          <PlayGlyph small={small} />
        ) : badge ? (
          <span className="rounded-full border border-[var(--hairline-strong)] bg-ink/70 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted backdrop-blur-sm">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        {item.client && (
          <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
            {item.client}
          </p>
        )}
        {/* Featured sits directly under the section h2 (its group header
            prints no title), so it takes h3 to keep the outline sequential. */}
        <Title
          className={`font-semibold leading-tight text-paper ${
            featured ? 'text-xl sm:text-3xl' : small ? 'text-sm' : 'text-base sm:text-lg'
          }`}
        >
          {item.title}
        </Title>
        {item.note && item.note !== 'Coming soon' && !small && (
          <p className="mt-1 text-sm text-muted">{item.note}</p>
        )}
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
      aria-label={`Play ${item.title}`}
      className={`${frame} cursor-pointer text-left hover:border-gold/50`}
      style={{ aspectRatio: aspect }}
    >
      {inner}
    </button>
  )
}
