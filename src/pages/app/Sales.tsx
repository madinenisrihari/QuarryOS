import { ArrowRight, Inbox } from 'lucide-react'
import { useState } from 'react'
import { AreaTrend } from '@/components/charts/Charts'
import { C } from '@/components/charts/theme'
import { DataTable, type Column } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'
import { MONTHLY } from '@/data/analytics'
import { balanceOf } from '@/data/commerce'
import { getCustomer } from '@/data/people'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services/api'
import type { Lead, LeadStage, Order } from '@/types/models'
import { dateShort, inr, inrCompact, relDays } from '@/lib/format'

const STAGES: { key: LeadStage; label: string }[] = [
  { key: 'new', label: 'New' }, { key: 'contacted', label: 'Contacted' }, { key: 'quoted', label: 'Quoted' },
  { key: 'negotiation', label: 'Negotiation' }, { key: 'won', label: 'Won' }, { key: 'lost', label: 'Lost' },
]
const NEXT: Partial<Record<LeadStage, LeadStage>> = { new: 'contacted', contacted: 'quoted', quoted: 'negotiation', negotiation: 'won' }

export default function Sales() {
  const toast = useToast()
  const leads = useAsync(() => api.leads.list(), [])
  const orders = useAsync(() => api.orders.list(), [])
  const [tab, setTab] = useState<'pipeline' | 'invoices'>('pipeline')
  const [moved, setMoved] = useState<Record<string, LeadStage>>({})
  if (leads.error) return <ErrorState message={leads.error.message} onRetry={leads.reload} />

  const list: Lead[] = (leads.data ?? []).map((l) => ({ ...l, stage: moved[l.id] ?? l.stage }))
  const open = list.filter((l) => !['won', 'lost'].includes(l.stage))
  const won = list.filter((l) => l.stage === 'won'), lost = list.filter((l) => l.stage === 'lost')
  const conversion = won.length + lost.length ? (won.length / (won.length + lost.length)) * 100 : 0

  const invCols: Column<Order>[] = [
    { key: 'inv', header: 'Invoice', mobile: 'title', cell: (o) => <span className="font-mono text-[13px]">INV-{o.id.slice(-4)}</span> },
    { key: 'cust', header: 'Customer', cell: (o) => getCustomer(o.customerId)?.company },
    { key: 'date', header: 'Issued', sortValue: (o) => o.date, cell: (o) => dateShort(o.date) },
    { key: 'due', header: 'Due', sortValue: (o) => o.dueDate, cell: (o) => dateShort(o.dueDate) },
    { key: 'amt', header: 'Amount', align: 'right', sortValue: (o) => o.total, cell: (o) => inr(o.total) },
    { key: 'bal', header: 'Balance', align: 'right', sortValue: (o) => balanceOf(o), cell: (o) => balanceOf(o) ? <span className="text-warn">{inr(balanceOf(o))}</span> : '·' },
    { key: 'st', header: 'Status', cell: (o) => <StatusBadge status={balanceOf(o) === 0 ? 'paid' : o.paid > 0 ? 'partial' : 'unpaid'} /> },
  ]
  const invoices = (orders.data ?? []).filter((o) => o.status !== 'cancelled')

  return (
    <>
      <PageHeader title="Sales" description="Enquiries in progress, and the invoices that follow." actions={<Button to="/app/quotations" variant="primary">New quotation</Button>} />
      <section aria-label="Sales summary" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {leads.loading ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[118px]" />) : <>
          <StatCard label="Open pipeline" value={open.reduce((s, l) => s + l.estValue, 0)} format={inrCompact} hint={`${open.length} live enquiries`} />
          <StatCard label="Won" value={won.reduce((s, l) => s + l.estValue, 0)} format={inrCompact} hint={`${won.length} deals`} />
          <StatCard label="Win rate" value={conversion} format={(n) => `${n.toFixed(0)}%`} hint="won ÷ (won + lost)" />
          <StatCard label="Sales this month" value={MONTHLY[11]!.sales} decimals={1} format={(n) => `₹${n.toFixed(1)}L`} delta={{ value: 14, label: 'vs last month' }} />
        </>}
      </section>
      <Card className="mb-6"><CardHeader title="Monthly sales" description="₹ lakh" /><div className="px-3 pb-4 pt-3"><AreaTrend data={MONTHLY} xKey="month" series={[{ key: 'sales', label: 'Sales', color: C.sand }]} height={200} fmt={(v) => `₹${v.toFixed(1)}L`} legend={false} /></div></Card>

      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'pipeline', label: 'Pipeline', count: list.length }, { value: 'invoices', label: 'Invoices', count: invoices.length }]} className="mb-5" />
      {tab === 'pipeline' ? (
        leads.loading ? <Skeleton className="h-72" /> : (
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0" role="list" aria-label="Sales pipeline">
            {STAGES.map((s) => {
              const col = list.filter((l) => l.stage === s.key)
              return (
                <section key={s.key} role="listitem" aria-label={s.label} className="w-[78%] shrink-0 snap-start sm:w-[260px]">
                  <div className="mb-2 flex items-center justify-between px-1 text-[13px]"><span className="font-medium">{s.label}</span><span className="text-muted tabular">{col.length} · {inrCompact(col.reduce((t, l) => t + l.estValue, 0))}</span></div>
                  <div className="space-y-2 rounded-xl border border-line bg-surface/50 p-2">
                    {!col.length && <p className="flex items-center gap-2 px-2 py-6 text-xs text-subtle"><Inbox className="h-4 w-4" aria-hidden />Nothing here</p>}
                    {col.map((l) => (
                      <article key={l.id} className="rounded-lg border border-line bg-surface p-3">
                        <div className="text-sm font-medium">{l.company}</div><div className="text-xs text-muted">{l.name}</div>
                        <div className="mt-2 text-[13px]">{l.interest}</div>
                        <div className="mt-3 flex items-center justify-between text-xs"><span className="tabular font-medium">{inrCompact(l.estValue)}</span><Badge>{l.source}</Badge></div>
                        <div className="mt-2 flex items-center justify-between text-xs text-muted"><span>{relDays(l.date)}</span>
                          {NEXT[l.stage] && <button onClick={() => { setMoved((m) => ({ ...m, [l.id]: NEXT[l.stage]! })); toast({ title: `${l.company} moved to ${NEXT[l.stage]}` }) }} className="inline-flex items-center gap-1 text-sand hover:underline" aria-label={`Move ${l.company} to ${NEXT[l.stage]}`}>Advance<ArrowRight className="h-3 w-3" aria-hidden /></button>}</div>
                      </article>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )
      ) : (
        <Card>{orders.loading ? <Skeleton className="m-5 h-64" /> : <DataTable caption="Invoices" columns={invCols} rows={invoices} rowKey={(o) => o.id} pageSize={12} />}</Card>
      )}
    </>
  )
}
