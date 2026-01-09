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

export function ProfilePage() {
  const { client, session, refreshSession } = useSupabaseSession()
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

  const [displayName, setDisplayName] = useState('')
  const [initialDisplayName, setInitialDisplayName] = useState('')
  const [profileStatus, setProfileStatus] = useState<'idle' | 'saving' | 'error' | 'success'>(
    'idle',
  )
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'error' | 'success'>(
    'idle',
  )
  const [emailMessage, setEmailMessage] = useState<string | null>(null)

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
      setScopeMessage(data?.message ?? '套餐信息加载失败。')
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

  useEffect(() => {
    if (!session?.user) return
    const metadataName = session.user.user_metadata?.name
    const fallbackName = session.user.email ? session.user.email.split('@')[0] : ''
    const nextName = metadataName ? String(metadataName) : fallbackName
    setInitialDisplayName(nextName)
    setDisplayName((current) => (current ? current : nextName))
  }, [session])

  async function handleSaveProfile() {
    if (!session?.user) {
      setProfileStatus('error')
      setProfileMessage('登录状态不可用，请刷新后再试。')
      return
    }

    const trimmedName = displayName.trim()
    if (!trimmedName) {
      setProfileStatus('error')
      setProfileMessage('账户名称不能为空。')
      return
    }

    const activeSession = await getSession()
    if (!activeSession) {
      setProfileStatus('error')
      setProfileMessage('会话已过期，请重新登录。')
      return
    }

    setProfileStatus('saving')
    setProfileMessage(null)

    const response = await fetch(`${apiBaseUrl}/settings/account-name`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`,
        'Content-Type': 'application/json',
        'X-Principal-User-Id': activeSession.user.id,
      },
      body: JSON.stringify({ name: trimmedName }),
    })
    const data = (await response.json().catch(() => ({}))) as { name?: string; message?: string }
    if (!response.ok) {
      setProfileStatus('error')
      setProfileMessage(data?.message ?? '账户名称更新失败。')
      return
    }

    await refreshSession()
    setInitialDisplayName(data?.name ?? trimmedName)
    setProfileStatus('success')
    setProfileMessage('账户名称已更新。')
  }

  async function handleEmailUpdate() {
    if (!client || !session?.user) {
      setEmailStatus('error')
      setEmailMessage('登录状态不可用，请刷新后再试。')
      return
    }

    const currentEmail = session.user.email ?? ''
    const nextEmail = window.prompt('请输入新的绑定邮箱', currentEmail)
    if (!nextEmail || nextEmail.trim() === currentEmail) return

    setEmailStatus('loading')
    setEmailMessage(null)
    const { error: updateError } = await client.auth.updateUser({
      email: nextEmail.trim(),
    })

    if (updateError) {
      setEmailStatus('error')
      setEmailMessage(updateError.message)
      return
    }

    setEmailStatus('success')
    setEmailMessage('已提交换绑请求，请前往新邮箱确认。')
  }

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

  const entitlements = scopeInfo?.entitlements ?? null
  const emailValue = session?.user?.email ?? '-'
  const trimmedDisplayName = displayName.trim()
  const canSaveName =
    Boolean(trimmedDisplayName) &&
    trimmedDisplayName !== initialDisplayName.trim() &&
    profileStatus !== 'saving'
  const entitlementItems = [
    { label: '默认额度', value: entitlements?.credit_default ?? '-' },
    { label: '记忆节点上限', value: entitlements?.memory_node_limit ?? '-' },
    { label: '请求限制（3 秒）', value: entitlements?.rate_limit_3s ?? '-' },
    {
      label: 'API 密钥隔离',
      value: entitlements ? (entitlements.allow_apikey_scope ? '已启用' : '未启用') : '-',
    },
  ]

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">账户</p>
        <h1 className="text-2xl font-semibold text-ink">个人资料</h1>
        <p className="text-sm text-ink/60">管理账户名称、套餐与账单概览。</p>
      </header>

      <section className="rounded-xl bg-white/70 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">账户资料</h2>
            <p className="text-sm text-ink/60">仅账户名称可编辑，其余信息为只读。</p>
          </div>
          <button
            type="button"
            className="rounded-md bg-ink px-4 py-2 text-xs font-semibold text-ivory disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleSaveProfile}
            disabled={!canSaveName}
          >
            {profileStatus === 'saving' ? '保存中...' : '保存修改'}
          </button>
        </div>
        {profileMessage ? (
          <p
            className={`mt-3 text-xs ${
              profileStatus === 'error' ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {profileMessage}
          </p>
        ) : null}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
              账户名称
            </label>
            <input
              className="h-9 w-full rounded-md border border-ink/10 bg-white/80 px-3 text-sm"
              placeholder="请输入账户名称"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
              绑定邮箱
            </label>
            <input
              className="h-9 w-full rounded-md border border-ink/10 bg-ink/5 px-3 text-sm text-ink/60"
              value={emailValue}
              readOnly
            />
            <button
              type="button"
              className="text-xs font-medium text-ink/60 hover:text-teal transition-colors"
              onClick={handleEmailUpdate}
              disabled={emailStatus === 'loading'}
            >
              {emailStatus === 'loading' ? '处理中...' : '更换绑定邮箱'}
            </button>
            {emailMessage ? (
              <p
                className={`text-xs ${
                  emailStatus === 'error' ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {emailMessage}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white/70 p-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-ink">套餐与升级</h2>
          <p className="text-sm text-ink/60">查看当前套餐权益并使用邀请码升级。</p>
        </div>
        {scopeStatus === 'loading' ? (
          <p className="mt-4 text-sm text-ink/60">套餐信息加载中...</p>
        ) : scopeStatus === 'error' ? (
          <p className="mt-4 text-sm text-red-600">{scopeMessage ?? '套餐信息加载失败。'}</p>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="text-sm">
              当前套餐：<span className="font-semibold">{scopeInfo?.scope ?? '-'}</span>
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {entitlementItems.map((item) => (
                <div key={item.label} className="rounded-lg bg-white/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-ink">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
              邀请码
            </label>
            <input
              className="h-9 w-full rounded-md border border-ink/10 bg-white/80 px-3 text-sm"
              placeholder="输入邀请码"
              value={upgradeCode}
              onChange={(event) => setUpgradeCode(event.target.value)}
            />
          </div>
          <button
            type="button"
            className="h-9 rounded-md bg-ink px-4 text-xs font-semibold text-ivory disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleUpgrade}
            disabled={upgradeStatus === 'loading'}
          >
            {upgradeStatus === 'loading' ? '升级中...' : '应用'}
          </button>
        </div>
        {upgradeMessage ? (
          <p
            className={`mt-2 text-xs ${
              upgradeStatus === 'error' ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {upgradeMessage}
          </p>
        ) : null}
      </section>
    </div>
  )
}
