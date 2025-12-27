import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { getSupabaseClient } from '../lib/supabase'

interface SupabaseSessionState {
  client: SupabaseClient | null
  session: Session | null
  isLoading: boolean
  error: string | null
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

  return { client, session, isLoading, error }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Unknown error'
}
