import type { Lead, Order, OrderStatus, Payment, Quotation } from '@/types/models'
import { BLOCKS } from './blocks'
import { CUSTOMERS } from './people'
import { DEMO_NOW, isoDaysAgo, isoDaysAhead } from './clock'
import { mulberry32 } from '@/lib/seed'

const rand = mulberry32(2609)

const DESTINATIONS: Record<string, string> = {
  'c-arcadia': 'Krishnapatnam Port', 'c-lumina': 'Chennai Port', 'c-vijaya': 'Hyderabad', 'c-coastal': 'Chennai Port',
  'c-ramanathan': 'Coimbatore', 'c-kiran': 'Bengaluru', 'c-alnoor': 'Krishnapatnam Port', 'c-sundaram': 'Madurai',
  'c-pinnacle': 'Pune', 'c-bhavani': 'Vijayawada', 'c-northgate': 'Chennai Port', 'c-deccan': 'Bidar',
}

const statusFor = (s: string): OrderStatus =>
  s === 'reserved' ? 'confirmed' : s === 'in_processing' ? 'processing' : s === 'sold' ? 'ready' : rand() < 0.55 ? 'delivered' : 'dispatched'

/** Orders are derived from non-available blocks so every order references real block records. */
function buildOrders(): Order[] {
  const byCustomer = new Map<string, typeof BLOCKS>()
  for (const b of BLOCKS) {
    if (!b.customerId) continue
    byCustomer.set(b.customerId, [...(byCustomer.get(b.customerId) ?? []), b])
  }
  const orders: Order[] = []
  let seq = 1
  for (const [customerId, blocks] of byCustomer) {
    for (let i = 0; i < blocks.length; ) {
      const size = Math.min(blocks.length - i, 1 + Math.floor(rand() * 3))
      const chunk = blocks.slice(i, i + size)
      i += size
      const status = statusFor(chunk[0]!.status)
      const total = Math.round((chunk.reduce((s, b) => s + b.price, 0) * 1.02) / 1000) * 1000
      const ageDays = status === 'delivered' ? 35 + Math.floor(rand() * 30) : status === 'dispatched' ? 12 + Math.floor(rand() * 20) : 2 + Math.floor(rand() * 25)
      const paidRatio = { confirmed: 0.15 + rand() * 0.15, processing: 0.5 + rand() * 0.2, ready: 0.7 + rand() * 0.3, dispatched: 0.8 + rand() * 0.2, delivered: rand() < 0.75 ? 1 : 0.85, cancelled: 0 }[status]
      orders.push({
        id: `SO-2026-${String(seq++).padStart(4, '0')}`,
        customerId, blockIds: chunk.map((b) => b.id),
        date: isoDaysAgo(ageDays), dueDate: isoDaysAgo(ageDays - 30),
        total, paid: Math.round((total * paidRatio) / 1000) * 1000, status,
        destination: DESTINATIONS[customerId] ?? 'Ex-yard',
      })
    }
  }
  return orders.sort((a, b) => b.date.localeCompare(a.date))
}
/** Scale open balances so demo receivables stay in proportion to monthly sales (about ₹12.4L outstanding). */
function calibrate(orders: Order[], target = 1_240_000): Order[] {
  const open = orders.reduce((s, o) => s + Math.max(0, o.total - o.paid), 0)
  const f = open > 0 ? target / open : 1
  return orders.map((o) => ({ ...o, paid: o.total - Math.round((Math.max(0, o.total - o.paid) * f) / 1000) * 1000 }))
}
export const ORDERS: Order[] = calibrate(buildOrders())
export const getOrder = (id: string) => ORDERS.find((o) => o.id === id)
export const ACTIVE_ORDER_STATUSES: OrderStatus[] = ['confirmed', 'processing', 'ready', 'dispatched']
export const balanceOf = (o: Order) => (o.status === 'cancelled' ? 0 : Math.max(0, o.total - o.paid))

const METHODS: Payment['method'][] = ['Bank transfer', 'UPI', 'Cheque', 'Letter of credit', 'Bank transfer']

function buildPayments(): Payment[] {
  const out: Payment[] = []
  let seq = 1
  for (const o of ORDERS) {
    if (o.paid > 0) {
      const parts = o.paid > 300000 && rand() < 0.6 ? 2 : 1
      let remaining = o.paid
      for (let p = 0; p < parts; p++) {
        const amt = p === parts - 1 ? remaining : Math.round((remaining * 0.6) / 1000) * 1000
        remaining -= amt
        const isForeign = ['c-arcadia', 'c-lumina', 'c-alnoor', 'c-northgate'].includes(o.customerId)
        out.push({
          id: `PAY-${String(seq++).padStart(4, '0')}`, orderId: o.id, customerId: o.customerId, amount: amt,
          method: isForeign ? (o.customerId === 'c-lumina' ? 'Letter of credit' : 'Bank transfer') : METHODS[Math.floor(rand() * METHODS.length)]!,
          date: isoDaysAgo(Math.max(0, Math.floor(new Date(DEMO_NOW).getTime() / 86400000 - new Date(o.date).getTime() / 86400000) - (p === 0 ? 1 : -3) - Math.floor(rand() * 6))),
          status: 'received', reference: `TXN${100000 + Math.floor(rand() * 899999)}`,
        })
      }
    }
    const bal = balanceOf(o)
    if (bal > 0) {
      out.push({
        id: `PAY-${String(seq++).padStart(4, '0')}`, orderId: o.id, customerId: o.customerId, amount: bal, method: 'Bank transfer',
        date: o.dueDate, status: new Date(o.dueDate) < DEMO_NOW ? 'overdue' : 'pending', reference: 'Awaiting payment',
      })
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date))
}
export const PAYMENTS: Payment[] = buildPayments()

const availableIds = BLOCKS.filter((b) => b.status === 'available').map((b) => b.id)

export const QUOTATIONS: Quotation[] = [
  { id: 'QT-2609-014', customerId: 'c-arcadia', lines: [{ blockId: availableIds[0]!, price: BLOCKS.find((b) => b.id === availableIds[0])!.price }, { blockId: availableIds[3]!, price: BLOCKS.find((b) => b.id === availableIds[3])!.price }], transport: 48000, taxRatePct: 18, date: isoDaysAgo(2), validUntil: isoDaysAhead(12), status: 'sent' },
  { id: 'QT-2609-013', customerId: 'c-pinnacle', lines: [{ blockId: 'GR-1042', price: 240000 }], transport: 22000, taxRatePct: 18, date: isoDaysAgo(4), validUntil: isoDaysAhead(10), status: 'sent' },
  { id: 'QT-2609-012', customerId: 'c-kiran', lines: [{ blockId: availableIds[6]!, price: BLOCKS.find((b) => b.id === availableIds[6])!.price }, { blockId: availableIds[9]!, price: BLOCKS.find((b) => b.id === availableIds[9])!.price }, { blockId: availableIds[11]!, price: BLOCKS.find((b) => b.id === availableIds[11])!.price }], transport: 36000, taxRatePct: 18, date: isoDaysAgo(6), validUntil: isoDaysAhead(8), status: 'accepted' },
  { id: 'QT-2609-011', customerId: 'c-ramanathan', lines: [{ blockId: availableIds[14]!, price: BLOCKS.find((b) => b.id === availableIds[14])!.price }], transport: 14000, taxRatePct: 18, date: isoDaysAgo(9), validUntil: isoDaysAhead(5), status: 'draft' },
  { id: 'QT-2609-010', customerId: 'c-alnoor', lines: [{ blockId: availableIds[16]!, price: BLOCKS.find((b) => b.id === availableIds[16])!.price }, { blockId: availableIds[18]!, price: BLOCKS.find((b) => b.id === availableIds[18])!.price }], transport: 52000, taxRatePct: 18, date: isoDaysAgo(15), validUntil: isoDaysAgo(1), status: 'expired' },
  { id: 'QT-2609-009', customerId: 'c-deccan', lines: [{ blockId: availableIds[21]!, price: BLOCKS.find((b) => b.id === availableIds[21])!.price }], transport: 18000, taxRatePct: 18, date: isoDaysAgo(18), validUntil: isoDaysAgo(4), status: 'declined' },
]
export const quoteSubtotal = (q: Quotation) => q.lines.reduce((s, l) => s + l.price, 0)
export const quoteTotal = (q: Quotation) => Math.round((quoteSubtotal(q) + q.transport) * (1 + q.taxRatePct / 100))

export const LEADS: Lead[] = [
  { id: 'L-301', name: 'Hannah Vogel', company: 'Vogel Naturstein', interest: 'Black Galaxy, 6 blocks', estValue: 1450000, stage: 'quoted', source: 'Storefront', date: isoDaysAgo(3) },
  { id: 'L-302', name: 'Manoj Patil', company: 'Patil Granite Works', interest: 'Tan Brown slabs', estValue: 620000, stage: 'new', source: 'QR scan', date: isoDaysAgo(1) },
  { id: 'L-303', name: 'Ibrahim Khalil', company: 'Gulf Stone Traders', interest: 'Colonial White, 4 blocks', estValue: 980000, stage: 'negotiation', source: 'Referral', date: isoDaysAgo(8) },
  { id: 'L-304', name: 'Sanjana Rao', company: 'Rao Kitchens & Interiors', interest: 'Absolute Black, 2 blocks', estValue: 470000, stage: 'contacted', source: 'Phone', date: isoDaysAgo(5) },
  { id: 'L-305', name: 'Thomas Brandt', company: 'Brandt Steinhandel', interest: 'Steel Grey, 8 blocks', estValue: 1120000, stage: 'quoted', source: 'Trade enquiry', date: isoDaysAgo(6) },
  { id: 'L-306', name: 'Lakshmi Devi', company: 'Sri Devi Monuments', interest: 'Absolute Black, 1 block', estValue: 240000, stage: 'won', source: 'QR scan', date: isoDaysAgo(11) },
  { id: 'L-307', name: 'Arvind Menon', company: 'Menon Projects', interest: 'Viscount White flooring', estValue: 860000, stage: 'new', source: 'Storefront', date: isoDaysAgo(0) },
  { id: 'L-308', name: 'Yusuf Demir', company: 'Demir Mermer', interest: 'Black Galaxy, 3 blocks', estValue: 780000, stage: 'lost', source: 'Trade enquiry', date: isoDaysAgo(21) },
  { id: 'L-309', name: 'Kavya Shetty', company: 'Shetty Stone Art', interest: 'Steel Grey, 2 blocks', estValue: 260000, stage: 'contacted', source: 'Referral', date: isoDaysAgo(2) },
]

export function outstandingByCustomer() {
  const map = new Map<string, number>()
  for (const o of ORDERS) { const b = balanceOf(o); if (b > 0) map.set(o.customerId, (map.get(o.customerId) ?? 0) + b) }
  return [...map.entries()].map(([customerId, amount]) => ({ customerId, amount })).sort((a, b) => b.amount - a.amount)
}
export const totalOutstanding = () => ORDERS.reduce((s, o) => s + balanceOf(o), 0)
export const overdueOutstanding = () => PAYMENTS.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.amount, 0)
