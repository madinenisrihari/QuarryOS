import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

/** Entrance used sparingly: only where it clarifies hierarchy. */
export function Reveal({ children, delay = 0, y = 14, className, ...rest }: { children: ReactNode; delay?: number; y?: number; className?: string } & HTMLMotionProps<'div'>) {
  return (
    <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }} className={className} {...rest}>
      {children}
    </motion.div>
  )
}

export const listContainer = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
export const listItem = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
