import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import type { WorkItem } from '../../content/site'

/**
 * The beauty & editorial row: four portraits as a contact strip.
 *
 * Not the parallax wall — drift needs tall columns to have any travel, and
 * a single four-across row has none. What it gets instead is an alternating
 * rise: odd tiles lift a little faster than even ones as the row crosses
 * the viewport, so the strip breathes without any tile leaving its box.
 */
export function BeautyStrip({ items }: { items: readonly WorkItem[] }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLUListElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const slow = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [10, -10])
  const fast = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [22, -22])

  return (
    <ul ref={ref} className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
      {items.map((item, i) => (
        <motion.li
          key={item.id}
          style={{ y: i % 2 === 0 ? slow : fast }}
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <figure className="overflow-hidden rounded-xl border border-[var(--hairline)] bg-surface sm:rounded-2xl">
            {item.poster ? (
              <img
                src={item.poster}
                alt={item.title}
                width={500}
                height={625}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="aspect-[4/5] w-full" aria-hidden="true" />
            )}
          </figure>
        </motion.li>
      ))}
    </ul>
  )
}
