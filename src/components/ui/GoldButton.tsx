import type { ReactNode } from 'react'

interface BaseProps {
  children: ReactNode
  variant?: 'solid' | 'ghost'
  className?: string
}

const styles = {
  solid:
    'bg-gold text-ink hover:bg-gold-soft border border-gold hover:border-gold-soft shadow-[0_0_0_0_var(--gold-glow)] hover:shadow-[0_0_28px_0_var(--gold-glow)]',
  ghost:
    'bg-transparent text-paper border border-[var(--hairline-strong)] hover:border-gold hover:text-gold',
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none'

export function GoldButton({
  children,
  variant = 'solid',
  className = '',
  ...rest
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function GoldLink({
  children,
  variant = 'solid',
  className = '',
  ...rest
}: BaseProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </a>
  )
}
