/**
 * Quarry Intelligence service.
 *
 * DEMO IMPLEMENTATION: no language model is connected. Each supported question maps to a
 * deterministic analysis computed from the local demo dataset, and answers say so.
 * The `ask` signature is the contract a real backend (FastAPI + an LLM with tool access to
 * read-only analytics endpoints) would fulfil.
 */
import type { Insight, IntelligenceAnswer } from '@/types/models'

import { outstandingByCustomer, totalOutstanding } from '@/data/commerce'
import { CUSTOMERS } from '@/data/people'
import { EXPENSE_BREAKDOWN, MONTHLY, demandByType, salesChangePct, salesLastMonth, salesThisMonth, slowMovingBlocks, stockByType } from '@/data/analytics'
import { PRODUCTION } from '@/data/operations'
import { inr, inrCompact, daysSince, num } from '@/lib/format'
import { isoDaysAgo } from '@/data/clock'
import { demoDelay } from './http'

export const SUGGESTED_QUESTIONS = [
  'What are my best-selling granite types?',
  'Which customers owe money?',
  'Which blocks have been in inventory too long?',
  'How much did we sell this month?',
  'What were our biggest expenses?',
  "Show me today's production.",
  'Which inventory should I promote?',
]

export function computeInsights(): Insight[] {
  const change = salesChangePct()
  const slow = slowMovingBlocks(60)
  const owed = totalOutstanding()
  return [
    { id: 'i-sales', tone: change >= 0 ? 'positive' : 'attention', text: `Sales are ${Math.abs(change).toFixed(0)}% ${change >= 0 ? 'higher' : 'lower'} than last month.`, href: '/app/analytics' },
    { id: 'i-slow', tone: 'attention', text: `${slow.length} blocks have been in inventory for over 60 days.`, href: '/app/inventory' },
    { id: 'i-owed', tone: 'attention', text: `${inrCompact(owed)} in customer payments are pending.`, href: '/app/payments' },
  ]
}
export const getInsights = () => demoDelay(computeInsights(), 350)

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w))

function answerFor(raw: string): IntelligenceAnswer {
  const q = raw.toLowerCase()

  if (has(q, 'best-selling', 'best selling', 'top selling', 'bestselling', 'granite type', 'demand')) {
    const rows = demandByType().sort((a, b) => b.soldBlocks - a.soldBlocks)
    const top = rows[0]!
    return {
      matched: true, title: 'Best-selling granite types',
      summary: `${top.type} leads with ${top.soldBlocks} blocks sold or in processing, worth ${inrCompact(top.revenue)}. ${rows[1]!.type} follows with ${rows[1]!.soldBlocks}.`,
      bars: rows.map((r) => ({ label: r.type, value: r.soldBlocks, display: `${r.soldBlocks} blocks · ${inrCompact(r.revenue)}` })),
      followUps: ['Which inventory should I promote?'], basis: 'Blocks with status sold, in processing or dispatched, across all quarries.',
    }
  }
  if (has(q, 'owe', 'outstanding', 'pending payment', 'unpaid', 'receivable')) {
    const rows = outstandingByCustomer().slice(0, 6)
    return {
      matched: true, title: 'Customers with outstanding balances',
      summary: `${inrCompact(totalOutstanding())} is outstanding across ${outstandingByCustomer().length} customers. ${CUSTOMERS.find((c) => c.id === rows[0]!.customerId)!.company} has the largest balance at ${inr(rows[0]!.amount)}.`,
      table: { columns: ['Customer', 'Outstanding'], rows: rows.map((r) => [CUSTOMERS.find((c) => c.id === r.customerId)!.company, inr(r.amount)]) },
      followUps: ['How much did we sell this month?'], basis: 'Order totals minus recorded payments, excluding cancelled orders.',
    }
  }
  if (has(q, 'inventory too long', 'too long', 'slow', 'aging', 'ageing', 'stale', '60 days')) {
    const slow = slowMovingBlocks(60)
    const value = slow.reduce((s, b) => s + b.price, 0)
    return {
      matched: true, title: 'Blocks held for more than 60 days',
      summary: `${slow.length} available blocks were extracted more than 60 days ago, with a combined list value of ${inrCompact(value)}. The oldest is ${slow[0]!.id} at ${daysSince(slow[0]!.extractedOn)} days.`,
      metrics: [{ label: 'Blocks', value: String(slow.length), tone: 'attention' }, { label: 'List value', value: inrCompact(value) }],
      table: { columns: ['Block', 'Type', 'Days held', 'Price'], rows: slow.slice(0, 6).map((b) => [b.id, b.type, String(daysSince(b.extractedOn)), inr(b.price)]) },
      followUps: ['Which inventory should I promote?'], basis: 'Blocks with status available, by extraction date.',
    }
  }
  if (has(q, 'sell this month', 'sales', 'sold this month', 'revenue', 'last month')) {
    const ch = salesChangePct()
    return {
      matched: true, title: 'Sales this month',
      summary: `Sales were ₹${salesThisMonth().toFixed(1)} lakh, ${Math.abs(ch).toFixed(0)}% ${ch >= 0 ? 'higher' : 'lower'} than the previous month (₹${salesLastMonth().toFixed(1)} lakh).`,
      metrics: [{ label: 'September', value: `₹${salesThisMonth().toFixed(1)}L`, tone: ch >= 0 ? 'positive' : 'attention' }, { label: 'August', value: `₹${salesLastMonth().toFixed(1)}L` }, { label: 'Change', value: `${ch >= 0 ? '+' : ''}${ch.toFixed(1)}%` }],
      bars: MONTHLY.slice(-6).map((m) => ({ label: m.month, value: m.sales, display: `₹${m.sales.toFixed(1)}L` })),
      followUps: ['What were our biggest expenses?'], basis: 'Monthly sales ledger (demo data).',
    }
  }
  if (has(q, 'expense', 'cost', 'spend')) {
    const total = EXPENSE_BREAKDOWN.reduce((s, e) => s + e.amount, 0)
    const top = EXPENSE_BREAKDOWN[0]!
    return {
      matched: true, title: 'Biggest expenses this month',
      summary: `Total expenses were ₹${total.toFixed(1)} lakh. ${top.category} was the largest line at ₹${top.amount.toFixed(1)} lakh (${((top.amount / total) * 100).toFixed(0)}%), followed by ${EXPENSE_BREAKDOWN[1]!.category.toLowerCase()}.`,
      bars: EXPENSE_BREAKDOWN.slice(0, 5).map((e) => ({ label: e.category, value: e.amount, display: `₹${e.amount.toFixed(1)}L` })),
      followUps: ['How much did we sell this month?'], basis: 'Expense ledger by category (demo data).',
    }
  }
  if (has(q, 'production', 'extract', 'today')) {
    const today = PRODUCTION.filter((p) => p.date === isoDaysAgo(0))
    const list = today.length ? today : PRODUCTION.filter((p) => p.date === isoDaysAgo(1))
    const label = today.length ? 'today' : 'yesterday (no entries logged yet today)'
    const blocks = list.reduce((s, p) => s + p.blocksExtracted, 0)
    const vol = list.reduce((s, p) => s + p.volumeCft, 0)
    return {
      matched: true, title: `Production ${label}`,
      summary: `${blocks} blocks were extracted, about ${num(vol)} cft across ${list.length} benches.`,
      table: { columns: ['Bench', 'Crew', 'Blocks', 'Volume (cft)'], rows: list.map((p) => [p.benchId, p.crew, String(p.blocksExtracted), num(p.volumeCft)]) },
      basis: 'Production log entries.',
    }
  }
  if (has(q, 'promote', 'discount', 'push', 'campaign')) {
    const demand = demandByType()
    const weakest = [...demand].sort((a, b) => a.sellThrough - b.sellThrough)[0]!
    const stock = stockByType().find((s) => s.type === weakest.type)!
    const slowOfType = slowMovingBlocks(45).filter((b) => b.type === weakest.type).slice(0, 5)
    return {
      matched: true, title: `Promote ${weakest.type}`,
      summary: `${weakest.type} has the lowest sell-through (${(weakest.sellThrough * 100).toFixed(0)}%) with ${stock.count} blocks available worth ${inrCompact(stock.value)}. Featuring it on the storefront and quoting it to recent enquiries is the strongest lever.`,
      table: slowOfType.length ? { columns: ['Block', 'Days held', 'Price'], rows: slowOfType.map((b) => [b.id, String(daysSince(b.extractedOn)), inr(b.price)]) } : undefined,
      followUps: ['What are my best-selling granite types?'], basis: 'Sell-through = blocks sold ÷ (sold + available), per type.',
    }
  }
  return {
    matched: false, title: 'That question is outside the demo',
    summary: 'This demo answers a fixed set of questions from the sample dataset. A production deployment would connect a language model to your live data.',
    followUps: SUGGESTED_QUESTIONS.slice(0, 4), basis: 'No analysis matched the question.',
  }
}

export const askIntelligence = (question: string) => demoDelay(answerFor(question), 700)
