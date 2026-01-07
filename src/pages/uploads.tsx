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
}

type UploadInitResponse = {
  upload_id: string
  oss_key: string
  upload_url: string
  upload_method?: string
  upload_expires_in?: number
  upload_headers?: Record<string, string>
  message?: string
}

type UploadStatusResponse = {
  upload_id: string
  status: string
  error_code?: string | null
  error_message?: string | null
  filename?: string | null
  memory_scope?: string | null
  updated_at?: string | null
  message?: string
}

type UploadHistoryResponse = {
  data: Array<{
    id: string
    filename?: string | null
    mime?: string | null
    status: string
    memory_scope?: string | null
    created_at?: string | null
    updated_at?: string | null
    request_id?: string | null
    size_bytes?: number | null
    balance_used?: number | null
  }>
}

const ACTIVE_STATUSES = new Set(['init', 'uploaded', 'processing'])

export function UploadsPage() {
  const { session, refreshSession } = useSupabaseSession()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploads, setUploads] = useState<UploadRow[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [inlineStatus, setInlineStatus] = useState<string | null>(null)
  const [pollingUploadId, setPollingUploadId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)
  const pageSize = 10

  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])
  const accountId = session?.user?.id ?? null
  const accessToken = session?.access_token ?? null

  async function getActiveSession() {
    const refreshed = await refreshSession()
    return refreshed ?? session
  }

  function handleRefresh() {
    setPage(1)
    setUploads([])
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

  async function uploadWithProgress(options: {
    url: string
    method: string
    headers: Record<string, string>
    body: Blob
    onProgress: (percent: number) => void
  }) {
    const { url, method, headers, body, onProgress } = options

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open(method, url)
      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value)
      }
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
          return
        }
        reject(new Error('上传到对象存储失败。'))
      }
      xhr.onerror = () => reject(new Error('上传到对象存储失败。'))
      xhr.send(body)
    })
  }

  async function handleUpload() {
    if (!selectedFile || !accountId || !accessToken) {
      setStatus('error')
      setMessage('请先登录并选择文件。')
      setInlineStatus(null)
      return
    }

    setStatus('loading')
    setMessage(null)
    setInlineStatus(null)

    try {
      const active = await getActiveSession()
      if (!active) {
        throw new Error('会话已过期，请重新登录。')
      }

      const requestId = crypto.randomUUID()
      const initResponse = await fetch(`${apiBaseUrl}/uploads/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${active.access_token}`,
          'X-Principal-User-Id': active.user.id,
          'X-Request-Id': requestId,
        },
        body: JSON.stringify({
          filename: selectedFile.name,
          size: selectedFile.size,
          mime: selectedFile.type || 'application/octet-stream',
        }),
      })

      const initData = (await initResponse.json()) as UploadInitResponse
      if (!initResponse.ok) {
        throw new Error(initData?.message ?? '初始化上传失败。')
      }

      const now = new Date().toISOString()
      const scope = session?.user?.id ? 'user' : 'apikey'
      upsertUpload({
        id: initData.upload_id,
        file: selectedFile.name,
        fileType: getFileTypeLabel(selectedFile.name, selectedFile.type),
        status: 'uploading',
        scope,
        createdAt: now,
        updatedAt: now,
        balanceUsed: 0,
        error: null,
        progress: 0,
        sizeBytes: selectedFile.size,
      })
      setPollingUploadId(initData.upload_id)

      const uploadHeaders = initData.upload_headers ?? {}
      const uploadMethod = initData.upload_method ?? 'PUT'
      await uploadWithProgress({
        url: initData.upload_url,
        method: uploadMethod,
        headers: uploadHeaders,
        body: selectedFile,
        onProgress: (percent) => {
          upsertUpload({
            id: initData.upload_id,
            progress: percent,
            updatedAt: new Date().toISOString(),
          })
        },
      })

      upsertUpload({
        id: initData.upload_id,
        file: selectedFile.name,
        fileType: getFileTypeLabel(selectedFile.name, selectedFile.type),
        status: 'uploaded',
        scope,
        createdAt: now,
        updatedAt: new Date().toISOString(),
        balanceUsed: 0,
        error: null,
        progress: 100,
        sizeBytes: selectedFile.size,
      })
      setStatus('success')
      setMessage(null)
      setSelectedFile(null)
    } catch (error) {
      setStatus('error')
      setMessage(String(error))
      setInlineStatus(null)
    }
  }

  useEffect(() => {
    if (!accountId || !accessToken) return

    let cancelled = false

    async function loadUploadHistory() {
      try {
        const active = await getActiveSession()
        if (!active) return

        const response = await fetch(
          `${apiBaseUrl}/uploads/history?page=${page}&pageSize=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${active.access_token}`,
              'X-Principal-User-Id': active.user.id,
            },
          },
        )
        const data = (await response.json()) as UploadHistoryResponse
        if (!response.ok) {
          return
        }

        if (cancelled) return
        const rows = (data.data ?? []).map((row) => ({
          id: row.id,
          file: row.filename ?? 'upload',
          fileType: getFileTypeLabel(row.filename ?? 'upload', row.mime ?? ''),
          status: row.status,
          scope: row.memory_scope ?? 'user',
          createdAt: row.created_at ?? row.updated_at ?? new Date().toISOString(),
          updatedAt: row.updated_at ?? new Date().toISOString(),
          balanceUsed: Number(row.balance_used ?? 0),
          error: null,
          progress: null,
          sizeBytes: row.size_bytes ?? null,
        }))

        setUploads((prev) => mergeUploadRows(prev, rows))
        setHasNext(rows.length === pageSize)
      } catch {
        return
      }
    }

    loadUploadHistory()
    return () => {
      cancelled = true
    }
  }, [accountId, accessToken, apiBaseUrl, refreshSession, page, refreshToken])

  useEffect(() => {
    if (!pollingUploadId || !accountId || !accessToken) return

    let cancelled = false
    let interval: number | null = null

    async function pollOnce() {
      try {
        const active = await getActiveSession()
        if (!active) {
          throw new Error('会话已过期，请重新登录。')
        }

        const response = await fetch(`${apiBaseUrl}/uploads/${pollingUploadId}`, {
          headers: {
            Authorization: `Bearer ${active.access_token}`,
            'X-Principal-User-Id': active.user.id,
          },
        })
        const data = (await response.json()) as UploadStatusResponse
        if (!response.ok) {
          throw new Error(data?.message ?? '获取上传状态失败。')
        }

        if (cancelled) return
        upsertUpload({
          id: data.upload_id,
          file: data.filename ?? 'upload',
          status: data.status,
          scope: data.memory_scope ?? 'user',
          updatedAt: data.updated_at ?? new Date().toISOString(),
          error: data.error_message ?? null,
        })

        if (data.status === 'done') {
          setInlineStatus('记忆已同步。')
        }

        if (!ACTIVE_STATUSES.has(data.status)) {
          setPollingUploadId(null)
        }
      } catch (error) {
        if (cancelled) return
        setStatus('error')
        setMessage(String(error))
        setPollingUploadId(null)
      }
    }

    pollOnce()
    interval = window.setInterval(pollOnce, 2000)

    return () => {
      cancelled = true
      if (interval) {
        window.clearInterval(interval)
      }
    }
  }, [pollingUploadId, accountId, accessToken, apiBaseUrl, refreshSession])

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
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-ink px-4 py-2 text-xs font-semibold text-ivory"
            onClick={() => (selectedFile ? handleUpload() : handlePickFile())}
            disabled={status === 'loading'}
          >
            <CloudUpload className="mr-2 h-4 w-4" />
            {status === 'loading' ? '上传中…' : selectedFile ? '开始上传' : '上传文件'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
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
                <th className="px-4 py-3 text-left">格式</th>
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
                    <td className="px-4 py-3 text-ink/60">{row.fileType}</td>
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
  if (row.status === 'processing') {
    return '处理中'
  }
  if (row.status === 'done') {
    return '已同步'
  }
  if (row.status === 'failed') {
    return row.error ? `失败：${row.error}` : '失败'
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
    row.status === 'done'
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

function mergeUploadRows(existing: UploadRow[], incoming: UploadRow[]) {
  const map = new Map(existing.map((row) => [row.id, row]))
  for (const row of incoming) {
    const current = map.get(row.id)
    if (current) {
      map.set(row.id, {
        ...row,
        progress: current.progress ?? row.progress ?? null,
        error: current.error ?? row.error ?? null,
      })
    } else {
      map.set(row.id, row)
    }
  }

  const incomingIds = new Set(incoming.map((row) => row.id))
  const ordered = incoming.map((row) => map.get(row.id)!).filter(Boolean)
  const extras = existing.filter((row) => !incomingIds.has(row.id))
  return [...ordered, ...extras]
}
