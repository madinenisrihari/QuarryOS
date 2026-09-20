import { DEMO_NOW } from '@/data/clock'

const inrFull = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

/** ₹2,40,000 */
export const inr = (n: number) => `₹${inrFull.format(Math.round(n))}`

/** ₹48.2L, ₹1.4Cr, ₹85K */
export function inrCompact(n: number) {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2).replace(/\.?0+$/, '')}Cr`
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(1).replace(/\.0$/, '')}L`
  if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(0)}K`
  return `${sign}₹${abs}`
}

export const num = (n: number, digits = 0) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n)

export function dateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
export function dateDay(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export function daysSince(iso: string, now: Date = DEMO_NOW) {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000)
}

export function daysUntil(iso: string, now: Date = DEMO_NOW) {
  return Math.ceil((new Date(iso).getTime() - now.getTime()) / 86_400_000)
}

export function relDays(iso: string) {
  const d = daysSince(iso)
  if (d <= 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 31) return `${d} days ago`
  return dateShort(iso)
}

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join('')
