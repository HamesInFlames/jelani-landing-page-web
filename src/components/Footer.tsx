import { site } from '../content/site'

const links = [
  { label: 'Instagram', href: site.meta.instagram },
  { label: 'Studio Impetus', href: site.meta.studioInstagram },
  { label: 'YouTube', href: site.meta.youtube },
  { label: 'LinkedIn', href: site.meta.linkedin },
]

export function Footer() {
  return (
    <footer className="border-t border-[var(--hairline)] py-14">
      <div className="shell grid gap-10 sm:grid-cols-2">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-paper">
            {site.meta.brand}
          </p>
          <p className="mt-3 max-w-xs leading-relaxed text-muted">{site.footer.tagline}</p>
          <a
            href={`mailto:${site.meta.email}`}
            className="mt-5 inline-block text-gold underline-offset-4 transition-colors hover:text-gold-soft hover:underline"
          >
            {site.meta.email}
          </a>
        </div>

        <div className="sm:justify-self-end sm:text-right">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 sm:justify-end">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-muted transition-colors hover:text-paper"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-xs uppercase tracking-[0.18em] text-muted">
            {site.footer.location}
          </p>
          <p className="mt-2 text-xs text-muted">
            © {new Date().getFullYear()} {site.meta.name}
          </p>
        </div>
      </div>
    </footer>
  )
}
