import { AlertTriangle, Box, CircleDollarSign, ClipboardList, Factory, Sparkles, TrendingUp, Warehouse, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AreaTrend, BarTrend, HBars } from '@/components/charts/Charts'
import { C, TYPE_COLORS } from '@/components/charts/theme'
import { useQuarryScope } from '@/components/common/QuarryScope'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { InsightList } from '@/components/intelligence/IntelligenceChat'
import { useIntelligence } from '@/components/intelligence/IntelligenceProvider'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { MONTHLY_WITH_PROFIT } from '@/data/analytics'
import { ORDERS } from '@/data/commerce'
import { CUSTOMERS } from '@/data/people'
import { TRIPS, VEHICLES, maintenanceAlerts, productionByDay } from '@/data/operations'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services/api'
import { computeInsights } from '@/services/intelligence'
import { dateDay, inrCompact } from '@/lib/format'
import { useAuth } from '@/auth/AuthProvider'

export default function Dashboard() {
  const { quarryId } = useQuarryScope()
  const { user } = useAuth()
  const { openWith } = useIntelligence()
  const { data, loading, error, reload } = useAsync(() => api.dashboard.summary(quarryId), [quarryId])
  const alerts = maintenanceAlerts().filter((a) => a.severity !== 'soon')
  const inTransit = TRIPS.filter((t) => t.status === 'in_transit' || t.status === 'loaded')
  const recent = ORDERS.slice(0, 5)
  const production = productionByDay(14).map((d) => ({ ...d, label: dateDay(d.date) }))

  if (error) return <ErrorState message={error.message} onRetry={reload} />

  return (
    <>
      <PageHeader title={`Welcome back, ${user?.name.split(' ')[0] ?? ''}`} description="What is happening across your quarries today."
        actions={<><Button variant="ai" icon={Sparkles} onClick={() => openWith()}>Ask Quarry Intelligence</Button><Button to="/app/quotations" variant="primary">New quotation</Button></>} />

      {/* KPIs: swipeable on phones, grid from sm up */}
      <section aria-label="Key figures" className="-mx-4 mb-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 xl:grid-cols-6">
        {loading || !data ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[118px] min-w-[46%] snap-start sm:min-w-0" />) : (
          <>
            <StatCard className="min-w-[46%] snap-start sm:min-w-0" label="Total blocks" value={data.totalBlocks} icon={Box} to="/app/blocks" hint="across all statuses" />
            <StatCard className="min-w-[46%] snap-start sm:min-w-0" label="Available stock" value={data.availableBlocks} icon={Warehouse} to="/app/inventory" hint={`${inrCompact(data.availableValue)} list value`} />
            <StatCard className="min-w-[46%] snap-start sm:min-w-0" label="Monthly sales" value={data.monthlySalesLakh} decimals={1} format={(n) => `₹${n.toFixed(1)}L`} icon={TrendingUp} to="/app/sales" delta={{ value: data.salesChangePct, label: 'vs last month' }} />
            <StatCard className="min-w-[46%] snap-start sm:min-w-0" label="Active orders" value={data.activeOrders} icon={ClipboardList} to="/app/orders" hint="confirmed to dispatched" />
            <StatCard className="min-w-[46%] snap-start sm:min-w-0" label="Outstanding payments" value={data.outstanding} format={inrCompact} icon={CircleDollarSign} to="/app/payments" hint={`${inrCompact(data.overdue)} overdue`} />
            <StatCard className="min-w-[46%] snap-start sm:min-w-0" label="Extracted this month" value={data.extractedThisMonth} icon={Factory} to="/app/production" hint="blocks" />
          </>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Sales and expenses" description="Last 12 months, ₹ lakh" action={<Link to="/app/analytics" className="text-[13px] text-muted hover:text-fg">Full analytics</Link>} />
          <div className="px-3 pb-4 pt-3"><AreaTrend data={MONTHLY_WITH_PROFIT} xKey="month" series={[{ key: 'sales', label: 'Sales', color: C.sand }, { key: 'expenses', label: 'Expenses', color: C.titanium }]} fmt={(v) => `₹${v.toFixed(1)}L`} yFormat={(v) => `${v}`} /></div>
        </Card>

        <Card className="border-ai/20 bg-gradient-to-b from-ai/[0.05] to-surface">
          <CardHeader title={<span className="flex items-center gap-2 text-ai"><Sparkles className="h-4 w-4" aria-hidden />Quarry Intelligence</span>} description="Noticed in your data today" />
          <div className="space-y-5 p-5">
            <InsightList insights={computeInsights()} />
            <div className="flex flex-wrap gap-2">
              {['Which customers owe money?', 'Which inventory should I promote?'].map((q) => <button key={q} onClick={() => openWith(q)} className="rounded-full border border-line-strong px-3 py-1.5 text-xs text-muted hover:border-ai/40 hover:text-ai">{q}</button>)}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Extraction, last 14 days" description="Blocks lifted per day across active benches" />
          <div className="px-3 pb-4 pt-3"><BarTrend data={production} xKey="label" series={[{ key: 'blocks', label: 'Blocks', color: C.sand }]} height={220} /></div>
        </Card>

        <Card>
          <CardHeader title="Available stock by type" description="Blocks ready to sell" />
          <div className="p-5">{loading || !data ? <Skeleton className="h-52" /> : <HBars items={data.stockByType.map((s) => ({ label: s.type, value: s.count, display: `${s.count} · ${inrCompact(s.value)}`, color: TYPE_COLORS[s.type] }))} />}</div>
        </Card>

        <Card>
          <CardHeader title="On the road" description={`${inTransit.length} trips active`} action={<Link to="/app/transport" className="text-[13px] text-muted hover:text-fg">Dispatch board</Link>} />
          <ul className="divide-y divide-line px-5 pb-2 pt-2">
            {inTransit.map((t) => (
              <li key={t.id} className="py-3">
                <div className="flex items-center justify-between text-sm"><span className="font-medium">{t.destination}</span><StatusBadge status={t.status} /></div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-3"><div className="h-full rounded-full bg-sand" style={{ width: `${Math.max(t.progressPct, 4)}%` }} /></div>
                <div className="mt-1.5 text-xs text-muted">{VEHICLES.find((v) => v.id === t.vehicleId)?.reg} · {t.distanceKm} km</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Recent orders" action={<Link to="/app/orders" className="text-[13px] text-muted hover:text-fg">All orders</Link>} />
          <ul className="divide-y divide-line px-5 pb-2 pt-2">
            {recent.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0"><div className="truncate font-medium">{CUSTOMERS.find((c) => c.id === o.customerId)?.company}</div><div className="text-xs text-muted">{o.id} · {o.blockIds.length} block{o.blockIds.length > 1 ? 's' : ''}</div></div>
                <div className="shrink-0 text-right"><div className="tabular">{inrCompact(o.total)}</div><StatusBadge status={o.status} /></div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Machinery alerts" action={<Link to="/app/maintenance" className="text-[13px] text-muted hover:text-fg">Maintenance</Link>} />
          <ul className="divide-y divide-line px-5 pb-2 pt-2">
            {alerts.slice(0, 5).map((a, i) => (
              <li key={i} className="flex gap-3 py-3 text-sm">
                {a.severity === 'critical' ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-bad" aria-label="Critical" /> : <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-label="Due" />}
                <div><div className="font-medium">{a.machine.tag} · {a.machine.name}</div><div className="text-xs text-muted">{a.message}</div></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <p className="mt-6 text-xs text-subtle">Demo workspace. Figures are illustrative.</p>
    </>
  )
}
