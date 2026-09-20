import { AlertTriangle, Plus, Truck } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/EmptyState'
import { Progress } from '@/components/ui/Progress'
import { SkeletonCards } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services/api'
import { dateShort, daysUntil, num } from '@/lib/format'
import { cn } from '@/lib/cn'
import { motion } from 'framer-motion'
import { listContainer, listItem } from '@/components/common/Motion'

function Expiry({ label, iso }: { label: string; iso: string }) {
  const d = daysUntil(iso)
  const warn = d <= 30
  return <div className={cn('flex items-center justify-between text-[13px]', warn ? 'text-warn' : 'text-muted')}><span className="flex items-center gap-1.5">{warn && <AlertTriangle className="h-3.5 w-3.5" aria-label="Expiring soon" />}{label}</span><span className="tabular">{dateShort(iso)}{warn && ` (${d} days)`}</span></div>
}

export default function Vehicles() {
  const { data, loading, error, reload } = useAsync(() => api.vehicles.list(), [])
  const toast = useToast()
  if (error) return <ErrorState message={error.message} onRetry={reload} />
  const v = data ?? []
  return (
    <>
      <PageHeader title="Vehicles" description="Your fleet, who drives it, and which papers are about to expire." actions={<Button variant="primary" icon={Plus} onClick={() => toast({ tone: 'info', title: 'Adding vehicles is not wired up in the demo' })}>Add vehicle</Button>} />
      <section aria-label="Fleet summary" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Vehicles" value={v.length} icon={Truck} />
        <StatCard label="On a trip" value={v.filter((x) => x.status === 'on_trip').length} />
        <StatCard label="Available" value={v.filter((x) => x.status === 'available').length} />
        <StatCard label="Km this month" value={v.reduce((s, x) => s + x.kmThisMonth, 0)} format={(n) => num(n)} />
      </section>
      {loading ? <SkeletonCards count={6} /> : (
        <motion.ul variants={listContainer} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {v.map((x) => (
            <motion.li key={x.id} variants={listItem} className="panel p-5">
              <div className="flex items-start justify-between gap-3"><div><div className="font-mono text-[15px] tracking-wide">{x.reg}</div><div className="mt-0.5 text-[13px] text-muted">{x.kind} · {x.capacityT} t</div></div><StatusBadge status={x.status} /></div>
              <div className="mt-4 text-sm"><span className="text-muted">Driver </span>{x.driver}</div>
              <div className="mt-4"><div className="mb-1.5 flex justify-between text-[13px]"><span className="text-muted">Utilisation</span><span className="tabular">{x.utilisationPct}%</span></div><Progress value={x.utilisationPct} tone={x.utilisationPct < 50 ? 'warn' : 'sand'} label={`${x.reg} utilisation`} /></div>
              <div className="mt-4 space-y-1.5 border-t border-line pt-4"><Expiry label="Fitness certificate" iso={x.fitnessExpiry} /><Expiry label="Insurance" iso={x.insuranceExpiry} /><div className="flex justify-between text-[13px] text-muted"><span>Distance this month</span><span className="tabular">{num(x.kmThisMonth)} km</span></div></div>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </>
  )
}
