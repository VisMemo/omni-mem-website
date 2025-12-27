import { getApiEnv } from './env'

interface ApiRequestParams {
  path: string
  method?: string
  body?: unknown
  token?: string | null
}

export async function apiRequest<T>({
  path,
  method = 'GET',
  body,
  token,
}: ApiRequestParams): Promise<T> {
  const { apiBaseUrl } = getApiEnv()
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) return {} as T
  return (await response.json()) as T
}
