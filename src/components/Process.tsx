import { site } from '../content/site'
import { Reveal } from './ui/Reveal'

/**
 * The four-step engagement path — the answer to "how does working with you
 * go" before anyone has to ask it.
 *
 * The evidence block that sat under the steps (a page from a client brief,
 * a strip of phone shots from a shoot day, and the bundle note) was removed
 * 2026-08-05: the brief page read as a blank sheet at this size, and four
 * near-identical frames of the same room added nothing the steps had not
 * already said.
 */
export function Process() {
  const { eyebrow, title, blurb, steps } = site.process

  return (
    <section id="process" className="section border-t border-[var(--hairline)]">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title mt-4 max-w-3xl text-paper">{title}</h2>
          <div className="rule-gold mt-7 w-24" />
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted">{blurb}</p>
        </Reveal>

        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal as="li" key={step.n} delay={i * 0.08}>
              <article className="card h-full p-7 transition-colors duration-300 hover:border-gold/40">
                <p className="font-quote text-2xl italic text-gold">{step.n}</p>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-paper">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted">{step.body}</p>
              </article>
            </Reveal>
          ))}
        </ol>

      </div>
    </section>
  )
}
