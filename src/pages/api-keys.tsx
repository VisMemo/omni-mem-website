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

type ApiKeyRow = {
  id: string
  label: string | null
  key_prefix: string | null
  revoked_at: string | null
  deleted_at: string | null
  created_at: string | null
}

type ApiKeyListResponse = {
  data: ApiKeyRow[]
}

type ApiKeyCreateResponse = {
  api_key_id?: string
  api_key_plaintext?: string | null
  label?: string | null
  created_at?: string | null
  idempotent?: boolean
  message?: string
}

export function ApiKeysPage() {
  const { session, refreshSession } = useSupabaseSession()
  const [label, setLabel] = useState('')
  const [rows, setRows] = useState<ApiKeyRow[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [lastPlaintext, setLastPlaintext] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const pageSize = 10

  const accountId = session?.user?.id ?? null
  const accessToken = session?.access_token ?? null
  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])

  async function getActiveSession() {
    const refreshed = await refreshSession()
    return refreshed ?? session
  }

  async function fetchKeys(currentAccountId: string, token: string, pageNumber: number) {
    const response = await fetch(
      `${apiBaseUrl}/apikeys?page=${pageNumber}&pageSize=${pageSize}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Principal-User-Id': currentAccountId,
        },
      },
    )
    const data = (await response.json()) as ApiKeyListResponse & { message?: string }
    if (!response.ok) {
      throw new Error(data?.message ?? '加载 API 密钥失败')
    }
    const nextRows = data.data ?? []
    setRows(nextRows)
    setHasNext(nextRows.length === pageSize)
  }

  useEffect(() => {
    if (!accountId || !accessToken) return

    let cancelled = false
    setStatus('loading')
    setMessage(null)

    getActiveSession()
      .then((active) => {
        if (!active) {
          throw new Error('会话已过期，请重新登录。')
        }
        return fetchKeys(active.user.id, active.access_token, page)
      })
      .then(() => {
        if (cancelled) return
        setStatus('idle')
      })
      .catch((error) => {
        if (cancelled) return
        setStatus('error')
        setMessage(String(error))
      })

    return () => {
      cancelled = true
    }
  }, [accountId, accessToken, apiBaseUrl, refreshSession, page])

  async function handleCreateKey() {
    if (!accountId || !accessToken) {
      setStatus('error')
      setMessage('请先登录以创建 API 密钥。')
      return
    }

    setStatus('loading')
    setMessage(null)

    try {
      const active = await getActiveSession()
      if (!active) {
        throw new Error('会话已过期，请重新登录。')
      }

      const response = await fetch(`${apiBaseUrl}/apikeys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Principal-User-Id': active.user.id,
          Authorization: `Bearer ${active.access_token}`,
          'X-Request-Id': crypto.randomUUID(),
        },
        body: JSON.stringify({ label }),
      })

      const data = (await response.json()) as ApiKeyCreateResponse
      if (!response.ok) {
        throw new Error(data?.message ?? '创建 API 密钥失败')
      }

      setLabel('')
      setStatus('success')
      setLastPlaintext(data.api_key_plaintext ?? null)
      setMessage(
        data.api_key_plaintext
          ? `已创建，请立即复制：${data.api_key_plaintext}`
          : '创建成功，密钥仅显示一次。',
      )

      await fetchKeys(active.user.id, active.access_token, page)
      setStatus('idle')
    } catch (error) {
      setStatus('error')
      setMessage(String(error))
    }
  }

  async function handleAction(action: 'revoke' | 'rotate' | 'delete', apiKeyId: string) {
    if (!accountId || !accessToken) {
      setStatus('error')
      setMessage('请先登录以管理 API 密钥。')
      return
    }

    setStatus('loading')
    setMessage(null)

    try {
      const active = await getActiveSession()
      if (!active) {
        throw new Error('会话已过期，请重新登录。')
      }

      const requestId = crypto.randomUUID()
      const method = action === 'delete' ? 'DELETE' : 'POST'
      const endpoint =
        action === 'delete'
          ? `${apiBaseUrl}/apikeys/${apiKeyId}`
          : `${apiBaseUrl}/apikeys/${apiKeyId}/${action}`

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Principal-User-Id': active.user.id,
          Authorization: `Bearer ${active.access_token}`,
          'X-Request-Id': requestId,
        },
      })

      const data = (await response.json()) as ApiKeyCreateResponse & { status?: string; message?: string }
      if (!response.ok) {
        throw new Error(
          data?.message ??
            (action === 'revoke' ? '撤销失败' : action === 'rotate' ? '轮换失败' : '删除失败'),
        )
      }

      if (action === 'rotate') {
        setLastPlaintext(data.api_key_plaintext ?? null)
        setMessage(
          data.api_key_plaintext
            ? `已轮换，请立即复制：${data.api_key_plaintext}`
            : '轮换完成，密钥仅显示一次。',
        )
      } else {
        setLastPlaintext(null)
        setMessage(action === 'revoke' ? '撤销成功' : '删除成功')
      }

      await fetchKeys(active.user.id, active.access_token, page)
      setStatus('idle')
    } catch (error) {
      setStatus('error')
      setMessage(String(error))
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">访问控制</p>
          <h1 className="text-2xl font-semibold text-ink">API 密钥</h1>
          <p className="text-sm text-muted">创建与管理 API 密钥，用于自动化调用。</p>
        </div>
      </header>

      <Card className="glass-panel">
        <CardHeader className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold">创建 API 密钥</h3>
          <p className="text-sm text-muted">标签用于区分用途，生成后的密钥仅显示一次。</p>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              label="标签"
              placeholder="例如：生产环境"
              value={label}
              onValueChange={setLabel}
            />
            <Button
              className="bg-vermillion text-white"
              radius="full"
              isLoading={status === 'loading'}
              onPress={handleCreateKey}
            >
              新建 API 密钥
            </Button>
          </div>
          {message ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className={status === 'error' ? 'text-sm text-danger-500' : 'text-sm text-emerald-500'}>
                {message}
              </div>
              {lastPlaintext ? (
                <Button
                  size="sm"
                  variant="bordered"
                  className="border-ink/20 text-ink"
                  onPress={async () => {
                    try {
                      await navigator.clipboard.writeText(lastPlaintext)
                      setMessage('已复制到剪贴板。')
                    } catch (error) {
                      setStatus('error')
                      setMessage(String(error))
                    }
                  }}
                >
                  复制密钥
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card className="glass-panel">
        <CardHeader className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold">当前密钥</h3>
          <p className="text-sm text-muted">密钥仅在创建或轮换时展示明文。</p>
        </CardHeader>
        <CardBody>
          <Table removeWrapper aria-label="API 密钥">
            <TableHeader>
              <TableColumn>前缀</TableColumn>
              <TableColumn>标签</TableColumn>
              <TableColumn>状态</TableColumn>
              <TableColumn>创建时间</TableColumn>
              <TableColumn>操作</TableColumn>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow key="empty">
                  <TableCell>暂无 API 密钥。</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.key_prefix ?? '-'}</TableCell>
                    <TableCell>{row.label ?? '-'}</TableCell>
                    <TableCell>
                      {row.deleted_at ? '已删除' : row.revoked_at ? '已撤销' : '启用'}
                    </TableCell>
                    <TableCell>
                      {row.created_at ? new Date(row.created_at).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="bordered"
                          className="border-ink/20 text-ink"
                          onPress={() => handleAction('revoke', row.id)}
                          isDisabled={status === 'loading' || Boolean(row.revoked_at) || Boolean(row.deleted_at)}
                        >
                          撤销
                        </Button>
                        <Button
                          size="sm"
                          variant="bordered"
                          onPress={() => handleAction('rotate', row.id)}
                          isDisabled={status === 'loading' || Boolean(row.deleted_at)}
                        >
                          轮换
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="bordered"
                          className="border-danger-300 text-danger-600"
                          onPress={() => handleAction('delete', row.id)}
                          isDisabled={status === 'loading' || Boolean(row.deleted_at)}
                        >
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
