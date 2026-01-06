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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploads, setUploads] = useState<UploadRow[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [inlineStatus, setInlineStatus] = useState<string | null>(null)
  const [pollingUploadId, setPollingUploadId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const pageSize = 10

  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])
  const accountId = session?.user?.id ?? null
  const accessToken = session?.access_token ?? null

  async function getActiveSession() {
    const refreshed = await refreshSession()
    return refreshed ?? session
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
        reject(new Error('Upload to object storage failed.'))
      }
      xhr.onerror = () => reject(new Error('Upload to object storage failed.'))
      xhr.send(body)
    })
  }

  async function handleUpload() {
    if (!selectedFile || !accountId || !accessToken) {
      setStatus('error')
      setMessage('Please sign in and choose a file before uploading.')
      setInlineStatus(null)
      return
    }

    setStatus('loading')
    setMessage(null)
    setInlineStatus(null)

    try {
      const active = await getActiveSession()
      if (!active) {
        throw new Error('Session expired. Please sign in again.')
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
        throw new Error(initData?.message ?? 'Failed to initialize upload.')
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
  }, [accountId, accessToken, apiBaseUrl, refreshSession, page])

  useEffect(() => {
    if (!pollingUploadId || !accountId || !accessToken) return

    let cancelled = false
    let interval: number | null = null

    async function pollOnce() {
      try {
        const active = await getActiveSession()
        if (!active) {
          throw new Error('Session expired. Please sign in again.')
        }

        const response = await fetch(`${apiBaseUrl}/uploads/${pollingUploadId}`, {
          headers: {
            Authorization: `Bearer ${active.access_token}`,
            'X-Principal-User-Id': active.user.id,
          },
        })
        const data = (await response.json()) as UploadStatusResponse
        if (!response.ok) {
          throw new Error(data?.message ?? 'Failed to fetch upload status.')
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
          setInlineStatus('记忆已同步')
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
    <Card className="glass-panel">
      <CardHeader className="flex flex-col items-start gap-2">
        <h3 className="text-lg font-semibold">Uploads</h3>
        <p className="text-sm text-muted">Upload a file to sync it into memory.</p>
      </CardHeader>
      <CardBody className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              setSelectedFile(file)
            }}
          />
          <Button
            className="bg-accent text-white"
            radius="full"
            isDisabled={!selectedFile || status === 'loading'}
            onPress={handleUpload}
          >
            {status === 'loading' ? 'Uploading...' : 'Upload file'}
          </Button>
          <div className="text-sm text-muted">
            {selectedFile ? `Size: ${formatBytes(selectedFile.size)}` : 'No file selected'}
          </div>
        </div>
        {inlineStatus ? <p className="text-sm text-accent">{inlineStatus}</p> : null}
        {message ? <p className="text-sm text-danger">{message}</p> : null}

        <Table removeWrapper aria-label="Uploads">
          <TableHeader>
            <TableColumn>文件名</TableColumn>
            <TableColumn>文件格式</TableColumn>
            <TableColumn>上传状态</TableColumn>
            <TableColumn>上传时间</TableColumn>
            <TableColumn>消耗积分</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No uploads yet.">
            {uploads.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.file}</TableCell>
                <TableCell>{row.fileType}</TableCell>
                <TableCell>{renderStatusCell(row)}</TableCell>
                <TableCell>{formatTimestamp(row.createdAt)}</TableCell>
                <TableCell>{row.balanceUsed}</TableCell>
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
    return '上传已完成'
  }
  if (row.status === 'processing') {
    return '处理中'
  }
  if (row.status === 'done') {
    return '记忆已同步'
  }
  if (row.status === 'failed') {
    return row.error ? `Failed: ${row.error}` : 'Failed'
  }
  return row.status
}

function renderStatusCell(row: UploadRow) {
  const label = formatStatus(row)
  if (row.status !== 'uploading') {
    return label
  }

  const progress = row.progress ?? 0
  return (
    <div className="flex flex-col gap-1">
      <span>{`${label} ${progress}%`}</span>
      <div className="h-1.5 w-24 overflow-hidden rounded bg-white/10">
        <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
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
  return date.toLocaleString()
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
