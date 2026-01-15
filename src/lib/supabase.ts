import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseEnv } from './env'

let client: SupabaseClient | null = null

export function getSupabaseClient() {
  if (client) return client
  const env = getSupabaseEnv()
  client = createClient(env.url, env.anonKey, {
    global: {
      headers: {
        apikey: env.anonKey,
      },
    },
  })
  return client
}
