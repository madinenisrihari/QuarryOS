import { ArrowRight, MapPin, Plus } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/EmptyState'
import { Field, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { getBlock } from '@/data/blocks'
import { getCustomer } from '@/data/people'
import { getOrder } from '@/data/commerce'
import { VEHICLES, getVehicle } from '@/data/operations'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services/api'
import type { Trip, TripStatus } from '@/types/models'
import { dateDay } from '@/lib/format'
import { cn } from '@/lib/cn'

const COLUMNS: { key: TripStatus; label: string; hint: string }[] = [
  { key: 'preparing', label: 'Preparing', hint: 'Vehicle assigned, not yet loaded' },
  { key: 'loaded', label: 'Loaded', hint: 'Ready to leave the yard' },
  { key: 'in_transit', label: 'In transit', hint: 'On the road' },
  { key: 'delivered', label: 'Delivered', hint: 'Handed over' },
  { key: 'cancelled', label: 'Cancelled', hint: '' },
]
const NEXT: Partial<Record<TripStatus, TripStatus>> = { preparing: 'loaded', loaded: 'in_transit', in_transit: 'delivered' }
const NEXT_LABEL: Partial<Record<TripStatus, string>> = { preparing: 'Mark loaded', loaded: 'Dispatch', in_transit: 'Mark delivered' }

function TripCard({ t, onAdvance }: { t: Trip; onAdvance: () => void }) {
  const v = getVehicle(t.vehicleId)
  const order = t.orderId ? getOrder(t.orderId) : undefined
  const weight = t.blockIds.reduce((s, id) => s + (getBlock(id)?.weightT ?? 0), 0)
  return (
    <article className="rounded-lg border border-line bg-surface p-3.5">
      <div className="flex items-center justify-between"><span className="font-mono text-[13px]">{t.id}</span><span className="font-mono text-xs text-muted">{v?.reg}</span></div>
      <div className="mt-2.5 flex items-center gap-1.5 text-sm"><span className="truncate text-muted">{t.origin.replace(' Yard', '')}</span><ArrowRight className="h-3.5 w-3.5 shrink-0 text-subtle" aria-label="to" /><span className="truncate font-medium">{t.destination}</span></div>
      {order && <div className="mt-1 truncate text-xs text-muted">{getCustomer(order.customerId)?.company}</div>}
      {t.status === 'in_transit' && (<div className="mt-3"><div className="h-1.5 overflow-hidden rounded-full bg-surface-3" role="progressbar" aria-valuenow={t.progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Trip progress"><div className="h-full rounded-full bg-info" style={{ width: `${t.progressPct}%` }} /></div><div className="mt-1 flex justify-between text-[11px] text-muted"><span>{t.progressPct}% of {t.distanceKm} km</span><span>ETA {t.eta ? dateDay(t.eta) : '·'}</span></div></div>)}
      <div className="mt-3 flex items-center justify-between text-xs text-muted"><span>{t.blockIds.length} block{t.blockIds.length !== 1 ? 's' : ''} · {weight.toFixed(1)} t</span><span>{v?.driver}</span></div>
      {NEXT[t.status] && <Button size="sm" className="mt-3 w-full" onClick={onAdvance}>{NEXT_LABEL[t.status]}</Button>}
    </article>
  )
}

export default function Transport() {
  const { data, loading, error, reload } = useAsync(() => api.trips.list(), [])
  const toast = useToast()
  const [moved, setMoved] = useState<Record<string, TripStatus>>({})
  const [created, setCreated] = useState<Trip[]>([])
  const [open, setOpen] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const orders = useAsync(() => api.orders.list(), [])
  if (error) return <ErrorState message={error.message} onRetry={reload} />
  const trips = [...created, ...(data ?? [])].map((t) => ({ ...t, status: moved[t.id] ?? t.status }))
  const readyOrders = (orders.data ?? []).filter((o) => o.status === 'ready' || o.status === 'processing')

  const create = () => {
    const o = readyOrders.find((x) => x.id === orderId)!
    const t: Trip = { id: `TRP-04${18 + created.length}`, vehicleId, orderId: o.id, blockIds: o.blockIds, origin: 'Kondapi Yard A', destination: o.destination, status: 'preparing', distanceKm: 400, progressPct: 0 }
    setCreated((c) => [t, ...c]); setOpen(false); toast({ title: `${t.id} created`, description: `${o.destination} · ${getVehicle(vehicleId)?.reg}` })
  }

  return (
    <>
      <PageHeader title="Transport" description="Every trip from loading bay to delivery." actions={<Button variant="primary" icon={Plus} onClick={() => setOpen(true)}>Plan trip</Button>} />
      {loading ? <Skeleton className="h-96" /> : (
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0" role="list" aria-label="Dispatch board">
          {COLUMNS.map((c) => { const col = trips.filter((t) => t.status === c.key); return (
            <section key={c.key} role="listitem" aria-label={c.label} className="w-[82%] shrink-0 snap-start sm:w-[280px] xl:min-w-0 xl:flex-1">
              <div className="mb-2 flex items-center justify-between px-1"><StatusBadge status={c.key} /><span className="text-xs tabular text-muted">{col.length}</span></div>
              <div className={cn('min-h-32 space-y-2 rounded-xl border border-line bg-surface/50 p-2')}>
                {!col.length && <p className="flex items-center gap-2 px-2 py-6 text-xs text-subtle"><MapPin className="h-3.5 w-3.5" aria-hidden />{c.hint || 'None'}</p>}
                {col.map((t) => <TripCard key={t.id} t={t} onAdvance={() => { const n = NEXT[t.status]!; setMoved((m) => ({ ...m, [t.id]: n })); toast({ title: `${t.id}: ${n.replace('_', ' ')}`, description: 'Demo change: resets on reload.' }) }} />)}
              </div>
            </section>) })}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Plan a trip" description="Pick an order that is ready and a free vehicle."
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" disabled={!orderId || !vehicleId} onClick={create}>Create trip</Button></>}>
        <div className="space-y-4">
          <Field label="Order">{(id) => <Select id={id} data-autofocus value={orderId} onChange={(e) => setOrderId(e.target.value)}><option value="">Choose an order…</option>{readyOrders.map((o) => <option key={o.id} value={o.id}>{o.id} · {getCustomer(o.customerId)?.company} · {o.destination}</option>)}</Select>}</Field>
          <Field label="Vehicle">{(id) => <Select id={id} value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}><option value="">Choose a vehicle…</option>{VEHICLES.filter((v) => v.status === 'available').map((v) => <option key={v.id} value={v.id}>{v.reg} · {v.kind} · {v.driver}</option>)}</Select>}</Field>
        </div>
      </Modal>
    </>
  )
}
