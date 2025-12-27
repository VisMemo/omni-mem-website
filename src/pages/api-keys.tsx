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
  const { session } = useSupabaseSession()
  const [label, setLabel] = useState('')
  const [rows, setRows] = useState<ApiKeyRow[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [lastPlaintext, setLastPlaintext] = useState<string | null>(null)

  const accountId = session?.user?.id ?? null
  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])

  async function fetchKeys(currentAccountId: string) {
    const response = await fetch(`${apiBaseUrl}/apikeys`, {
      headers: {
        'X-Principal-User-Id': currentAccountId,
      },
    })
    const data = (await response.json()) as ApiKeyListResponse & { message?: string }
    if (!response.ok) {
      throw new Error(data?.message ?? 'Failed to load API keys')
    }
    setRows(data.data ?? [])
  }

  useEffect(() => {
    if (!accountId) return

    let cancelled = false
    setStatus('loading')
    setMessage(null)

    fetchKeys(accountId)
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
  }, [accountId, apiBaseUrl])

  async function handleCreateKey() {
    if (!accountId) {
      setStatus('error')
      setMessage('Please sign in to create an API key.')
      return
    }

    setStatus('loading')
    setMessage(null)

    try {
      const response = await fetch(`${apiBaseUrl}/apikeys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Principal-User-Id': accountId,
          'X-Request-Id': crypto.randomUUID(),
        },
        body: JSON.stringify({ label }),
      })

      const data = (await response.json()) as ApiKeyCreateResponse
      if (!response.ok) {
        throw new Error(data?.message ?? 'Failed to create API key')
      }

      setLabel('')
      setStatus('success')
      setLastPlaintext(data.api_key_plaintext ?? null)
      setMessage(
        data.api_key_plaintext
          ? `Created. Copy now: ${data.api_key_plaintext}`
          : 'Created. The key is only shown once.',
      )

      await fetchKeys(accountId)
      setStatus('idle')
    } catch (error) {
      setStatus('error')
      setMessage(String(error))
    }
  }

  async function handleAction(action: 'revoke' | 'rotate' | 'delete', apiKeyId: string) {
    if (!accountId) {
      setStatus('error')
      setMessage('Please sign in to manage API keys.')
      return
    }

    setStatus('loading')
    setMessage(null)

    try {
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
          'X-Principal-User-Id': accountId,
          'X-Request-Id': requestId,
        },
      })

      const data = (await response.json()) as ApiKeyCreateResponse & { status?: string; message?: string }
      if (!response.ok) {
        throw new Error(data?.message ?? `Failed to ${action} API key`)
      }

      if (action === 'rotate') {
        setLastPlaintext(data.api_key_plaintext ?? null)
        setMessage(
          data.api_key_plaintext
            ? `Rotated. Copy now: ${data.api_key_plaintext}`
            : 'Rotated. The key is only shown once.',
        )
      } else {
        setLastPlaintext(null)
        setMessage(`${action} success`)
      }

      await fetchKeys(accountId)
      setStatus('idle')
    } catch (error) {
      setStatus('error')
      setMessage(String(error))
    }
  }

  return (
    <div className="space-y-6">
      <Card className="glass-panel">
        <CardHeader className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold">API Keys</h3>
          <p className="text-sm text-muted">Create and manage API keys for integrations.</p>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              label="Label"
              placeholder="e.g. production-service"
              value={label}
              onValueChange={setLabel}
            />
            <Button
              className="bg-accent text-white"
              radius="full"
              isLoading={status === 'loading'}
              onPress={handleCreateKey}
            >
              Create key
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
                  variant="flat"
                  onPress={async () => {
                    try {
                      await navigator.clipboard.writeText(lastPlaintext)
                      setMessage('Copied to clipboard.')
                    } catch (error) {
                      setStatus('error')
                      setMessage(String(error))
                    }
                  }}
                >
                  Copy key
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardBody>
      </Card>

      <Card className="glass-panel">
        <CardHeader className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold">Existing keys</h3>
          <p className="text-sm text-muted">Keys are shown once on creation.</p>
        </CardHeader>
        <CardBody>
          <Table removeWrapper aria-label="API keys">
            <TableHeader>
              <TableColumn>Prefix</TableColumn>
              <TableColumn>Label</TableColumn>
              <TableColumn>Status</TableColumn>
              <TableColumn>Created</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow key="empty">
                  <TableCell>No API keys yet.</TableCell>
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
                      {row.deleted_at ? 'Deleted' : row.revoked_at ? 'Revoked' : 'Active'}
                    </TableCell>
                    <TableCell>
                      {row.created_at ? new Date(row.created_at).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => handleAction('revoke', row.id)}
                          isDisabled={status === 'loading' || Boolean(row.revoked_at) || Boolean(row.deleted_at)}
                        >
                          Revoke
                        </Button>
                        <Button
                          size="sm"
                          variant="bordered"
                          onPress={() => handleAction('rotate', row.id)}
                          isDisabled={status === 'loading' || Boolean(row.deleted_at)}
                        >
                          Rotate
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => handleAction('delete', row.id)}
                          isDisabled={status === 'loading' || Boolean(row.deleted_at)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  )
}
