import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Role } from '@/types/models'

type AuthUser = {
  id: string
  email: string
  name: string
  company: string
  role: Role
}

type SignUpInput = {
  name: string
  company: string
  email: string
  password: string
}

type SignUpResult = {
  needsConfirmation: boolean
}

type AuthContextValue = {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  demoMode: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (input: SignUpInput) => Promise<SignUpResult>
  signOut: () => Promise<void>
  signInDemo: (role: Role) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const VALID_ROLES: Role[] = [
  'owner',
  'admin',
  'manager',
  'sales',
  'worker',
]

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && VALID_ROLES.includes(value as Role)
}

function getUserName(user: User) {
  return (
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    'User'
  )
}

function getCompanyName(user: User) {
  return (
    user.user_metadata?.company ??
    user.user_metadata?.company_name ??
    'My Quarry'
  )
}

/**
 * Loads the user's actual QuarryOS role from quarry_members.
 *
 * This is intentionally based on the database membership rather than
 * app_metadata, because quarry_members is the source of truth for
 * workspace access.
 */
async function loadAuthUser(user: User): Promise<AuthUser> {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  let role: Role | null = null

  const { data: membership, error: membershipError } = await supabase
    .from('quarry_members')
    .select('role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (membershipError) {
    console.error('Failed to load QuarryOS membership:', membershipError)
  } else if (membership && isRole(membership.role)) {
    role = membership.role
  }

  // Fallback for existing accounts that may not have a membership yet.
  if (!role && isRole(user.app_metadata?.role)) {
    role = user.app_metadata.role
  }

  // A newly-created QuarryOS account should normally have an owner
  // membership created by the database trigger.
  if (!role) {
    role = 'owner'
  }

  return {
    id: user.id,
    email: user.email ?? '',
    name: getUserName(user),
    company: getCompanyName(user),
    role,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const demoMode = !supabase

  useEffect(() => {
    let mounted = true

    if (!supabase) {
      setLoading(false)
      return
    }

    const initialiseAuth = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('Failed to restore Supabase session:', error)
          return
        }

        if (!mounted) return

        setSession(currentSession)

        if (currentSession?.user) {
          const authUser = await loadAuthUser(currentSession.user)

          if (mounted) {
            setUser(authUser)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)

        if (mounted) {
          setSession(null)
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void initialiseAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!mounted) return

      setSession(nextSession)

      if (!nextSession?.user) {
        setUser(null)
        setLoading(false)
        return
      }

      /*
       * Avoid doing database work directly inside Supabase's auth callback
       * synchronously. A small timeout lets Supabase finish its internal
       * auth transaction first.
       */
      setTimeout(async () => {
        if (!mounted) return

        try {
          const authUser = await loadAuthUser(nextSession.user)

          if (mounted) {
            setUser(authUser)
          }
        } catch (error) {
          console.error('Failed to load QuarryOS user:', error)
        } finally {
          if (mounted) {
            setLoading(false)
          }
        }
      }, 0)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    if (!data.user) {
      throw new Error('Sign-in succeeded but no user was returned.')
    }

    const authUser = await loadAuthUser(data.user)

    setSession(data.session)
    setUser(authUser)
  }

  const signUp = async (input: SignUpInput): Promise<SignUpResult> => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.name,
          company: input.company,
        },
      },
    })

    if (error) {
      throw error
    }

    /*
     * If email confirmation is enabled, Supabase returns a user but
     * no active session. The Signup page will show the confirmation screen.
     */
    if (!data.session || !data.user) {
      return {
        needsConfirmation: true,
      }
    }

    const authUser = await loadAuthUser(data.user)

    setSession(data.session)
    setUser(authUser)

    return {
      needsConfirmation: false,
    }
  }

  const signOut = async () => {
    if (!supabase) {
      setUser(null)
      setSession(null)
      return
    }

    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    setUser(null)
    setSession(null)
  }

  const signInDemo = (role: Role) => {
    const demoUser: AuthUser = {
      id: `demo-${role}`,
      email: `${role}@demo.quarryos.local`,
      name: `Demo ${role.charAt(0).toUpperCase()}${role.slice(1)}`,
      company: 'QuarryOS Demo',
      role,
    }

    setUser(demoUser)
    setSession(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      demoMode,
      signIn,
      signUp,
      signOut,
      signInDemo,
    }),
    [user, session, loading, demoMode],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}