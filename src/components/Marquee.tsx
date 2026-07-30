import { site } from '../content/site'

/**
 * Continuous credit strip. The track holds two identical copies of the
 * list and translates by exactly -50%, so the loop is seamless; the
 * duplicate is hidden from assistive tech.
 */
export function Marquee() {
  const items = site.marquee

  const Run = ({ hidden }: { hidden?: boolean }) => (
    <ul
      className="flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14"
      aria-hidden={hidden || undefined}
    >
      {items.map((label, i) => (
        <li key={`${label}-${i}`} className="flex items-center gap-10 sm:gap-14">
          <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.22em] text-muted sm:text-sm">
            {label}
          </span>
          <span aria-hidden="true" className="size-1 rounded-full bg-gold/70" />
        </li>
      ))}
    </ul>
  )

  return (
    <section
      aria-label="Selected clients and capabilities"
      className="marquee-viewport relative overflow-hidden border-y border-[var(--hairline)] bg-surface/40 py-5"
    >
      <div className="marquee-track flex w-max">
        <Run />
        <Run hidden />
      </div>

      {/* Feather the ends so words dissolve rather than clip. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink to-transparent sm:w-32" />
    </section>
  )
}
