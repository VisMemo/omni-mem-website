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

type GroupBy = 'account' | 'apikey'

type OverviewItem = {
  title: string
  description: string
  status: string
}

export function DashboardPage() {
  const { session, refreshSession } = useSupabaseSession()
  const [usage, setUsage] = useState<UsageSummaryItem[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [groupBy, setGroupBy] = useState<GroupBy>('account')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const accountId = session?.user?.id ?? null
  const accessToken = session?.access_token ?? null
  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])
  const overviewItems = useMemo<OverviewItem[]>(
    () => [
      {
        title: '工作区 / 租户',
        description: accountId
          ? `主账户：${accountId}`
          : '登录后查看 Workspace 成员。',
        status: '暂未接通',
      },
      {
        title: '套餐 / 订阅',
        description: '套餐等级、续费日期与计费状态。',
        status: '暂未接通',
      },
      {
        title: '配额 / 限流',
        description: '速率限制、存储上限与并发配额。',
        status: '暂未接通',
      },
      {
        title: '权益配置',
        description: '功能开关、记忆范围与模型权限。',
        status: '暂未接通',
      },
    ],
    [accountId],
  )

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
