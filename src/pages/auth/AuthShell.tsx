import type { ReactNode } from 'react'
import { Logo } from '@/components/common/Logo'
import { StoneSwatch } from '@/components/common/StoneSwatch'

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 text-sm text-muted">{footer}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden border-l border-line lg:block" aria-hidden>
        <div className="absolute inset-0 opacity-90"><StoneSwatch type="Black Galaxy" seed={42} /></div>
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-bg/10" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="max-w-md text-2xl font-medium leading-snug tracking-tight">Every block measured, tagged and traceable from the quarry face to the customer's gate.</p>
          <p className="mt-3 text-xs text-muted">Illustration: procedurally generated Black Galaxy texture.</p>
        </div>
      </div>
    </div>
  )
}
