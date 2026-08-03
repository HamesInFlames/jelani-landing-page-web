import { site } from '../content/site'
import type { WorkGroup } from '../content/site'
import { BeautyStrip } from './ui/BeautyStrip'
import { LiteYouTube } from './ui/LiteYouTube'
import { ParallaxGallery } from './ui/ParallaxGallery'
import { Reveal } from './ui/Reveal'

function GroupHeader({ group }: { group: WorkGroup }) {
  // The featured card carries its own title over the artwork, so the header
  // above it stays a label — printing the film's name twice reads as an error.
  const titled = group.layout !== 'featured'

  return (
    <Reveal>
      <p className="eyebrow">{group.eyebrow}</p>
      {titled && (
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-paper sm:text-3xl">
          {group.title}
        </h3>
      )}
      {group.blurb && (
        <p className={`${titled ? 'mt-3' : 'mt-2'} max-w-2xl leading-relaxed text-muted`}>
          {group.blurb}
        </p>
      )}
    </Reveal>
  )
}

function GroupBody({ group }: { group: WorkGroup }) {
  if (group.layout === 'featured') {
    const item = group.items[0]
    if (!item) return null
    return (
      <Reveal delay={0.08}>
        <LiteYouTube item={item} featured />
      </Reveal>
    )
  }

  if (group.layout === 'row') {
    return (
      <ul
        // Scrollable on narrow screens, so it must be reachable by keyboard.
        tabIndex={0}
        role="list"
        aria-label={group.title}
        className="scroll-row -mx-[max(1.25rem,5vw)] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[max(1.25rem,5vw)] pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0"
      >
        {group.items.map((item, i) => (
          <Reveal as="li" key={item.id} delay={i * 0.08} className="w-[62vw] shrink-0 snap-start sm:w-auto">
            <LiteYouTube item={item} />
          </Reveal>
        ))}
      </ul>
    )
  }

  if (group.layout === 'gallery') {
    return (
      <Reveal>
        <ParallaxGallery items={group.items} />
      </Reveal>
    )
  }

  if (group.layout === 'beauty') {
    return <BeautyStrip items={group.items} />
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {group.items.map((item, i) => (
        <Reveal as="li" key={item.id} delay={i * 0.08}>
          <LiteYouTube item={item} />
        </Reveal>
      ))}
    </ul>
  )
}

export function Work() {
  const { eyebrow, title, blurb, groups } = site.work

  return (
    <section id="work" className="section border-t border-[var(--hairline)]">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title mt-4 text-paper">{title}</h2>
          <div className="rule-gold mt-7 w-24" />
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted">{blurb}</p>
        </Reveal>

        <div className="mt-16 space-y-20 sm:space-y-24">
          {groups.map((group) => (
            <section key={group.id} aria-label={group.title}>
              <GroupHeader group={group} />
              <div className="mt-8">
                <GroupBody group={group} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}
