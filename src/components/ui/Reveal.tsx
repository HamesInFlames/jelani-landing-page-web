import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** Seconds of delay — used to stagger siblings by ~0.08 each. */
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article'
}

/**
 * Scroll-triggered reveal: fade + rise, once per element.
 * Under `prefers-reduced-motion` the rise is dropped and only opacity
 * animates, per the motion spec.
 */
export function Reveal({ children, delay = 0, className, as = 'div' }: RevealProps) {
  const reduced = useReducedMotion()
  const MotionTag = motion[as]

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{
        duration: reduced ? 0.3 : 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionTag>
  )
}
