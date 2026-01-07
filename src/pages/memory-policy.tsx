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

const PROVIDER_MODELS: Record<string, string[]> = {
  openai: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'o1-preview',
    'o1-mini',
    'text-embedding-3-small',
  ],
  anthropic: [
    'claude-3-7-sonnet',
    'claude-3-5-sonnet',
    'claude-3-5-haiku',
    'claude-3-opus',
    'claude-3-sonnet',
    'claude-3-haiku',
  ],
  google: [
    'gemini/gemini-1.5-pro',
    'gemini/gemini-1.5-flash',
    'gemini/gemini-2.0-flash-exp',
    'vertex_ai/gemini-1.5-pro',
  ],
  azure: ['azure/gpt-4o', 'azure/gpt-4-turbo', 'azure/gpt-35-turbo'],
  aws_bedrock: [
    'bedrock/anthropic.claude-3-5-sonnet-v2:0',
    'bedrock/meta.llama3-1-70b-instruct-v1:0',
    'bedrock/amazon.nova-pro-v1:0',
    'bedrock/cohere.command-r-plus-v1:0',
  ],
  groq: [
    'groq/llama-3.1-70b-versatile',
    'groq/llama-3.1-8b-instant',
    'groq/mixtral-8x7b-32768',
    'groq/gemma2-9b-it',
  ],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  mistral: [
    'mistral/mistral-large-latest',
    'mistral/mistral-small-latest',
    'mistral/codestral-latest',
  ],
  openrouter: [
    'openrouter/anthropic/claude-3.5-sonnet',
    'openrouter/google/gemini-pro-1.5',
    'openrouter/meta-llama/llama-3.1-405b',
  ],
  ollama: ['ollama/llama3', 'ollama/mistral', 'ollama/phi3', 'ollama/qwen2'],
  together_ai: [
    'together_ai/meta-llama/Llama-3.1-70b-instruct-turbo',
    'together_ai/Qwen/Qwen2.5-72B-Instruct',
  ],
  perplexity: [
    'perplexity/llama-3.1-sonar-huge-128k-online',
    'perplexity/llama-3.1-sonar-large-128k-chat',
  ],
}

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
      throw new Error(data?.message ?? '加载通用设置失败')
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
    if (nextScope === 'apikey' && !allowApikeyScope) {
      setPolicyStatus('error')
      setPolicyMessage('API key scope is not enabled for the current plan.')
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
      setLlmMessage('请填写备注（label）')
      setLlmStatus('error')
      return
    }
    const normalizedLower = normalizedLabel.toLowerCase()
    if (
      llmKeys.some((item) => (item.label ?? '').trim().toLowerCase() === normalizedLower)
    ) {
      setLlmMessage('备注（label）已存在，请更换')
      setLlmStatus('error')
      return
    }
    if (!normalizedKey || !formProvider || !formModelName) {
      setLlmMessage('请填写 LLM Key，并选择平台与模型')
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
              disabledKeys={allowApikeyScope ? [] : ['apikey']}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as 'user' | 'apikey'
                updateMemoryPolicy(value)
              }}
            >
              <SelectItem key="user">用户级</SelectItem>
              <SelectItem key="apikey">API Key 级</SelectItem>
            </Select>
            {!allowApikeyScope ? (
              <p className="text-xs text-warning-500">
                API key scope is disabled for the current plan.
              </p>
            ) : null}
            {policyStatus === 'error' ? (
              <p className="text-xs text-danger-500">{policyMessage ?? '保存失败'}</p>
            ) : null}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">LLM Key 设置</p>
              <p className="text-xs text-muted">添加并绑定不同的 LLM Key。</p>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
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
              <Select
                label="平台（provider）"
                selectedKeys={formProvider ? new Set([formProvider]) : new Set([])}
                onSelectionChange={(keys) => {
                  const value = String(Array.from(keys)[0] ?? '')
                  setFormProvider(value)
                  setFormModelName('')
                }}
              >
                {Object.keys(PROVIDER_MODELS).map((provider) => (
                  <SelectItem key={provider}>{provider}</SelectItem>
                ))}
              </Select>
              <Select
                label="模型名称（model_name）"
                isDisabled={!formProvider}
                selectedKeys={formModelName ? new Set([formModelName]) : new Set([])}
                onSelectionChange={(keys) => {
                  const value = String(Array.from(keys)[0] ?? '')
                  setFormModelName(value)
                }}
              >
                {(PROVIDER_MODELS[formProvider] ?? []).map((model) => (
                  <SelectItem key={model}>{model}</SelectItem>
                ))}
              </Select>
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
          <p className="text-sm text-muted">选择绑定范围，或删除。</p>
        </CardHeader>
        <CardBody>
          {llmStatus === 'loading' ? (
            <div className="text-sm text-muted">加载中...</div>
          ) : (
            <Table removeWrapper aria-label="LLM Keys" className="w-full">
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
                    <TableCell>暂无 LLM Key</TableCell>
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
                              <SelectItem key={option.key}>
                                {option.label}
                              </SelectItem>
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
