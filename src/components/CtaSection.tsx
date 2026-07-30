import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { FORM_ENDPOINT, site } from '../content/site'
import { GoldButton } from './ui/GoldButton'
import { Reveal } from './ui/Reveal'

const STEP_COUNT = site.cta.steps.length + 1

function buildMailto(answers: Record<string, string>, email: string, note: string) {
  const lines = [
    `What they need: ${answers['need'] ?? '—'}`,
    `Timing: ${answers['when'] ?? '—'}`,
    `Reply to: ${email}`,
    '',
    note || '(no additional note)',
  ]
  return `mailto:${site.meta.email}?subject=${encodeURIComponent(
    'Booking enquiry via jelaniwoodstv.com',
  )}&body=${encodeURIComponent(lines.join('\n'))}`
}

export function CtaSection() {
  const reduced = useReducedMotion()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')

  const go = (next: number) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  const choose = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
    go(step + 1)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    if (FORM_ENDPOINT) {
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...answers, email, note }),
        })
        if (res.ok) {
          setStatus('done')
          return
        }
      } catch {
        // fall through to the mail client
      }
    }

    // No relay configured (or it failed): hand off to the visitor's mail
    // client with everything they answered already filled in.
    window.location.href = buildMailto(answers, email, note)
    setStatus('done')
  }

  const slide = {
    enter: { opacity: 0, x: reduced ? 0 : dir * 28 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduced ? 0 : dir * -28 },
  }

  const current = site.cta.steps[step]

  return (
    <section id="contact" className="section border-t border-[var(--hairline)]">
      <div className="shell">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">{site.cta.eyebrow}</p>
            <h2 className="section-title mt-4 text-paper">{site.cta.title}</h2>
            <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-muted">
              {site.cta.sub}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="card mx-auto mt-12 max-w-xl p-7 sm:p-10">
            {/* Floor is sized to the tallest step (the final form) so the
                card never resizes as the visitor moves through it. */}
            <div className="grid min-h-[21rem] grid-rows-[auto_1fr]">
              <div className="flex items-center justify-between gap-4 pb-8">
                <div className="flex items-center gap-2" aria-hidden="true">
                  {Array.from({ length: STEP_COUNT }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === step && status !== 'done'
                          ? 'w-7 bg-gold'
                          : i < step || status === 'done'
                            ? 'w-3 bg-gold/50'
                            : 'w-3 bg-[var(--hairline-strong)]'
                      }`}
                    />
                  ))}
                </div>

                {step > 0 && status !== 'done' && (
                  <button
                    type="button"
                    onClick={() => go(step - 1)}
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-muted transition-colors hover:text-paper"
                  >
                    ← Back
                  </button>
                )}
              </div>

              <div aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  {status === 'done' ? (
                    <motion.div
                      key="done"
                      variants={slide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="flex h-full flex-col justify-center text-center"
                    >
                      <p aria-hidden="true" className="font-quote text-4xl italic text-gold">
                        ✓
                      </p>
                      <h3 className="mt-4 text-xl font-semibold text-paper">
                        {site.cta.success.title}
                      </h3>
                      <p className="mt-3 leading-relaxed text-muted">{site.cta.success.body}</p>
                    </motion.div>
                  ) : current ? (
                    <motion.div
                      key={current.id}
                      variants={slide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <h3 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">
                        {current.question}
                      </h3>

                      <ul className="mt-6 flex flex-wrap gap-2.5">
                        {current.options.map((option) => (
                          <li key={option}>
                            <button
                              type="button"
                              onClick={() => choose(current.id, option)}
                              aria-pressed={answers[current.id] === option}
                              className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-150 hover:scale-[1.02] ${
                                answers[current.id] === option
                                  ? 'border-gold bg-gold text-ink'
                                  : 'border-[var(--hairline-strong)] bg-transparent text-paper hover:border-gold hover:text-gold'
                              }`}
                            >
                              {option}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="final"
                      variants={slide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      onSubmit={submit}
                    >
                      <h3 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">
                        {site.cta.final.question}
                      </h3>

                      <div className="mt-6 space-y-4">
                        <div>
                          <label htmlFor="cta-email" className="sr-only">
                            {site.cta.final.emailLabel}
                          </label>
                          <input
                            id="cta-email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={site.cta.final.emailPlaceholder}
                            className="w-full rounded-xl border border-[var(--hairline-strong)] bg-ink px-4 py-3 text-paper placeholder:text-muted/70 focus:border-gold focus:outline-none"
                          />
                        </div>

                        <div>
                          <label htmlFor="cta-note" className="sr-only">
                            {site.cta.final.noteLabel}
                          </label>
                          <textarea
                            id="cta-note"
                            rows={2}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={site.cta.final.notePlaceholder}
                            className="w-full resize-none rounded-xl border border-[var(--hairline-strong)] bg-ink px-4 py-3 text-paper placeholder:text-muted/70 focus:border-gold focus:outline-none"
                          />
                        </div>

                        <GoldButton type="submit" disabled={status === 'sending'} className="w-full">
                          {status === 'sending' ? 'Sending…' : site.cta.final.submit}
                        </GoldButton>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-muted">
            {site.cta.fallbackNote}{' '}
            <a
              href={`mailto:${site.meta.email}`}
              className="text-gold underline-offset-4 transition-colors hover:text-gold-soft hover:underline"
            >
              {site.meta.email}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
