import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react'
import { useState } from 'react'
import { signInWithPassword } from '../../lib/auth'
import { useSupabaseSession } from '../../hooks/use-supabase-session'

interface SignInPageProps {
  signUpPath: string
  passwordResetPath: string
  dashboardPath: string
  onNavigate: (path: string) => void
}

export function SignInPage({
  signUpPath,
  passwordResetPath,
  dashboardPath,
  onNavigate,
}: SignInPageProps) {
  const { client, session, error } = useSupabaseSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  async function handleSignIn() {
    if (!client) {
      setErrorMessage('Supabase client is not ready.')
      return
    }

    setIsBusy(true)
    setErrorMessage(null)
    const result = await signInWithPassword({ client, email, password })
    setIsBusy(false)

    if (!result.ok) {
      setErrorMessage(result.error ?? 'Sign in failed.')
      return
    }

    onNavigate(dashboardPath)
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
          <Button className="bg-accent text-white" radius="full" onPress={() => onNavigate(dashboardPath)}>
            进入个人空间
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="glass-panel mx-auto w-full max-w-md">
      <CardHeader className="flex flex-col items-start gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Sign in</p>
        <h1 className="text-2xl font-semibold">进入个人空间</h1>
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
          placeholder="Enter your password"
          type="password"
          value={password}
          onValueChange={setPassword}
        />
        {error ? <p className="text-sm text-danger-500">{error}</p> : null}
        {errorMessage ? <p className="text-sm text-danger-500">{errorMessage}</p> : null}
        <Button className="bg-accent text-white" radius="full" isLoading={isBusy} onPress={handleSignIn}>
          Sign in
        </Button>
        <button
          className="text-sm font-medium text-ink/70 hover:text-ink"
          onClick={() => onNavigate(passwordResetPath)}
        >
          忘记密码？
        </button>
        <button
          className="text-sm font-medium text-ink/70 hover:text-ink"
          onClick={() => onNavigate(signUpPath)}
        >
          Don&apos;t have an account? Sign up
        </button>
      </CardBody>
    </Card>
  )
}
