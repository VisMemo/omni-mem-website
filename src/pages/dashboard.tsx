import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
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

type ScopeResponse = {
  scope: string
  entitlements?: ScopeEntitlements | null
}

type BalanceResponse = {
  balance: number
}

type GroupBy = 'account' | 'apikey'

type OverviewItem = {
  title: string
  description: string
  status: string
}

function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return '-'
  const numeric = Number(value)
  return Number.isFinite(numeric) ? String(numeric) : '-'
}

function formatSwitch(value?: boolean | null) {
  if (value === null || value === undefined) return '-'
  return value ? '已开启' : '未开启'
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

  const accountId = session?.user?.id ?? null
  const accessToken = session?.access_token ?? null
  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])
  const entitlements = scopeInfo?.entitlements ?? null
  const overviewStatusLabel = useMemo(() => {
    if (!accountId) return '未登录'
    if (overviewStatus === 'loading') return '加载中'
    if (overviewStatus === 'error') return '加载失败'
    return '已接通'
  }, [accountId, overviewStatus])
  const overviewItems = useMemo<OverviewItem[]>(
    () => [
      {
        title: '工作区 / 租户',
        description: accountId
          ? `主账户：${accountId}`
          : '登录后查看 Workspace 成员。',
        status: overviewStatusLabel,
      },
      {
        title: '套餐 / 订阅',
        description: accountId
          ? `当前套餐：${scopeInfo?.scope ?? '-'}，余额：${formatNumber(balanceInfo?.balance)}`
          : '登录后查看套餐信息。',
        status: overviewStatusLabel,
      },
      {
        title: '配额 / 限流',
        description: accountId
          ? `节点上限：${formatNumber(entitlements?.memory_node_limit)}，3秒限流：${formatNumber(entitlements?.rate_limit_3s)}`
          : '登录后查看配额信息。',
        status: overviewStatusLabel,
      },
      {
        title: '权益配置',
        description: accountId
          ? `默认额度：${formatNumber(entitlements?.credit_default)}，API Key Scope：${formatSwitch(entitlements?.allow_apikey_scope)}`
          : '登录后查看权益配置。',
        status: overviewStatusLabel,
      },
    ],
    [accountId, balanceInfo, entitlements, overviewStatusLabel, scopeInfo],
  )

  useEffect(() => {
    if (!accountId || !accessToken) return
    setOverviewStatus('loading')
    setOverviewMessage(null)
    refreshSession()
      .then((active) => {
        const sessionToUse = active ?? session
        if (!sessionToUse) {
          throw new Error('Session expired. Please sign in again.')
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
                throw new Error(data?.message ?? 'Failed to load scope information.')
              }
              return data
            }),
          fetch(`${apiBaseUrl}/balance`, { headers })
            .then((response) => response.json().then((data) => ({ response, data })))
            .then(({ response, data }: { response: Response; data: BalanceResponse & { message?: string } }) => {
              if (!response.ok) {
                throw new Error(data?.message ?? 'Failed to load balance.')
              }
              return data
            }),
        ])
      })
      .then(([scopeData, balanceData]) => {
        setScopeInfo(scopeData)
        setBalanceInfo(balanceData)
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
          throw new Error('Session expired. Please sign in again.')
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
          throw new Error(data?.message ?? 'Failed to load usage summary.')
        }
        setUsage(data.data ?? [])
        setStatus('idle')
      })
      .catch((error) => {
        setStatus('error')
        setMessage(String(error))
      })
  }, [accountId, accessToken, apiBaseUrl, fromDate, toDate, groupBy, refreshSession, session])

  const totalUsage = useMemo(() => usage.reduce((sum, item) => sum + (item.total ?? 0), 0), [usage])

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">账户概览</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewItems.map((item) => (
            <Card key={item.title} className="glass-panel">
              <CardHeader className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">{item.title}</p>
                  <p className="text-sm text-muted">{item.description}</p>
                </div>
                <Chip size="sm" variant="flat" className="bg-ink/5 text-ink/70">
                  {item.status}
                </Chip>
              </CardHeader>
            </Card>
          ))}
        </div>
        {overviewStatus === 'loading' ? (
          <p className="text-sm text-muted">概览加载中…</p>
        ) : overviewStatus === 'error' ? (
          <p className="text-sm text-danger-500">{overviewMessage ?? '概览加载失败'}</p>
        ) : null}
      </div>

      <h2 className="text-lg font-semibold text-ink">用量仪表盘</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader className="flex flex-col items-start gap-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">总用量</p>
            <h3 className="text-2xl font-semibold text-ink">{totalUsage}</h3>
            <p className="text-sm text-muted">时间范围：{fromDate} → {toDate}</p>
          </CardHeader>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="flex flex-col items-start gap-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">分组维度</p>
            <h3 className="text-2xl font-semibold text-ink">{groupBy}</h3>
            <p className="text-sm text-muted">用量汇总维度</p>
          </CardHeader>
        </Card>
      </div>

      <Card className="glass-panel">
        <CardHeader className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold">用量筛选</h3>
          <div className="flex flex-wrap gap-3">
            <select
              className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
              value={groupBy}
              onChange={(event) => setGroupBy(event.target.value as GroupBy)}
            >
              <option value="account">账户</option>
              <option value="apikey">API Key</option>
            </select>
            <Input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
            <Input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
            <Button
              variant="flat"
              onPress={() => {
                const now = new Date()
                const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                setFromDate(from.toISOString().slice(0, 10))
                setToDate(now.toISOString().slice(0, 10))
              }}
            >
              最近 30 天
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {status === 'loading' ? (
            <div className="text-sm text-muted">用量加载中…</div>
          ) : status === 'error' ? (
            <div className="text-sm text-danger-500">{message ?? '用量加载失败'}</div>
          ) : (
            <Table removeWrapper aria-label="用量汇总">
              <TableHeader>
                <TableColumn>标识</TableColumn>
                <TableColumn>总量</TableColumn>
                <TableColumn>事件</TableColumn>
              </TableHeader>
              <TableBody>
                {usage.length === 0 ? (
                  <TableRow key="empty">
                    <TableCell>暂无用量数据。</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                ) : (
                  usage.map((row) => (
                    <TableRow key={row.key}>
                      <TableCell>{row.key}</TableCell>
                      <TableCell>{row.total}</TableCell>
                      <TableCell>
                        {Object.entries(row.events ?? {})
                          .map(([event, count]) => `${event}:${count}`)
                          .join(', ')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
