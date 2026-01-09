import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react'
import { useMemo, useState } from 'react'
import { useSupabaseSession } from '../../hooks/use-supabase-session'

interface PasswordResetPageProps {
  signInPath: string
  dashboardPath: string
  updatePasswordPath: string
  onNavigate: (path: string) => void
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function PasswordResetPage({ signInPath, dashboardPath, updatePasswordPath, onNavigate }: PasswordResetPageProps) {
  const { client } = useSupabaseSession()
  const siteUrl = useMemo(() => window.location.origin, [])
  const [email, setEmail] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleReset() {
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!client) {
      setErrorMessage('Supabase client is not ready.')
      return
    }

    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage('请输入有效邮箱地址')
      return
    }

    setIsBusy(true)
    try {
      const redirectTo = `${siteUrl}${updatePasswordPath}?callback=${encodeURIComponent(dashboardPath)}`
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) {
        throw new Error(error.message)
      }

      setSuccessMessage('重置邮件已发送，请检查邮箱。')
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
        {errorMessage ? <p className="text-sm text-danger-500">{errorMessage}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-500">{successMessage}</p> : null}
        <Button className="bg-teal text-white hover:bg-seafoam" radius="full" isLoading={isBusy} onPress={handleReset}>
          重置密码
        </Button>
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
