import type { DocPage } from '../types';

// =============================================================================
// Limits & Rate Limits Reference
// =============================================================================

export const limitsPage: DocPage = {
  slug: 'reference/limits',
  title: {
    en: 'Limits & Rate Limits',
    zh: '限制与速率限制',
  },
  description: {
    en: 'API limits, rate limits, and performance guidelines.',
    zh: 'API 限制、速率限制和性能指南。',
  },
  sections: [
    {
      id: 'rate-limits',
      heading: {
        en: 'Rate Limits',
        zh: '速率限制',
      },
      content: {
        en: `| Endpoint | Limit | Window |
|----------|-------|--------|
| \`/memory/ingest\` | 100 req | per minute |
| \`/memory/retrieval\` | 300 req | per minute |
| \`/apikeys\` | 60 req | per minute |
| \`/uploads/direct\` | 20 req | per minute |

When rate limited, the API returns **429 Too Many Requests** with a \`Retry-After\` header indicating seconds to wait.`,
        zh: `| 端点 | 限制 | 时间窗口 |
|------|------|----------|
| \`/memory/ingest\` | 100 次 | 每分钟 |
| \`/memory/retrieval\` | 300 次 | 每分钟 |
| \`/apikeys\` | 60 次 | 每分钟 |
| \`/uploads/direct\` | 20 次 | 每分钟 |

触发速率限制时，API 返回 **429 Too Many Requests**，并在 \`Retry-After\` 头中指示等待秒数。`,
      },
    },
    {
      id: 'payload-limits',
      heading: {
        en: 'Payload Limits',
        zh: '请求体限制',
      },
      content: {
        en: `| Limit | Value |
|-------|-------|
| Max request body | 10 MB |
| Max turns per ingest | 1000 |
| Max content per turn | 32 KB |
| Max file upload size | 50 MB |
| Max query length | 4 KB |`,
        zh: `| 限制 | 值 |
|------|-----|
| 最大请求体 | 10 MB |
| 每次 ingest 最大轮次 | 1000 |
| 每轮最大内容 | 32 KB |
| 最大文件上传大小 | 50 MB |
| 最大查询长度 | 4 KB |`,
      },
    },
    {
      id: 'timeouts',
      heading: {
        en: 'Timeouts',
        zh: '超时',
      },
      content: {
        en: `| Operation | Timeout |
|-----------|---------|
| Ingest | 30s |
| Retrieval | 15s |
| File upload | 60s |

SDK default timeout is 30 seconds, configurable via \`timeout_s\` parameter.`,
        zh: `| 操作 | 超时 |
|------|------|
| Ingest | 30s |
| Retrieval | 15s |
| 文件上传 | 60s |

SDK 默认超时为 30 秒，可通过 \`timeout_s\` 参数配置。`,
      },
    },
    {
      id: 'processing-times',
      heading: {
        en: 'Processing Times',
        zh: '处理时间',
      },
      content: {
        en: `**Memory ingestion is asynchronous.** After calling \`add()\` or \`/memory/ingest\`:

- Memories become searchable within **5-30 seconds**
- Complex conversations may take longer to extract entities
- File uploads are processed in background (check status via \`/uploads/:id\`)

**Tip:** Save conversations at the end of a session, not after each message.`,
        zh: `**记忆摄取是异步的。** 调用 \`add()\` 或 \`/memory/ingest\` 后：

- 记忆在 **5-30 秒内** 变得可搜索
- 复杂对话的实体提取可能需要更长时间
- 文件上传在后台处理（通过 \`/uploads/:id\` 检查状态）

**提示：** 在会话结束时保存对话，而不是每条消息后都保存。`,
      },
    },
  ],
};


