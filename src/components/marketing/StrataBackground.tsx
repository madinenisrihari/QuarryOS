import { useMemo } from 'react'
import { cn } from '@/lib/cn'

/** Geological strata: fine, slightly wavering horizontal layers. Generated once, purely decorative. */
export function StrataBackground({ className, lines = 26, seed = 3 }: { className?: string; lines?: number; seed?: number }) {
  const paths = useMemo(() => {
    const out: string[] = []
    for (let i = 0; i < lines; i++) {
      const y = 30 + i * (940 / lines)
      const a = 6 + ((i * 7 + seed * 3) % 14), f1 = 0.004 + ((i + seed) % 5) * 0.0011, ph = i * 0.9 + seed
      let d = ''
      for (let x = 0; x <= 1600; x += 40) d += `${x === 0 ? 'M' : 'L'}${x} ${(y + Math.sin(x * f1 + ph) * a + Math.sin(x * f1 * 2.7 + ph * 1.3) * (a / 3)).toFixed(1)} `
      out.push(d)
    }
    return out
  }, [lines, seed])
  return (
    <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} aria-hidden>
      {paths.map((d, i) => <path key={i} d={d} fill="none" stroke="rgb(var(--line))" strokeOpacity={i % 6 === 0 ? 0.11 : 0.055} strokeWidth={i % 6 === 0 ? 1.1 : 0.8} />)}
    </svg>
  )
}
