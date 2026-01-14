import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react'
import { useMemo, useState } from 'react'
import { getApiEnv } from '../../lib/env'

interface UpdatePasswordPageProps {
  dashboardPath: string
  signInPath: string
  onNavigate: (path: string) => void
}

export function UpdatePasswordPage({ dashboardPath, signInPath, onNavigate }: UpdatePasswordPageProps) {
  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])
  const resetToken = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    const tokenFromQuery = params.get('token') ?? params.get('access_token')
    if (tokenFromQuery) return tokenFromQuery
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    return hashParams.get('access_token') ?? null
  }, [])
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleUpdatePassword() {
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!resetToken) {
      setErrorMessage('链接已失效，请重新发起密码重置。')
      return
    }

    if (!password || !repeatPassword) {
      setErrorMessage('请输入新密码。')
      return
    }

    if (password !== repeatPassword) {
      setErrorMessage('两次输入的密码不一致。')
      return
    }

    setIsBusy(true)
    try {
      const response = await fetch(`${apiBaseUrl}/auth/password-reset/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset_token: resetToken, password }),
      })
      const data = (await response.json().catch(() => ({}))) as { message?: string }
      if (!response.ok) {
        throw new Error(data?.message ?? '密码更新失败')
      }

      setSuccessMessage('密码已更新。')
      onNavigate(signInPath)
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setIsBusy(false)
    }
  }

  if (!resetToken) {
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
