import type { SupabaseClient } from '@supabase/supabase-js'

interface AuthResult {
  ok: boolean
  error?: string
}

interface SignInWithPasswordParams {
  client: SupabaseClient
  email: string
  password: string
}

interface SignOutParams {
  client: SupabaseClient
}

interface SignUpWithPasswordParams {
  client: SupabaseClient
  email: string
  password: string
}

export async function signInWithPassword({
  client,
  email,
  password,
}: SignInWithPasswordParams): Promise<AuthResult> {
  if (!email || !password)
    return { ok: false, error: 'Email and password are required.' }

  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) return { ok: false, error: error.message }

  return { ok: true }
}

export async function signOut({ client }: SignOutParams): Promise<AuthResult> {
  const { error } = await client.auth.signOut()
  if (error) return { ok: false, error: error.message }

  return { ok: true }
}

export async function signUpWithPassword({
  client,
  email,
  password,
}: SignUpWithPasswordParams): Promise<AuthResult> {
  if (!email || !password)
    return { ok: false, error: 'Email and password are required.' }

  const { error } = await client.auth.signUp({ email, password })
  if (error) return { ok: false, error: error.message }

  return { ok: true }
}
