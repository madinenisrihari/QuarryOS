import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export function PageHeader({ title, description, actions, crumbs }: { title: string; description?: string; actions?: ReactNode; crumbs?: { label: string; to?: string }[] }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1 text-xs text-muted">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1">
                {c.to ? <Link to={c.to} className="hover:text-fg">{c.label}</Link> : <span aria-current="page" className="text-fg/80">{c.label}</span>}
                {i < crumbs.length - 1 && <ChevronRight className="h-3 w-3" aria-hidden />}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
