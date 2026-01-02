import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
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

type MemoryPolicyResponse = {
  default_scope: 'user' | 'apikey'
}

type ApiKeyRow = {
  id: string
  label?: string | null
  key_prefix?: string | null
}

type LlmKeyRow = {
  id: string
  label?: string | null
  base_url?: string | null
  scope_type?: string | null
  api_key_id?: string | null
  masked_key?: string | null
  last_used_at?: string | null
  last_tested_at?: string | null
  last_test_status?: string | null
}

export function MemoryPolicyPage() {
  const { session, refreshSession } = useSupabaseSession()
  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])
  const accountId = session?.user?.id ?? null

  const [defaultScope, setDefaultScope] = useState<'user' | 'apikey'>('user')
  const [policyStatus, setPolicyStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const [policyMessage, setPolicyMessage] = useState<string | null>(null)

  const [llmKeys, setLlmKeys] = useState<LlmKeyRow[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKeyRow[]>([])
  const [formLabel, setFormLabel] = useState('')
  const [formKey, setFormKey] = useState('')
  const [formBaseUrl, setFormBaseUrl] = useState('')
  const [llmStatus, setLlmStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [llmMessage, setLlmMessage] = useState<string | null>(null)

  function formatDate(value?: string | null) {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString('zh-CN')
  }

  async function getSession() {
    const active = await refreshSession()
    return active ?? session ?? null
  }

  async function loadMemoryPolicy() {
    const activeSession = await getSession()
    if (!activeSession) return
    const response = await fetch(`${apiBaseUrl}/settings/memory-policy`, {
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`,
        'X-Principal-User-Id': activeSession.user.id,
      },
    })
    const data = (await response.json()) as MemoryPolicyResponse & { message?: string }
    if (!response.ok) {
      throw new Error(data?.message ?? '加载记忆隔离失败')
    }
    setDefaultScope(data.default_scope ?? 'user')
  }

  async function loadLlmKeys() {
    const activeSession = await getSession()
    if (!activeSession) return
    const response = await fetch(`${apiBaseUrl}/llm-keys`, {
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`,
        'X-Principal-User-Id': activeSession.user.id,
      },
    })
    const data = (await response.json()) as { data?: LlmKeyRow[]; message?: string }
    if (!response.ok) {
      throw new Error(data?.message ?? '加载 LLM Key 失败')
    }
    setLlmKeys(data.data ?? [])
  }

  async function loadApiKeys() {
    const activeSession = await getSession()
    if (!activeSession) return
    const response = await fetch(`${apiBaseUrl}/apikeys?page=1&pageSize=200`, {
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`,
        'X-Principal-User-Id': activeSession.user.id,
      },
    })
    const data = (await response.json()) as { data?: ApiKeyRow[]; message?: string }
    if (!response.ok) {
      throw new Error(data?.message ?? '加载 API Key 失败')
    }
    setApiKeys(data.data ?? [])
  }

  useEffect(() => {
    if (!accountId) return
    setLlmStatus('loading')
    setLlmMessage(null)
    Promise.all([loadMemoryPolicy(), loadLlmKeys(), loadApiKeys()])
      .then(() => setLlmStatus('idle'))
      .catch((error) => {
        setLlmStatus('error')
        setLlmMessage(String(error))
      })
  }, [accountId])

  async function updateMemoryPolicy(nextScope: 'user' | 'apikey') {
    const activeSession = await getSession()
    if (!activeSession) return
    setPolicyStatus('saving')
    setPolicyMessage(null)
    const response = await fetch(`${apiBaseUrl}/settings/memory-policy`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`,
        'Content-Type': 'application/json',
        'X-Principal-User-Id': activeSession.user.id,
      },
      body: JSON.stringify({ default_scope: nextScope }),
    })
    const data = (await response.json()) as { message?: string }
    if (!response.ok) {
      setPolicyStatus('error')
      setPolicyMessage(data?.message ?? '保存失败')
      return
    }
    setDefaultScope(nextScope)
    setPolicyStatus('idle')
  }

  async function handleAddLlmKey() {
    if (!formKey || !formBaseUrl) {
      setLlmMessage('请填写 LLM Key 和请求地址')
      setLlmStatus('error')
      return
    }
    const activeSession = await getSession()
    if (!activeSession) return
    setLlmStatus('loading')
    setLlmMessage(null)
    const response = await fetch(`${apiBaseUrl}/llm-keys`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`,
        'Content-Type': 'application/json',
        'X-Principal-User-Id': activeSession.user.id,
      },
      body: JSON.stringify({
        label: formLabel || null,
        api_key: formKey,
        base_url: formBaseUrl,
        scope_type: null,
      }),
    })
    const data = (await response.json()) as { message?: string }
    if (!response.ok) {
      setLlmStatus('error')
      setLlmMessage(data?.message ?? '添加失败')
      return
    }
    setFormLabel('')
    setFormKey('')
    setFormBaseUrl('')
    await loadLlmKeys()
    setLlmStatus('idle')
  }

  async function handleBindingChange(keyId: string, value: string) {
    const activeSession = await getSession()
    if (!activeSession) return
    setLlmStatus('loading')
    setLlmMessage(null)
    const payload: { scope_type: string | null; api_key_id: string | null } = {
      scope_type: null,
      api_key_id: null,
    }
    if (value === 'all') {
      payload.scope_type = 'all'
      payload.api_key_id = null
    } else if (value) {
      payload.scope_type = 'apikey'
      payload.api_key_id = value
    }
    const response = await fetch(`${apiBaseUrl}/llm-keys/${keyId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`,
        'Content-Type': 'application/json',
        'X-Principal-User-Id': activeSession.user.id,
      },
      body: JSON.stringify(payload),
    })
    const data = (await response.json()) as { message?: string }
    if (!response.ok) {
      setLlmStatus('error')
      setLlmMessage(data?.message ?? '更新失败')
      return
    }
    await loadLlmKeys()
    setLlmStatus('idle')
  }

  async function handleTestKey(keyId: string) {
    const activeSession = await getSession()
    if (!activeSession) return
    setLlmStatus('loading')
    setLlmMessage(null)
    const response = await fetch(`${apiBaseUrl}/llm-keys/${keyId}/test`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`,
        'X-Principal-User-Id': activeSession.user.id,
      },
    })
    const data = (await response.json()) as { message?: string }
    if (!response.ok) {
      setLlmStatus('error')
      setLlmMessage(data?.message ?? '测试失败')
      return
    }
    await loadLlmKeys()
    setLlmStatus('idle')
  }

  async function handleDeleteKey(keyId: string) {
    const activeSession = await getSession()
    if (!activeSession) return
    setLlmStatus('loading')
    setLlmMessage(null)
    const response = await fetch(`${apiBaseUrl}/llm-keys/${keyId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`,
        'X-Principal-User-Id': activeSession.user.id,
      },
    })
    const data = (await response.json()) as { message?: string }
    if (!response.ok) {
      setLlmStatus('error')
      setLlmMessage(data?.message ?? '删除失败')
      return
    }
    await loadLlmKeys()
    setLlmStatus('idle')
  }

  const scopeOptions = useMemo(() => {
    const apiOptions = apiKeys.map((item) => ({
      key: item.id,
      label: item.label || item.key_prefix || item.id.slice(0, 6),
    }))
    return [
      { key: 'none', label: '未启用' },
      { key: 'all', label: '所有' },
      ...apiOptions,
    ]
  }, [apiKeys])

  return (
    <div className="space-y-6">
      <Card className="glass-panel">
        <CardHeader className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold">通用设置</h3>
          <p className="text-sm text-muted">配置记忆隔离策略与 LLM Key。</p>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">记忆隔离策略</p>
                <p className="text-xs text-muted">默认按用户或 API Key 隔离记忆。</p>
              </div>
            </div>
            <Select
              label="默认隔离范围"
              selectedKeys={new Set([defaultScope])}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as 'user' | 'apikey'
                updateMemoryPolicy(value)
              }}
            >
              <SelectItem key="user">用户级</SelectItem>
              <SelectItem key="apikey">API Key 级</SelectItem>
            </Select>
            {policyStatus === 'error' ? (
              <p className="text-xs text-danger-500">{policyMessage ?? '保存失败'}</p>
            ) : null}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">LLM Key 设置</p>
              <p className="text-xs text-muted">添加并绑定不同的 LLM Key。</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                label="备注"
                placeholder="例如：主用 OpenAI"
                value={formLabel}
                onChange={(event) => setFormLabel(event.target.value)}
              />
              <Input
                label="LLM Key"
                placeholder="sk-..."
                type="password"
                value={formKey}
                onChange={(event) => setFormKey(event.target.value)}
              />
              <Input
                label="请求地址"
                placeholder="https://api.openai.com"
                value={formBaseUrl}
                onChange={(event) => setFormBaseUrl(event.target.value)}
              />
            </div>
            <div>
              <Button onPress={handleAddLlmKey} className="bg-ink text-white">
                添加
              </Button>
            </div>
            {llmStatus === 'error' && llmMessage ? (
              <p className="text-xs text-danger-500">{llmMessage}</p>
            ) : null}
          </div>
        </CardBody>
      </Card>

      <Card className="glass-panel">
        <CardHeader className="flex flex-col items-start gap-1">
          <h3 className="text-lg font-semibold">LLM Key 列表</h3>
          <p className="text-sm text-muted">选择绑定范围，或测试可用性。</p>
        </CardHeader>
        <CardBody>
          {llmStatus === 'loading' ? (
            <div className="text-sm text-muted">加载中...</div>
          ) : (
            <Table removeWrapper aria-label="LLM Keys">
              <TableHeader>
                <TableColumn>备注</TableColumn>
                <TableColumn>绑定范围</TableColumn>
                <TableColumn>最后使用时间</TableColumn>
                <TableColumn>是否可用</TableColumn>
                <TableColumn>操作</TableColumn>
              </TableHeader>
              <TableBody>
                {llmKeys.length === 0 ? (
                  <TableRow key="empty">
                    <TableCell>暂无 LLM Key</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                ) : (
                  llmKeys.map((row) => {
                    let selectedKey = 'none'
                    if (row.scope_type === 'all') {
                      selectedKey = 'all'
                    } else if (row.scope_type === 'apikey' && row.api_key_id) {
                      selectedKey = row.api_key_id
                    }
                    const statusLabel =
                      row.last_test_status === 'ok'
                        ? '可用'
                        : row.last_test_status === 'failed'
                          ? '不可用'
                          : '未测试'
                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{row.label || row.masked_key || '未命名'}</div>
                            {row.base_url ? (
                              <div className="text-xs text-muted">{row.base_url}</div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            aria-label="绑定范围"
                            selectedKeys={new Set([selectedKey])}
                            onSelectionChange={(keys) => {
                              const value = String(Array.from(keys)[0] ?? '')
                              handleBindingChange(row.id, value === 'none' ? '' : value)
                            }}
                          >
                            {scopeOptions.map((option) => (
                              <SelectItem key={option.key}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell>{formatDate(row.last_used_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{statusLabel}</span>
                            <Button
                              size="sm"
                              variant="flat"
                              onPress={() => handleTestKey(row.id)}
                            >
                              测试
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="flat"
                            color="danger"
                            onPress={() => handleDeleteKey(row.id)}
                          >
                            删除
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
