import { site } from '../content/site'
import { Reveal } from './ui/Reveal'

export function Services() {
  const { eyebrow, title, blurb, items } = site.services

  return (
    <section id="services" className="section">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title mt-4 max-w-3xl text-paper">{title}</h2>
          <div className="rule-gold mt-7 w-24" />
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted">{blurb}</p>
        </Reveal>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2">
          {items.map((service, i) => (
            <Reveal as="li" key={service.n} delay={i * 0.08}>
              <article className="card group h-full p-7 transition-colors duration-300 hover:border-gold/40 sm:p-9">
                <p className="font-quote text-2xl italic text-gold">{service.n}</p>

                <h3 className="mt-5 text-xl font-semibold tracking-tight text-paper sm:text-2xl">
                  {service.title}
                </h3>

                <p className="mt-3 leading-relaxed text-muted">{service.body}</p>

                <p className="mt-6 inline-flex items-center gap-2 border-t border-[var(--hairline)] pt-5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-soft">
                  <span aria-hidden="true" className="size-1 rounded-full bg-gold" />
                  {service.promise}
                </p>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
