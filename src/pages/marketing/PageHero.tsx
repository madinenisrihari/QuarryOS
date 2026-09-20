import type { ReactNode } from 'react'
import { StrataBackground } from '@/components/marketing/StrataBackground'

export function PageHero({ title, lead, children }: { title: string; lead: string; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line pb-16 pt-36">
      <StrataBackground className="opacity-70 mask-fade-b" lines={18} seed={5} />
      <div className="container-page relative">
        <h1 className="max-w-3xl text-headline font-semibold">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{lead}</p>
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  )
}
