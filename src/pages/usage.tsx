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
    return new Date(Math.max(...timestamps)).toLocaleString('zh-CN')
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">数据洞察</p>
          <h1 className="text-2xl font-semibold text-ink">用量</h1>
          <p className="text-sm text-ink/60">查看账户与 API 密钥的使用消耗记录。</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-ink/20 px-3 py-2 text-xs text-ink/70 hover:bg-ink/5"
            onClick={handleRefresh}
          >
            最近 7 天
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((summary) => (
          <div key={summary.title} className="rounded-xl border border-ink/10 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
              {summary.title}
            </p>
            <div className="mt-3 text-2xl font-semibold text-ink">{summary.value}</div>
            <p className="mt-1 text-sm text-ink/60">{summary.meta}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-ink/10 bg-white/80 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">用量明细</h2>
          <p className="text-xs text-ink/50">按时间</p>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <div className="mt-4 overflow-hidden rounded-lg border border-ink/10">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-xs uppercase tracking-[0.12em] text-ink/60">
              <tr>
                <th className="px-4 py-3 text-left">使用方式</th>
                <th className="px-4 py-3 text-left">消耗</th>
                <th className="px-4 py-3 text-left">时间</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-3 text-ink/60" colSpan={3}>
                    暂无记录
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={`${row.createdAt}-${index}`} className="border-t border-ink/5">
                    <td className="px-4 py-3 font-medium">{row.method}</td>
                    <td className="px-4 py-3">{row.quantity}</td>
                    <td className="px-4 py-3">{formatTimestamp(row.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-ink/20 px-3 py-1 text-xs text-ink/70 hover:bg-ink/5"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            上一页
          </button>
          <span className="text-xs text-ink/50">第 {page} 页</span>
          <button
            type="button"
            className="rounded-md border border-ink/20 px-3 py-1 text-xs text-ink/70 hover:bg-ink/5"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!hasNext}
          >
            下一页
          </button>
        </div>
      </section>
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
  return date.toLocaleString('zh-CN')
}
