import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react'
import { useMemo, useState } from 'react'
import { getApiEnv } from '../../lib/env'

interface PasswordResetPageProps {
  signInPath: string
  dashboardPath: string
  updatePasswordPath: string
  onNavigate: (path: string) => void
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function PasswordResetPage({ signInPath, dashboardPath, updatePasswordPath, onNavigate }: PasswordResetPageProps) {
  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleRequest() {
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage('请输入有效邮箱地址')
      return
    }

    setIsBusy(true)
    try {
      const response = await fetch(`${apiBaseUrl}/auth/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await response.json().catch(() => ({}))) as { message?: string }
      if (!response.ok) {
        throw new Error(data?.message ?? '发送验证码失败')
      }

      setStep('verify')
      setSuccessMessage('验证码已发送，请检查邮箱。')
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setIsBusy(false)
    }
  }

  async function handleVerify() {
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage('请输入有效邮箱地址')
      return
    }

    if (!otp.trim()) {
      setErrorMessage('请输入验证码')
      return
    }

    setIsBusy(true)
    try {
      const response = await fetch(`${apiBaseUrl}/auth/password-reset/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.trim() }),
      })
      const data = (await response.json().catch(() => ({}))) as {
        message?: string
        reset_token?: string
      }
      if (!response.ok) {
        throw new Error(data?.message ?? '验证码校验失败')
      }

      const resetToken = data.reset_token
      if (!resetToken) {
        throw new Error('验证码校验失败')
      }

      onNavigate(
        `${updatePasswordPath}?token=${encodeURIComponent(resetToken)}&callback=${encodeURIComponent(dashboardPath)}`,
      )
    } catch (error) {
      setErrorMessage(String(error))
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <Card className="glass-panel mx-auto w-full max-w-md">
      <CardHeader className="flex flex-col items-start gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Reset</p>
        <h1 className="text-2xl font-semibold">重置密码</h1>
      </CardHeader>
      <CardBody className="space-y-4">
        <Input
          label="Email"
          placeholder="you@example.com"
          type="email"
          value={email}
          onValueChange={setEmail}
        />
        {step === 'verify' ? (
          <Input
            label="验证码"
            placeholder="输入邮箱验证码"
            type="text"
            value={otp}
            onValueChange={(value) => setOtp(value.trim())}
          />
        ) : null}
        {errorMessage ? <p className="text-sm text-danger-500">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-500">{successMessage}</p> : null}
        {step === 'request' ? (
          <Button className="bg-teal text-white hover:bg-seafoam" radius="full" isLoading={isBusy} onPress={handleRequest}>
            发送验证码
          </Button>
        ) : (
          <Button className="bg-teal text-white hover:bg-seafoam" radius="full" isLoading={isBusy} onPress={handleVerify}>
            下一步
          </Button>
        )}
        <button
          className="text-sm font-medium text-ink/70 hover:text-teal transition-colors"
          onClick={() => onNavigate(signInPath)}
        >
          返回登录
        </button>
      </CardBody>
    </Card>
  )
}
