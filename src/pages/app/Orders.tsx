import { Check } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DataTable, type Column } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Progress } from '@/components/ui/Progress'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'
import { ACTIVE_ORDER_STATUSES, balanceOf } from '@/data/commerce'
import { getBlock } from '@/data/blocks'
import { getCustomer } from '@/data/people'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services/api'
import type { Order, OrderStatus } from '@/types/models'
import { cn } from '@/lib/cn'
import { dateShort, inr, inrCompact } from '@/lib/format'

const FLOW: OrderStatus[] = ['confirmed', 'processing', 'ready', 'dispatched', 'delivered']
const LABEL: Record<string, string> = { confirmed: 'Confirmed', processing: 'Processing', ready: 'Ready', dispatched: 'Dispatched', delivered: 'Delivered' }

function Stepper({ status }: { status: OrderStatus }) {
  const idx = FLOW.indexOf(status)
  if (status === 'cancelled') return <StatusBadge status="cancelled" />
  return (
    <ol className="flex items-center" aria-label={`Order progress: ${LABEL[status]}`}>
      {FLOW.map((s, i) => (
        <li key={s} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <span className={cn('grid h-6 w-6 place-items-center rounded-full border text-[10px]', i < idx ? 'border-sand bg-sand text-bg' : i === idx ? 'border-sand text-sand' : 'border-line-strong text-subtle')}>{i < idx ? <Check className="h-3 w-3" aria-hidden /> : i + 1}</span>
            <span className={cn('text-[11px]', i <= idx ? 'text-fg' : 'text-subtle')}>{LABEL[s]}</span>
          </div>
          {i < FLOW.length - 1 && <span className={cn('mx-1 mb-5 h-px flex-1', i < idx ? 'bg-sand' : 'bg-line-strong')} />}
        </li>
      ))}
    </ol>
  )
}

export default function Orders() {
  const { data, loading, error, reload } = useAsync(() => api.orders.list(), [])
  const toast = useToast()
  const [tab, setTab] = useState<'active' | 'delivered' | 'all'>('active')
  const [sel, setSel] = useState<string | null>(null)
  const [override, setOverride] = useState<Record<string, OrderStatus>>({})
  const rows = useMemo(() => (data ?? []).map((o) => ({ ...o, status: override[o.id] ?? o.status })), [data, override])
  if (error) return <ErrorState message={error.message} onRetry={reload} />

  const active = rows.filter((o) => ACTIVE_ORDER_STATUSES.includes(o.status))
  const shown = tab === 'active' ? active : tab === 'delivered' ? rows.filter((o) => o.status === 'delivered') : rows
  const order = rows.find((o) => o.id === sel)
  const cols: Column<Order>[] = [
    { key: 'id', header: 'Order', mobile: 'title', sortValue: (o) => o.id, cell: (o) => <span className="font-mono text-[13px]">{o.id}</span> },
    { key: 'cust', header: 'Customer', cell: (o) => getCustomer(o.customerId)?.company },
    { key: 'blocks', header: 'Blocks', align: 'right', cell: (o) => o.blockIds.length },
    { key: 'date', header: 'Ordered', sortValue: (o) => o.date, cell: (o) => dateShort(o.date) },
    { key: 'total', header: 'Value', align: 'right', sortValue: (o) => o.total, cell: (o) => inr(o.total) },
    { key: 'paid', header: 'Paid', align: 'right', mobile: 'hide', cell: (o) => `${Math.round((o.paid / o.total) * 100)}%` },
    { key: 'st', header: 'Status', cell: (o) => <StatusBadge status={o.status} /> },
  ]
  const next = order ? FLOW[FLOW.indexOf(order.status) + 1] : undefined

  return (
    <>
      <PageHeader title="Orders" description="From confirmation to delivery, with payment progress alongside." />
      <section aria-label="Order summary" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[118px]" />) : <>
          <StatCard label="Active orders" value={active.length} />
          <StatCard label="Value in progress" value={active.reduce((s, o) => s + o.total, 0)} format={inrCompact} />
          <StatCard label="Ready to ship" value={rows.filter((o) => o.status === 'ready').length} hint="waiting for a vehicle" />
          <StatCard label="Awaiting payment" value={rows.reduce((s, o) => s + balanceOf(o), 0)} format={inrCompact} to="/app/payments" />
        </>}
      </section>
      <Card>
        <div className="px-4 pt-2"><Tabs value={tab} onChange={setTab} tabs={[{ value: 'active', label: 'Active', count: active.length }, { value: 'delivered', label: 'Delivered' }, { value: 'all', label: 'All', count: rows.length }]} /></div>
        {loading ? <Skeleton className="m-5 h-72" /> : <DataTable caption="Orders" columns={cols} rows={shown} rowKey={(o) => o.id} onRowClick={(o) => setSel(o.id)} pageSize={12} emptyTitle="No orders here" emptyDescription="Orders appear when a quotation is accepted or a block is sold." />}
      </Card>

      <Modal open={Boolean(order)} onClose={() => setSel(null)} variant="drawer" title={order ? `Order ${order.id}` : ''} description={order ? `${getCustomer(order.customerId)?.company} · ${dateShort(order.date)}` : ''}
        footer={order && <><Button to="/app/transport">Plan transport</Button>{next && order.status !== 'cancelled' && <Button variant="primary" onClick={() => { setOverride((m) => ({ ...m, [order.id]: next })); toast({ title: `${order.id} moved to ${LABEL[next]}`, description: 'Demo change: resets on reload.' }) }}>Mark as {LABEL[next].toLowerCase()}</Button>}</>}>
        {order && (
          <div className="space-y-6">
            <Stepper status={order.status} />
            <div><div className="mb-2 flex justify-between text-sm"><span className="text-muted">Payment</span><span className="tabular">{inr(order.paid)} of {inr(order.total)}</span></div><Progress value={(order.paid / order.total) * 100} tone={balanceOf(order) ? 'warn' : 'ok'} label="Payment progress" /><p className="mt-1.5 text-xs text-muted">{balanceOf(order) ? `${inr(balanceOf(order))} due by ${dateShort(order.dueDate)}` : 'Paid in full'}</p></div>
            <div><h3 className="mb-2 text-sm font-medium">Blocks</h3>
              <ul className="divide-y divide-line rounded-lg border border-line">{order.blockIds.map((id) => { const b = getBlock(id); return <li key={id} className="flex items-center justify-between px-3 py-2.5 text-sm"><Link to={`/app/blocks/${id}`} className="font-mono text-[13px] hover:text-sand">{id}</Link><span className="text-muted">{b?.type} · {b?.weightT} t</span><span className="tabular">{b ? inr(b.price) : ''}</span></li> })}</ul></div>
            <dl className="grid grid-cols-2 gap-4 text-sm"><div><dt className="text-xs text-muted">Destination</dt><dd className="mt-0.5">{order.destination}</dd></div><div><dt className="text-xs text-muted">Payment due</dt><dd className="mt-0.5">{dateShort(order.dueDate)}</dd></div></dl>
          </div>
        )}
      </Modal>
    </>
  )
}
