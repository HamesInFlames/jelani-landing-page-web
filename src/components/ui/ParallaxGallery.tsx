import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import type { WorkItem } from '../../content/site'

/**
 * The photography wall: three columns of portrait stills, each drifting at a
 * slightly different rate as the page scrolls past — a gallery wall in slow
 * motion. Transforms only (GPU-composited), scroll speed untouched, and the
 * drift is a few percent of column height so nothing ever escapes the
 * section's own whitespace.
 *
 * Three columns hold at every breakpoint — three-across portrait tiles are
 * the grid every phone user already knows. The middle column starts lower
 * and drifts the opposite way, which is what makes the wall read as curated
 * rather than templated. Reduced motion pins all three columns still.
 */
export function ParallaxGallery({ items }: { items: readonly WorkItem[] }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Wider drift than the first pass — the wall should visibly assemble
  // itself as you arrive, not merely shimmer.
  const range = (from: string, to: string) => (reduced ? ['0%', '0%'] : [from, to])
  const y0 = useTransform(scrollYProgress, [0, 1], range('5%', '-5%'))
  const y1 = useTransform(scrollYProgress, [0, 1], range('-7%', '7%'))
  const y2 = useTransform(scrollYProgress, [0, 1], range('3%', '-3%'))
  const columnYs = [y0, y1, y2]

  const columns: [WorkItem[], WorkItem[], WorkItem[]] = [[], [], []]
  items.forEach((item, i) => columns[i % 3]!.push(item))

  return (
    <div ref={ref} className="grid grid-cols-3 gap-3 sm:gap-5">
      {columns.map((column, c) => (
        <motion.div
          key={c}
          style={{ y: columnYs[c] }}
          className={`flex flex-col gap-3 sm:gap-5 ${c === 1 ? 'pt-10 sm:pt-16' : ''}`}
        >
          {column.map((item, i) => (
            // Each tile settles in on arrival — opacity and a small scale,
            // staggered down the column, so the wall composes rather than
            // simply appearing.
            <motion.figure
              key={item.id}
              initial={reduced ? false : { opacity: 0, scale: 0.97, y: 16 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-xl border border-[var(--hairline)] bg-surface sm:rounded-2xl"
            >
              {item.poster ? (
                <img
                  src={item.poster}
                  alt={item.title}
                  width={900}
                  height={1125}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover"
                />
              ) : (
                <div className="aspect-[4/5] w-full" aria-hidden="true" />
              )}
            </motion.figure>
          ))}
        </motion.div>
      ))}
    </div>
  )
}
