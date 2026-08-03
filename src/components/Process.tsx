import { site } from '../content/site'
import { Reveal } from './ui/Reveal'

/**
 * The four-step engagement path, backed by receipts: a page from a real
 * client creative brief and phone shots from a live shoot day. The section
 * exists to make "how does working with you go" a question the page has
 * already answered — and to carry the video+photo bundle offer.
 */
export function Process() {
  const { eyebrow, title, blurb, steps, brief, bts, bundleNote } = site.process

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

        <div className="mt-12 grid items-start gap-5 lg:grid-cols-[1fr_1.35fr]">
          <Reveal>
            <figure className="card p-5 sm:p-6">
              <img
                src={brief.image}
                alt={brief.alt}
                width={1100}
                height={619}
                loading="lazy"
                decoding="async"
                className="w-full rounded-lg border border-[var(--hairline)]"
              />
              <figcaption className="mt-4 text-sm leading-relaxed text-muted">
                {brief.caption}
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.08}>
            <figure>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {bts.images.map((image) => (
                  <img
                    key={image.src}
                    src={image.src}
                    alt={image.alt}
                    width={640}
                    height={480}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full rounded-lg border border-[var(--hairline)] object-cover"
                  />
                ))}
              </div>
              <figcaption className="mt-4 text-sm leading-relaxed text-muted">
                {bts.caption}
              </figcaption>
            </figure>
            <p className="mt-6 border-t border-[var(--hairline)] pt-5 leading-relaxed text-muted">
              <span aria-hidden="true" className="mr-2 inline-block size-1 translate-y-[-2px] rounded-full bg-gold" />
              {bundleNote}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
