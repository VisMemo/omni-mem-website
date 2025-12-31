import {
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

  async function getActiveSession() {
    const refreshed = await refreshSession()
    return refreshed ?? session
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
          fetch(`${apiBaseUrl}/usage/ledger`, {
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
  }, [apiBaseUrl, refreshSession, session?.access_token, session?.user?.id])

  return (
    <Card className="glass-panel">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">用量汇总</h3>
          <p className="text-sm text-muted">当前账户的积分消耗记录。</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-2 text-sm">
          <span className="text-muted">可用积分</span>
          <span className="ml-2 font-semibold text-ink">{balance ?? '-'}</span>
        </div>
      </CardHeader>
      <CardBody>
        {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
        <Table removeWrapper aria-label="Usage ledger">
          <TableHeader>
            <TableColumn>使用方式</TableColumn>
            <TableColumn>使用量</TableColumn>
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
      </CardBody>
    </Card>
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
