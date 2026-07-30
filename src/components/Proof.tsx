import { site } from '../content/site'
import { Reveal } from './ui/Reveal'

export function Proof() {
  const { eyebrow, title, entries, toolset, testimonials } = site.proof

  return (
    <section className="section border-t border-[var(--hairline)]">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title mt-4 text-paper">{title}</h2>
          <div className="rule-gold mt-7 w-24" />
        </Reveal>

        <ol className="mt-14 max-w-3xl">
          {entries.map((entry, i) => (
            <Reveal as="li" key={entry.org} delay={i * 0.08}>
              <div className="relative border-l border-[var(--hairline)] pb-10 pl-8 last:pb-0 sm:pl-10">
                <span
                  aria-hidden="true"
                  className="absolute -left-[4.5px] top-2 size-2 rounded-full bg-gold"
                />

                <h3 className="text-lg font-semibold tracking-tight text-paper sm:text-xl">
                  {entry.org}
                </h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-soft">
                  {entry.role}
                </p>
                <p className="mt-3 leading-relaxed text-muted">{entry.detail}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={0.1}>
          <div className="mt-14 border-t border-[var(--hairline)] pt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {toolset.label}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {toolset.items.map((tool) => (
                <li
                  key={tool}
                  className="rounded-full border border-[var(--hairline)] bg-surface px-4 py-2 text-sm text-paper"
                >
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Hidden until real, attributable quotes land — never fabricated. */}
        {testimonials.length > 0 && (
          <ul className="mt-16 grid gap-6 sm:grid-cols-2">
            {testimonials.map((t, i) => (
              <Reveal as="li" key={t.attribution} delay={i * 0.08}>
                <figure className="card h-full p-8">
                  <span aria-hidden="true" className="font-quote text-5xl leading-none text-gold/60">
                    &ldquo;
                  </span>
                  <blockquote className="mt-3 font-quote text-xl italic leading-relaxed text-paper">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-5 text-xs uppercase tracking-[0.18em] text-muted">
                    {t.attribution}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
