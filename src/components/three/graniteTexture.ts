import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import type { GraniteType } from '@/types/models'
import { mulberry32 } from '@/lib/seed'
import { RECIPES } from '@/data/stoneRecipes'

export const graniteRoughness = (t: GraniteType) => RECIPES[t].roughness

function canvas(size: number) {
  const c = document.createElement('canvas'); c.width = c.height = size; return c
}

export function makeGraniteTextures(type: GraniteType, size = 1024, seed = 11) {
  const r = RECIPES[type]
  const rand = mulberry32(seed)

  // Colour map: mottled base with crystal flecks
  const col = canvas(size); const ctx = col.getContext('2d')!
  ctx.fillStyle = r.base; ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 90; i++) {
    const x = rand() * size, y = rand() * size, rad = 60 + rand() * 240
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
    g.addColorStop(0, hexA(r.mottle, 0.1 + rand() * 0.16)); g.addColorStop(1, hexA(r.mottle, 0))
    ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2)
  }
  for (let i = 0; i < r.count; i++) {
    ctx.globalAlpha = 0.3 + rand() * 0.7
    ctx.fillStyle = r.flecks[Math.floor(rand() * r.flecks.length)]!
    const s = 0.5 + rand() * r.maxSize
    ctx.beginPath(); ctx.arc(rand() * size, rand() * size, s * 0.5, 0, Math.PI * 2); ctx.fill()
  }
  ctx.globalAlpha = 1

  // Bump map: fine crystalline relief
  const bump = canvas(size / 2); const bctx = bump.getContext('2d')!
  bctx.fillStyle = '#808080'; bctx.fillRect(0, 0, size / 2, size / 2)
  for (let i = 0; i < 16000; i++) {
    const v = Math.floor(90 + rand() * 90)
    bctx.fillStyle = `rgb(${v},${v},${v})`
    bctx.fillRect(rand() * size / 2, rand() * size / 2, 1 + rand() * 2, 1 + rand() * 2)
  }

  const map = new CanvasTexture(col); map.colorSpace = SRGBColorSpace; map.wrapS = map.wrapT = RepeatWrapping; map.anisotropy = 8
  const bumpMap = new CanvasTexture(bump); bumpMap.wrapS = bumpMap.wrapT = RepeatWrapping
  return { map, bumpMap }
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}
