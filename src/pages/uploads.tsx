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
  status: string
  scope: string
  updatedAt: string
  error?: string | null
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

const ACTIVE_STATUSES = new Set(['init', 'uploaded', 'processing'])

export function UploadsPage() {
  const { session, refreshSession } = useSupabaseSession()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploads, setUploads] = useState<UploadRow[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [pollingUploadId, setPollingUploadId] = useState<string | null>(null)

  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])
  const accountId = session?.user?.id ?? null
  const accessToken = session?.access_token ?? null

  async function getActiveSession() {
    const refreshed = await refreshSession()
    return refreshed ?? session
  }

  function upsertUpload(row: UploadRow) {
    setUploads((prev) => {
      const existing = prev.find((item) => item.id === row.id)
      if (!existing) {
        return [row, ...prev]
      }
      return prev.map((item) => (item.id === row.id ? { ...item, ...row } : item))
    })
  }

  async function handleUpload() {
    if (!selectedFile || !accountId || !accessToken) {
      setStatus('error')
      setMessage('Please sign in and choose a file before uploading.')
      return
    }

    setStatus('loading')
    setMessage(null)

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
        status: 'init',
        scope,
        updatedAt: now,
        error: null,
      })
      setPollingUploadId(initData.upload_id)

      const uploadHeaders = initData.upload_headers ?? {}
      const uploadMethod = initData.upload_method ?? 'PUT'
      const uploadResult = await fetch(initData.upload_url, {
        method: uploadMethod,
        headers: uploadHeaders,
        body: selectedFile,
      })
      if (!uploadResult.ok) {
        throw new Error('Upload to object storage failed.')
      }

      upsertUpload({
        id: initData.upload_id,
        file: selectedFile.name,
        status: 'uploaded',
        scope,
        updatedAt: new Date().toISOString(),
        error: null,
      })
      setStatus('success')
      setMessage('Upload sent to OSS. Waiting for processing.')
      setSelectedFile(null)
    } catch (error) {
      setStatus('error')
      setMessage(String(error))
    }
  }

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
        {message ? <p className="text-sm text-muted">{message}</p> : null}

        <Table removeWrapper aria-label="Uploads">
          <TableHeader>
            <TableColumn>File</TableColumn>
            <TableColumn>Status</TableColumn>
            <TableColumn>Scope</TableColumn>
            <TableColumn>Updated</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No uploads yet.">
            {uploads.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.file}</TableCell>
                <TableCell>{formatStatus(row)}</TableCell>
                <TableCell>{row.scope}</TableCell>
                <TableCell>{row.updatedAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
  if (row.status === 'done') {
    return 'Done (记忆已同步完成)'
  }
  if (row.status === 'failed') {
    return row.error ? `Failed: ${row.error}` : 'Failed'
  }
  return row.status
}
