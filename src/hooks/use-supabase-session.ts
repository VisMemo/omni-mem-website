import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import { getSupabaseClient } from '../lib/supabase'

interface SupabaseSessionState {
  client: SupabaseClient | null
  session: Session | null
  isLoading: boolean
  error: string | null
  refreshSession: () => Promise<Session | null>
}

export function useSupabaseSession(): SupabaseSessionState {
  const [client, setClient] = useState<SupabaseClient | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      setClient(getSupabaseClient())
    } catch (err) {
      setError(getErrorMessage(err))
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!client) return

    let isMounted = true

    client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!isMounted) return
      if (sessionError) {
        setError(sessionError.message)
      } else {
        setSession(data.session ?? null)
      }
      setIsLoading(false)
    })

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      isMounted = false
      data.subscription.unsubscribe()
    }
  }, [client])

  const refreshSession = useCallback(async () => {
    if (!client) return null

    const { data, error: sessionError } = await client.auth.getSession()
    if (sessionError) {
      throw sessionError
    }

    const current = data.session ?? null
    if (!current) return null

    const expiresAt = current.expires_at ?? 0
    const now = Math.floor(Date.now() / 1000)
    if (expiresAt - now > 60) {
      return current
    }

    const { data: refreshed, error: refreshError } = await client.auth.refreshSession()
    if (refreshError || !refreshed.session) {
      await client.auth.signOut()
      throw refreshError ?? new Error('Session expired. Please sign in again.')
    }

    setSession(refreshed.session)
    return refreshed.session
  }, [client])

  return { client, session, isLoading, error, refreshSession }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Unknown error'
}
