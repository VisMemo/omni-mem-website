import type { ApiEndpoint } from '../types';

// =============================================================================
// Memory API Endpoints (Public)
// =============================================================================

export const ingestEndpoint: ApiEndpoint = {
  method: 'POST',
  path: '/api/v1/memory/ingest',
  title: {
    en: 'Save Conversation',
    zh: '保存对话',
  },
  description: {
    en: 'Save a conversation to memory. The conversation will be processed asynchronously and become searchable within 5-30 seconds.',
    zh: '将对话保存到记忆中。对话将异步处理，并在 5-30 秒内可被搜索。',
  },
  auth: 'api_key',
  requestBody: {
    contentType: 'application/json',
    parameters: [
      {
        name: 'session_id',
        type: 'string',
        required: false,
        description: {
          en: 'Unique conversation identifier. Auto-generated if not provided.',
          zh: '对话唯一标识。如未提供则自动生成。',
        },
      },
      {
        name: 'turns',
        type: 'Turn[]',
        required: true,
        description: {
          en: 'Array of conversation messages. Each turn must have `role` and `content` (or `text`).',
          zh: '对话消息数组。每条消息必须包含 `role` 和 `content`（或 `text`）。',
        },
      },
      {
        name: 'memory_domain',
        type: 'string',
        required: false,
        default: '"dialog"',
        description: {
          en: 'Business domain for memory isolation (e.g., "dialog", "notes", "coding").',
          zh: '用于记忆隔离的业务域（如 "dialog"、"notes"、"coding"）。',
        },
      },
      {
        name: 'commit_id',
        type: 'string',
        required: false,
        description: {
          en: 'Idempotency key. Same commit_id returns the same job_id without reprocessing.',
          zh: '幂等键。相同的 commit_id 会返回相同的 job_id，不会重复处理。',
        },
      },
    ],
    example: `{
  "session_id": "conv-001",
  "turns": [
    { "role": "user", "content": "Book a meeting tomorrow at 3pm" },
    { "role": "assistant", "content": "Done! Meeting scheduled for tomorrow at 3pm." }
  ]
}`,
  },
  responses: [
    {
      status: 200,
      description: {
        en: 'Conversation accepted for processing.',
        zh: '对话已接受处理。',
      },
      example: `{
  "code": "ok",
  "data": {
    "job_id": "job_abc123",
    "session_id": "conv-001"
  }
}`,
    },
    {
      status: 400,
      description: {
        en: 'Invalid request. Check that `turns` is provided and non-empty.',
        zh: '请求无效。请检查 `turns` 是否已提供且非空。',
      },
      example: `{
  "code": "invalid_request",
  "message": "turns is required and must be non-empty"
}`,
    },
    {
      status: 401,
      description: {
        en: 'Invalid or missing API key.',
        zh: 'API 密钥无效或缺失。',
      },
    },
  ],
  codeExamples: [
    {
      language: 'python',
      title: 'Python SDK',
      code: `from omem import Memory

mem = Memory(api_key="qbk_xxx")
mem.add("conv-001", [
    {"role": "user", "content": "Book a meeting tomorrow at 3pm"},
    {"role": "assistant", "content": "Done! Meeting scheduled."},
])`,
    },
    {
      language: 'curl',
      title: 'cURL',
      code: `curl -X POST "https://api.qbrain.ai/api/v1/memory/ingest" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: qbk_xxx" \\
  -d '{
    "session_id": "conv-001",
    "turns": [
      {"role": "user", "content": "Book a meeting tomorrow at 3pm"},
      {"role": "assistant", "content": "Done! Meeting scheduled."}
    ]
  }'`,
    },
  ],
};

export const retrievalEndpoint: ApiEndpoint = {
  method: 'POST',
  path: '/api/v1/memory/retrieval',
  title: {
    en: 'Search Memories',
    zh: '搜索记忆',
  },
  description: {
    en: 'Search for relevant memories using natural language. Returns ranked results with relevance scores.',
    zh: '使用自然语言搜索相关记忆。返回按相关性排序的结果。',
  },
  auth: 'api_key',
  requestBody: {
    contentType: 'application/json',
    parameters: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: {
          en: 'Natural language search query.',
          zh: '自然语言搜索查询。',
        },
      },
      {
        name: 'topk',
        type: 'integer',
        required: false,
        default: '10',
        description: {
          en: 'Maximum number of results to return (1-50).',
          zh: '最多返回的结果数量（1-50）。',
        },
      },
      {
        name: 'memory_domain',
        type: 'string',
        required: false,
        description: {
          en: 'Filter by business domain.',
          zh: '按业务域过滤。',
        },
      },
    ],
    example: `{
  "query": "When is my next meeting?",
  "topk": 5
}`,
  },
  responses: [
    {
      status: 200,
      description: {
        en: 'Search results with relevance scores.',
        zh: '带有相关性分数的搜索结果。',
      },
      example: `{
  "code": "ok",
  "data": {
    "items": [
      {
        "text": "User booked a meeting tomorrow at 3pm",
        "score": 0.92,
        "metadata": {
          "session_id": "conv-001",
          "timestamp": "2025-01-07T10:30:00Z"
        }
      }
    ]
  }
}`,
    },
    {
      status: 400,
      description: {
        en: 'Invalid request. Check that `query` is provided.',
        zh: '请求无效。请检查 `query` 是否已提供。',
      },
    },
    {
      status: 401,
      description: {
        en: 'Invalid or missing API key.',
        zh: 'API 密钥无效或缺失。',
      },
    },
  ],
  codeExamples: [
    {
      language: 'python',
      title: 'Python SDK',
      code: `from omem import Memory

mem = Memory(api_key="qbk_xxx")
result = mem.search("When is my next meeting?")

if result:
    for item in result:
        print(f"[{item.score:.2f}] {item.text}")
    
    # Format for LLM context injection
    prompt = result.to_prompt()`,
    },
    {
      language: 'curl',
      title: 'cURL',
      code: `curl -X POST "https://api.qbrain.ai/api/v1/memory/retrieval" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: qbk_xxx" \\
  -d '{
    "query": "When is my next meeting?",
    "topk": 5
  }'`,
    },
  ],
};

// =============================================================================
// Turn Schema (for documentation)
// =============================================================================

export const turnSchema = {
  title: {
    en: 'Turn Object',
    zh: 'Turn 对象',
  },
  description: {
    en: 'A single message in a conversation.',
    zh: '对话中的单条消息。',
  },
  fields: [
    {
      name: 'role',
      type: 'string',
      required: true,
      description: {
        en: 'Message role: "user", "assistant", "system", or "tool".',
        zh: '消息角色："user"、"assistant"、"system" 或 "tool"。',
      },
    },
    {
      name: 'content',
      type: 'string',
      required: true,
      description: {
        en: 'Message content. Use `text` as an alias.',
        zh: '消息内容。可使用 `text` 作为别名。',
      },
    },
    {
      name: 'turn_id',
      type: 'string',
      required: false,
      description: {
        en: 'Stable identifier for this turn. Recommended for evidence tracing.',
        zh: '此轮消息的稳定标识符。建议用于证据追踪。',
      },
    },
    {
      name: 'timestamp_iso',
      type: 'string',
      required: false,
      description: {
        en: 'ISO 8601 timestamp. Recommended for temporal queries.',
        zh: 'ISO 8601 时间戳。建议用于时间查询。',
      },
    },
  ],
};

// Export all memory endpoints
export const memoryEndpoints = [ingestEndpoint, retrievalEndpoint];

