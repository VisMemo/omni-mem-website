import {
  Button,
  Card,
  CardBody,
  CardHeader,
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

type UsageLedgerRow = {
  method: string
  quantity: number
  createdAt: string
}

type UsageLedgerResponse = {
  data: Array<{
    event_name?: string | null
    quantity?: number | null
    created_at?: string | null
  }>
}

type BalanceResponse = {
  balance: number
}

export function UsagePage() {
  const { session, refreshSession } = useSupabaseSession()
  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])
  const [balance, setBalance] = useState<number | null>(null)
  const [rows, setRows] = useState<UsageLedgerRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)
  const pageSize = 10

  async function getActiveSession() {
    const refreshed = await refreshSession()
    return refreshed ?? session
  }

  function handleRefresh() {
    setPage(1)
    setRefreshToken((prev) => prev + 1)
  }

  useEffect(() => {
    if (!session?.access_token) return

    let cancelled = false

    async function loadUsageData() {
      try {
        const active = await getActiveSession()
        if (!active) return

        const [balanceResponse, ledgerResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/balance`, {
            headers: {
              Authorization: `Bearer ${active.access_token}`,
              'X-Principal-User-Id': active.user.id,
            },
          }),
          fetch(`${apiBaseUrl}/usage/ledger?page=${page}&pageSize=${pageSize}`, {
            headers: {
              Authorization: `Bearer ${active.access_token}`,
              'X-Principal-User-Id': active.user.id,
            },
          }),
        ])

        if (cancelled) return

        if (balanceResponse.ok) {
          const data = (await balanceResponse.json()) as BalanceResponse
          setBalance(Number(data.balance ?? 0))
        }

        if (ledgerResponse.ok) {
          const data = (await ledgerResponse.json()) as UsageLedgerResponse
          const mapped = (data.data ?? []).map((row) => ({
            method: formatUsageMethod(row.event_name ?? ''),
            quantity: Number(row.quantity ?? 0),
            createdAt: row.created_at ?? new Date().toISOString(),
          }))
          setRows(mapped)
          setHasNext(mapped.length === pageSize)
        }
      } catch (err) {
        if (cancelled) return
        setError(String(err))
      }
    }

    loadUsageData()
    return () => {
      cancelled = true
    }
  }, [apiBaseUrl, refreshSession, session?.access_token, session?.user?.id, page, refreshToken])

  const totalQuantity = useMemo(
    () => rows.reduce((sum, row) => sum + (Number.isFinite(row.quantity) ? row.quantity : 0), 0),
    [rows],
  )
  const latestRecord = useMemo(() => {
    if (rows.length === 0) return '-'
    const timestamps = rows
      .map((row) => new Date(row.createdAt).getTime())
      .filter((value) => Number.isFinite(value))
    if (timestamps.length === 0) return rows[0].createdAt
    return new Date(Math.max(...timestamps)).toLocaleString()
  }, [rows])

  const summaryCards = [
    {
      title: '可用积分',
      value: balance ?? '-',
      meta: '当前账户余额',
    },
    {
      title: '本页事件量',
      value: totalQuantity,
      meta: `共 ${rows.length} 条记录`,
    },
    {
      title: '最近记录时间',
      value: latestRecord,
      meta: '最近一次扣费',
    },
    {
      title: '当前页',
      value: page,
      meta: `每页 ${pageSize} 条`,
    },
  ]

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">数据洞察</p>
          <h1 className="text-2xl font-semibold text-ink">用量</h1>
          <p className="text-sm text-muted">查看账户与 API 密钥的使用消耗记录。</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="bordered"
            className="border-ink/20 text-ink"
            onPress={handleRefresh}
          >
            刷新
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((summary) => (
          <Card key={summary.title} className="glass-panel">
            <CardHeader className="flex flex-col items-start gap-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{summary.title}</p>
              <h3 className="text-2xl font-semibold text-ink">{summary.value}</h3>
              <p className="text-sm text-muted">{summary.meta}</p>
            </CardHeader>
          </Card>
        ))}
      </section>

      <Card className="glass-panel">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">用量明细</h3>
            <p className="text-sm text-muted">按时间展示扣费与使用记录。</p>
          </div>
        </CardHeader>
        <CardBody>
          {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
          <Table removeWrapper aria-label="用量明细">
            <TableHeader>
              <TableColumn>使用方式</TableColumn>
              <TableColumn>消耗</TableColumn>
              <TableColumn>时间</TableColumn>
            </TableHeader>
            <TableBody emptyContent="暂无记录">
              {rows.map((row, index) => (
                <TableRow key={`${row.createdAt}-${index}`}>
                  <TableCell>{row.method}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>{formatTimestamp(row.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="bordered"
              className="border-ink/20 text-ink"
              onPress={() => setPage((prev) => Math.max(1, prev - 1))}
              isDisabled={page <= 1}
            >
              上一页
            </Button>
            <span className="text-sm text-muted">第 {page} 页</span>
            <Button
              size="sm"
              variant="bordered"
              className="border-ink/20 text-ink"
              onPress={() => setPage((prev) => prev + 1)}
              isDisabled={!hasNext}
            >
              下一页
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

function formatUsageMethod(eventName: string) {
  if (eventName === 'upload_processed') {
    return '上传处理'
  }
  if (!eventName) {
    return '未知'
  }
  return eventName
}

function formatTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}
