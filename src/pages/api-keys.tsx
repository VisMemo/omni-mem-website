import { useEffect, useMemo, useState } from 'react'
import { Copy, KeyRound, Pencil, RotateCw, Trash2, X, XCircle } from 'lucide-react'
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

type ApiKeyRevealResponse = {
  api_key_id?: string
  api_key_plaintext?: string | null
  message?: string
}

export function ApiKeysPage() {
  const { session, refreshSession } = useSupabaseSession()
  const [label, setLabel] = useState('')
  const [rows, setRows] = useState<ApiKeyRow[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [lastPlaintext, setLastPlaintext] = useState<string | null>(null)
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [editMessage, setEditMessage] = useState<string | null>(null)
  const [revealKeyId, setRevealKeyId] = useState<string | null>(null)
  const [revealPassword, setRevealPassword] = useState('')
  const [revealMessage, setRevealMessage] = useState<string | null>(null)
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

    const trimmedLabel = label.trim()
    if (!trimmedLabel) {
      setStatus('error')
      setMessage('标签不能为空。')
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
        body: JSON.stringify({ label: trimmedLabel }),
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
          ? '已创建密钥，请立即复制。'
          : '创建成功，密钥仅显示一次。',
      )

      await fetchKeys(active.user.id, active.access_token, page)
      setStatus('idle')
    } catch (error) {
      setStatus('error')
      setMessage(String(error))
    }
  }
  async function handleUpdateLabel() {
    if (!editingKeyId) return
    if (!accountId || !accessToken) {
      setEditMessage('请先登录以管理 API 密钥。')
      return
    }

    const trimmed = editingLabel.trim()
    if (!trimmed) {
      setEditMessage('标签不能为空。')
      return
    }

    const duplicate = rows.some(
      (row) => row.id !== editingKeyId && (row.label ?? '').trim() === trimmed,
    )
    if (duplicate) {
      setEditMessage('标签已存在，请更换。')
      return
    }

    setStatus('loading')
    setEditMessage(null)

    try {
      const active = await getActiveSession()
      if (!active) {
        throw new Error('会话已过期，请重新登录。')
      }

      const response = await fetch(`${apiBaseUrl}/apikeys/${editingKeyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Principal-User-Id': active.user.id,
          Authorization: `Bearer ${active.access_token}`,
        },
        body: JSON.stringify({ label: trimmed }),
      })
      const data = (await response.json()) as ApiKeyCreateResponse
      if (!response.ok) {
        throw new Error(data?.message ?? '更新标签失败')
      }

      setEditingKeyId(null)
      setEditingLabel('')
      setMessage('标签已更新。')
      await fetchKeys(active.user.id, active.access_token, page)
      setStatus('idle')
    } catch (error) {
      setStatus('error')
      setEditMessage(String(error))
    }
  }

  async function handleRevealKey() {
    if (!revealKeyId) return
    if (!accountId || !accessToken) {
      setRevealMessage('请先登录以管理 API 密钥。')
      return
    }

    const trimmed = revealPassword.trim()
    if (!trimmed) {
      setRevealMessage('请输入密码以继续。')
      return
    }

    setStatus('loading')
    setRevealMessage(null)

    try {
      const active = await getActiveSession()
      if (!active) {
        throw new Error('会话已过期，请重新登录。')
      }

      const response = await fetch(`${apiBaseUrl}/apikeys/${revealKeyId}/reveal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Principal-User-Id': active.user.id,
          Authorization: `Bearer ${active.access_token}`,
        },
        body: JSON.stringify({ password: trimmed }),
      })
      const data = (await response.json()) as ApiKeyRevealResponse
      if (!response.ok) {
        throw new Error(data?.message ?? '校验失败')
      }
      if (!data.api_key_plaintext) {
        throw new Error('未获取到密钥明文，请尝试轮换后重试。')
      }

      await navigator.clipboard.writeText(data.api_key_plaintext)
      setRevealKeyId(null)
      setRevealPassword('')
      setMessage('已复制到剪贴板。')
      setStatus('idle')
    } catch (error) {
      setStatus('error')
      setRevealMessage(String(error))
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

      const headers: Record<string, string> = {
        'X-Principal-User-Id': active.user.id,
        Authorization: `Bearer ${active.access_token}`,
        'X-Request-Id': requestId,
      }
      const body = method === 'DELETE' ? undefined : JSON.stringify({})
      if (method !== 'DELETE') {
        headers['Content-Type'] = 'application/json'
      }

      const response = await fetch(endpoint, {
        method,
        headers,
        body,
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
            ? '已轮换密钥，请立即复制。'
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
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">访问控制</p>
          <h1 className="text-2xl font-semibold text-ink">API 密钥</h1>
          <p className="text-sm text-ink/60">创建与管理 API 密钥，用于自动化调用。</p>
        </div>
      </header>

      <section className="rounded-xl bg-white/70 p-6">
        <h2 className="text-lg font-semibold text-ink">创建 API 密钥</h2>
        <p className="text-sm text-ink/60">
          标签用于区分用途，生成后的密钥仅显示一次。
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            className="h-9 w-full max-w-xs rounded-md border border-ink/10 bg-white/80 px-3 text-sm"
            placeholder="标签（例如：生产环境）"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-ink px-4 py-2 text-sm font-semibold text-ivory"
            onClick={handleCreateKey}
            disabled={status === 'loading' || !label.trim()}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            新建 API 密钥
          </button>
        </div>
        {message ? (
          <p className={`mt-3 text-sm ${status === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
            {message}
          </p>
        ) : null}
        {lastPlaintext ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              className="h-9 w-full max-w-xl rounded-md border border-ink/20 bg-ink/5 px-3 text-sm text-ink/80"
              value={lastPlaintext}
              readOnly
            />
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-teal px-4 py-2 text-sm font-semibold text-ivory hover:bg-seafoam"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(lastPlaintext)
                  setStatus('success')
                  setMessage('已复制到剪贴板。')
                } catch (error) {
                  setStatus('error')
                  setMessage(String(error))
                }
              }}
            >
              复制密钥
            </button>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl bg-white/70 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">当前密钥</h2>
          <p className="text-xs text-ink/50">共 {rows.length} 个</p>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg bg-white/60">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-xs uppercase tracking-[0.12em] text-ink/60">
              <tr>
                <th className="px-4 py-3 text-left">标签</th>
                <th className="px-4 py-3 text-left">前缀</th>
                <th className="px-4 py-3 text-left">创建时间</th>
                <th className="px-4 py-3 text-left">最近使用</th>
                <th className="px-4 py-3 text-left">状态</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-3 text-ink/60" colSpan={6}>
                    暂无 API 密钥。
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const statusLabel = row.deleted_at
                    ? '已删除'
                    : row.revoked_at
                      ? '已撤销'
                      : '启用'
                  const statusClass = row.deleted_at
                    ? 'bg-red-500/10 text-red-600'
                    : row.revoked_at
                      ? 'bg-ink/5 text-ink/60'
                      : 'bg-emerald-500/10 text-emerald-600'
                  return (
                    <tr key={row.id} className="border-t border-ink/5">
                      <td className="px-4 py-3 font-medium">{row.label ?? '-'}</td>
                      <td className="px-4 py-3 text-ink/60">{row.key_prefix ?? '-'}</td>
                      <td className="px-4 py-3">
                        {row.created_at ? new Date(row.created_at).toLocaleString('zh-CN') : '-'}
                      </td>
                      <td className="px-4 py-3 text-ink/60">-</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink/60 hover:bg-ink/5"
                            onClick={() => {
                              setRevealKeyId(row.id)
                              setRevealPassword('')
                              setRevealMessage(null)
                            }}
                            disabled={status === 'loading' || Boolean(row.deleted_at)}
                            aria-label="复制"
                            title="复制密钥"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink/60 hover:bg-ink/5"
                            onClick={() => {
                              setEditingKeyId(row.id)
                              setEditingLabel(row.label ?? '')
                              setEditMessage(null)
                            }}
                            disabled={status === 'loading' || Boolean(row.deleted_at)}
                            aria-label="编辑"
                            title="修改备注"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink/60 hover:bg-ink/5"
                            onClick={() => handleAction('rotate', row.id)}
                            disabled={status === 'loading' || Boolean(row.deleted_at)}
                            aria-label="轮换"
                            title="轮换密钥"
                          >
                            <RotateCw className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink/60 hover:bg-ink/5"
                            onClick={() => handleAction('revoke', row.id)}
                            disabled={status === 'loading' || Boolean(row.revoked_at) || Boolean(row.deleted_at)}
                            aria-label="撤销"
                            title="撤销密钥"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:bg-red-500/10"
                            onClick={() => handleAction('delete', row.id)}
                            disabled={status === 'loading' || Boolean(row.deleted_at)}
                            aria-label="删除"
                            title="删除密钥"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
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
      {editingKeyId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink">修改 API Key 备注</h3>
              <button
                type="button"
                className="rounded-md p-1 text-ink/60 hover:bg-ink/5"
                onClick={() => {
                  setEditingKeyId(null)
                  setEditMessage(null)
                }}
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-ink/60">仅可修改备注名称，且不可为空。</p>
            <input
              className="mt-4 h-9 w-full rounded-md border border-ink/10 bg-white/80 px-3 text-sm"
              value={editingLabel}
              onChange={(event) => setEditingLabel(event.target.value)}
              placeholder="备注名称"
            />
            {editMessage ? (
              <p className="mt-2 text-sm text-red-600">{editMessage}</p>
            ) : null}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-ink/20 px-3 py-1.5 text-sm text-ink/70 hover:bg-ink/5"
                onClick={() => setEditingKeyId(null)}
              >
                取消
              </button>
              <button
                type="button"
                className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-ivory"
                onClick={handleUpdateLabel}
                disabled={status === 'loading'}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {revealKeyId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink">验证密码复制密钥</h3>
              <button
                type="button"
                className="rounded-md p-1 text-ink/60 hover:bg-ink/5"
                onClick={() => {
                  setRevealKeyId(null)
                  setRevealMessage(null)
                }}
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-ink/60">
              为确保安全，请输入账户密码后复制密钥。
            </p>
            <input
              type="password"
              className="mt-4 h-9 w-full rounded-md border border-ink/10 bg-white/80 px-3 text-sm"
              value={revealPassword}
              onChange={(event) => setRevealPassword(event.target.value)}
              placeholder="账户密码"
            />
            {revealMessage ? (
              <p className="mt-2 text-sm text-red-600">{revealMessage}</p>
            ) : null}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-ink/20 px-3 py-1.5 text-sm text-ink/70 hover:bg-ink/5"
                onClick={() => setRevealKeyId(null)}
              >
                取消
              </button>
              <button
                type="button"
                className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-ivory"
                onClick={handleRevealKey}
                disabled={status === 'loading'}
              >
                验证并复制
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}









