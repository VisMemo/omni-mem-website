import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react'
import { useMemo, useState } from 'react'
import { useSupabaseSession } from '../../hooks/use-supabase-session'

interface UpdatePasswordPageProps {
  dashboardPath: string
  signInPath: string
  onNavigate: (path: string) => void
}

export function UpdatePasswordPage({ dashboardPath, signInPath, onNavigate }: UpdatePasswordPageProps) {
  const { client, session } = useSupabaseSession()
  const redirectTo = useMemo(() => {
    if (typeof window === 'undefined') return dashboardPath
    const params = new URLSearchParams(window.location.search)
    return params.get('callback') ?? dashboardPath
  }, [dashboardPath])
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleUpdatePassword() {
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!client) {
      setErrorMessage('Supabase client is not ready.')
      return
    }

    if (!password || !repeatPassword) {
      setErrorMessage('Password is required.')
      return
    }

    if (password !== repeatPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsBusy(true)
    try {
      const { error } = await client.auth.updateUser({ password })
      if (error) {
        throw new Error(error.message)
      }

      setSuccessMessage('密码已更新。')
      onNavigate(redirectTo)
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setIsBusy(false)
    }
  }

  if (!session) {
    return (
      <Card className="glass-panel mx-auto w-full max-w-md">
        <CardHeader className="flex flex-col items-start gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Reset</p>
          <h1 className="text-2xl font-semibold">更新密码</h1>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-muted">链接已失效或未登录，请重新发起密码重置。</p>
          <Button className="bg-teal text-white hover:bg-seafoam" radius="full" onPress={() => onNavigate(signInPath)}>
            返回登录
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="glass-panel mx-auto w-full max-w-md">
      <CardHeader className="flex flex-col items-start gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Reset</p>
        <h1 className="text-2xl font-semibold">更新密码</h1>
      </CardHeader>
      <CardBody className="space-y-4">
        <Input
          label="New Password"
          placeholder="Enter a new password"
          type="password"
          value={password}
          onValueChange={setPassword}
        />
        <Input
          label="Repeat Password"
          placeholder="Repeat your password"
          type="password"
          value={repeatPassword}
          onValueChange={setRepeatPassword}
        />
        {errorMessage ? <p className="text-sm text-danger-500">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-500">{successMessage}</p> : null}
        <Button className="bg-teal text-white hover:bg-seafoam" radius="full" isLoading={isBusy} onPress={handleUpdatePassword}>
          更新密码
        </Button>
      </CardBody>
    </Card>
  )
}
