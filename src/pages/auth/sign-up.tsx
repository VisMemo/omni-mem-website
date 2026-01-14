import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react'
import { useMemo, useState } from 'react'
import { useSupabaseSession } from '../../hooks/use-supabase-session'

interface SignUpPageProps {
  signInPath: string
  dashboardPath: string
  onNavigate: (path: string) => void
}

export function SignUpPage({ signInPath, dashboardPath, onNavigate }: SignUpPageProps) {
  const { client, session, error } = useSupabaseSession()
  const signInRedirectUrl = useMemo(() => {
    if (typeof window === 'undefined') return null
    return `${window.location.origin}${signInPath}`
  }, [signInPath])
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  async function handleRequestOtp() {
    if (!client) {
      setErrorMessage('Supabase client is not ready.')
      return
    }

    const trimmedUsername = username.trim()
    if (!trimmedUsername || !email || !password || !confirmPassword) {
      setErrorMessage('Username, email, and password are required.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsBusy(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      const { error: otpError } = await client.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          ...(signInRedirectUrl ? { emailRedirectTo: signInRedirectUrl } : {}),
          data: {
            name: trimmedUsername,
          },
        },
      })
      if (otpError) {
        throw new Error(otpError.message)
      }

      setStep('verify')
      setSuccessMessage('验证码已发送，请查收邮箱。')
    } catch (requestError) {
      setErrorMessage(
        requestError instanceof Error ? requestError.message : 'OTP request failed.'
      )
    } finally {
      setIsBusy(false)
    }
  }

  async function handleVerifyOtp() {
    if (!client) {
      setErrorMessage('Supabase client is not ready.')
      return
    }

    const trimmedUsername = username.trim()
    if (!trimmedUsername || !email || !password || !confirmPassword || !otp) {
      setErrorMessage('Username, email, password, and OTP are required.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsBusy(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      const verifyTypes: Array<'signup' | 'email'> = ['signup', 'email']
      let verificationError: Error | null = null
      let session = null

      for (const type of verifyTypes) {
        const { data, error: verifyError } = await client.auth.verifyOtp({
          email,
          token: otp,
          type,
        })
        if (verifyError) {
          verificationError = verifyError
          continue
        }
        session = data.session ?? null
        break
      }

      if (!session) {
        const { data: sessionData, error: sessionError } = await client.auth.getSession()
        if (sessionError) {
          throw new Error(sessionError.message)
        }
        session = sessionData.session ?? null
      }

      if (!session) {
        throw new Error(
          verificationError?.message ?? 'Session not available after OTP verification.'
        )
      }

      const { error: passwordError } = await client.auth.updateUser({
        password,
        data: {
          name: trimmedUsername,
        },
      })
      if (passwordError) {
        throw new Error(passwordError.message)
      }

      setSuccessMessage('注册成功，正在进入控制台...')
      onNavigate(dashboardPath)
    } catch (verifyError) {
      setErrorMessage(
        verifyError instanceof Error ? verifyError.message : 'OTP verification failed.'
      )
    } finally {
      setIsBusy(false)
    }
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
          <Button className="bg-teal text-white hover:bg-seafoam" radius="full" onPress={() => onNavigate(dashboardPath)}>
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
          label="Username"
          placeholder="Create a username"
          type="text"
          value={username}
          onValueChange={setUsername}
        />
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
        <Input
          label="Confirm password"
          placeholder="Re-enter your password"
          type="password"
          value={confirmPassword}
          onValueChange={setConfirmPassword}
        />
        {step === 'verify' ? (
          <Input
            label="OTP"
            placeholder="Enter OTP code"
            type="text"
            value={otp}
            onValueChange={(value) => setOtp(value.trim())}
          />
        ) : null}
        {error ? <p className="text-sm text-danger-500">{error}</p> : null}
        {errorMessage ? <p className="text-sm text-danger-500">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
        {step === 'request' ? (
          <Button className="bg-teal text-white hover:bg-seafoam" radius="full" isLoading={isBusy} onPress={handleRequestOtp}>
            注册
          </Button>
        ) : (
          <Button className="bg-teal text-white hover:bg-seafoam" radius="full" isLoading={isBusy} onPress={handleVerifyOtp}>
            确认验证码
          </Button>
        )}
        {step === 'verify' ? (
          <Button radius="full" variant="flat" isLoading={isBusy} onPress={handleRequestOtp}>
            重新发送验证码
          </Button>
        ) : null}
        <button
          className="text-sm font-medium text-ink/70 hover:text-teal transition-colors"
          onClick={() => onNavigate(signInPath)}
        >
          Already have an account? Sign in
        </button>
      </CardBody>
    </Card>
  )
}
