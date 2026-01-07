import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react'
import { useEffect, useMemo, useState } from 'react'
import { useSupabaseSession } from '../hooks/use-supabase-session'
import { getApiEnv } from '../lib/env'

interface ScopeEntitlements {
  credit_default: number
  memory_node_limit: number
  rate_limit_3s: number
  allow_apikey_scope: boolean
}

interface ScopeResponse {
  scope: string
  entitlements?: ScopeEntitlements | null
}

function formatAccountId(value?: string | null) {
  if (!value) return '-'
  if (value.length <= 12) return value
  return `${value.slice(0, 6)}-****-****-${value.slice(-4)}`
}

export function ProfilePage() {
  const { session, refreshSession } = useSupabaseSession()
  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])
  const accountId = session?.user?.id ?? null

  const [scopeInfo, setScopeInfo] = useState<ScopeResponse | null>(null)
  const [scopeStatus, setScopeStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [scopeMessage, setScopeMessage] = useState<string | null>(null)

  const [upgradeCode, setUpgradeCode] = useState('')
  const [upgradeStatus, setUpgradeStatus] = useState<'idle' | 'loading' | 'error' | 'success'>(
    'idle',
  )
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState('Qbrain')

  async function getSession() {
    const active = await refreshSession()
    return active ?? session ?? null
  }

  async function loadScope() {
    const activeSession = await getSession()
    if (!activeSession) return
    setScopeStatus('loading')
    setScopeMessage(null)
    const response = await fetch(`${apiBaseUrl}/settings/scope`, {
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`,
        'X-Principal-User-Id': activeSession.user.id,
      },
    })
    const data = (await response.json()) as ScopeResponse & { message?: string }
    if (!response.ok) {
      setScopeStatus('error')
      setScopeMessage(data?.message ?? '加载套餐信息失败。')
      return
    }
    setScopeInfo(data)
    setScopeStatus('idle')
  }

  useEffect(() => {
    if (!accountId) return
    loadScope().catch((error) => {
      setScopeStatus('error')
      setScopeMessage(String(error))
    })
  }, [accountId])

  async function handleUpgrade() {
    const trimmed = upgradeCode.trim()
    if (!trimmed) {
      setUpgradeStatus('error')
      setUpgradeMessage('请输入邀请码。')
      return
    }
    const activeSession = await getSession()
    if (!activeSession) return
    setUpgradeStatus('loading')
    setUpgradeMessage(null)
    const response = await fetch(`${apiBaseUrl}/settings/scope-upgrade`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`,
        'Content-Type': 'application/json',
        'X-Principal-User-Id': activeSession.user.id,
      },
      body: JSON.stringify({ code: trimmed }),
    })
    const data = (await response.json()) as { message?: string }
    if (!response.ok) {
      setUpgradeStatus('error')
      setUpgradeMessage(data?.message ?? '升级失败。')
      return
    }
    setUpgradeStatus('success')
    setUpgradeMessage('升级成功。')
    setUpgradeCode('')
    loadScope().catch(() => null)
  }

  const entitlements = scopeInfo?.entitlements
  const emailValue = session?.user?.email ?? '-'
  const accountIdValue = formatAccountId(session?.user?.id ?? null)
  const scopeValue = scopeInfo?.scope ?? '-'

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">账户</p>
          <h1 className="text-2xl font-semibold text-ink">个人资料</h1>
          <p className="text-sm text-muted">管理账户名称、套餐与账单概览。</p>
        </div>
        <Button className="bg-accent text-white" radius="full">
          保存修改
        </Button>
      </header>

      <Card className="glass-panel">
        <CardHeader className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold">账户资料</h3>
          <p className="text-sm text-muted">仅账户名称可编辑，其余信息为只读。</p>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Input
            label="账户名称"
            placeholder="请输入账户名称"
            value={displayName}
            onValueChange={setDisplayName}
          />
          <Input label="管理员邮箱" value={emailValue} isReadOnly onValueChange={() => {}} />
          <Input label="账户 ID" value={accountIdValue} isReadOnly onValueChange={() => {}} />
          <Input label="套餐级别" value={scopeValue} isReadOnly onValueChange={() => {}} />
        </CardBody>
      </Card>

      <Card className="glass-panel">
        <CardHeader className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold">套餐与升级</h3>
          <p className="text-sm text-muted">查看当前套餐权益并使用邀请码升级。</p>
        </CardHeader>
        <CardBody className="space-y-4">
          {scopeStatus === 'loading' ? (
            <p className="text-sm text-muted">套餐信息加载中...</p>
          ) : scopeStatus === 'error' ? (
            <p className="text-sm text-danger-500">{scopeMessage ?? '套餐信息加载失败。'}</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm">
                当前套餐：<span className="font-semibold">{scopeInfo?.scope ?? '-'}</span>
              </p>
              {entitlements ? (
                <div className="text-xs text-muted">
                  <p>默认额度：{entitlements.credit_default}</p>
                  <p>记忆节点上限：{entitlements.memory_node_limit}</p>
                  <p>速率限制（3 秒）：{entitlements.rate_limit_3s}</p>
                  <p>API 密钥隔离：{entitlements.allow_apikey_scope ? '已启用' : '未启用'}</p>
                </div>
              ) : null}
            </div>
          )}

          <div className="space-y-2">
            <Input
              label="邀请码"
              placeholder="输入邀请码"
              value={upgradeCode}
              onChange={(event) => setUpgradeCode(event.target.value)}
            />
            <Button
              className="bg-ink text-white"
              onPress={handleUpgrade}
              isDisabled={upgradeStatus === 'loading'}
            >
              {upgradeStatus === 'loading' ? '升级中...' : '应用'}
            </Button>
            {upgradeMessage ? (
              <p
                className={
                  upgradeStatus === 'error'
                    ? 'text-xs text-danger-500'
                    : 'text-xs text-success-600'
                }
              >
                {upgradeMessage}
              </p>
            ) : null}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
