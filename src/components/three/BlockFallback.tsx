import { useId } from 'react'
import type { GraniteType } from '@/types/models'
import { getTypeSwatch } from '@/data/blocks'

/** Static isometric block used when WebGL is unavailable or the device is low-powered. */
export function BlockFallback({ type = 'Black Galaxy', className }: { type?: GraniteType; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const base = getTypeSwatch(type)
  const gold = type === 'Black Galaxy'
  const faces = { top: 'M200 60 L340 132 L200 204 L60 132 Z', left: 'M60 132 L200 204 L200 330 L60 258 Z', right: 'M340 132 L200 204 L200 330 L340 258 Z' }
  return (
    <svg viewBox="0 0 400 380" className={className} role="img" aria-label="Granite block illustration">
      <defs>
        <filter id={`s${id}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="4" />
          <feColorMatrix type="matrix" values={gold ? '0 0 0 0 .88  0 0 0 0 .7  0 0 0 0 .36  8 0 0 0 -5' : '0 0 0 0 .8  0 0 0 0 .8  0 0 0 0 .82  7 0 0 0 -4.6'} />
        </filter>
        {Object.entries(faces).map(([k, d]) => <clipPath key={k} id={`c${k}${id}`}><path d={d} /></clipPath>)}
        <ellipse id={`sh${id}`} cx="200" cy="336" rx="150" ry="22" />
        <radialGradient id={`g${id}`}><stop offset="0" stopColor="#000" stopOpacity=".55" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
      </defs>
      <use href={`#sh${id}`} fill={`url(#g${id})`} />
      {(['top', 'left', 'right'] as const).map((k) => (
        <g key={k} clipPath={`url(#c${k}${id})`}>
          <rect width="400" height="380" fill={base} />
          <rect width="400" height="380" filter={`url(#s${id})`} />
          <rect width="400" height="380" fill={k === 'top' ? '#fff' : k === 'left' ? '#000' : '#000'} opacity={k === 'top' ? 0.1 : k === 'left' ? 0.12 : 0.34} />
        </g>
      ))}
      <path d="M60 132 L200 60 L340 132 L200 204 Z M60 132 V258 L200 330 L340 258 V132 M200 204 V330" fill="none" stroke="#fff" strokeOpacity=".14" strokeLinejoin="round" />
    </svg>
  )
}
