import { site } from '../content/site'
import { GoldLink } from './ui/GoldButton'
import { Reveal } from './ui/Reveal'

/**
 * Video-editing packages. The model's personality is that the math never
 * changes — $100 an edit at every tier — so the section's job is to state
 * that plainly, not to merchandise it. No discount badges, no crossed-out
 * anchors, no "most popular": the quarterly card is distinguished by a
 * gold hairline and its included-strategy tag, nothing louder.
 */
export function Pricing() {
  const { eyebrow, title, blurb, tiers, cta, footnote } = site.pricing

  return (
    <section id="pricing" className="section border-t border-[var(--hairline)]">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title mt-4 max-w-3xl text-paper">{title}</h2>
          <div className="rule-gold mt-7 w-24" />
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted">{blurb}</p>
        </Reveal>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <Reveal
              as="li"
              key={tier.id}
              delay={i * 0.08}
              className={tier.featured ? 'sm:col-span-2 lg:col-span-1' : ''}
            >
              <article
                className={`card flex h-full flex-col p-7 transition-colors duration-300 sm:p-9 ${
                  tier.featured ? 'border-gold/40 hover:border-gold/70' : 'hover:border-gold/40'
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-xl font-semibold tracking-tight text-paper">{tier.name}</h3>
                  {tier.featured && (
                    <span className="rounded-full border border-gold/40 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-gold">
                      Strategy included
                    </span>
                  )}
                </div>

                <p className="font-quote mt-5 text-3xl italic text-gold">{tier.price}</p>

                <p className="mt-4 leading-relaxed text-muted">{tier.body}</p>

                <div className="mt-auto pt-6">
                  <p className="inline-flex items-center gap-2 border-t border-[var(--hairline)] pt-5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-soft">
                    <span aria-hidden="true" className="size-1 rounded-full bg-gold" />
                    {tier.foot}
                  </p>
                  <div className="mt-5">
                    <GoldLink href="#contact" variant="ghost">
                      {cta}
                    </GoldLink>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>

        <Reveal>
          <p className="mt-10 text-sm leading-relaxed text-muted">{footnote}</p>
        </Reveal>
      </div>
    </section>
  )
}
