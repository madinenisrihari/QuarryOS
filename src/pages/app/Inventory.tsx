import { Megaphone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BarTrend, HBars, LineTrend } from '@/components/charts/Charts'
import { C, TYPE_COLORS } from '@/components/charts/theme'
import { DataTable, type Column } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { useQuarryScope } from '@/components/common/QuarryScope'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import { Progress } from '@/components/ui/Progress'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { GRANITE_TYPES } from '@/data/blocks'
import { inventoryMovement } from '@/data/analytics'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services/api'
import type { Block } from '@/types/models'
import { daysSince, inr, inrCompact, num } from '@/lib/format'

const YARD_CAPACITY: Record<string, number> = { 'Yard A': 40, 'Yard B': 22, 'Yard C': 26 }

export default function Inventory() {
  const { quarryId } = useQuarryScope()
  const toast = useToast()
  const navigate = useNavigate()
  const { data, loading, error, reload } = useAsync(() => api.blocks.list({ quarryId, status: 'available', sort: 'oldest' }), [quarryId])

  if (error) return <ErrorState message={error.message} onRetry={reload} />
  const blocks = data ?? []
  const value = blocks.reduce((s, b) => s + b.price, 0)
  const volume = blocks.reduce((s, b) => s + b.volumeCft, 0)
  const slow = blocks.filter((b) => daysSince(b.extractedOn) > 60)
  const byType = GRANITE_TYPES.map((t) => { const l = blocks.filter((b) => b.type === t); return { type: t, count: l.length, value: l.reduce((s, b) => s + b.price, 0) } }).filter((x) => x.count > 0)
  const aging = [['0–14', 0, 15], ['15–30', 15, 31], ['31–60', 31, 61], ['61–90', 61, 91], ['90+', 91, 9999]].map(([label, lo, hi]) => ({ label: label as string, blocks: blocks.filter((b) => { const d = daysSince(b.extractedOn); return d >= (lo as number) && d < (hi as number) }).length }))
  const yards = Object.entries(YARD_CAPACITY).map(([y, cap]) => ({ yard: y, used: blocks.filter((b) => b.location.startsWith(y)).length, cap })).filter((y) => y.used > 0 || quarryId === 'all')

  const cols: Column<Block>[] = [
    { key: 'id', header: 'Block', mobile: 'title', cell: (b) => <span className="font-mono text-[13px]">{b.id}<span className="ml-2 font-sans text-muted">{b.type}</span></span> },
    { key: 'days', header: 'Days in stock', align: 'right', sortValue: (b) => daysSince(b.extractedOn), cell: (b) => <span className="text-warn">{daysSince(b.extractedOn)}</span> },
    { key: 'loc', header: 'Location', cell: (b) => b.location },
    { key: 'vol', header: 'Volume', align: 'right', mobile: 'hide', cell: (b) => `${num(b.volumeCft, 1)} cft` },
    { key: 'price', header: 'List price', align: 'right', sortValue: (b) => b.price, cell: (b) => inr(b.price) },
  ]

  return (
    <>
      <PageHeader title="Inventory" description="What is in the yard, how long it has been there, and what it is worth." />
      <section aria-label="Inventory summary" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[118px]" />) : <>
          <StatCard label="Blocks in stock" value={blocks.length} hint="available to sell" />
          <StatCard label="List value" value={value} format={inrCompact} hint="at current prices" />
          <StatCard label="Volume" value={volume} format={(n) => `${num(n)} cft`} hint={`${num(volume * 0.0283168 * 2.7)} tonnes approx.`} />
          <StatCard label="Held over 60 days" value={slow.length} hint={`${inrCompact(slow.reduce((s, b) => s + b.price, 0))} tied up`} />
        </>}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card><CardHeader title="Stock by granite type" description="Blocks and list value" /><div className="p-5">{loading ? <Skeleton className="h-52" /> : <HBars items={byType.map((s) => ({ label: s.type, value: s.count, display: `${s.count} · ${inrCompact(s.value)}`, color: TYPE_COLORS[s.type] }))} />}</div></Card>
        <Card><CardHeader title="Time in stock" description="Days since extraction" /><div className="px-3 pb-4 pt-3">{loading ? <Skeleton className="h-52" /> : <BarTrend data={aging} xKey="label" series={[{ key: 'blocks', label: 'Blocks', color: C.sand }]} height={210} colorByIndex={[C.sand, C.sand, C.sand, C.warn, C.bad]} />}</div></Card>
        <Card><CardHeader title="Yard occupancy" description="Bays in use" /><div className="space-y-4 p-5">{loading ? <Skeleton className="h-52" /> : yards.map((y) => <div key={y.yard}><div className="mb-1.5 flex justify-between text-[13px]"><span>{y.yard}</span><span className="tabular text-muted">{y.used} of {y.cap} bays</span></div><Progress value={(y.used / y.cap) * 100} tone={y.used / y.cap > 0.85 ? 'warn' : 'sand'} label={`${y.yard} occupancy`} /></div>)}</div></Card>
        <Card className="lg:col-span-3"><CardHeader title="Inventory movement" description="Blocks added (extracted) versus blocks leaving the yard, monthly" /><div className="px-3 pb-4 pt-3"><LineTrend data={inventoryMovement()} xKey="month" series={[{ key: 'in', label: 'Extracted', color: C.sand }, { key: 'out', label: 'Dispatched', color: C.ai }]} height={220} /></div></Card>
        <Card className="lg:col-span-3">
          <CardHeader title="Slow-moving blocks" description="Available for more than 60 days, oldest first" action={<Button size="sm" icon={Megaphone} onClick={() => toast({ title: 'Promotion drafted (demo)', description: `${slow.length} blocks would be featured on your storefront.` })}>Promote these</Button>} />
          <div className="mt-3"><DataTable caption="Slow-moving blocks" columns={cols} rows={slow} rowKey={(b) => b.id} onRowClick={(b) => navigate(`/app/blocks/${b.id}`)} pageSize={8} emptyTitle="No slow-moving stock" emptyDescription="Every available block was extracted in the last 60 days." /></div>
        </Card>
      </div>
    </>
  )
}
