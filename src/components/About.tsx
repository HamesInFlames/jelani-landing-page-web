import { site } from '../content/site'
import { Reveal } from './ui/Reveal'

export function About() {
  const { eyebrow, title, body, portrait, portraitCaption } = site.about

  return (
    <section id="about" className="section border-t border-[var(--hairline)]">
      <div className="shell grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-[var(--hairline)] bg-surface">
            <div className="grain relative aspect-[4/5]">
              {portrait ? (
                <img
                  src={portrait}
                  alt={`${site.meta.name}, ${site.meta.role}`}
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div
                  className="grid size-full place-items-center p-8 text-center"
                  style={{
                    background:
                      'linear-gradient(150deg, #1a1a1d 0%, #101012 55%, #17140e 100%)',
                  }}
                >
                  <div>
                    <p className="font-quote text-5xl italic text-gold/70">JW</p>
                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted">
                      {site.meta.name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="border-t border-[var(--hairline)] px-5 py-4 text-xs uppercase tracking-[0.18em] text-muted">
              {portraitCaption}
            </p>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="section-title mt-4 text-paper">{title}</h2>
            <div className="rule-gold mt-7 w-24" />
          </Reveal>

          <div className="mt-8 space-y-6">
            {body.map((para, i) => (
              <Reveal key={i} delay={0.08 + i * 0.08}>
                <p className="text-lg leading-relaxed text-muted">{para}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
