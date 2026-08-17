import { site } from '../content/site'
import { Reveal } from './ui/Reveal'

/**
 * The argument for hiring him, sitting directly above About.
 *
 * It is a separate block rather than a rewrite of About's opening because
 * the two are answering different questions: this one is "why you and not
 * the other good shooter in Toronto", About is who he is. Folding them
 * together blunted both.
 */
export function WhyMe() {
  const { eyebrow, title, body } = site.whyMe

  return (
    <section id="why" className="section border-t border-[var(--hairline)]">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title mt-4 max-w-3xl text-paper">{title}</h2>
          <div className="rule-gold mt-7 w-24" />
        </Reveal>

        <div className="mt-10 max-w-2xl space-y-6">
          {body.map((para, i) => (
            <Reveal key={i} delay={0.08 + i * 0.08}>
              <p className="text-lg leading-relaxed text-muted">{para}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
