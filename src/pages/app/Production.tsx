import { Plus } from 'lucide-react'
import { useState } from 'react'
import { BarTrend, LineTrend } from '@/components/charts/Charts'
import { C } from '@/components/charts/theme'
import { DataTable, type Column } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import { Field, Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { MONTHLY } from '@/data/analytics'
import { isoDaysAgo } from '@/data/clock'
import { productionByDay } from '@/data/operations'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services/api'
import type { ProductionEntry } from '@/types/models'
import { dateDay, num, relDays } from '@/lib/format'

export default function Production() {
  const { data, loading, error, reload } = useAsync(() => api.production.list(), [])
  const toast = useToast()
  const [open, setOpen] = useState(false)
  if (error) return <ErrorState message={error.message} onRetry={reload} />

  const rows = data ?? []
  const today = rows.filter((r) => r.date === isoDaysAgo(0))
  const last = today.length ? today : rows.filter((r) => r.date === isoDaysAgo(1))
  const sum = (l: ProductionEntry[], k: 'blocksExtracted' | 'volumeCft') => l.reduce((s, r) => s + r[k], 0)
  const avgWaste = rows.length ? rows.reduce((s, r) => s + r.wastePct, 0) / rows.length : 0
  const series = productionByDay(14).map((d) => ({ ...d, label: dateDay(d.date) }))

  const cols: Column<ProductionEntry>[] = [
    { key: 'date', header: 'Date', mobile: 'title', sortValue: (r) => r.date, cell: (r) => <span>{relDays(r.date)} <span className="text-muted">· {r.benchId}</span></span> },
    { key: 'crew', header: 'Crew', cell: (r) => r.crew },
    { key: 'machine', header: 'Machine', cell: (r) => <span className="font-mono text-[13px]">{r.machine}</span> },
    { key: 'blocks', header: 'Blocks', align: 'right', sortValue: (r) => r.blocksExtracted, cell: (r) => r.blocksExtracted },
    { key: 'vol', header: 'Volume', align: 'right', sortValue: (r) => r.volumeCft, cell: (r) => `${num(r.volumeCft)} cft` },
    { key: 'waste', header: 'Waste', align: 'right', cell: (r) => `${r.wastePct}%` },
    { key: 'note', header: 'Note', mobile: 'hide', cell: (r) => <span className="text-muted">{r.note || '·'}</span> },
  ]

  return (
    <>
      <PageHeader title="Production" description="What each bench and crew lifted, and how much was lost to waste." actions={<Button variant="primary" icon={Plus} onClick={() => setOpen(true)}>Log extraction</Button>} />
      <section aria-label="Production summary" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[118px]" />) : <>
          <StatCard label={today.length ? 'Blocks today' : 'Blocks yesterday'} value={sum(last, 'blocksExtracted')} hint={`${last.length} benches working`} />
          <StatCard label="Volume" value={sum(last, 'volumeCft')} format={(n) => `${num(n)} cft`} hint="same period" />
          <StatCard label="This month" value={MONTHLY[MONTHLY.length - 1]!.extracted} hint="blocks extracted" delta={{ value: ((MONTHLY[11]!.extracted - MONTHLY[10]!.extracted) / MONTHLY[10]!.extracted) * 100, label: 'vs August' }} />
          <StatCard label="Average waste" value={avgWaste} decimals={1} format={(n) => `${n.toFixed(1)}%`} hint="last 14 days" />
        </>}
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader title="Blocks per day" description="Last 14 days" /><div className="px-3 pb-4 pt-3"><BarTrend data={series} xKey="label" series={[{ key: 'blocks', label: 'Blocks', color: C.sand }]} height={220} /></div></Card>
        <Card><CardHeader title="Monthly extraction" description="Blocks, last 12 months" /><div className="px-3 pb-4 pt-3"><LineTrend data={MONTHLY} xKey="month" series={[{ key: 'extracted', label: 'Extracted', color: C.sand }]} height={220} /></div></Card>
        <Card className="lg:col-span-2"><CardHeader title="Extraction log" /><div className="mt-3">{loading ? <Skeleton className="m-5 h-64" /> : <DataTable caption="Extraction log" columns={cols} rows={rows} rowKey={(r) => r.id} pageSize={10} dense />}</div></Card>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Log extraction" description="Record what a crew lifted on a bench today." footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button variant="primary" onClick={() => { toast({ title: 'Extraction logged (demo)', description: 'Each block would now get an ID and a QR tag.' }); setOpen(false) }}>Save entry</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Bench">{(id) => <Select id={id} data-autofocus><option>KR-B1</option><option>KR-B2</option><option>KR-B3</option><option>NH-B1</option><option>NH-B3</option></Select>}</Field>
          <Field label="Machine">{(id) => <Select id={id}><option>WS-01</option><option>DR-03</option><option>EX-01</option></Select>}</Field>
          <Field label="Blocks lifted">{(id) => <Input id={id} inputMode="numeric" defaultValue="2" />}</Field>
          <Field label="Volume (cft)">{(id) => <Input id={id} inputMode="numeric" defaultValue="410" />}</Field>
        </div>
      </Modal>
    </>
  )
}
