interface SupabaseEnv {
  url: string
  anonKey: string
}

interface ApiEnv {
  apiBaseUrl: string
}

function getEnvValue({ key }: { key: string }) {
  const env = import.meta.env as Record<string, string | undefined>
  const value = env[key]
  if (!value) throw new Error(`${key} is required`)
  return String(value)
}

export function getSupabaseEnv(): SupabaseEnv {
  return {
    url: getEnvValue({ key: 'VITE_SUPABASE_URL' }),
    anonKey: getEnvValue({ key: 'VITE_SUPABASE_ANON_KEY' }),
  }
}

export function getApiEnv(): ApiEnv {
  return {
    apiBaseUrl: getEnvValue({ key: 'VITE_API_BASE_URL' }).replace(/\/$/, ''),
  }
}
