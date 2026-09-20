import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Role } from '@/types/models'
import { supabase } from '@/lib/supabase'
import { isSupabaseConfigured } from '@/lib/env'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
  organisation: string
  demo: boolean
}

interface AuthContextValue {
  user: SessionUser | null
  loading: boolean
  demoMode: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: { name: string; email: string; password: string; company: string }) => Promise<{ needsConfirmation: boolean }>
  signInDemo: (role: Role) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const DEMO_KEY = 'quarryos.demo-session'

const DEMO_USERS: Record<Role, Omit<SessionUser, 'demo'>> = {
  owner: { id: 'demo-owner', name: 'Venkat Ramana', email: 'owner@demo.quarryos.example', role: 'owner', organisation: 'Meridian Granites' },
  admin: { id: 'demo-admin', name: 'Sirisha Devi', email: 'admin@demo.quarryos.example', role: 'admin', organisation: 'Meridian Granites' },
  manager: { id: 'demo-manager', name: 'Lakshmi Prasanna', email: 'manager@demo.quarryos.example', role: 'manager', organisation: 'Meridian Granites' },
  sales: { id: 'demo-sales', name: 'Tarun Sharma', email: 'sales@demo.quarryos.example', role: 'sales', organisation: 'Meridian Granites' },
  worker: { id: 'demo-worker', name: 'Padma Latha', email: 'yard@demo.quarryos.example', role: 'worker', organisation: 'Meridian Granites' },
}

const ROLES: Role[] = ['owner', 'admin', 'manager', 'sales', 'worker']

function toSessionUser(u: {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown>
  app_metadata?: Record<string, unknown>
}): SessionUser {
  const r = u.app_metadata?.role as Role | undefined

  return {
    id: u.id,
    email: u.email ?? '',
    name:
      (u.user_metadata?.full_name as string | undefined) ??
      (u.email ?? 'User').split('@')[0]!,
    role: r && ROLES.includes(r) ? r : 'worker',
    organisation:
      (u.user_metadata?.company as string | undefined) ??
      'Your organisation',
    demo: false,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        setUser(
          data.session
            ? toSessionUser(data.session.user)
            : null,
        )
        setLoading(false)
      })

      const { data: sub } =
        supabase.auth.onAuthStateChange(
          (_e, session) => {
            setUser(
              session
                ? toSessionUser(session.user)
                : null,
            )
          },
        )

      return () => sub.subscription.unsubscribe()
    }

    try {
      const raw = localStorage.getItem(DEMO_KEY)

      if (raw) {
        setUser({
          ...(DEMO_USERS[JSON.parse(raw) as Role] ??
            DEMO_USERS.owner),
          demo: true,
        })
      }
    } catch {
      // Ignore storage errors.
    }

    setLoading(false)
  }, [])

  const signInDemo = useCallback((role: Role) => {
    try {
      localStorage.setItem(
        DEMO_KEY,
        JSON.stringify(role),
      )
    } catch {
      // Ignore storage errors.
    }

    setUser({
      ...DEMO_USERS[role],
      demo: true,
    })
  }, [])

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) {
        throw new Error(
          'Supabase is not configured. Use the demo sign-in below.',
        )
      }

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      if (error) {
        throw new Error(error.message)
      }
    },
    [],
  )

  const signUp = useCallback(
    async ({
      name,
      email,
      password,
      company,
    }: {
      name: string
      email: string
      password: string
      company: string
    }) => {
      if (!supabase) {
        throw new Error(
          'Supabase is not configured. Use the demo sign-in instead.',
        )
      }

      const { data, error } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              company,
            },
          },
        })

      if (error) {
        throw new Error(error.message)
      }

      return {
        needsConfirmation: !data.session,
      }
    },
    [],
  )

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }

    try {
      localStorage.removeItem(DEMO_KEY)
    } catch {
      // Ignore storage errors.
    }

    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      demoMode: !isSupabaseConfigured,
      signIn,
      signUp,
      signInDemo,
      signOut,
    }),
    [
      user,
      loading,
      signIn,
      signUp,
      signInDemo,
      signOut,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error(
      'useAuth must be used inside <AuthProvider>',
    )
  }

  return ctx
}