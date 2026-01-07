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
  allow_apikey_scope?: boolean
  scope?: string
}

type ApiKeyRow = {
  id: string
  label?: string | null
  key_prefix?: string | null
}

type LlmKeyRow = {
  id: string
  label?: string | null
  provider?: string | null
  model_name?: string | null
  is_default?: boolean | null
  scope_type?: string | null
  api_key_id?: string | null
  masked_key?: string | null
  last_used_at?: string | null
}

const PROVIDER_OPTIONS = [
  'openai',
  'openrouter',
  'qwen',
  'glm',
  'gemini',
  'deepseek',
  'moonshot',
]

export function MemoryPolicyPage() {
  const { session, refreshSession } = useSupabaseSession()
  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])
  const accountId = session?.user?.id ?? null

  const [defaultScope, setDefaultScope] = useState<'user' | 'apikey'>('user')
  const [policyStatus, setPolicyStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const [policyMessage, setPolicyMessage] = useState<string | null>(null)
  const [allowApikeyScope, setAllowApikeyScope] = useState(true)

  const [llmKeys, setLlmKeys] = useState<LlmKeyRow[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKeyRow[]>([])
  const [formLabel, setFormLabel] = useState('')
  const [formKey, setFormKey] = useState('')
  const [formProvider, setFormProvider] = useState('')
  const [formModelName, setFormModelName] = useState('')
  const [modelOptions, setModelOptions] = useState<string[]>([])
  const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [modelMessage, setModelMessage] = useState<string | null>(null)
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
      throw new Error(data?.message ?? '加载记忆策略失败')
    }
    setDefaultScope(data.default_scope ?? 'user')
    setAllowApikeyScope(Boolean(data.allow_apikey_scope))
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
      throw new Error(data?.message ?? '加载 LLM 密钥失败')
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
      throw new Error(data?.message ?? '加载 API 密钥失败')
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

  useEffect(() => {
    if (!formProvider || !formKey.trim()) {
      setModelOptions([])
      setFormModelName('')
      setModelStatus('idle')
      setModelMessage(null)
      return
    }

    let cancelled = false
    setModelOptions([])
    setFormModelName('')
    setModelStatus('loading')
    setModelMessage(null)

    ;(async () => {
      const activeSession = await getSession()
      if (!activeSession || cancelled) return
      const response = await fetch(
        `${apiBaseUrl}/llm-models?provider=${encodeURIComponent(formProvider)}`,
        {
          headers: {
            Authorization: `Bearer ${activeSession.access_token}`,
            'X-Principal-User-Id': activeSession.user.id,
            'X-LLM-Api-Key': formKey.trim(),
          },
        },
      )
      const data = (await response.json()) as {
        models?: string[]
        message?: string
      }
      if (cancelled) return
      if (!response.ok) {
        setModelStatus('error')
        setModelMessage(data?.message ?? '加载模型列表失败')
        setModelOptions([])
        return
      }
      setModelOptions(Array.isArray(data?.models) ? data.models : [])
      setModelStatus('idle')
    })().catch((error) => {
      if (cancelled) return
      setModelStatus('error')
      setModelMessage(String(error))
      setModelOptions([])
    })

    return () => {
      cancelled = true
    }
  }, [apiBaseUrl, formKey, formProvider])

  async function updateMemoryPolicy(nextScope: 'user' | 'apikey') {
    const activeSession = await getSession()
    if (!activeSession) return
    if (nextScope === 'apikey' && !allowApikeyScope) {
      setPolicyStatus('error')
      setPolicyMessage('当前套餐未启用 API 密钥隔离。')
      return
    }
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
    const normalizedLabel = formLabel.trim()
    const normalizedKey = formKey.trim()
    if (!normalizedLabel) {
      setLlmMessage('请填写备注（label）。')
      setLlmStatus('error')
      return
    }
    const normalizedLower = normalizedLabel.toLowerCase()
    if (llmKeys.some((item) => (item.label ?? '').trim().toLowerCase() === normalizedLower)) {
      setLlmMessage('备注（label）已存在，请更换。')
      setLlmStatus('error')
      return
    }
    if (!normalizedKey || !formProvider || !formModelName) {
      setLlmMessage('请填写 LLM 密钥，并选择平台与模型。')
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
        label: normalizedLabel,
        api_key: normalizedKey,
        provider: formProvider,
        model_name: formModelName,
        is_default: false,
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
    setFormProvider('')
    setFormModelName('')
    await loadLlmKeys()
    setLlmStatus('idle')
  }

  async function handleBindingChange(keyId: string, value: string) {
    const activeSession = await getSession()
    if (!activeSession) return
    setLlmStatus('loading')
    setLlmMessage(null)
    const payload: { is_default: boolean; api_key_id: string | null } = {
      is_default: false,
      api_key_id: null,
    }
    if (value === 'all') {
      payload.is_default = true
      payload.api_key_id = null
    } else if (value) {
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
      { key: 'all', label: '所有 API 密钥' },
      ...apiOptions,
    ]
  }, [apiKeys])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">记忆</p>
          <h1 className="text-2xl font-semibold text-ink">记忆策略</h1>
          <p className="text-sm text-muted">配置记忆隔离策略并管理 LLM 密钥。</p>
        </div>
      </header>

      <Card className="glass-panel">
        <CardHeader className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold">记忆隔离策略</h3>
          <p className="text-sm text-muted">默认按用户或 API 密钥隔离记忆。</p>
        </CardHeader>
        <CardBody className="space-y-4">
          <Select
            label="默认隔离范围"
            selectedKeys={new Set([defaultScope])}
            disabledKeys={allowApikeyScope ? [] : ['apikey']}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as 'user' | 'apikey'
              updateMemoryPolicy(value)
            }}
          >
            <SelectItem key="user">用户级</SelectItem>
            <SelectItem key="apikey">API 密钥级</SelectItem>
          </Select>
          {!allowApikeyScope ? (
            <p className="text-xs text-warning-500">当前套餐未启用 API 密钥隔离。</p>
          ) : null}
          {policyStatus === 'error' ? (
            <p className="text-xs text-danger-500">{policyMessage ?? '保存失败'}</p>
          ) : null}
        </CardBody>
      </Card>

      <Card className="glass-panel">
        <CardHeader className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold">LLM 密钥管理</h3>
          <p className="text-sm text-muted">添加并绑定不同的 LLM 密钥。</p>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="grid gap-3 md:grid-cols-4">
            <Input
              label="备注"
              placeholder="例如：主用 OpenAI"
              value={formLabel}
              onChange={(event) => setFormLabel(event.target.value)}
            />
            <Input
              label="LLM 密钥"
              placeholder="sk-..."
              type="password"
              value={formKey}
              onChange={(event) => setFormKey(event.target.value)}
            />
            <Select
              label="平台（provider）"
              selectedKeys={formProvider ? new Set([formProvider]) : new Set([])}
              onSelectionChange={(keys) => {
                const value = String(Array.from(keys)[0] ?? '')
                setFormProvider(value)
                setFormModelName('')
              }}
            >
              {PROVIDER_OPTIONS.map((provider) => (
                <SelectItem key={provider}>{provider}</SelectItem>
              ))}
            </Select>
            <Select
              label="模型名称（model_name）"
              isDisabled={!formProvider || !formKey.trim() || modelStatus === 'loading'}
              selectedKeys={formModelName ? new Set([formModelName]) : new Set([])}
              onSelectionChange={(keys) => {
                const value = String(Array.from(keys)[0] ?? '')
                setFormModelName(value)
              }}
            >
              {modelOptions.map((model) => (
                <SelectItem key={model}>{model}</SelectItem>
              ))}
            </Select>
          </div>
          <div>
            <Button onPress={handleAddLlmKey} className="bg-ink text-white">
              添加
            </Button>
          </div>
          {modelStatus === 'error' && modelMessage ? (
            <p className="text-xs text-danger-500">{modelMessage}</p>
          ) : null}
          {llmStatus === 'error' && llmMessage ? (
            <p className="text-xs text-danger-500">{llmMessage}</p>
          ) : null}

          {llmStatus === 'loading' ? (
            <div className="text-sm text-muted">加载中...</div>
          ) : (
            <Table removeWrapper aria-label="LLM 密钥" className="w-full">
              <TableHeader>
                <TableColumn>备注</TableColumn>
                <TableColumn>平台</TableColumn>
                <TableColumn>模型</TableColumn>
                <TableColumn className="min-w-[220px]">绑定范围</TableColumn>
                <TableColumn className="w-40">最后使用时间</TableColumn>
                <TableColumn className="w-24">操作</TableColumn>
              </TableHeader>
              <TableBody>
                {llmKeys.length === 0 ? (
                  <TableRow key="empty">
                    <TableCell>暂无 LLM 密钥</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                ) : (
                  llmKeys.map((row) => {
                    let selectedKey = 'none'
                    const isDefault = Boolean(row.is_default) || row.scope_type === 'all'
                    if (isDefault) {
                      selectedKey = 'all'
                    } else if (row.api_key_id) {
                      selectedKey = row.api_key_id
                    }
                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{row.label || row.masked_key || '未命名'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{row.provider || '-'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{row.model_name || '-'}</div>
                        </TableCell>
                        <TableCell>
                          <Select
                            aria-label="绑定范围"
                            className="min-w-[200px]"
                            selectedKeys={new Set([selectedKey])}
                            onSelectionChange={(keys) => {
                              const value = String(Array.from(keys)[0] ?? '')
                              handleBindingChange(row.id, value === 'none' ? '' : value)
                            }}
                          >
                            {scopeOptions.map((option) => (
                              <SelectItem key={option.key}>{option.label}</SelectItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell>{formatDate(row.last_used_at)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="bordered"
                            className="border-danger-300 text-danger-600"
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
