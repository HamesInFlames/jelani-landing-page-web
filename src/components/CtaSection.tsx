import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { FORM_ENDPOINT, site } from '../content/site'
import { GoldButton } from './ui/GoldButton'
import { Reveal } from './ui/Reveal'

const STEP_COUNT = site.cta.steps.length + 1

/** The same shape the server relays, so both routes read identically. */
function summarise(
  answers: Record<string, string>,
  email: string,
  phone: string,
  note: string,
) {
  return [
    { label: 'What they need', value: answers['need'] ?? '—' },
    { label: "What it's for", value: answers['for'] ?? '—' },
    { label: 'Timing', value: answers['when'] ?? '—' },
    { label: 'Reply to', value: email },
    { label: 'Phone', value: phone || '(not given)' },
    { label: 'Note', value: note || '(no additional note)' },
  ]
}

function buildMailto(
  answers: Record<string, string>,
  email: string,
  phone: string,
  note: string,
) {
  const lines = summarise(answers, email, phone, note)
    .filter((line) => line.label !== 'Note')
    .map((line) => `${line.label}: ${line.value}`)

  return `mailto:${site.meta.email}?subject=${encodeURIComponent(
    'Booking enquiry from your website',
  )}&body=${encodeURIComponent([...lines, '', note || '(no additional note)'].join('\n'))}`
}

export function CtaSection() {
  const reduced = useReducedMotion()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  // Honeypot: hidden from real visitors, irresistible to form bots. The
  // server drops any submission that fills it.
  const [company, setCompany] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle')

  // Both terminal states replace the question flow, so the progress dots
  // and the Back link answer to this rather than to `done` alone.
  const finished = status === 'done' || status === 'failed'

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
          body: JSON.stringify({ ...answers, email, phone, note, company }),
        })
        // Success is a 2xx from our own server and nothing else: that is
        // the only response that means a channel actually took the lead.
        if (res.ok) {
          setStatus('done')
          return
        }
      } catch {
        // fall through to the mail client
      }
    }

    // Delivery failed. The mail client is still worth trying — it works on
    // desktop — but it silently does nothing on most phones, so the card
    // says what happened instead of showing a tick it did not earn, and
    // keeps every answer on screen to be copied out.
    window.location.href = buildMailto(answers, email, phone, note)
    setStatus('failed')
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
                card never resizes as the visitor moves through it. Raised
                from 21rem when the optional phone field was added — the
                final step grew by an input, and the e2e height assertion
                catches this if it is ever left behind again. */}
            <div className="grid min-h-[25.5rem] grid-rows-[auto_1fr]">
              <div className="flex items-center justify-between gap-4 pb-8">
                <div className="flex items-center gap-2" aria-hidden="true">
                  {Array.from({ length: STEP_COUNT }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === step && !finished
                          ? 'w-7 bg-gold'
                          : i < step || finished
                            ? 'w-3 bg-gold/50'
                            : 'w-3 bg-[var(--hairline-strong)]'
                      }`}
                    />
                  ))}
                </div>

                {step > 0 && !finished && (
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
                  ) : status === 'failed' ? (
                    <motion.div
                      key="failed"
                      variants={slide}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      role="alert"
                    >
                      <h3 className="text-xl font-semibold tracking-tight text-paper sm:text-2xl">
                        {site.cta.failure.title}
                      </h3>
                      <p className="mt-3 leading-relaxed text-muted">
                        {site.cta.failure.body}{' '}
                        <a
                          href={`mailto:${site.meta.email}`}
                          className="font-medium text-gold underline underline-offset-4 transition-colors hover:text-gold-soft"
                        >
                          {site.meta.email}
                        </a>
                      </p>

                      {/* Nothing the visitor typed is thrown away — they can
                          read it straight off the card into an email. */}
                      <div className="mt-6 border-t border-[var(--hairline)] pt-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                          {site.cta.failure.answersLabel}
                        </p>
                        <dl className="text-sm">
                          {summarise(answers, email, phone, note).map((line) => (
                            <div key={line.label} className="mt-3 flex flex-wrap gap-x-2">
                              <dt className="text-muted">{line.label}:</dt>
                              <dd className="text-paper">{line.value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
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
                          <label htmlFor="cta-phone" className="sr-only">
                            {site.cta.final.phoneLabel}
                          </label>
                          {/* type/inputMode/autoComplete together get a phone
                              keypad and the browser's stored number on mobile,
                              where most of this traffic is. Deliberately not
                              validated: formats vary, extensions exist, and
                              rejecting an odd-but-real number costs a lead on
                              a field that is optional anyway. */}
                          <input
                            id="cta-phone"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder={site.cta.final.phonePlaceholder}
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

                        {/* Off-screen rather than display:none — bots skip
                            fields that cannot be rendered. Hidden from the
                            accessibility tree and the tab order, so no real
                            visitor ever meets it. */}
                        <input
                          type="text"
                          name="company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          tabIndex={-1}
                          autoComplete="off"
                          aria-hidden="true"
                          className="absolute left-[-9999px] h-px w-px opacity-0"
                        />

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
