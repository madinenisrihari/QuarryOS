import { Plus } from 'lucide-react'
import { useState } from 'react'
import { ROLE_LABEL } from '@/auth/permissions'
import { DataTable, type Column } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services/api'
import type { Employee } from '@/types/models'
import { dateShort, initials, inr, inrCompact } from '@/lib/format'

const WORKING_DAYS = 26
export default function Employees() {
  const { data, loading, error, reload } = useAsync(() => api.employees.list(), [])
  const toast = useToast()
  const [tab, setTab] = useState<'directory' | 'attendance' | 'salary'>('directory')
  const [att, setAtt] = useState<Record<string, Employee['attendanceToday']>>({})
  if (error) return <ErrorState message={error.message} onRetry={reload} />
  const rows = (data ?? []).map((e) => ({ ...e, attendanceToday: att[e.id] ?? e.attendanceToday }))
  const count = (s: Employee['attendanceToday']) => rows.filter((e) => e.attendanceToday === s).length
  const pay = (e: Employee) => Math.round((e.monthlySalary * e.daysPresentMonth) / WORKING_DAYS)

  const person = (e: Employee) => <span className="flex items-center gap-2.5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-3 text-[11px] font-medium text-muted">{initials(e.name)}</span><span><span className="block text-sm">{e.name}</span><span className="block text-xs text-muted">{e.title}</span></span></span>
  const dir: Column<Employee>[] = [
    { key: 'n', header: 'Employee', mobile: 'title', sortValue: (e) => e.name, cell: person },
    { key: 'd', header: 'Department', sortValue: (e) => e.department, cell: (e) => e.department },
    { key: 'a', header: 'Current assignment', cell: (e) => e.assignment },
    { key: 'r', header: 'Access role', mobile: 'hide', cell: (e) => <Badge>{ROLE_LABEL[e.role]}</Badge> },
    { key: 'j', header: 'Joined', mobile: 'hide', sortValue: (e) => e.joined, cell: (e) => dateShort(e.joined) },
  ]
  const attCols: Column<Employee>[] = [
    { key: 'n', header: 'Employee', mobile: 'title', cell: person },
    { key: 'd', header: 'Department', cell: (e) => e.department },
    { key: 's', header: 'Today', cell: (e) => <StatusBadge status={e.attendanceToday} /> },
    { key: 'm', header: 'Mark', mobile: 'default', cell: (e) => <Select aria-label={`Attendance for ${e.name}`} className="h-8 w-32 text-[13px]" value={e.attendanceToday} onChange={(ev) => { setAtt((a) => ({ ...a, [e.id]: ev.target.value as Employee['attendanceToday'] })); toast({ title: `${e.name} marked ${ev.target.value.replace('_', ' ')}`, description: 'Demo change.' }) }}><option value="present">Present</option><option value="half_day">Half day</option><option value="leave">On leave</option><option value="absent">Absent</option></Select> },
  ]
  const salCols: Column<Employee>[] = [
    { key: 'n', header: 'Employee', mobile: 'title', cell: person },
    { key: 'p', header: 'Days present', align: 'right', cell: (e) => `${e.daysPresentMonth} of ${WORKING_DAYS}` },
    { key: 'b', header: 'Monthly salary', align: 'right', sortValue: (e) => e.monthlySalary, cell: (e) => inr(e.monthlySalary) },
    { key: 'e', header: 'Estimated pay', align: 'right', sortValue: pay, cell: (e) => <span className="font-medium">{inr(pay(e))}</span> },
  ]

  return (
    <>
      <PageHeader title="Employees" description="People, attendance and payroll at a glance." actions={<Button variant="primary" icon={Plus} onClick={() => toast({ tone: 'info', title: 'Adding employees is not wired up in the demo' })}>Add employee</Button>} />
      <section aria-label="People summary" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[118px]" />) : <>
          <StatCard label="Employees" value={rows.length} />
          <StatCard label="Present today" value={count('present') + count('half_day')} hint={`${count('absent')} absent, ${count('leave')} on leave`} />
          <StatCard label="Monthly payroll" value={rows.reduce((s, e) => s + e.monthlySalary, 0)} format={inrCompact} hint="at full attendance" />
          <StatCard label="Departments" value={new Set(rows.map((e) => e.department)).size} />
        </>}
      </section>
      <Card>
        <div className="px-4 pt-2"><Tabs value={tab} onChange={setTab} tabs={[{ value: 'directory', label: 'Directory' }, { value: 'attendance', label: 'Attendance' }, { value: 'salary', label: 'Salary' }]} /></div>
        {loading ? <Skeleton className="m-5 h-72" /> : tab === 'directory' ? <DataTable caption="Employee directory" columns={dir} rows={rows} rowKey={(e) => e.id} pageSize={12} />
          : tab === 'attendance' ? <DataTable caption="Attendance today" columns={attCols} rows={rows} rowKey={(e) => e.id} pageSize={15} dense />
          : <><DataTable caption="Salary records" columns={salCols} rows={rows} rowKey={(e) => e.id} pageSize={15} dense /><p className="border-t border-line px-5 py-3 text-xs text-muted">Estimated pay is salary × days present ÷ {WORKING_DAYS}. It is illustrative and does not include deductions or statutory contributions.</p></>}
      </Card>
    </>
  )
}
