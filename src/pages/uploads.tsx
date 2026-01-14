import { useEffect, useMemo, useRef, useState } from 'react'
import { CloudUpload, RefreshCcw } from 'lucide-react'
import { useSupabaseSession } from '../hooks/use-supabase-session'
import { getApiEnv } from '../lib/env'

type UploadRow = {
  id: string
  file: string
  fileType: string
  status: string
  scope: string
  createdAt: string
  updatedAt: string
  balanceUsed: number
  error?: string | null
  progress?: number | null
  sizeBytes?: number | null
  apiKeyId?: string | null
  memoryLabel?: string | null
}

type ApiKeyRow = {
  id: string
  label: string | null
}

type ApiKeyListResponse = {
  data: ApiKeyRow[]
}

type IngestHistoryItem = {
  id?: string | null
  job_id?: string | null
  session_id?: string | null
  file_name?: string | null
  file_type?: string | null
  size_bytes?: number | null
  status?: string | null
  api_key_id?: string | null
  api_key_label?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type IngestHistoryResponse = {
  data?: IngestHistoryItem[]
  pagination?: {
    page?: number
    pageSize?: number
    total?: number
    hasNext?: boolean
  }
  message?: string
}

const ACTIVE_STATUSES = new Set(['queued', 'processing', 'running', 'RECEIVED'])

function resolveUploadErrorMessage(payload: { code?: string; message?: string; missing?: string[] }) {
  const missing = Array.isArray(payload?.missing) ? payload.missing : []
  const hasLlmMissing = missing.some((item) =>
    ['llm_api_key', 'llm_provider', 'llm_model'].includes(String(item))
  )
  if (payload?.code === 'missing_core_requirements' && hasLlmMissing) {
    return '请在上传记忆前先配置 llmkey'
  }
  return payload?.message ?? null
}

export function UploadsPage() {
  const { session, refreshSession } = useSupabaseSession()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploads, setUploads] = useState<UploadRow[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [inlineStatus, setInlineStatus] = useState<string | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKeyRow[]>([])
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string>('')
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)
  const pageSize = 10

  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])
  const accountId = session?.user?.id ?? null
  const accessToken = session?.access_token ?? null
  const apiKeyLabelMap = useMemo(() => new Map(apiKeys.map((item) => [item.id, item.label])), [apiKeys])

  async function getActiveSession() {
    const refreshed = await refreshSession()
    return refreshed ?? session
  }

  function handleRefresh() {
    setPage(1)
    setRefreshToken((prev) => prev + 1)
  }

  function handlePickFile() {
    if (!fileInputRef.current) return
    fileInputRef.current.value = ''
    fileInputRef.current.click()
  }

  function upsertUpload(row: Partial<UploadRow> & { id: string }) {
    setUploads((prev) => {
      const existing = prev.find((item) => item.id === row.id)
      if (!existing) {
        return [row as UploadRow, ...prev]
      }
      return prev.map((item) => (item.id === row.id ? { ...item, ...row } : item))
    })
  }

  async function handleUpload() {
    if (!selectedFile || !accountId || !accessToken) {
      setStatus('error')
      setMessage('请先登录并选择文件。')
      setInlineStatus(null)
      return
    }

    if (!selectedApiKeyId) {
      setStatus('error')
      setMessage('请先指定记忆归属的 apikey')
      setInlineStatus(null)
      return
    }

    const lowerName = selectedFile.name.toLowerCase()
    if (!lowerName.endsWith('.json') && !selectedFile.type.includes('json')) {
      setStatus('error')
      setMessage('仅支持 JSON 文件。')
      setInlineStatus(null)
      return
    }

    setStatus('loading')
    setMessage(null)
    setInlineStatus(null)

    try {
      const active = await getActiveSession()
      if (!active) {
        throw new Error('登录已过期，请重新登录。')
      }

      const text = await selectedFile.text()
      let parsed
      try {
        parsed = JSON.parse(text)
      } catch {
        throw new Error('仅支持 JSON 文件。')
      }

      let ingestBody
      if (Array.isArray(parsed)) {
        ingestBody = { turns: parsed }
      } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.turns)) {
        ingestBody = parsed
      } else {
        ingestBody = { turns: [{ role: 'user', content: JSON.stringify(parsed) }] }
      }

      const requestId = crypto.randomUUID()
      const apiKeyLabel = apiKeyLabelMap.get(selectedApiKeyId) ?? null
      const response = await fetch(`${apiBaseUrl}/memory/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${active.access_token}`,
          'X-Principal-User-Id': active.user.id,
          'X-Request-Id': requestId,
        },
        body: JSON.stringify({
          ...ingestBody,
          api_key_id: selectedApiKeyId,
          upload_meta: {
            filename: selectedFile.name,
            size_bytes: selectedFile.size,
            mime: selectedFile.type,
            api_key_label: apiKeyLabel,
          },
        }),
      })

      const data = (await response.json().catch(() => ({}))) as {
        code?: string
        message?: string
        missing?: string[]
        job_id?: string
        jobId?: string
        status?: string
      }
      if (!response.ok) {
        const resolvedMessage = resolveUploadErrorMessage(data)
        throw new Error(resolvedMessage ?? '上传失败。')
      }

      const jobId = data.job_id ?? data.jobId ?? requestId
      const now = new Date().toISOString()
      const nextStatus = data.status ?? 'processing'
      upsertUpload({
        id: jobId,
        file: selectedFile.name,
        fileType: getFileTypeLabel(selectedFile.name, selectedFile.type),
        status: nextStatus,
        scope: 'apikey',
        createdAt: now,
        updatedAt: now,
        balanceUsed: 0,
        error: null,
        progress: null,
        sizeBytes: selectedFile.size,
        apiKeyId: selectedApiKeyId,
        memoryLabel: apiKeyLabel ?? selectedApiKeyId,
      })

      setStatus('success')
      setMessage(null)
      setSelectedFile(null)
    } catch (error) {
      setStatus('error')
      if (error instanceof Error) {
        setMessage(error.message)
      } else {
        setMessage(String(error))
      }
      setInlineStatus(null)
    }
  }

  useEffect(() => {
    if (!accountId || !accessToken) return

    let cancelled = false

    async function loadApiKeys() {
      try {
        const active = await getActiveSession()
        if (!active) return

        const response = await fetch(`${apiBaseUrl}/apikeys?page=1&pageSize=200`, {
          headers: {
            Authorization: `Bearer ${active.access_token}`,
            'X-Principal-User-Id': active.user.id,
          },
        })
        const data = (await response.json()) as ApiKeyListResponse & { message?: string }
        if (!response.ok) {
          throw new Error(data?.message ?? '加载 API 密钥失败')
        }

        if (cancelled) return
        setApiKeys(data.data ?? [])
      } catch (error) {
        if (cancelled) return
        setStatus('error')
        setMessage(error instanceof Error ? error.message : String(error))
      }
    }

    loadApiKeys()
    return () => {
      cancelled = true
    }
  }, [accountId, accessToken, apiBaseUrl, refreshSession, refreshToken])

  useEffect(() => {
    if (!accountId || !accessToken) return

    let cancelled = false

    async function loadHistory() {
      try {
        const active = await getActiveSession()
        if (!active) return

        const response = await fetch(
          `${apiBaseUrl}/memory/ingest/history?page=${page}&pageSize=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${active.access_token}`,
              'X-Principal-User-Id': active.user.id,
            },
          }
        )
        const data = (await response.json().catch(() => ({}))) as IngestHistoryResponse
        if (!response.ok) {
          throw new Error(data?.message ?? '加载上传历史失败')
        }

        if (cancelled) return
        const rows = (data.data ?? [])
          .map((item) => {
            const id = item.job_id ?? item.id
            if (!id) return null
            const createdAt = item.created_at ?? new Date().toISOString()
            const updatedAt = item.updated_at ?? createdAt
            const fileName = item.file_name ?? 'unknown'
            const fileType = item.file_type ?? getFileTypeLabel(fileName, '')
            return {
              id,
              file: fileName,
              fileType,
              status: item.status ?? 'processing',
              scope: 'apikey',
              createdAt,
              updatedAt,
              balanceUsed: 0,
              error: null,
              progress: null,
              sizeBytes: item.size_bytes ?? null,
              apiKeyId: item.api_key_id ?? null,
              memoryLabel: item.api_key_label ?? null,
            } as UploadRow
          })
          .filter(Boolean) as UploadRow[]
        setUploads(rows)
        setHasNext(Boolean(data.pagination?.hasNext))
      } catch (error) {
        if (cancelled) return
        setStatus('error')
        setMessage(error instanceof Error ? error.message : String(error))
      }
    }

    loadHistory()
    return () => {
      cancelled = true
    }
  }, [accountId, accessToken, apiBaseUrl, page, pageSize, refreshSession, refreshToken])

  useEffect(() => {
    if (!accountId || !accessToken) return

    let cancelled = false
    let interval: number | null = null

    async function pollActiveJobs() {
      const activeRows = uploads.filter((row) => ACTIVE_STATUSES.has(row.status))
      if (activeRows.length === 0) return

      try {
        const active = await getActiveSession()
        if (!active) return

        const results = await Promise.all(
          activeRows.map(async (row) => {
            try {
              const response = await fetch(`${apiBaseUrl}/memory/ingest/jobs/${row.id}`, {
                headers: {
                  Authorization: `Bearer ${active.access_token}`,
                  'X-Principal-User-Id': active.user.id,
                },
              })
              const data = (await response.json().catch(() => ({}))) as {
                status?: string
                message?: string
              }
              if (!response.ok) {
                throw new Error(data?.message ?? '获取任务状态失败。')
              }
              return { id: row.id, status: data.status ?? row.status }
            } catch (error) {
              return { id: row.id, error }
            }
          })
        )

        if (cancelled) return
        const now = new Date().toISOString()
        for (const result of results) {
          if ('status' in result) {
            upsertUpload({
              id: result.id,
              status: result.status,
              updatedAt: now,
            })
            if (result.status === 'done' || result.status === 'COMPLETED') {
              setInlineStatus('记忆已同步。')
            }
          } else if (result.error) {
            setStatus('error')
            setMessage(result.error instanceof Error ? result.error.message : String(result.error))
          }
        }
      } catch (error) {
        if (cancelled) return
        setStatus('error')
        setMessage(error instanceof Error ? error.message : String(error))
      }
    }

    pollActiveJobs()
    interval = window.setInterval(pollActiveJobs, 2000)

    return () => {
      cancelled = true
      if (interval) {
        window.clearInterval(interval)
      }
    }
  }, [uploads, accountId, accessToken, apiBaseUrl, refreshSession])

  function resolveMemoryLabel(row: UploadRow) {
    if (row.memoryLabel) return row.memoryLabel
    if (row.apiKeyId) {
      return apiKeyLabelMap.get(row.apiKeyId) ?? row.apiKeyId
    }
    return '-'
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">存储</p>
          <h1 className="text-2xl font-semibold text-ink">上传任务</h1>
          <p className="text-sm text-ink/60">查看上传任务与处理状态。</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-ink/20 px-3 py-2 text-xs text-ink/70 hover:bg-ink/5"
            onClick={handleRefresh}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            刷新
          </button>
          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-md border border-ink/20 bg-white/80 px-3 text-xs text-ink/80"
              value={selectedApiKeyId}
              onChange={(event) => setSelectedApiKeyId(event.target.value)}
            >
              <option value="">选择 API Key</option>
              {apiKeys.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label ?? item.id}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-ink px-4 py-2 text-xs font-semibold text-ivory"
            onClick={() => (selectedFile ? handleUpload() : handlePickFile())}
            disabled={status === 'loading'}
          >
            <CloudUpload className="mr-2 h-4 w-4" />
            {status === 'loading' ? '上传中...' : selectedFile ? '开始上传' : '上传文件'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              setSelectedFile(file)
            }}
          />
        </div>
      </header>

      <section className="rounded-xl bg-white/70 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">最近上传</h2>
          <p className="text-xs text-ink/50">共 {uploads.length} 个任务</p>
        </div>
        {selectedFile ? (
          <p className="mt-3 text-sm text-ink/60">
            已选择：{selectedFile.name}（{formatBytes(selectedFile.size)}）
          </p>
        ) : null}
        {inlineStatus ? <p className="mt-2 text-sm text-emerald-600">{inlineStatus}</p> : null}
        {message ? (
          <p className={`mt-2 text-sm ${status === 'error' ? 'text-red-600' : 'text-ink/70'}`}>
            {message}
          </p>
        ) : null}
        <div className="mt-4 overflow-hidden rounded-lg bg-white/60">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-xs uppercase tracking-[0.12em] text-ink/60">
              <tr>
                <th className="px-4 py-3 text-left">文件</th>
                <th className="px-4 py-3 text-left">记忆位置</th>
                <th className="px-4 py-3 text-left">大小</th>
                <th className="px-4 py-3 text-left">状态</th>
                <th className="px-4 py-3 text-left">更新时间</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {uploads.length === 0 ? (
                <tr>
                  <td className="px-4 py-3 text-ink/60" colSpan={6}>
                    暂无上传记录。
                  </td>
                </tr>
              ) : (
                uploads.map((row) => (
                  <tr key={row.id} className="border-t border-ink/5">
                    <td className="px-4 py-3 font-medium">{row.file}</td>
                    <td className="px-4 py-3 text-ink/60">{resolveMemoryLabel(row)}</td>
                    <td className="px-4 py-3 text-ink/60">
                      {row.sizeBytes ? formatBytes(row.sizeBytes) : '-'}
                    </td>
                    <td className="px-4 py-3">{renderStatusCell(row)}</td>
                    <td className="px-4 py-3">{formatTimestamp(row.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="rounded-md border border-ink/20 px-3 py-1 text-xs text-ink/70 hover:bg-ink/5"
                        disabled
                      >
                        {row.status === 'failed' ? '重试' : '查看'}
                      </button>
                    </td>
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

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

function formatStatus(row: UploadRow) {
  if (row.status === 'uploading') {
    return '上传中'
  }
  if (row.status === 'uploaded') {
    return '已上传'
  }
  if (row.status === 'queued') {
    return '排队中'
  }
  if (row.status === 'processing') {
    return '处理中'
  }
  if (row.status === 'RECEIVED') {
    return '已接收'
  }
  if (row.status === 'COMPLETED' || row.status === 'done') {
    return '已完成'
  }
  if (row.status === 'failed') {
    return row.error ? `失败: ${row.error}` : '失败'
  }
  return row.status
}

function renderStatusCell(row: UploadRow) {
  const label = formatStatus(row)
  if (row.status === 'uploading') {
    const progress = row.progress ?? 0
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-ink/70">{`${label} ${progress}%`}</span>
        <div className="h-1.5 w-24 overflow-hidden rounded bg-ink/10">
          <div className="h-full bg-vermillion" style={{ width: `${progress}%` }} />
        </div>
      </div>
    )
  }

  const badgeClass =
    row.status === 'done' || row.status === 'COMPLETED'
      ? 'bg-emerald-500/10 text-emerald-600'
      : row.status === 'failed'
        ? 'bg-red-500/10 text-red-600'
        : 'bg-amber-500/10 text-amber-600'

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${badgeClass}`}>{label}</span>
}

function getFileTypeLabel(filename: string, mime: string) {
  if (mime) {
    return mime
  }
  const ext = filename.split('.').pop()
  return ext ? ext.toLowerCase() : 'unknown'
}

function formatTimestamp(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN')
}
