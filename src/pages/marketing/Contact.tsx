import { useState } from 'react'
import { Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { PageHero } from './PageHero'

export default function Contact() {
  const toast = useToast()
  const [f, setF] = useState({ name: '', company: '', email: '', type: 'Quarry', message: '' })
  const [sent, setSent] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((s) => ({ ...s, [k]: e.target.value }))
  const valid = f.name.trim() && /\S+@\S+\.\S+/.test(f.email) && f.message.trim().length > 9
  return (
    <>
      <PageHero title="Tell us how your quarry runs today" lead="Describe your operation and what you would like to fix first. We will reply with how QuarryOS could help." />
      <div className="container-page grid gap-14 py-20 lg:grid-cols-[1.2fr_0.8fr]">
        {sent ? (
          <div role="status" className="rounded-2xl border border-ok/30 bg-ok/[0.06] p-8"><h2 className="text-xl font-semibold">Message recorded (demo)</h2><p className="mt-2 text-muted">This preview has no mail backend, so nothing was sent. A live site would deliver this to the team.</p><Button className="mt-6" onClick={() => setSent(false)}>Write another</Button></div>
        ) : (
          <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); setSent(true); toast({ title: 'Message recorded (demo)' }) }} noValidate>
            <Field label="Your name">{(id) => <Input id={id} required autoComplete="name" value={f.name} onChange={set('name')} />}</Field>
            <Field label="Company">{(id) => <Input id={id} autoComplete="organization" value={f.company} onChange={set('company')} />}</Field>
            <Field label="Work email">{(id) => <Input id={id} type="email" required autoComplete="email" value={f.email} onChange={set('email')} />}</Field>
            <Field label="Your business">{(id) => <Select id={id} value={f.type} onChange={set('type')}><option>Quarry</option><option>Stone manufacturer</option><option>Exporter</option><option>Dealer</option><option>Fabricator</option><option>Other</option></Select>}</Field>
            <Field label="Message" hint="At least 10 characters." className="sm:col-span-2">{(id, d) => <Textarea id={id} aria-describedby={d} className="min-h-36" value={f.message} onChange={set('message')} />}</Field>
            <div className="sm:col-span-2"><Button type="submit" variant="primary" size="lg" disabled={!valid}>Send message</Button></div>
          </form>
        )}
        <aside className="space-y-6 text-sm">
          <div className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 text-sand" aria-hidden /><div><div className="font-medium">Email</div><div className="text-muted">hello@quarryos.example</div></div></div>
          <div className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 text-sand" aria-hidden /><div><div className="font-medium">Based in</div><div className="text-muted">India, working with quarries worldwide</div></div></div>
          <p className="text-xs text-subtle">Contact details are placeholders in this preview.</p>
        </aside>
      </div>
    </>
  )
}
