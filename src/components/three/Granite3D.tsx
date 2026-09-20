import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { GraniteType } from '@/types/models'
import { useCanRender3D } from '@/hooks/useCanRender3D'
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { BlockFallback } from './BlockFallback'
import { Skeleton } from '@/components/ui/Skeleton'

// The whole three.js stack lives in its own chunk and only loads when a 3D view mounts.
const GraniteScene = lazy(() => import('./GraniteScene'))

interface Props {
  type: GraniteType
  dims: [number, number, number]
  interactive?: boolean
  autoRotate?: boolean
  pointerParallax?: boolean
  className?: string
  seed?: number
}

/** Lazy, viewport-aware, failure-tolerant wrapper. Renders a static illustration when 3D isn't appropriate. */
export function Granite3D({ type, dims, interactive, autoRotate = true, pointerParallax = true, className, seed }: Props) {
  const can3D = useCanRender3D()
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { const on = Boolean(e?.isIntersecting); setVisible(on); if (on) setMounted(true) }, { rootMargin: '120px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const fallback = <BlockFallback type={type} className="mx-auto h-full max-h-full w-full max-w-[520px]" />
  return (
    <div ref={ref} className={className}>
      {can3D === null ? <Skeleton className="h-full w-full" />
        : !can3D ? fallback
        : (
          <ErrorBoundary fallback={fallback}>
            <Suspense fallback={<Skeleton className="h-full w-full" />}>
              {mounted && <GraniteScene type={type} dims={dims} interactive={interactive} autoRotate={autoRotate} pointerParallax={pointerParallax} paused={!visible} reducedMotion={reduced} seed={seed} />}
            </Suspense>
          </ErrorBoundary>
        )}
    </div>
  )
}
