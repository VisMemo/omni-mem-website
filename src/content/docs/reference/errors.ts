import type { DocPage } from '../types';

// =============================================================================
// Error Reference
// =============================================================================

export const errorsPage: DocPage = {
  slug: 'reference/errors',
  title: {
    en: 'Error Codes',
    zh: '错误码',
  },
  description: {
    en: 'Complete reference for API error codes and how to handle them.',
    zh: 'API 错误码完整参考及处理方式。',
  },
  sections: [
    {
      id: 'overview',
      heading: {
        en: 'Overview',
        zh: '概述',
      },
      content: {
        en: `The API uses standard HTTP status codes. Errors include a \`code\` field for programmatic handling and a \`message\` field for debugging.

**Response format:**
\`\`\`json
{
  "code": "invalid_request",
  "message": "query is required and must be non-empty"
}
\`\`\``,
        zh: `API 使用标准 HTTP 状态码。错误包含用于程序处理的 \`code\` 字段和用于调试的 \`message\` 字段。

**响应格式：**
\`\`\`json
{
  "code": "invalid_request",
  "message": "query is required and must be non-empty"
}
\`\`\``,
      },
    },
    {
      id: 'http-codes',
      heading: {
        en: 'HTTP Status Codes',
        zh: 'HTTP 状态码',
      },
      content: {
        en: `| Code | Meaning | What to Do |
|------|---------|------------|
| **400** | Bad Request | Check request body/params |
| **401** | Unauthorized | Check API key |
| **402** | Payment Required | Check balance/quota |
| **403** | Forbidden | Check permissions |
| **404** | Not Found | Check resource ID |
| **409** | Conflict | Resolve conflict (e.g., duplicate) |
| **413** | Payload Too Large | Reduce request size |
| **429** | Rate Limited | Wait and retry (see Retry-After header) |
| **500** | Server Error | Retry with backoff |
| **503** | Service Unavailable | Retry with backoff |
| **504** | Gateway Timeout | Retry with smaller request |`,
        zh: `| 状态码 | 含义 | 处理方式 |
|--------|------|----------|
| **400** | 请求无效 | 检查请求体/参数 |
| **401** | 未授权 | 检查 API 密钥 |
| **402** | 需要付款 | 检查余额/配额 |
| **403** | 禁止访问 | 检查权限 |
| **404** | 未找到 | 检查资源 ID |
| **409** | 冲突 | 解决冲突（如重复） |
| **413** | 请求体过大 | 减小请求大小 |
| **429** | 速率限制 | 等待后重试（参见 Retry-After 头） |
| **500** | 服务器错误 | 指数退避重试 |
| **503** | 服务不可用 | 指数退避重试 |
| **504** | 网关超时 | 减小请求后重试 |`,
      },
    },
    {
      id: 'error-codes',
      heading: {
        en: 'Error Codes',
        zh: '错误码',
      },
      content: {
        en: `| Code | HTTP | Description |
|------|------|-------------|
| \`invalid_request\` | 400 | Missing or invalid parameters |
| \`invalid_api_key\` | 401 | API key is invalid or revoked |
| \`missing_api_key\` | 401 | No API key provided |
| \`insufficient_balance\` | 402 | Account balance too low |
| \`quota_exceeded\` | 402 | Usage quota exceeded |
| \`forbidden\` | 403 | Action not allowed |
| \`not_found\` | 404 | Resource doesn't exist |
| \`conflict\` | 409 | Resource already exists |
| \`rate_limit_exceeded\` | 429 | Too many requests |
| \`internal_error\` | 500 | Server error |`,
        zh: `| 错误码 | HTTP | 描述 |
|--------|------|------|
| \`invalid_request\` | 400 | 参数缺失或无效 |
| \`invalid_api_key\` | 401 | API 密钥无效或已撤销 |
| \`missing_api_key\` | 401 | 未提供 API 密钥 |
| \`insufficient_balance\` | 402 | 账户余额不足 |
| \`quota_exceeded\` | 402 | 超出使用配额 |
| \`forbidden\` | 403 | 不允许的操作 |
| \`not_found\` | 404 | 资源不存在 |
| \`conflict\` | 409 | 资源已存在 |
| \`rate_limit_exceeded\` | 429 | 请求过多 |
| \`internal_error\` | 500 | 服务器错误 |`,
      },
    },
    {
      id: 'retry-strategy',
      heading: {
        en: 'Retry Strategy',
        zh: '重试策略',
      },
      content: {
        en: `**Retryable errors:** 429, 500, 503, 504

**Recommended approach:**
1. Use exponential backoff: 1s → 2s → 4s → 8s
2. Respect \`Retry-After\` header when present
3. Maximum 3-5 retries
4. Non-retryable errors (4xx except 429) should not be retried`,
        zh: `**可重试的错误：** 429、500、503、504

**推荐方案：**
1. 使用指数退避：1s → 2s → 4s → 8s
2. 存在 \`Retry-After\` 头时遵循其值
3. 最多重试 3-5 次
4. 不可重试的错误（除 429 外的 4xx）不应重试`,
      },
      codeExamples: [
        {
          language: 'python',
          title: 'Retry with backoff',
          code: `import time
from omem import Memory, OmemRateLimitError, OmemClientError

def search_with_retry(mem: Memory, query: str, max_retries: int = 3):
    for attempt in range(max_retries):
        try:
            return mem.search(query)
        except OmemRateLimitError as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(e.retry_after_s or (2 ** attempt))
        except OmemClientError:
            raise  # Don't retry client errors
    return None`,
        },
      ],
    },
  ],
};

