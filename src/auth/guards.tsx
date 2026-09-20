import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './AuthProvider'
import type { ModuleKey } from './permissions'
import { ROLE_MODULES, type UserRole } from './permissions'

function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-sm text-muted-foreground">
        Loading QuarryOS...
      </div>
    </div>
  )
}

export function RequireAuth({ children }: { children?: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <AuthLoading />
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return children ? <>{children}</> : <Outlet />
}

function getUserRole(user: {
  user_metadata?: Record<string, unknown>
}): UserRole {
  const role = user.user_metadata?.role

  if (
    role === 'owner' ||
    role === 'admin' ||
    role === 'manager' ||
    role === 'employee' ||
    role === 'buyer'
  ) {
    return role
  }

  // New authenticated QuarryOS users start as owner
  // until the database-backed organization/role system is added.
  return 'owner'
}

export function RequireModule({
  module,
  children,
}: {
  module: ModuleKey
  children: ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return <AuthLoading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const role = getUserRole(user)
  const allowedModules = ROLE_MODULES[role]

  if (!allowedModules.includes(module)) {
    return <Navigate to="/app" replace />
  }

  return <>{children}</>
}