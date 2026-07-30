import { useEffect, useState } from 'react'
import { site } from '../content/site'
import { GoldLink } from './ui/GoldButton'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out ${
        scrolled
          ? 'border-b border-[var(--hairline)] bg-ink/85 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav
        aria-label="Primary"
        className="shell flex h-16 items-center justify-between gap-4 sm:h-20"
      >
        <a
          href="#top"
          className="text-sm font-extrabold uppercase tracking-[0.2em] text-paper transition-colors hover:text-gold sm:text-base"
        >
          {site.meta.brand}
        </a>

        <div className="flex items-center gap-1 sm:gap-6">
          <ul className="hidden items-center gap-6 sm:flex">
            {site.nav.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-muted transition-colors hover:text-paper"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <GoldLink href="#contact" className="px-4 py-2 text-xs sm:px-6 sm:py-2.5 sm:text-sm">
            {site.nav.cta}
          </GoldLink>
        </div>
      </nav>
    </header>
  )
}
