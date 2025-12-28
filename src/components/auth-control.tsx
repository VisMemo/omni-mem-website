import { Button, Chip } from '@nextui-org/react'
import { useState } from 'react'
import { signOut } from '../lib/auth'
import { useSupabaseSession } from '../hooks/use-supabase-session'

interface AuthControlProps {
  className?: string
  onSignIn?: () => void
  onSignUp?: () => void
}

export function AuthControl({ className, onSignIn, onSignUp }: AuthControlProps) {
  const { client, session, error: clientError } = useSupabaseSession()
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSignOut() {
    if (!client) return

    setIsBusy(true)
    const result = await signOut({ client })
    setIsBusy(false)

    if (!result.ok) {
      setErrorMessage(result.error ?? 'Sign out failed.')
    }
  }

  if (clientError) {
    return (
      <Button
        className={className}
        isDisabled
        radius="full"
        size="sm"
        variant="bordered"
        title={clientError}
      >
        Auth unavailable
      </Button>
    )
  }

  if (!session) {
    return (
      <div className={className ? `flex items-center gap-2 ${className}` : 'flex items-center gap-2'}>
        <Button
          radius="full"
          size="sm"
          variant="bordered"
          isDisabled={!onSignIn}
          onPress={onSignIn}
        >
          Sign in
        </Button>
        <Button
          className="bg-accent text-white"
          radius="full"
          size="sm"
          isDisabled={!onSignUp}
          onPress={onSignUp}
        >
          Sign up
        </Button>
      </div>
    )
  }

  return (
    <div className={className ? `flex items-center gap-2 ${className}` : 'flex items-center gap-2'}>
      <Chip className="bg-white/80 text-xs font-semibold text-ink">{session.user.email ?? 'Signed in'}</Chip>
      {errorMessage ? <span className="text-xs text-danger-500">{errorMessage}</span> : null}
      <Button
        className="border border-ink/20 text-ink"
        radius="full"
        size="sm"
        variant="bordered"
        isLoading={isBusy}
        onPress={handleSignOut}
      >
        Sign out
      </Button>
    </div>
  )
}
