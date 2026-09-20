import { BellRing, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { BarTrend, HBars } from '@/components/charts/Charts'
import { C } from '@/components/charts/theme'
import { DataTable, type Column } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import { Field, Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'
import { balanceOf, outstandingByCustomer } from '@/data/commerce'
import { CUSTOMERS, getCustomer } from '@/data/people'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services/api'
import type { Payment } from '@/types/models'
import { daysSince, dateShort, inr, inrCompact } from '@/lib/format'

export default function Payments() {
  const toast = useToast()
  const pay = useAsync(() => api.payments.list(), [])
  const ord = useAsync(() => api.orders.list(), [])
  const [tab, setTab] = useState<'all' | 'received' | 'pending' | 'overdue'>('overdue')
  const [rec, setRec] = useState(false)
  const [cust, setCust] = useState('')
  const rows = pay.data ?? []
  const openOrders = useMemo(() => (ord.data ?? []).filter((o) => o.customerId === cust && balanceOf(o) > 0), [ord.data, cust])
  const [orderId, setOrderId] = useState('')
  if (pay.error) return <ErrorState message={pay.error.message} onRetry={pay.reload} />

  const outstanding = rows.filter((p) => p.status !== 'received')
  const overdue = rows.filter((p) => p.status === 'overdue')
  const received = rows.filter((p) => p.status === 'received')
  const sum = (l: Payment[]) => l.reduce((s, p) => s + p.amount, 0)
  const buckets = [['Not yet due', -9999, 0], ['1–30 days', 1, 30], ['31–60', 31, 60], ['60+', 61, 9999]].map(([label, lo, hi]) => ({
    label: label as string,
    amount: outstanding.filter((p) => { const late = daysSince(p.date); return late >= (lo as number) && late <= (hi as number) }).reduce((s, p) => s + p.amount, 0) / 1e5,
  }))
  const shown = tab === 'all' ? rows : rows.filter((p) => p.status === tab)
  const collection = sum(received) + sum(outstanding) ? (sum(received) / (sum(received) + sum(outstanding))) * 100 : 0

  const cols: Column<Payment>[] = [
    { key: 'id', header: 'Reference', mobile: 'title', cell: (p) => <span className="font-mono text-[13px]">{p.id} <span className="ml-2 font-sans text-muted">{p.orderId}</span></span> },
    { key: 'cust', header: 'Customer', cell: (p) => getCustomer(p.customerId)?.company },
    { key: 'date', header: 'Date / due', sortValue: (p) => p.date, cell: (p) => dateShort(p.date) },
    { key: 'method', header: 'Method', mobile: 'hide', cell: (p) => p.status === 'received' ? p.method : '·' },
    { key: 'amt', header: 'Amount', align: 'right', sortValue: (p) => p.amount, cell: (p) => <span className="font-medium">{inr(p.amount)}</span> },
    { key: 'st', header: 'Status', cell: (p) => <StatusBadge status={p.status} /> },
    { key: 'act', header: '', align: 'right', mobile: 'hide', cell: (p) => p.status === 'overdue' ? <Button size="sm" variant="ghost" icon={BellRing} onClick={(e) => { e.stopPropagation(); toast({ title: 'Reminder queued (demo)', description: `A payment reminder would go to ${getCustomer(p.customerId)?.company}.` }) }}>Remind</Button> : null },
  ]

  return (
    <>
      <PageHeader title="Payments" description="What has come in, what is due, and who to chase." actions={<Button variant="primary" icon={Plus} onClick={() => setRec(true)}>Record payment</Button>} />
      <section aria-label="Payments summary" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {pay.loading ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[118px]" />) : <>
          <StatCard label="Outstanding" value={sum(outstanding)} format={inrCompact} hint={`${outstanding.length} open items`} />
          <StatCard label="Overdue" value={sum(overdue)} format={inrCompact} hint={`${overdue.length} items past due`} />
          <StatCard label="Received" value={sum(received)} format={inrCompact} hint="recorded payments" />
          <StatCard label="Collected" value={collection} format={(n) => `${n.toFixed(0)}%`} hint="received ÷ billed" />
        </>}
      </section>
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card><CardHeader title="Receivables by age" description="₹ lakh, by days past due" /><div className="px-3 pb-4 pt-3">{pay.loading ? <Skeleton className="h-52" /> : <BarTrend data={buckets} xKey="label" series={[{ key: 'amount', label: 'Outstanding', color: C.sand }]} height={210} colorByIndex={[C.sand, C.warn, C.warn, C.bad]} fmt={(v) => `₹${v.toFixed(1)}L`} />}</div></Card>
        <Card><CardHeader title="Who owes the most" description="Outstanding by customer" /><div className="p-5">{pay.loading ? <Skeleton className="h-52" /> : <HBars items={outstandingByCustomer().slice(0, 6).map((o) => ({ label: getCustomer(o.customerId)!.company, value: o.amount, display: inr(o.amount) }))} />}</div></Card>
      </div>
      <Card>
        <div className="px-4 pt-2"><Tabs value={tab} onChange={setTab} tabs={[{ value: 'overdue', label: 'Overdue', count: overdue.length }, { value: 'pending', label: 'Pending' }, { value: 'received', label: 'Received' }, { value: 'all', label: 'All' }]} /></div>
        {pay.loading ? <Skeleton className="m-5 h-64" /> : <DataTable caption="Payments" columns={cols} rows={shown} rowKey={(p) => p.id} pageSize={10} emptyTitle="Nothing in this view" emptyDescription="Payments matching this status will appear here." />}
      </Card>

      <Modal open={rec} onClose={() => setRec(false)} title="Record payment" description="Match a receipt to an open order."
        footer={<><Button variant="ghost" onClick={() => setRec(false)}>Cancel</Button><Button variant="primary" disabled={!orderId} onClick={() => { toast({ title: 'Payment recorded (demo)', description: 'The order balance would update immediately.' }); setRec(false) }}>Save payment</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer" className="sm:col-span-2">{(id) => <Select id={id} data-autofocus value={cust} onChange={(e) => { setCust(e.target.value); setOrderId('') }}><option value="">Choose a customer…</option>{CUSTOMERS.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}</Select>}</Field>
          <Field label="Order" hint={cust && !openOrders.length ? 'This customer has no open balances.' : undefined} className="sm:col-span-2">{(id, d) => <Select id={id} aria-describedby={d} disabled={!openOrders.length} value={orderId} onChange={(e) => setOrderId(e.target.value)}><option value="">Choose an order…</option>{openOrders.map((o) => <option key={o.id} value={o.id}>{o.id} · balance {inr(balanceOf(o))}</option>)}</Select>}</Field>
          <Field label="Amount (₹)">{(id) => <Input id={id} inputMode="numeric" defaultValue={orderId ? String(balanceOf(openOrders.find((o) => o.id === orderId)!)) : ''} key={orderId} />}</Field>
          <Field label="Method">{(id) => <Select id={id}><option>Bank transfer</option><option>UPI</option><option>Cheque</option><option>Letter of credit</option><option>Cash</option></Select>}</Field>
        </div>
      </Modal>
    </>
  )
}
