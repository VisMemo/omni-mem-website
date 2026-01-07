import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react'
import { useState } from 'react'
import { signUpWithPassword } from '../../lib/auth'
import { useSupabaseSession } from '../../hooks/use-supabase-session'

interface SignUpPageProps {
  signInPath: string
  dashboardPath: string
  onNavigate: (path: string) => void
}

export function SignUpPage({ signInPath, dashboardPath, onNavigate }: SignUpPageProps) {
  const { client, session, error } = useSupabaseSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  async function handleSignUp() {
    if (!client) {
      setErrorMessage('Supabase client is not ready.')
      return
    }

    setIsBusy(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    const result = await signUpWithPassword({ client, email, password })
    setIsBusy(false)

    if (!result.ok) {
      setErrorMessage(result.error ?? 'Sign up failed.')
      return
    }

    setSuccessMessage('Account created. You can now sign in.')
  }

  if (session) {
    return (
      <Card className="glass-panel mx-auto w-full max-w-md">
        <CardHeader className="flex flex-col items-start gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Signed in</p>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-muted">You already have an active session.</p>
          <Button className="bg-vermillion text-white" radius="full" onPress={() => onNavigate(dashboardPath)}>
            进入个人空间
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="glass-panel mx-auto w-full max-w-md">
      <CardHeader className="flex flex-col items-start gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Sign up</p>
        <h1 className="text-2xl font-semibold">Create your account</h1>
      </CardHeader>
      <CardBody className="space-y-4">
        <Input
          label="Email"
          placeholder="you@example.com"
          type="email"
          value={email}
          onValueChange={setEmail}
        />
        <Input
          label="Password"
          placeholder="Create a password"
          type="password"
          value={password}
          onValueChange={setPassword}
        />
        {error ? <p className="text-sm text-danger-500">{error}</p> : null}
        {errorMessage ? <p className="text-sm text-danger-500">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
        <Button className="bg-vermillion text-white" radius="full" isLoading={isBusy} onPress={handleSignUp}>
          Create account
        </Button>
        <button
          className="text-sm font-medium text-ink/70 hover:text-ink"
          onClick={() => onNavigate(signInPath)}
        >
          Already have an account? Sign in
        </button>
      </CardBody>
    </Card>
  )
}
