import type { GraniteType, MarketplaceListing, MonthlyPoint } from '@/types/models'
import { BLOCKS, GRANITE_TYPES } from './blocks'
import { ORDERS, balanceOf } from './commerce'
import { CUSTOMERS } from './people'
import { daysSince } from '@/lib/format'

/** DEMO DATA. Sales and expenses in ₹ lakh. */
export const MONTHLY: MonthlyPoint[] = [
  { month: 'Oct', sales: 31.5, expenses: 22.4, extracted: 58, dispatched: 49 },
  { month: 'Nov', sales: 34.8, expenses: 23.1, extracted: 61, dispatched: 55 },
  { month: 'Dec', sales: 29.6, expenses: 21.8, extracted: 52, dispatched: 47 },
  { month: 'Jan', sales: 36.2, expenses: 24.6, extracted: 64, dispatched: 58 },
  { month: 'Feb', sales: 38.9, expenses: 25.2, extracted: 67, dispatched: 60 },
  { month: 'Mar', sales: 41.7, expenses: 27.0, extracted: 72, dispatched: 66 },
  { month: 'Apr', sales: 39.4, expenses: 26.1, extracted: 66, dispatched: 62 },
  { month: 'May', sales: 44.1, expenses: 28.4, extracted: 74, dispatched: 69 },
  { month: 'Jun', sales: 40.8, expenses: 27.2, extracted: 69, dispatched: 63 },
  { month: 'Jul', sales: 45.6, expenses: 29.0, extracted: 76, dispatched: 70 },
  { month: 'Aug', sales: 42.3, expenses: 28.1, extracted: 71, dispatched: 66 },
  { month: 'Sep', sales: 48.2, expenses: 30.3, extracted: 78, dispatched: 73 },
]
export const MONTHLY_WITH_PROFIT = MONTHLY.map((m) => ({ ...m, profit: Math.round((m.sales - m.expenses) * 10) / 10 }))

export const salesThisMonth = () => MONTHLY[MONTHLY.length - 1]!.sales
export const salesLastMonth = () => MONTHLY[MONTHLY.length - 2]!.sales
export const salesChangePct = () => ((salesThisMonth() - salesLastMonth()) / salesLastMonth()) * 100

/** ₹ lakh, September. Sums to the September expense total above. */
export const EXPENSE_BREAKDOWN = [
  { category: 'Wages and contractors', amount: 8.4 },
  { category: 'Diesel and power', amount: 7.6 },
  { category: 'Drilling and explosives', amount: 6.2 },
  { category: 'Royalty and statutory', amount: 3.9 },
  { category: 'Machinery upkeep', amount: 2.1 },
  { category: 'Transport', amount: 1.5 },
  { category: 'Other', amount: 0.6 },
]

export function demandByType() {
  return GRANITE_TYPES.map((type) => {
    const sold = BLOCKS.filter((b) => b.type === type && ['sold', 'dispatched', 'in_processing'].includes(b.status))
    const available = BLOCKS.filter((b) => b.type === type && b.status === 'available')
    return {
      type, soldBlocks: sold.length, revenue: sold.reduce((s, b) => s + b.price, 0), available: available.length,
      sellThrough: sold.length + available.length ? sold.length / (sold.length + available.length) : 0,
    }
  })
}

export function topCustomers(limit = 6) {
  const totals = new Map<string, number>()
  for (const o of ORDERS) if (o.status !== 'cancelled') totals.set(o.customerId, (totals.get(o.customerId) ?? 0) + o.total)
  return [...totals.entries()]
    .map(([id, total]) => ({ customer: CUSTOMERS.find((c) => c.id === id)!, total, outstanding: ORDERS.filter((o) => o.customerId === id).reduce((s, o) => s + balanceOf(o), 0) }))
    .sort((a, b) => b.total - a.total).slice(0, limit)
}

export const agingBuckets = () => {
  const avail = BLOCKS.filter((b) => b.status === 'available')
  const bucket = (lo: number, hi: number) => avail.filter((b) => { const d = daysSince(b.extractedOn); return d >= lo && d < hi }).length
  return [
    { label: '0–14 days', count: bucket(0, 15) }, { label: '15–30', count: bucket(15, 31) }, { label: '31–60', count: bucket(31, 61) },
    { label: '61–90', count: bucket(61, 91) }, { label: '90+', count: bucket(91, 9999) },
  ]
}
export const slowMovingBlocks = (days = 60) => BLOCKS.filter((b) => b.status === 'available' && daysSince(b.extractedOn) > days).sort((a, b) => daysSince(b.extractedOn) - daysSince(a.extractedOn))

export const inventoryStats = () => {
  const available = BLOCKS.filter((b) => b.status === 'available')
  return {
    total: BLOCKS.length,
    available: available.length,
    availableValue: available.reduce((s, b) => s + b.price, 0),
    reserved: BLOCKS.filter((b) => b.status === 'reserved').length,
    volumeCft: available.reduce((s, b) => s + b.volumeCft, 0),
  }
}
export const stockByType = () => GRANITE_TYPES.map((type) => {
  const list = BLOCKS.filter((b) => b.type === type && b.status === 'available')
  return { type, count: list.length, value: list.reduce((s, b) => s + b.price, 0), volumeCft: list.reduce((s, b) => s + b.volumeCft, 0) }
})

export const inventoryMovement = () => MONTHLY.map((m) => ({ month: m.month, in: m.extracted, out: m.dispatched, net: m.extracted - m.dispatched }))

/** Marketplace preview. Listings from other quarries are illustrative only. */
const L = (id: string, title: string, slug: string, quarryName: string, state: string, country: string, type: GraniteType, kind: 'Block' | 'Slab', size: string, priceFrom: number, unit: string, availability: MarketplaceListing['availability'], seed: number): MarketplaceListing =>
  ({ id, title, quarrySlug: slug, quarryName, state, country, type, kind, size, priceFrom, unit, availability, seed })
export const LISTINGS: MarketplaceListing[] = [
  L('ml1', 'Black Galaxy export blocks', 'meridian-granites', 'Meridian Granites · Kondapi Ridge', 'Andhra Pradesh', 'India', 'Black Galaxy', 'Block', '7–9 ft length', 1850, 'per cft', 'In stock', 11),
  L('ml2', 'Absolute Black premium blocks', 'meridian-granites', 'Meridian Granites · Kondapi Ridge', 'Andhra Pradesh', 'India', 'Absolute Black', 'Block', '7–9 ft length', 1195, 'per cft', 'In stock', 22),
  L('ml3', 'Black Galaxy polished slabs, 20 mm', 'stonecraft-demo', 'Stonecraft Exports (demo listing)', 'Tamil Nadu', 'India', 'Black Galaxy', 'Slab', '2800 × 1600 mm', 265, 'per sq ft', 'Limited', 33),
  L('ml4', 'Colonial White blocks', 'meridian-granites-nagavaram', 'Meridian Granites · Nagavaram Hills', 'Andhra Pradesh', 'India', 'Colonial White', 'Block', '7–9 ft length', 700, 'per cft', 'In stock', 44),
  L('ml5', 'Viscount White flamed slabs', 'northern-ridge-demo', 'Northern Ridge Quarries (demo listing)', 'Karnataka', 'India', 'Viscount White', 'Slab', '2600 × 1500 mm', 210, 'per sq ft', 'In stock', 55),
  L('ml6', 'Tan Brown blocks', 'meridian-granites-nagavaram', 'Meridian Granites · Nagavaram Hills', 'Andhra Pradesh', 'India', 'Tan Brown', 'Block', '7–9 ft length', 780, 'per cft', 'Limited', 66),
  L('ml7', 'Steel Grey blocks', 'meridian-granites', 'Meridian Granites · Kondapi Ridge', 'Andhra Pradesh', 'India', 'Steel Grey', 'Block', '7–9 ft length', 620, 'per cft', 'In stock', 77),
  L('ml8', 'Steel Grey honed slabs, 30 mm', 'deccan-slab-demo', 'Deccan Slab Works (demo listing)', 'Telangana', 'India', 'Steel Grey', 'Slab', '2700 × 1600 mm', 155, 'per sq ft', 'Made to order', 88),
  L('ml9', 'Absolute Black monument blocks', 'sundar-stone-demo', 'Sundar Stone Co. (demo listing)', 'Tamil Nadu', 'India', 'Absolute Black', 'Block', '4–6 ft length', 1320, 'per cft', 'Limited', 99),
]
