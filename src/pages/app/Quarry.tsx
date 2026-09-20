import { Award, Layers, MapPin } from 'lucide-react'
import { useState } from 'react'
import { DataTable, type Column } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { StoneSwatch } from '@/components/common/StoneSwatch'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs } from '@/components/ui/Tabs'
import { BLOCKS } from '@/data/blocks'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services/api'
import type { Bench } from '@/types/models'
import { num } from '@/lib/format'
import { useToast } from '@/components/ui/Toast'

/** Schematic section through the benches: an illustration of levels, not survey data. */
function BenchSection({ benches }: { benches: Bench[] }) {
  const max = Math.max(...benches.map((b) => b.levelM)) + 6
  const w = 560, h = 190
  const sorted = [...benches].sort((a, b) => b.levelM - a.levelM)
  const colour = (s: Bench['status']) => (s === 'active' ? '#cdba9a' : s === 'idle' ? '#a0a8b2' : '#5b6068')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={`Bench levels: ${sorted.map((b) => `${b.name} at ${b.levelM} metres`).join(', ')}`}>
      <path d={`M0 ${h} L0 20 ${sorted.map((b, i) => { const x = 40 + (i * (w - 80)) / sorted.length; const y = 20 + ((max - b.levelM) / max) * (h - 40); return `L${x} ${y - 6} L${x + 20} ${y}` }).join(' ')} L${w} ${h - 30} L${w} ${h}Z`} fill="rgb(var(--surface-2))" stroke="rgb(var(--line) / 0.12)" />
      {sorted.map((b, i) => { const x = 40 + (i * (w - 80)) / sorted.length + 24; const y = 20 + ((max - b.levelM) / max) * (h - 40); return (
        <g key={b.id}><rect x={x} y={y} width={(w - 80) / sorted.length - 30} height="5" rx="2" fill={colour(b.status)} /><text x={x} y={y - 8} fontSize="10" fill="rgb(var(--muted))">{b.id}</text></g>) })}
    </svg>
  )
}

export default function Quarry() {
  const { data, loading, error, reload } = useAsync(() => api.quarries.list(), [])
  const [tab, setTab] = useState('q-kondapi')
  const toast = useToast()
  if (error) return <ErrorState message={error.message} onRetry={reload} />
  const q = data?.find((x) => x.id === tab) ?? data?.[0]

  const cols: Column<Bench>[] = [
    { key: 'name', header: 'Bench', mobile: 'title', cell: (b) => <span><span className="font-mono text-[13px]">{b.id}</span> <span className="ml-2 text-muted">{b.name}</span></span> },
    { key: 'stone', header: 'Granite', cell: (b) => b.stone },
    { key: 'level', header: 'Level', align: 'right', cell: (b) => `${b.levelM} m` },
    { key: 'res', header: 'Est. reserve', align: 'right', cell: (b) => `${num(b.estReserveM3)} m³` },
    { key: 'crew', header: 'Crew', cell: (b) => b.crew },
    { key: 'status', header: 'Status', cell: (b) => <StatusBadge status={b.status} /> },
  ]

  return (
    <>
      <PageHeader title="Quarry" description="Sites, benches and what each face produces." actions={<Button onClick={() => toast({ tone: 'info', title: 'Adding quarries is not wired up in the demo' })}>Add quarry</Button>} />
      {loading || !q ? <Skeleton className="h-96" /> : (
        <>
          <Tabs value={tab} onChange={setTab} tabs={data!.map((x) => ({ value: x.id, label: x.name }))} className="mb-6" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="overflow-hidden lg:col-span-2">
              <div className="relative h-40"><StoneSwatch type={q.stoneTypes[0]!} seed={q.established} /><div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" /></div>
              <div className="-mt-10 relative p-5">
                <h2 className="text-xl font-semibold tracking-tight">{q.name}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><MapPin className="h-3.5 w-3.5" aria-hidden />{q.district}, {q.state} · {q.areaHectares} ha · since {q.established}</p>
                <p className="mt-3 max-w-2xl text-sm text-fg/85">{q.about}</p>
                <div className="mt-4 flex flex-wrap gap-2">{q.stoneTypes.map((t) => <Badge key={t} tone="sand">{t}</Badge>)}</div>
              </div>
            </Card>
            <Card>
              <CardHeader title="Compliance" description="Sample entries" />
              <ul className="space-y-3 p-5 text-sm">{q.certifications.map((c) => <li key={c} className="flex gap-2.5"><Award className="mt-0.5 h-4 w-4 shrink-0 text-sand" aria-hidden />{c}</li>)}</ul>
              <p className="px-5 pb-5 text-xs text-subtle">Document upload and expiry reminders are planned.</p>
            </Card>
            <Card className="lg:col-span-2"><CardHeader title="Bench levels" description="Schematic, not to scale" /><div className="p-5"><BenchSection benches={q.benches} /></div></Card>
            <Card>
              <CardHeader title="Yard stock" description="Blocks currently on site" />
              <ul className="divide-y divide-line px-5 pb-3 pt-2 text-sm">{q.stoneTypes.map((t) => <li key={t} className="flex justify-between py-2.5"><span>{t}</span><span className="tabular text-muted">{BLOCKS.filter((b) => b.quarryId === q.id && b.type === t && b.status === 'available').length}</span></li>)}</ul>
            </Card>
            <Card className="lg:col-span-3"><CardHeader title={<span className="flex items-center gap-2"><Layers className="h-4 w-4 text-sand" aria-hidden />Benches</span>} /><div className="mt-3"><DataTable caption="Benches" columns={cols} rows={q.benches} rowKey={(b) => b.id} pageSize={10} /></div></Card>
          </div>
        </>
      )}
    </>
  )
}
