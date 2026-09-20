import { env, isApiConfigured } from '@/lib/env'
import { supabase } from '@/lib/supabase'

/**
 * Thin HTTP client for the FastAPI backend. Not used while VITE_API_BASE_URL is empty.
 * Auth: forwards the Supabase access token as a Bearer token; the API must verify it server-side.
 */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!isApiConfigured) throw new Error('API base URL is not configured')
  const session = supabase ? (await supabase.auth.getSession()).data.session : null
  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...init.headers,
    },
  })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return (await res.json()) as T
}

/** Simulated network latency for demo data so loading states are exercised. */
export const demoDelay = <T,>(value: T, ms = 380): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms + Math.random() * 220))
