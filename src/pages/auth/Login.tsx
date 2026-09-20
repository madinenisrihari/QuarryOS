import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthProvider'
import { ROLE_BLURB, ROLE_LABEL } from '@/auth/permissions'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import type { Role } from '@/types/models'
import { AuthShell } from './AuthShell'

export default function Login() {
  const { signIn, signInDemo, demoMode } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/app'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(undefined); setBusy(true)
    try { await signIn(email, password); navigate(from, { replace: true }) }
    catch (err) { setError(err instanceof Error ? err.message : 'Sign-in failed') }
    finally { setBusy(false) }
  }
  const demo = (r: Role) => { signInDemo(r); navigate(from, { replace: true }) }

  return (
    <AuthShell title="Log in to QuarryOS" subtitle="Welcome back. Enter your details to open your workspace." footer={<>New to QuarryOS? <Link to="/signup" className="text-fg underline underline-offset-4">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Work email">{(id) => <Input id={id} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />}</Field>
        <Field label="Password" error={error}>{(id, d) => <Input id={id} aria-describedby={d} aria-invalid={Boolean(error)} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />}</Field>
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy}>Log in</Button>
      </form>

      {demoMode && (
        <div className="mt-8 border-t border-line pt-6">
          <p className="text-sm font-medium">Explore the demo workspace</p>
          <p className="mt-1 text-[13px] text-muted">Supabase isn't configured, so real sign-in is off. Pick a role to see how access changes.</p>
          <div className="mt-4 grid gap-2">
            {(['owner', 'manager', 'sales', 'worker'] as Role[]).map((r) => (
              <button key={r} onClick={() => demo(r)} className="flex items-center justify-between rounded-xl border border-line-strong bg-surface-2/40 px-4 py-3 text-left transition-colors hover:border-sand/40 hover:bg-surface-2">
                <span><span className="block text-sm font-medium">Continue as {ROLE_LABEL[r]}</span><span className="block text-xs text-muted">{ROLE_BLURB[r]}</span></span>
              </button>
            ))}
          </div>
        </div>
      )}
    </AuthShell>
  )
}
