import { ArrowLeft, Banknote, Building2, Mail, MapPin, Package, Phone, Search, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Timeline, type TimelineItem } from '@/components/common/Timeline'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmptyState, ErrorState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services/api'
import { balanceOf } from '@/data/commerce'
import type { Customer, Order, Payment } from '@/types/models'
import { cn } from '@/lib/cn'
import { dateShort, initials, inr, inrCompact } from '@/lib/format'

function Detail({ c, orders, payments }: { c: Customer; orders: Order[]; payments: Payment[] }) {
  const toast = useToast()
  const mine = orders.filter((o) => o.customerId === c.id)
  const pays = payments.filter((p) => p.customerId === c.id && p.status === 'received')
  const lifetime = mine.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
  const outstanding = mine.reduce((s, o) => s + balanceOf(o), 0)
  const items: TimelineItem[] = [
    ...mine.map((o) => ({ id: o.id, at: o.date, title: `Order ${o.id}`, detail: `${o.blockIds.length} block${o.blockIds.length > 1 ? 's' : ''} · ${inr(o.total)} · ${o.status.replace('_', ' ')}`, icon: Package })),
    ...pays.map((p) => ({ id: p.id, at: p.date, title: `Payment received: ${inr(p.amount)}`, detail: `${p.method} · ${p.reference}`, icon: Banknote })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10)
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-sand/15 text-lg font-semibold text-sand">{initials(c.company)}</span>
            <div><h2 className="text-xl font-semibold tracking-tight">{c.company}</h2><p className="text-sm text-muted">{c.name} · <Badge>{c.segment}</Badge></p></div></div>
          <div className="flex gap-2"><Button to={`/app/quotations?customer=${c.id}`} variant="primary">New quotation</Button><Button onClick={() => toast({ tone: 'info', title: 'Note editing is not wired up in the demo' })}>Add note</Button></div>
        </div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2.5"><Phone className="h-4 w-4 text-subtle" aria-hidden /><dt className="sr-only">Phone</dt><dd><a href={`tel:${c.phone.replace(/\s/g, '')}`} className="hover:text-sand">{c.phone}</a></dd></div>
          <div className="flex items-center gap-2.5"><Mail className="h-4 w-4 text-subtle" aria-hidden /><dt className="sr-only">Email</dt><dd className="truncate"><a href={`mailto:${c.email}`} className="hover:text-sand">{c.email}</a></dd></div>
          <div className="flex items-center gap-2.5"><MapPin className="h-4 w-4 text-subtle" aria-hidden /><dt className="sr-only">Location</dt><dd>{c.city}, {c.country}</dd></div>
          <div className="flex items-center gap-2.5"><Building2 className="h-4 w-4 text-subtle" aria-hidden /><dt className="sr-only">Customer since</dt><dd>Customer since {dateShort(c.since)}</dd></div>
        </dl>
      </Card>
      <div className="grid grid-cols-3 gap-3">
        {[['Lifetime purchases', inrCompact(lifetime)], ['Orders', String(mine.length)], ['Outstanding', inrCompact(outstanding)]].map(([k, v], i) => (
          <div key={k} className="panel p-4"><div className="text-xs text-muted">{k}</div><div className={cn('mt-1.5 text-xl font-semibold tabular', i === 2 && outstanding > 0 && 'text-warn')}>{v}</div></div>
        ))}
      </div>
      <Card><CardHeader title="Notes" /><p className="px-5 pb-5 pt-2 text-sm text-fg/90">{c.notes}</p></Card>
      <Card><CardHeader title="Activity" description="Orders and payments, newest first" /><div className="p-5 pt-6">{items.length ? <Timeline items={items} /> : <p className="text-sm text-muted">No orders or payments yet.</p>}</div></Card>
      <Card><CardHeader title="Orders" />
        <ul className="divide-y divide-line px-5 pb-2 pt-2">{mine.length ? mine.map((o) => <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span><span className="font-mono text-[13px]">{o.id}</span><span className="ml-2 text-muted">{dateShort(o.date)}</span></span><span className="flex items-center gap-3"><span className="tabular">{inr(o.total)}</span><StatusBadge status={o.status} /></span></li>) : <li className="py-6 text-sm text-muted">No orders yet.</li>}</ul></Card>
    </div>
  )
}

export default function Customers() {
  const toast = useToast()
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useAsync(async () => { const [c, o, p] = await Promise.all([api.customers.list(), api.orders.list(), api.payments.list()]); return { c, o, p } }, [])
  const [q, setQ] = useState('')
  const list = useMemo(() => (data?.c ?? []).filter((c) => `${c.company} ${c.name} ${c.city}`.toLowerCase().includes(q.toLowerCase())), [data, q])
  if (error) return <ErrorState message={error.message} onRetry={reload} />
  const selected = data?.c.find((c) => c.id === id)
  const active = selected ?? (window.matchMedia('(min-width: 1024px)').matches ? list[0] : undefined)

  return (
    <>
      <PageHeader title="Customers" description="Who you sell to, what they have bought and what they owe." actions={<Button variant="primary" onClick={() => toast({ tone: 'info', title: 'Customer creation is not wired up in the demo' })}>Add customer</Button>} />
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className={cn(id && 'hidden lg:block')}>
          <div className="relative mb-3"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden /><label htmlFor="cust-q" className="sr-only">Search customers</label>
            <input id="cust-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" className="h-10 w-full rounded-lg border border-line-strong bg-surface-2/60 pl-9 pr-3 text-sm focus:border-sand/60 focus:outline-none focus:ring-2 focus:ring-sand/20" /></div>
          {loading ? <div className="space-y-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-16" />)}</div> : !list.length ? <EmptyState icon={Users} title="No customers found" description="Try a different name or city." /> : (
            <ul className="space-y-1.5" aria-label="Customers">
              {list.map((c) => { const out = data!.o.filter((o) => o.customerId === c.id).reduce((s, o) => s + balanceOf(o), 0); const on = active?.id === c.id; return (
                <li key={c.id}><Link to={`/app/customers/${c.id}`} aria-current={on ? 'true' : undefined} className={cn('flex items-center gap-3 rounded-xl border p-3 transition-colors', on ? 'border-sand/40 bg-sand/[0.06]' : 'border-line bg-surface hover:border-line-strong')}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-3 text-xs font-semibold text-muted">{initials(c.company)}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{c.company}</span><span className="block truncate text-xs text-muted">{c.city}, {c.country}</span></span>
                  {out > 0 && <span className="shrink-0 text-xs text-warn tabular">{inrCompact(out)}</span>}</Link></li>) })}
            </ul>)}
        </div>
        <div className={cn(!id && 'hidden lg:block')}>
          {id && <button onClick={() => navigate('/app/customers')} className="mb-3 flex items-center gap-1.5 text-sm text-muted hover:text-fg lg:hidden"><ArrowLeft className="h-4 w-4" aria-hidden />All customers</button>}
          {loading ? <Skeleton className="h-[500px]" /> : active ? <Detail c={active} orders={data!.o} payments={data!.p} /> : <EmptyState icon={Users} title="Customer not found" description="Choose someone from the list." />}
        </div>
      </div>
    </>
  )
}
