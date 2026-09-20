import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'

/** Buyer enquiry form. Demo: no request is sent. Wire `onSubmit` to POST /v1/public/enquiries. */
export function EnquiryModal({ open, onClose, subject, quote }: { open: boolean; onClose: () => void; subject: string; quote?: boolean }) {
  const toast = useToast()
  const [f, setF] = useState({ name: '', company: '', email: '', phone: '', message: '' })
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((s) => ({ ...s, [k]: e.target.value }))
  const valid = f.name.trim() && /\S+@\S+\.\S+/.test(f.email)
  return (
    <Modal open={open} onClose={onClose} title={quote ? 'Request a quotation' : 'Send an enquiry'} description={subject}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" disabled={!valid} onClick={() => { toast({ title: 'Enquiry recorded (demo)', description: 'In a live storefront this reaches the quarry’s sales team.' }); onClose() }}>{quote ? 'Request quotation' : 'Send enquiry'}</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name">{(id) => <Input id={id} data-autofocus value={f.name} onChange={set('name')} autoComplete="name" />}</Field>
        <Field label="Company">{(id) => <Input id={id} value={f.company} onChange={set('company')} autoComplete="organization" />}</Field>
        <Field label="Email">{(id) => <Input id={id} type="email" value={f.email} onChange={set('email')} autoComplete="email" />}</Field>
        <Field label="Phone or WhatsApp">{(id) => <Input id={id} type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" />}</Field>
        <Field label="Message" className="sm:col-span-2">{(id) => <Textarea id={id} value={f.message} onChange={set('message')} placeholder="Quantity, destination, timeline…" />}</Field>
      </div>
    </Modal>
  )
}
