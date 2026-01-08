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
  is_managed?: boolean | null
  status?: string | null
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
  const [modelStatus, setModelStatus] = useState<'idle' | 'loading' | 'error' | (string & {})>('idle')
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
      setLlmMessage(data?.message ?? '操作失败')
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
      setLlmMessage(data?.message ?? '操作失败')
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
      setLlmMessage(data?.message ?? '操作失败')
      return
    }
    await loadLlmKeys()
    setLlmStatus('idle')
  }

  async function handleManagedKeyToggle(keyId: string, action: 'disable' | 'enable') {
    const activeSession = await getSession()
    if (!activeSession) return
    setLlmStatus('loading')
    setLlmMessage(null)
    const response = await fetch(`${apiBaseUrl}/llm-keys/${keyId}/${action}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeSession.access_token}`,
        'X-Principal-User-Id': activeSession.user.id,
      },
    })
    const data = (await response.json()) as { message?: string }
    if (!response.ok) {
      setLlmStatus('error')
      setLlmMessage(data?.message ?? '操作失败')
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
    <div className="space-y-8">
            <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">记忆</p>
        <h1 className="text-2xl font-semibold text-ink">记忆策略</h1>
        <p className="text-sm text-ink/60">配置记忆隔离策略并管理 LLM 密钥。</p>
      </header>

      <section className="space-y-6">
        <div className="rounded-xl bg-white/70 p-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-ink">记忆隔离策略</h2>
            <p className="text-sm text-ink/60">
              设置默认隔离范围，决定按用户还是 API 密钥隔离记忆。
            </p>
          </div>
          <div className="mt-4 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
              默认隔离范围
            </label>
            <select
              className="h-9 w-full rounded-md border border-ink/10 bg-white/80 px-3 text-sm"
              value={defaultScope}
              onChange={(event) => {
                const value = event.target.value as 'user' | 'apikey'
                setDefaultScope(value)
                updateMemoryPolicy(value)
              }}
            >
              <option value="user">用户级</option>
              <option value="apikey" disabled={!allowApikeyScope}>
                API 密钥级
              </option>
            </select>
            {!allowApikeyScope ? (
              <p className="text-xs text-amber-600">当前套餐未启用 API 密钥隔离。</p>
            ) : null}
            {policyStatus === 'error' ? (
              <p className="text-xs text-red-600">{policyMessage ?? '保存失败'}</p>
            ) : null}
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="rounded-md bg-ink px-4 py-2 text-xs font-semibold text-ivory"
              onClick={handleAddLlmKey}
              disabled={llmStatus === 'loading'}
            >
              添加
            </button>
          </div>

          {modelStatus === 'error' && modelMessage ? (
            <p className="mt-2 text-xs text-red-600">{modelMessage}</p>
          ) : null}
          {llmStatus === 'error' && llmMessage ? (
            <p className="mt-2 text-xs text-red-600">{llmMessage}</p>
          ) : null}

          {llmStatus === 'loading' ? (
            <div className="mt-4 text-sm text-ink/60">加载中...</div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-lg bg-white/60">
              <table className="w-full text-sm">
                                <thead className="bg-ink/5 text-xs uppercase tracking-[0.12em] text-ink/60">
                  <tr>
                    <th className="px-4 py-3 text-left">备注</th>
                    <th className="px-4 py-3 text-left">平台</th>
                    <th className="px-4 py-3 text-left">模型</th>
                    <th className="px-4 py-3 text-left">绑定范围</th>
                    <th className="px-4 py-3 text-left">最后使用时间</th>
                    <th className="px-4 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {llmKeys.length === 0 ? (
                    <tr>
                      <td className="px-4 py-3 text-ink/60" colSpan={6}>暂无 LLM 密钥</td>
                    </tr>
                  ) : (
                    llmKeys.map((row) => {
                      const isManaged = Boolean(row.is_managed)
                      let selectedKey = 'none'
                      const isDefault = Boolean(row.is_default) || row.scope_type === 'all'
                      if (isDefault) {
                        selectedKey = 'all'
                      } else if (row.api_key_id) {
                        selectedKey = row.api_key_id
                      }
                      if (isManaged) {
                        selectedKey = 'all'
                      }
                      const providerLabel = isManaged ? 'Omni' : row.provider || '-'
                      const modelLabel = isManaged ? '自动' : row.model_name || '-'
                      const managedAction =
                        row.status && row.status !== 'active' ? 'enable' : 'disable'
                      const managedLabel =
                        row.status && row.status !== 'active' ? '恢复' : '停用'
                      return (
                        <tr key={row.id} className="border-t border-ink/5">
                          <td className="px-4 py-3 font-medium">
                            {row.label || row.masked_key || '未命名'}
                          </td>
                          <td className="px-4 py-3 text-ink/60">{providerLabel}</td>
                          <td className="px-4 py-3 text-ink/60">{modelLabel}</td>
                          <td className="px-4 py-3">
                            {isManaged ? (
                              <div className="text-sm text-ink/60">所有未指定API密钥</div>
                            ) : (
                              <select
                                className="h-9 w-full rounded-md border border-ink/10 bg-white/80 px-3 text-sm"
                                value={selectedKey}
                                onChange={(event) => {
                                  const value = event.target.value
                                  handleBindingChange(row.id, value === 'none' ? '' : value)
                                }}
                              >
                                {scopeOptions.map((option) => (
                                  <option key={option.key} value={option.key}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="px-4 py-3 text-ink/60">{formatDate(row.last_used_at)}</td>
                          <td className="px-4 py-3 text-right">
                            {isManaged ? (
                              <button
                                type="button"
                                className={
                                  managedAction === 'disable'
                                    ? 'rounded-md border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50'
                                    : 'rounded-md border border-emerald-300 px-3 py-1 text-xs text-emerald-600 hover:bg-emerald-50'
                                }
                                onClick={() => handleManagedKeyToggle(row.id, managedAction)}
                                disabled={llmStatus === 'loading'}
                              >
                                {managedLabel}
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteKey(row.id)}
                              >
                                删除
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}






