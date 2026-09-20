import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { useAuth } from '@/auth/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { AuthShell } from './AuthShell'

export default function Signup() {
  const { signUp, signInDemo, demoMode } = useAuth()
  const navigate = useNavigate()
  const [f, setF] = useState({ name: '', company: '', email: '', password: '' })
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(undefined)
    if (f.password.length < 8) { setError('Use at least 8 characters.'); return }
    setBusy(true)
    try { const r = await signUp(f); if (r.needsConfirmation) setConfirm(true); else navigate('/app') }
    catch (err) { setError(err instanceof Error ? err.message : 'Sign-up failed') }
    finally { setBusy(false) }
  }

  if (confirm) return <AuthShell title="Check your email" subtitle="" footer={<Link to="/login" className="underline underline-offset-4">Back to log in</Link>}><EmptyState icon={MailCheck} title="Confirm your address" description={`We sent a link to ${f.email}. Open it to activate your workspace.`} /></AuthShell>

  return (
    <AuthShell title="Start free" subtitle="Set up your quarry workspace in a few minutes. No card required." footer={<>Already have an account? <Link to="/login" className="text-fg underline underline-offset-4">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Your name">{(id) => <Input id={id} required autoComplete="name" value={f.name} onChange={set('name')} />}</Field>
        <Field label="Company or quarry name">{(id) => <Input id={id} required autoComplete="organization" value={f.company} onChange={set('company')} />}</Field>
        <Field label="Work email">{(id) => <Input id={id} type="email" required autoComplete="email" value={f.email} onChange={set('email')} />}</Field>
        <Field label="Password" hint="At least 8 characters." error={error}>{(id, d) => <Input id={id} aria-describedby={d} type="password" required autoComplete="new-password" value={f.password} onChange={set('password')} />}</Field>
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy}>Create account</Button>
      </form>
      {demoMode && <div className="mt-6 rounded-xl border border-line bg-surface-2/40 p-4 text-[13px] text-muted">Account creation needs Supabase, which isn't configured here. <button onClick={() => { signInDemo('owner'); navigate('/app') }} className="text-fg underline underline-offset-4">Open the demo workspace instead</button>.</div>}
    </AuthShell>
  )
}
