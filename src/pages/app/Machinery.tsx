import { Plus } from 'lucide-react'
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
import { dateShort, inr, inrCompact, num } from '@/lib/format'
import { motion } from 'framer-motion'
import { listContainer, listItem } from '@/components/common/Motion'

export default function Machinery() {
  const { data, loading, error, reload } = useAsync(() => api.machinery.list(), [])
  const toast = useToast()
  if (error) return <ErrorState message={error.message} onRetry={reload} />
  const m = data ?? []
  return (
    <>
      <PageHeader title="Machinery" description="Every machine, how hard it is working and how close it is to its next service." actions={<Button variant="primary" icon={Plus} onClick={() => toast({ tone: 'info', title: 'Adding machinery is not wired up in the demo' })}>Add machine</Button>} />
      <section aria-label="Machinery summary" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Machines" value={m.length} />
        <StatCard label="Running now" value={m.filter((x) => x.status === 'running').length} />
        <StatCard label="Hours this month" value={m.reduce((s, x) => s + x.hoursThisMonth, 0)} format={(n) => num(n)} />
        <StatCard label="Maintenance cost, year to date" value={m.reduce((s, x) => s + x.costYtd, 0)} format={inrCompact} />
      </section>
      {loading ? <SkeletonCards count={6} /> : (
        <motion.ul variants={listContainer} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {m.map((x) => {
            const used = (x.hoursSinceService / x.serviceIntervalHours) * 100
            return (
              <motion.li key={x.id} variants={listItem} className="panel p-5">
                <div className="flex items-start justify-between gap-3"><div><div className="text-[15px] font-medium">{x.name}</div><div className="mt-0.5 font-mono text-xs text-muted">{x.tag} · {x.location}</div></div><StatusBadge status={x.status} /></div>
                <div className="mt-5"><div className="mb-1.5 flex justify-between text-[13px]"><span className="text-muted">Hours since last service</span><span className="tabular">{x.hoursSinceService} / {x.serviceIntervalHours} h</span></div><Progress value={Math.min(used, 100)} tone={used >= 100 ? 'bad' : used >= 90 ? 'warn' : 'sand'} label={`${x.tag} service interval used`} /></div>
                <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 text-[13px]">
                  <div><dt className="text-2xs text-muted">Total hours</dt><dd className="mt-0.5 tabular">{num(x.hoursTotal)}</dd></div>
                  <div><dt className="text-2xs text-muted">This month</dt><dd className="mt-0.5 tabular">{x.hoursThisMonth} h</dd></div>
                  <div><dt className="text-2xs text-muted">Next service</dt><dd className="mt-0.5">{dateShort(x.nextServiceAt)}</dd></div>
                </dl>
                <div className="mt-3 text-xs text-muted">Maintenance this year: {inr(x.costYtd)}</div>
              </motion.li>
            )
          })}
        </motion.ul>
      )}
    </>
  )
}
