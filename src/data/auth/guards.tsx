import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { can, ROLE_LABEL, type ModuleKey } from './permissions'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="grid h-screen place-items-center text-sm text-muted" role="status">Loading workspace…</div>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

export function RequireModule({ module, children }: { module: ModuleKey; children: ReactNode }) {
  const { user } = useAuth()
  if (!can(user?.role, module)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="You don't have access to this module"
        description={`Your role (${user ? ROLE_LABEL[user.role] : 'unknown'}) doesn't include ${module}. Ask an owner or admin to change your role.`}
        action={<Button to="/app" variant="secondary">Back to overview</Button>}
      />
    )
  }
  return <>{children}</>
}
