import { useMemo } from 'react'
import type { GraniteType } from '@/types/models'
import { RECIPES } from '@/data/stoneRecipes'
import { mulberry32 } from '@/lib/seed'
import { cn } from '@/lib/cn'

const W = 360, H = 240
const cache = new Map<string, string>()

function rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

/** Paint a granite surface once per (type, variant) and reuse the resulting image everywhere. */
function stoneUrl(type: GraniteType, variant: number): string {
  const key = `${type}:${variant}`
  const hit = cache.get(key)
  if (hit) return hit
  const r = RECIPES[type]
  const rand = mulberry32(variant * 7919 + type.length * 131)
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')!
  ctx.fillStyle = r.base; ctx.fillRect(0, 0, W, H)
  for (let i = 0; i < 34; i++) {
    const x = rand() * W, y = rand() * H, rad = 30 + rand() * 110
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
    g.addColorStop(0, rgba(r.mottle, 0.14 + rand() * 0.2)); g.addColorStop(1, rgba(r.mottle, 0))
    ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2)
  }
  if (type === 'Viscount White') {
    ctx.lineCap = 'round'
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = rgba('#6d6357', 0.25 + rand() * 0.3); ctx.lineWidth = 0.8 + rand() * 2.2
      ctx.beginPath(); ctx.moveTo(-10, rand() * H)
      ctx.bezierCurveTo(W * 0.3, rand() * H, W * 0.6, rand() * H, W + 10, rand() * H); ctx.stroke()
    }
  }
  const count = Math.round((r.count * W * H) / (1024 * 1024) * 1.6)
  for (let i = 0; i < count; i++) {
    ctx.globalAlpha = 0.3 + rand() * 0.7
    ctx.fillStyle = r.flecks[Math.floor(rand() * r.flecks.length)]!
    const s = 0.5 + rand() * r.maxSize * 0.6
    ctx.beginPath(); ctx.arc(rand() * W, rand() * H, s, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1
  const light = ctx.createLinearGradient(0, 0, W, H)
  light.addColorStop(0, 'rgba(255,255,255,0.10)'); light.addColorStop(0.5, 'rgba(255,255,255,0)'); light.addColorStop(1, 'rgba(0,0,0,0.28)')
  ctx.fillStyle = light; ctx.fillRect(0, 0, W, H)
  const url = c.toDataURL('image/jpeg', 0.82)
  cache.set(key, url)
  return url
}

/**
 * Procedurally painted granite surface. Stands in for uploaded block photography in the demo;
 * no external images are used. Only six variants per stone are generated and cached.
 */
export function StoneSwatch({ type, seed = 1, className, label }: { type: GraniteType; seed?: number; className?: string; label?: string }) {
  const src = useMemo(() => stoneUrl(type, Math.abs(Math.round(seed)) % 6), [type, seed])
  return <img src={src} alt={label ?? ''} aria-hidden={label ? undefined : true} decoding="async" draggable={false} className={cn('h-full w-full select-none object-cover', className)} />
}
