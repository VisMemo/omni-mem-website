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
      throw new Error(data?.message ?? '鍔犺浇璁板繂绛栫暐澶辫触')
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
      throw new Error(data?.message ?? '鍔犺浇 LLM 瀵嗛挜澶辫触')
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
      throw new Error(data?.message ?? '鍔犺浇 API 瀵嗛挜澶辫触')
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
        setModelMessage(data?.message ?? '鍔犺浇妯″瀷鍒楄〃澶辫触')
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
      setPolicyMessage('褰撳墠濂楅鏈惎鐢?API 瀵嗛挜闅旂銆?)
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
      setPolicyMessage(data?.message ?? '淇濆瓨澶辫触')
      return
    }
    setDefaultScope(nextScope)
    setPolicyStatus('idle')
  }

  async function handleAddLlmKey() {
    const normalizedLabel = formLabel.trim()
    const normalizedKey = formKey.trim()
    if (!normalizedLabel) {
      setLlmMessage('璇峰～鍐欏娉紙label锛夈€?)
      setLlmStatus('error')
      return
    }
    const normalizedLower = normalizedLabel.toLowerCase()
    if (llmKeys.some((item) => (item.label ?? '').trim().toLowerCase() === normalizedLower)) {
      setLlmMessage('澶囨敞锛坙abel锛夊凡瀛樺湪锛岃鏇存崲銆?)
      setLlmStatus('error')
      return
    }
    if (!normalizedKey || !formProvider || !formModelName) {
      setLlmMessage('璇峰～鍐?LLM 瀵嗛挜锛屽苟閫夋嫨骞冲彴涓庢ā鍨嬨€?)
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
      setLlmMessage(data?.message ?? '娣诲姞澶辫触')
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
      setLlmMessage(data?.message ?? '鏇存柊澶辫触')
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
      setLlmMessage(data?.message ?? '鍒犻櫎澶辫触')
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
      setLlmMessage(data?.message ?? '閹垮秳缍旀径杈Е')
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
      { key: 'none', label: '鏈惎鐢? },
      { key: 'all', label: '鎵€鏈?API 瀵嗛挜' },
      ...apiOptions,
    ]
  }, [apiKeys])

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">璁板繂</p>
        <h1 className="text-2xl font-semibold text-ink">璁板繂绛栫暐</h1>
        <p className="text-sm text-ink/60">閰嶇疆璁板繂闅旂绛栫暐骞剁鐞?LLM 瀵嗛挜銆?/p>
      </header>

      <section className="space-y-6">
        <div className="rounded-xl bg-white/70 p-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-ink">璁板繂闅旂绛栫暐</h2>
            <p className="text-sm text-ink/60">
              璁剧疆榛樿闅旂鑼冨洿锛屽喅瀹氭寜鐢ㄦ埛杩樻槸 API 瀵嗛挜闅旂璁板繂銆?            </p>
          </div>
          <div className="mt-4 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
              榛樿闅旂鑼冨洿
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
              <option value="user">鐢ㄦ埛绾?/option>
              <option value="apikey" disabled={!allowApikeyScope}>
                API 瀵嗛挜绾?              </option>
            </select>
            {!allowApikeyScope ? (
              <p className="text-xs text-amber-600">褰撳墠濂楅鏈惎鐢?API 瀵嗛挜闅旂銆?/p>
            ) : null}
            {policyStatus === 'error' ? (
              <p className="text-xs text-red-600">{policyMessage ?? '淇濆瓨澶辫触'}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="mt-4 rounded-md bg-ink px-4 py-2 text-xs font-semibold text-ivory"
            onClick={() => updateMemoryPolicy(defaultScope)}
          >
            淇濆瓨绛栫暐
          </button>
        </div>

        <div className="rounded-xl bg-white/70 p-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-ink">LLM 瀵嗛挜绠＄悊</h2>
            <p className="text-sm text-ink/60">所有未指定API密钥</div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
                澶囨敞
              </label>
              <input
                className="h-9 w-full rounded-md border border-ink/10 bg-white/80 px-3 text-sm"
                placeholder="渚嬪锛氫富鐢?OpenAI"
                value={formLabel}
                onChange={(event) => setFormLabel(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
                LLM 瀵嗛挜
              </label>
              <input
                className="h-9 w-full rounded-md border border-ink/10 bg-white/80 px-3 text-sm"
                placeholder="sk-..."
                type="password"
                value={formKey}
                onChange={(event) => setFormKey(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
                骞冲彴
              </label>
              <select
                className="h-9 w-full rounded-md border border-ink/10 bg-white/80 px-3 text-sm"
                value={formProvider}
                onChange={(event) => {
                  setFormProvider(event.target.value)
                  setFormModelName('')
                }}
              >
                <option value="">璇烽€夋嫨</option>
                {PROVIDER_OPTIONS.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
                妯″瀷鍚嶇О
              </label>
              <select
                className="h-9 w-full rounded-md border border-ink/10 bg-white/80 px-3 text-sm"
                value={formModelName}
                onChange={(event) => setFormModelName(event.target.value)}
                disabled={!formProvider || !formKey.trim() || modelStatus === 'loading'}
              >
                <option value="">璇烽€夋嫨</option>
                {modelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              className="rounded-md bg-ink px-4 py-2 text-xs font-semibold text-ivory"
              onClick={handleAddLlmKey}
              disabled={llmStatus === 'loading'}
            >
              娣诲姞
            </button>
          </div>

          {modelStatus === 'error' && modelMessage ? (
            <p className="mt-2 text-xs text-red-600">{modelMessage}</p>
          ) : null}
          {llmStatus === 'error' && llmMessage ? (
            <p className="mt-2 text-xs text-red-600">{llmMessage}</p>
          ) : null}

          {llmStatus === 'loading' ? (
            <div className="mt-4 text-sm text-ink/60">所有未指定API密钥</div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-lg bg-white/60">
              <table className="w-full text-sm">
                <thead className="bg-ink/5 text-xs uppercase tracking-[0.12em] text-ink/60">
                  <tr>
                    <th className="px-4 py-3 text-left">澶囨敞</th>
                    <th className="px-4 py-3 text-left">骞冲彴</th>
                    <th className="px-4 py-3 text-left">妯″瀷</th>
                    <th className="px-4 py-3 text-left">缁戝畾鑼冨洿</th>
                    <th className="px-4 py-3 text-left">鏈€鍚庝娇鐢ㄦ椂闂?/th>
                    <th className="px-4 py-3 text-right">鎿嶄綔</th>
                  </tr>
                </thead>
                <tbody>
                  {llmKeys.length === 0 ? (
                    <tr>
                      <td className="px-4 py-3 text-ink/60" colSpan={6}>
                        鏆傛棤 LLM 瀵嗛挜
                      </td>
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
                      const modelLabel = isManaged ? '鑷姩' : row.model_name || '-'
                      const managedAction =
                        row.status && row.status !== 'active' ? 'enable' : 'disable'
                      const managedLabel =
                        row.status && row.status !== 'active' ? '鎭㈠' : '鍋滅敤'
                      return (
                        <tr key={row.id} className="border-t border-ink/5">
                          <td className="px-4 py-3 font-medium">
                            {row.label || row.masked_key || '鏈懡鍚?}
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
                                鍒犻櫎
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

