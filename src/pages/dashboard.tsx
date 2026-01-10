import { useEffect, useMemo, useState } from 'react'
import { useSupabaseSession } from '../hooks/use-supabase-session'
import { getApiEnv } from '../lib/env'

type UsageSummaryItem = {
  key: string
  total: number
  events: Record<string, number>
}

type UsageSummaryResponse = {
  data: UsageSummaryItem[]
}

type ScopeEntitlements = {
  credit_default: number
  memory_node_limit: number
  rate_limit_3s: number
  allow_apikey_scope: boolean
}

type QdrantNodeCounts = {
  total?: number
  by_collection?: Record<string, number>
  updated_at?: string
}

type ScopeResponse = {
  scope: string
  entitlements?: ScopeEntitlements | null
  qdrant_node_counts?: QdrantNodeCounts | null
}

type BalanceResponse = {
  balance: number
}

type MemoryPolicyResponse = {
  default_scope?: 'user' | 'apikey' | null
}

type GroupBy = 'account' | 'apikey'

type OverviewItem = {
  title: string
  value: string
  meta: string
  status: string
}

function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return '-'
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric.toLocaleString('zh-CN') : '-'
}

function formatMemoryScope(value?: string | null) {
  if (!value) return '-'
  if (value === 'apikey') return 'API 密钥隔离'
  return '用户隔离'
}

function formatNodesInK(value?: number | null) {
  if (value === null || value === undefined) return '-'
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '-'
  const truncated = Math.floor((numeric / 1000) * 10) / 10
  if (Number.isInteger(truncated)) {
    return `${truncated}k`
  }
  return `${truncated.toFixed(1)}k`
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10)
}

function getDefaultRange() {
  const now = new Date()
  const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  return { from: formatDateInput(from), to: formatDateInput(now) }
}

export function DashboardPage() {
  const { session, refreshSession } = useSupabaseSession()
  const [usage, setUsage] = useState<UsageSummaryItem[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [groupBy, setGroupBy] = useState<GroupBy>('account')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [overviewStatus, setOverviewStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [overviewMessage, setOverviewMessage] = useState<string | null>(null)
  const [scopeInfo, setScopeInfo] = useState<ScopeResponse | null>(null)
  const [balanceInfo, setBalanceInfo] = useState<BalanceResponse | null>(null)
  const [memoryPolicy, setMemoryPolicy] = useState<MemoryPolicyResponse | null>(null)

  const accountId = session?.user?.id ?? null
  const accountEmail = session?.user?.email ?? null
  const accessToken = session?.access_token ?? null
  const accountName = useMemo(() => {
    if (!session?.user) return ''
    const metadataName = session.user.user_metadata?.name
    if (metadataName && String(metadataName).trim()) {
      return String(metadataName)
    }
    return accountEmail ? accountEmail.split('@')[0] : ''
  }, [accountEmail, session])
  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])
  const entitlements = scopeInfo?.entitlements ?? null
  const qdrantNodeCounts = scopeInfo?.qdrant_node_counts ?? null
  const memoryScopeLabel = formatMemoryScope(memoryPolicy?.default_scope ?? null)
  const apikeyLimitLabel = !scopeInfo?.scope
    ? 'apikey限制：-'
    : scopeInfo.scope === 'normal'
      ? 'apikey限制：1个'
      : 'apikey限制：无限制'
  const groupByLabel = groupBy === 'account' ? '账户' : 'API 密钥'
  const overviewStatusLabel = useMemo(() => {
    if (!accountId) return '未登录'
    if (overviewStatus === 'loading') return '加载中'
    if (overviewStatus === 'error') return '加载失败'
    return ''
  }, [accountId, overviewStatus])
  const overviewItems = useMemo<OverviewItem[]>(
    () => [
      {
        title: '账户',
        value: accountId ? accountName || accountEmail || '已登录' : '未登录',
        meta: accountId ? `邮箱：${accountEmail ?? '-'}` : '登录后查看账户信息。',
        status: overviewStatusLabel,
      },
      {
        title: '套餐',
        value: accountId ? `${scopeInfo?.scope ?? '-'}` : '-',
        meta: accountId ? `余额：${formatNumber(balanceInfo?.balance)}` : '登录后查看套餐与余额。',
        status: overviewStatusLabel,
      },
      {
        title: '配额',
        value: accountId
          ? `已用节点 ${formatNodesInK(
              qdrantNodeCounts?.total ?? 0,
            )}/节点上限 ${formatNodesInK(entitlements?.memory_node_limit ?? 0)}`
          : '-',
        meta: accountId
          ? `3 秒限流：${formatNumber(entitlements?.rate_limit_3s)}`
          : '登录后查看配额与限流。',
        status: overviewStatusLabel,
      },
      {
        title: '权益',
        value: accountId ? `${formatNumber(entitlements?.credit_default)} 积分` : '-',
        meta: accountId
          ? `记忆隔离策略：${memoryScopeLabel} · ${apikeyLimitLabel}`
          : '登录后查看权益配置。',
        status: overviewStatusLabel,
      },
    ],
    [
      accountEmail,
      accountId,
      balanceInfo,
      entitlements,
      memoryScopeLabel,
      overviewStatusLabel,
      qdrantNodeCounts,
      scopeInfo,
    ],
  )

  useEffect(() => {
    if (!accountId || !accessToken) return
    setOverviewStatus('loading')
    setOverviewMessage(null)
    refreshSession()
      .then((active) => {
        const sessionToUse = active ?? session
        if (!sessionToUse) {
          throw new Error('会话已过期，请重新登录。')
        }
        const headers = {
          Authorization: `Bearer ${sessionToUse.access_token}`,
          'X-Principal-User-Id': sessionToUse.user.id,
        }
        return Promise.all([
          fetch(`${apiBaseUrl}/settings/scope`, { headers })
            .then((response) => response.json().then((data) => ({ response, data })))
            .then(({ response, data }: { response: Response; data: ScopeResponse & { message?: string } }) => {
              if (!response.ok) {
                throw new Error(data?.message ?? '加载套餐信息失败。')
              }
              return data
            }),
          fetch(`${apiBaseUrl}/balance`, { headers })
            .then((response) => response.json().then((data) => ({ response, data })))
            .then(({ response, data }: { response: Response; data: BalanceResponse & { message?: string } }) => {
              if (!response.ok) {
                throw new Error(data?.message ?? '加载余额失败。')
              }
              return data
            }),
          fetch(`${apiBaseUrl}/settings/memory-policy`, { headers })
            .then((response) => response.json().then((data) => ({ response, data })))
            .then(({ response, data }: { response: Response; data: MemoryPolicyResponse & { message?: string } }) => {
              if (!response.ok) {
                throw new Error(data?.message ?? '加载记忆隔离配置失败。')
              }
              return data
            }),
        ])
      })
      .then(([scopeData, balanceData, memoryPolicyData]) => {
        setScopeInfo(scopeData)
        setBalanceInfo(balanceData)
        setMemoryPolicy(memoryPolicyData)
        setOverviewStatus('idle')
      })
      .catch((error) => {
        setOverviewStatus('error')
        setOverviewMessage(String(error))
      })
  }, [accountId, accessToken, apiBaseUrl, refreshSession, session])

  useEffect(() => {
    if (!accountId || !accessToken) return
    if (!fromDate || !toDate) {
      const now = new Date()
      const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      setFromDate(from.toISOString().slice(0, 10))
      setToDate(now.toISOString().slice(0, 10))
      return
    }

    setStatus('loading')
    setMessage(null)

    refreshSession()
      .then((active) => {
        const sessionToUse = active ?? session
        if (!sessionToUse) {
          throw new Error('会话已过期，请重新登录。')
        }
        return fetch(
          `${apiBaseUrl}/usage/summary?from=${fromDate}&to=${toDate}&groupBy=${groupBy}`,
          {
            headers: {
              Authorization: `Bearer ${sessionToUse.access_token}`,
              'X-Principal-User-Id': sessionToUse.user.id,
            },
          },
        )
      })
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }: { response: Response; data: UsageSummaryResponse & { message?: string } }) => {
        if (!response.ok) {
          throw new Error(data?.message ?? '加载用量汇总失败。')
        }
        setUsage(data.data ?? [])
        setStatus('idle')
      })
      .catch((error) => {
        setStatus('error')
        setMessage(String(error))
      })
  }, [accountId, accessToken, apiBaseUrl, fromDate, toDate, groupBy, refreshSession, session])

  return (
    <div className="space-y-8">
      <header className="rounded-xl bg-white/70 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">控制台</p>
        <h1 className="text-2xl font-semibold text-ink">概览</h1>
        <p className="text-sm text-ink/60">用量、配额与权益的整体视图。</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewItems.map((item) => (
          <div key={item.title} className="rounded-xl bg-white/70 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
                {item.title}
              </p>
              {item.status ? (
                <span className="rounded-full bg-ink/5 px-2 py-1 text-xs font-semibold text-ink/60">
                  {item.status}
                </span>
              ) : null}
            </div>
            <div className="mt-3 text-2xl font-semibold text-ink">{item.value}</div>
            <p className="mt-1 text-sm text-ink/60">{item.meta}</p>
          </div>
        ))}
      </section>

      {overviewStatus === 'loading' ? (
        <p className="text-sm text-ink/60">概览加载中…</p>
      ) : overviewStatus === 'error' ? (
        <p className="text-sm text-red-600">{overviewMessage ?? '概览加载失败'}</p>
      ) : null}

      <section className="space-y-4 rounded-xl bg-white/70 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">用量概览</h2>
            <p className="text-sm text-ink/60">当前按 {groupByLabel} 统计。</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/60 px-2 py-1">
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm ${
                groupBy === 'account'
                  ? 'bg-ink text-ivory'
                  : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
              }`}
              onClick={() => setGroupBy('account')}
            >
              账户
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm ${
                groupBy === 'apikey'
                  ? 'bg-ink text-ivory'
                  : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
              }`}
              onClick={() => setGroupBy('apikey')}
            >
              API 密钥
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            className="h-9 rounded-md border border-ink/10 bg-white/80 px-3 text-sm"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
          />
          <input
            type="date"
            className="h-9 rounded-md border border-ink/10 bg-white/80 px-3 text-sm"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
          />
          <button
            type="button"
            className="h-9 rounded-md border border-ink/20 px-3 text-sm text-ink/70 hover:bg-ink/5"
            onClick={() => {
              const range = getDefaultRange()
              setFromDate(range.from)
              setToDate(range.to)
            }}
          >
            最近 30 天
          </button>
        </div>

        <div className="overflow-hidden rounded-lg bg-white/60">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-xs uppercase tracking-[0.12em] text-ink/60">
              <tr>
                <th className="px-4 py-3 text-left">标识</th>
                <th className="px-4 py-3 text-left">总量</th>
                <th className="px-4 py-3 text-left">事件</th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' ? (
                <tr>
                  <td className="px-4 py-3 text-ink/60" colSpan={3}>
                    用量加载中…
                  </td>
                </tr>
              ) : status === 'error' ? (
                <tr>
                  <td className="px-4 py-3 text-red-600" colSpan={3}>
                    {message ?? '用量加载失败'}
                  </td>
                </tr>
              ) : usage.length === 0 ? (
                <tr>
                  <td className="px-4 py-3 text-ink/60" colSpan={3}>
                    暂无用量数据。
                  </td>
                </tr>
              ) : (
                usage.map((row) => (
                  <tr key={row.key} className="border-t border-ink/5">
                    <td className="px-4 py-3 font-medium">{row.key}</td>
                    <td className="px-4 py-3">{row.total}</td>
                    <td className="px-4 py-3 text-ink/60">
                      {Object.entries(row.events ?? {})
                        .map(([event, count]) => `${event}:${count}`)
                        .join(', ')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}


