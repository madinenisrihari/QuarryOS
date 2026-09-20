import { Check, Minus } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/auth/AuthProvider'
import { ROLE_BLURB, ROLE_LABEL, ROLE_MODULES, type ModuleKey } from '@/auth/permissions'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Field, Input, Select, Switch } from '@/components/ui/Field'
import { Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'
import { isApiConfigured, isSupabaseConfigured } from '@/lib/env'
import type { Role } from '@/types/models'

const MODULES: ModuleKey[] = ['overview', 'quarry', 'blocks', 'production', 'inventory', 'customers', 'sales', 'quotations', 'orders', 'payments', 'vehicles', 'transport', 'employees', 'machinery', 'maintenance', 'analytics', 'intelligence', 'settings']
const ROLES: Role[] = ['owner', 'admin', 'manager', 'sales', 'worker']

export default function Settings() {
  const { user } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState<'org' | 'roles' | 'integrations' | 'appearance'>('org')
  const [prefs, setPrefs] = useState({ lowStock: true, overdue: true, maint: true, digest: false })
  const status = (ok: boolean, on: string, off: string) => <Badge tone={ok ? 'ok' : 'warn'} dot>{ok ? on : off}</Badge>

  return (
    <>
      <PageHeader title="Settings" description="Organisation, access and connections." />
      <Tabs value={tab} onChange={setTab} className="mb-6" tabs={[{ value: 'org', label: 'Organisation' }, { value: 'roles', label: 'Roles and access' }, { value: 'integrations', label: 'Connections' }, { value: 'appearance', label: 'Appearance' }]} />

      {tab === 'org' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card><CardHeader title="Organisation" /><div className="space-y-4 p-5">
            <Field label="Company name">{(id) => <Input id={id} defaultValue={user?.organisation} />}</Field>
            <Field label="Storefront address" hint="Where buyers find your public showroom.">{(id, d) => <Input id={id} aria-describedby={d} defaultValue="meridian-granites" />}</Field>
            <Field label="Default currency">{(id) => <Select id={id}><option>Indian rupee (₹)</option></Select>}</Field>
            <Button variant="primary" onClick={() => toast({ title: 'Settings saved (demo)' })}>Save changes</Button></div></Card>
          <Card><CardHeader title="Notifications" description="Choose what should reach you" /><div className="divide-y divide-line px-5 pb-2 pt-2">
            {([['lowStock', 'Slow-moving stock over 60 days'], ['overdue', 'Payments that become overdue'], ['maint', 'Machinery service due'], ['digest', 'Weekly summary email']] as const).map(([k, label]) => (
              <div key={k} className="flex items-center justify-between py-3.5 text-sm"><span id={`n-${k}`}>{label}</span><Switch checked={prefs[k]} onChange={(v) => setPrefs((p) => ({ ...p, [k]: v }))} label={label} /></div>))}</div></Card>
        </div>
      )}

      {tab === 'roles' && (
        <Card>
          <CardHeader title="Who can open what" description="Navigation and pages follow this matrix. The API and database must enforce the same rules." />
          <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><caption className="sr-only">Role access matrix</caption>
            <thead><tr className="border-b border-line text-left text-xs text-muted"><th className="px-5 py-2.5 font-medium">Module</th>{ROLES.map((r) => <th key={r} scope="col" className="px-3 py-2.5 text-center font-medium">{ROLE_LABEL[r]}</th>)}</tr></thead>
            <tbody>{MODULES.map((m) => <tr key={m} className="border-b border-line/60 last:border-0"><th scope="row" className="px-5 py-2.5 text-left font-normal capitalize">{m}</th>{ROLES.map((r) => <td key={r} className="px-3 py-2.5 text-center">{ROLE_MODULES[r].includes(m) ? <Check className="mx-auto h-4 w-4 text-ok" aria-label="Allowed" /> : <Minus className="mx-auto h-4 w-4 text-subtle" aria-label="Not allowed" />}</td>)}</tr>)}</tbody></table></div>
          <ul className="grid gap-2 border-t border-line p-5 text-[13px] text-muted sm:grid-cols-2">{ROLES.map((r) => <li key={r}><span className="text-fg">{ROLE_LABEL[r]}.</span> {ROLE_BLURB[r]}</li>)}</ul>
        </Card>
      )}

      {tab === 'integrations' && (
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            { name: 'Supabase (auth and database)', ok: isSupabaseConfigured, on: 'Configured', off: 'Not configured', text: 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Only the public anon key belongs in the browser.' },
            { name: 'FastAPI backend', ok: isApiConfigured, on: 'Connected', off: 'Using demo data', text: 'Set VITE_API_BASE_URL. The service layer in src/services already isolates every data call.' },
          ].map((i) => (
            <Card key={i.name} className="p-5"><div className="flex items-center justify-between gap-3"><h3 className="text-[15px] font-medium">{i.name}</h3>{status(i.ok, i.on, i.off)}</div><p className="mt-2 text-[13px] text-muted">{i.text}</p></Card>
          ))}
          <Card className="p-5 lg:col-span-2"><h3 className="text-[15px] font-medium">Coming later</h3><p className="mt-2 text-[13px] text-muted">Camera QR scanning, PDF quotations, WhatsApp notifications, accounting export and marketplace payments.</p></Card>
        </div>
      )}

      {tab === 'appearance' && (
        <Card className="max-w-xl p-5">
          <h3 className="text-[15px] font-medium">Theme</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-sand/50 bg-bg p-4"><div className="text-sm font-medium">Dark</div><div className="mt-1 text-xs text-muted">Graphite and obsidian. Active.</div></div>
            <div className="rounded-xl border border-line bg-surface-2/40 p-4 opacity-70"><div className="text-sm font-medium">Light</div><div className="mt-1 text-xs text-muted">Tokens are prepared. Chart colours are still to do.</div></div>
          </div>
        </Card>
      )}
    </>
  )
}
