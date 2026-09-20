import { AlertOctagon, CalendarClock, Plus, Wrench } from 'lucide-react'
import { BarTrend } from '@/components/charts/Charts'
import { C } from '@/components/charts/theme'
import { DataTable, type Column } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { MACHINES, getMachine, maintenanceAlerts } from '@/data/operations'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services/api'
import type { MaintenanceRecord } from '@/types/models'
import { dateShort, daysUntil, inr, inrCompact } from '@/lib/format'
import { cn } from '@/lib/cn'

export default function Maintenance() {
  const { data, loading, error, reload } = useAsync(() => api.machinery.log(), [])
  const toast = useToast()
  if (error) return <ErrorState message={error.message} onRetry={reload} />
  const alerts = maintenanceAlerts().sort((a, b) => ({ critical: 0, due: 1, soon: 2 }[a.severity] - { critical: 0, due: 1, soon: 2 }[b.severity]))
  const log = data ?? []
  const cost = MACHINES.map((m) => ({ tag: m.tag, cost: Math.round(m.costYtd / 1000) })).sort((a, b) => b.cost - a.cost)
  const upcoming = [...MACHINES].sort((a, b) => a.nextServiceAt.localeCompare(b.nextServiceAt)).slice(0, 6)
  const cols: Column<MaintenanceRecord>[] = [
    { key: 'd', header: 'Date', mobile: 'title', sortValue: (r) => r.date, cell: (r) => <span>{dateShort(r.date)} <span className="ml-2 font-mono text-[13px] text-muted">{getMachine(r.machineId)?.tag}</span></span> },
    { key: 't', header: 'Type', cell: (r) => <Badge tone={r.type === 'Repair' ? 'bad' : r.type === 'Preventive' ? 'ok' : 'info'}>{r.type}</Badge> },
    { key: 'x', header: 'Work done', cell: (r) => r.description },
    { key: 'v', header: 'Vendor', mobile: 'hide', cell: (r) => r.vendor },
    { key: 'c', header: 'Cost', align: 'right', sortValue: (r) => r.cost, cell: (r) => inr(r.cost) },
  ]
  const sev = { critical: { icon: AlertOctagon, cls: 'text-bad', label: 'Critical' }, due: { icon: Wrench, cls: 'text-warn', label: 'Due' }, soon: { icon: CalendarClock, cls: 'text-info', label: 'Coming up' } }

  return (
    <>
      <PageHeader title="Maintenance" description="Alerts first, then the schedule and the cost history." actions={<Button variant="primary" icon={Plus} onClick={() => toast({ tone: 'info', title: 'Scheduling is not wired up in the demo' })}>Log service</Button>} />
      <section aria-label="Maintenance summary" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Critical" value={alerts.filter((a) => a.severity === 'critical').length} hint="need action now" />
        <StatCard label="Service due" value={alerts.filter((a) => a.severity === 'due').length} hint="within 14 days" />
        <StatCard label="Jobs logged" value={log.length} hint="recent" />
        <StatCard label="Cost, year to date" value={MACHINES.reduce((s, m) => s + m.costYtd, 0)} format={inrCompact} />
      </section>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Alerts" description="Sorted by urgency" />
          <ul className="divide-y divide-line px-5 pb-2 pt-2">
            {alerts.length === 0 && <li className="py-8 text-center text-sm text-muted">No maintenance alerts. Everything is within its service window.</li>}
            {alerts.map((a, i) => { const s = sev[a.severity]; return (
              <li key={i} className="flex items-start gap-3 py-3.5"><s.icon className={cn('mt-0.5 h-4 w-4 shrink-0', s.cls)} aria-label={s.label} />
                <div className="flex-1 text-sm"><div className="font-medium">{a.machine.tag} · {a.machine.name}</div><div className="text-[13px] text-muted">{a.message}</div></div>
                <Button size="sm" onClick={() => toast({ title: 'Work order drafted (demo)', description: `${a.machine.tag} would be assigned to the maintenance team.` })}>Create work order</Button></li>) })}
          </ul>
        </Card>
        <Card><CardHeader title="Next services" /><ul className="divide-y divide-line px-5 pb-2 pt-2 text-sm">{upcoming.map((m) => { const d = daysUntil(m.nextServiceAt); return <li key={m.id} className="flex justify-between py-2.5"><span><span className="font-mono text-[13px]">{m.tag}</span><span className="ml-2 text-muted">{m.kind}</span></span><span className={cn('tabular', d < 0 ? 'text-bad' : d <= 14 ? 'text-warn' : 'text-muted')}>{d < 0 ? `${-d} d overdue` : `in ${d} d`}</span></li> })}</ul></Card>
        <Card className="lg:col-span-3"><CardHeader title="Maintenance cost by machine" description="₹ thousand, year to date" /><div className="px-3 pb-4 pt-3"><BarTrend data={cost} xKey="tag" series={[{ key: 'cost', label: 'Cost', color: C.sand }]} height={220} fmt={(v) => `₹${v}K`} /></div></Card>
        <Card className="lg:col-span-3"><CardHeader title="Service history" /><div className="mt-3">{loading ? <Skeleton className="m-5 h-56" /> : <DataTable caption="Service history" columns={cols} rows={log} rowKey={(r) => r.id} pageSize={8} />}</div></Card>
      </div>
    </>
  )
}
