import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './useReducedMotion'

/** Animates a number from 0 to `target`. Jumps straight to the value under reduced motion. */
export function useCountUp(target: number, duration = 1100, decimals = 0) {
  const reduced = usePrefersReducedMotion()
  const [value, setValue] = useState(reduced ? target : 0)
  const raf = useRef<number>()
  useEffect(() => {
    if (reduced) { setValue(target); return }
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(target * eased)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration, reduced])
  const f = 10 ** decimals
  return Math.round(value * f) / f
}
