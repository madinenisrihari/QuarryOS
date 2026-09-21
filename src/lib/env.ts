export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
}

export const isSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseAnonKey
)

export const isApiConfigured = Boolean(env.apiBaseUrl)