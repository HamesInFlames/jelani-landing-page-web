import { site } from '../content/site'
import { Reveal } from './ui/Reveal'

/**
 * The problem, named before the page starts selling. It sits between the
 * marquee and the work gallery: the visitor has just been told what Jelani
 * delivers, and this is the reason that promise is worth anything.
 *
 * Deliberately typographic — no cards, no numerals. Against the gridded
 * sections above and below it, a column of plain paragraphs reads as
 * someone talking rather than as another feature list.
 */
export function Problem() {
  const { eyebrow, title, body } = site.problem

  return (
    <section id="problem" className="section border-t border-[var(--hairline)]">
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
