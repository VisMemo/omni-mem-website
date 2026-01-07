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
      setScopeMessage(data?.message ?? 'Failed to load scope information.')
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
      setUpgradeMessage('Invite code is required.')
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
      setUpgradeMessage(data?.message ?? 'Upgrade failed.')
      return
    }
    setUpgradeStatus('success')
    setUpgradeMessage('Upgrade successful.')
    setUpgradeCode('')
    loadScope().catch(() => null)
  }

  const entitlements = scopeInfo?.entitlements

  return (
    <div className="space-y-6">
      <Card className="glass-panel">
        <CardHeader className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold">Profile</h3>
          <p className="text-sm text-muted">Update your personal details.</p>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input label="Display name" placeholder="Jane Doe" />
          <Input label="Email" placeholder="jane@example.com" type="email" />
          <Input label="Company" placeholder="Omni Memory" />
          <Button className="bg-vermillion text-white" radius="full">
            Save changes
          </Button>
        </CardBody>
      </Card>

      <Card className="glass-panel">
        <CardHeader className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold">Plan &amp; Upgrade</h3>
          <p className="text-sm text-muted">Check your current scope and upgrade.</p>
        </CardHeader>
        <CardBody className="space-y-4">
          {scopeStatus === 'loading' ? (
            <p className="text-sm text-muted">Loading scope...</p>
          ) : scopeStatus === 'error' ? (
            <p className="text-sm text-danger-500">{scopeMessage ?? 'Scope load failed.'}</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm">
                Current scope: <span className="font-semibold">{scopeInfo?.scope ?? '-'}</span>
              </p>
              {entitlements ? (
                <div className="text-xs text-muted">
                  <p>Credit: {entitlements.credit_default}</p>
                  <p>Memory nodes: {entitlements.memory_node_limit}</p>
                  <p>Rate limit (3s): {entitlements.rate_limit_3s}</p>
                  <p>API key scope: {entitlements.allow_apikey_scope ? 'Enabled' : 'Disabled'}</p>
                </div>
              ) : null}
            </div>
          )}

          <div className="space-y-2">
            <Input
              label="Invite code"
              placeholder="Enter upgrade code"
              value={upgradeCode}
              onChange={(event) => setUpgradeCode(event.target.value)}
            />
            <Button
              className="bg-ink text-white"
              onPress={handleUpgrade}
              isDisabled={upgradeStatus === 'loading'}
            >
              {upgradeStatus === 'loading' ? 'Upgrading...' : 'Upgrade'}
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
