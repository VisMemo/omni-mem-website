import {
  Button,
  Card,
  CardBody,
  CardHeader,
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

export function DashboardPage() {
  const { session } = useSupabaseSession()
  const [usage, setUsage] = useState<UsageSummaryItem[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [groupBy, setGroupBy] = useState<GroupBy>('account')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const accountId = session?.user?.id ?? null
  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])

  useEffect(() => {
    if (!accountId) return
    if (!fromDate || !toDate) {
      const now = new Date()
      const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      setFromDate(from.toISOString().slice(0, 10))
      setToDate(now.toISOString().slice(0, 10))
      return
    }

    setStatus('loading')
    setMessage(null)

    fetch(
      `${apiBaseUrl}/usage/summary?from=${fromDate}&to=${toDate}&groupBy=${groupBy}`,
      {
        headers: {
          'X-Principal-User-Id': accountId,
        },
      },
    )
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }: { response: Response; data: UsageSummaryResponse & { message?: string } }) => {
        if (!response.ok) {
          throw new Error(data?.message ?? 'Failed to load usage summary')
        }
        setUsage(data.data ?? [])
        setStatus('idle')
      })
      .catch((error) => {
        setStatus('error')
        setMessage(String(error))
      })
  }, [accountId, apiBaseUrl, fromDate, toDate, groupBy])

  const totalUsage = useMemo(() => usage.reduce((sum, item) => sum + (item.total ?? 0), 0), [usage])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader className="flex flex-col items-start gap-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Total usage</p>
            <h3 className="text-2xl font-semibold text-ink">{totalUsage}</h3>
            <p className="text-sm text-muted">Range: {fromDate} → {toDate}</p>
          </CardHeader>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="flex flex-col items-start gap-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Group by</p>
            <h3 className="text-2xl font-semibold text-ink">{groupBy}</h3>
            <p className="text-sm text-muted">Usage summary breakdown</p>
          </CardHeader>
        </Card>
      </div>

      <Card className="glass-panel">
        <CardHeader className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold">Usage filters</h3>
          <div className="flex flex-wrap gap-3">
            <select
              className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
              value={groupBy}
              onChange={(event) => setGroupBy(event.target.value as GroupBy)}
            >
              <option value="account">account</option>
              <option value="apikey">apikey</option>
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
              Last 30 days
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {status === 'loading' ? (
            <div className="text-sm text-muted">Loading usage...</div>
          ) : status === 'error' ? (
            <div className="text-sm text-danger-500">{message ?? 'Failed to load usage'}</div>
          ) : (
            <Table removeWrapper aria-label="Usage summary">
              <TableHeader>
                <TableColumn>Key</TableColumn>
                <TableColumn>Total</TableColumn>
                <TableColumn>Events</TableColumn>
              </TableHeader>
              <TableBody>
                {usage.length === 0 ? (
                  <TableRow key="empty">
                    <TableCell>No usage data yet.</TableCell>
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
