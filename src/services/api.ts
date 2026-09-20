/**
 * Data access boundary. Pages and hooks only import from here, never from /data.
 * To go live: replace each body with `request<T>('/v1/...')` from ./http, keeping signatures unchanged.
 */
import type { Block, BlockEvent, BlockStatus, Customer, GraniteType, Order, Payment, Quotation, Lead, Trip, Vehicle, Employee, Machine, MaintenanceRecord, ProductionEntry, Quarry } from '@/types/models'
import { BLOCKS, blockEvents, getBlock } from '@/data/blocks'
import { CUSTOMERS, EMPLOYEES } from '@/data/people'
import { ORDERS, PAYMENTS, QUOTATIONS, LEADS, ACTIVE_ORDER_STATUSES, totalOutstanding, overdueOutstanding } from '@/data/commerce'
import { TRIPS, VEHICLES, MACHINES, MAINTENANCE_LOG, PRODUCTION } from '@/data/operations'
import { QUARRIES, getQuarryBySlug } from '@/data/quarries'
import { LISTINGS, MONTHLY, salesChangePct, stockByType, slowMovingBlocks } from '@/data/analytics'
import { daysSince } from '@/lib/format'
import { demoDelay } from './http'

export interface BlockFilters {
  q?: string
  quarryId?: string
  types?: GraniteType[]
  colors?: ('Black' | 'Grey' | 'White' | 'Brown')[]
  status?: BlockStatus | 'all'
  size?: 'all' | 'small' | 'medium' | 'large'
  maxPrice?: number
  location?: string
  extractedWithinDays?: number
  sort?: 'newest' | 'oldest' | 'price_desc' | 'price_asc' | 'volume_desc'
}

export const colorFamily = (t: GraniteType): 'Black' | 'Grey' | 'White' | 'Brown' =>
  t === 'Black Galaxy' || t === 'Absolute Black' ? 'Black' : t === 'Steel Grey' ? 'Grey' : t === 'Tan Brown' ? 'Brown' : 'White'

export function filterBlocks(f: BlockFilters): Block[] {
  const q = f.q?.trim().toLowerCase()
  let list = BLOCKS.filter((b) => {
    if (q && !`${b.id} ${b.type} ${b.location} ${b.notes}`.toLowerCase().includes(q)) return false
    if (f.quarryId && f.quarryId !== 'all' && b.quarryId !== f.quarryId) return false
    if (f.types?.length && !f.types.includes(b.type)) return false
    if (f.colors?.length && !f.colors.includes(colorFamily(b.type))) return false
    if (f.status && f.status !== 'all' && b.status !== f.status) return false
    if (f.size === 'small' && b.volumeCft >= 150) return false
    if (f.size === 'medium' && (b.volumeCft < 150 || b.volumeCft > 220)) return false
    if (f.size === 'large' && b.volumeCft <= 220) return false
    if (f.maxPrice && b.price > f.maxPrice) return false
    if (f.location && f.location !== 'all' && !b.location.startsWith(f.location)) return false
    if (f.extractedWithinDays && daysSince(b.extractedOn) > f.extractedWithinDays) return false
    return true
  })
  const s = f.sort ?? 'newest'
  list = [...list].sort((a, b) =>
    s === 'newest' ? b.extractedOn.localeCompare(a.extractedOn)
    : s === 'oldest' ? a.extractedOn.localeCompare(b.extractedOn)
    : s === 'price_desc' ? b.price - a.price
    : s === 'price_asc' ? a.price - b.price
    : b.volumeCft - a.volumeCft)
  return list
}

export function buildDashboardSummary(quarryId: string) {
  const blocks = BLOCKS.filter((b) => quarryId === 'all' || b.quarryId === quarryId)
  const available = blocks.filter((b) => b.status === 'available')
  const last = MONTHLY[MONTHLY.length - 1]!
  const share = blocks.length / BLOCKS.length
  return {
    totalBlocks: blocks.length,
    availableBlocks: available.length,
    availableValue: available.reduce((s, b) => s + b.price, 0),
    monthlySalesLakh: Math.round(last.sales * (quarryId === 'all' ? 1 : share) * 10) / 10,
    salesChangePct: salesChangePct(),
    activeOrders: ORDERS.filter((o) => ACTIVE_ORDER_STATUSES.includes(o.status)).length,
    outstanding: totalOutstanding(),
    overdue: overdueOutstanding(),
    extractedThisMonth: Math.round(last.extracted * (quarryId === 'all' ? 1 : share)),
    slowMoving: slowMovingBlocks(60).filter((b) => quarryId === 'all' || b.quarryId === quarryId).length,
    stockByType: stockByType(),
  }
}
export type DashboardSummary = ReturnType<typeof buildDashboardSummary>

export const api = {
  dashboard: { summary: (quarryId = 'all') => demoDelay(buildDashboardSummary(quarryId), 450) },
  blocks: {
    list: (f: BlockFilters = {}) => demoDelay(filterBlocks(f)),
    get: (id: string) => demoDelay(getBlock(id) ?? null, 260),
    events: (id: string): Promise<BlockEvent[]> => demoDelay(getBlock(id) ? blockEvents(getBlock(id)!) : [], 300),
    all: () => BLOCKS,
  },
  customers: {
    list: (): Promise<Customer[]> => demoDelay(CUSTOMERS, 300),
    get: (id: string) => demoDelay(CUSTOMERS.find((c) => c.id === id) ?? null, 220),
  },
  orders: { list: (): Promise<Order[]> => demoDelay(ORDERS) },
  payments: { list: (): Promise<Payment[]> => demoDelay(PAYMENTS) },
  quotations: { list: (): Promise<Quotation[]> => demoDelay(QUOTATIONS, 300) },
  leads: { list: (): Promise<Lead[]> => demoDelay(LEADS, 280) },
  vehicles: { list: (): Promise<Vehicle[]> => demoDelay(VEHICLES, 300) },
  trips: { list: (): Promise<Trip[]> => demoDelay(TRIPS, 320) },
  employees: { list: (): Promise<Employee[]> => demoDelay(EMPLOYEES, 300) },
  machinery: { list: (): Promise<Machine[]> => demoDelay(MACHINES, 300), log: (): Promise<MaintenanceRecord[]> => demoDelay(MAINTENANCE_LOG, 260) },
  production: { list: (): Promise<ProductionEntry[]> => demoDelay(PRODUCTION, 300) },
  quarries: {
    list: (): Promise<Quarry[]> => demoDelay(QUARRIES, 260),
    bySlug: (slug: string) => demoDelay(getQuarryBySlug(slug) ?? null, 320),
  },
  marketplace: { listings: () => demoDelay(LISTINGS, 350) },
}
