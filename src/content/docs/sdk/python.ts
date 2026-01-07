import type { DocPage, SdkClass } from '../types';

// =============================================================================
// Python SDK Reference
// =============================================================================

export const pythonSdkPage: DocPage = {
  slug: 'sdk/python',
  title: {
    en: 'Python SDK',
    zh: 'Python SDK',
  },
  description: {
    en: 'Complete reference for the omem Python SDK. Give your AI agents long-term memory.',
    zh: 'omem Python SDK 完整参考。为你的 AI Agent 赋予长期记忆。',
  },
  sections: [
    {
      id: 'installation',
      heading: {
        en: 'Installation',
        zh: '安装',
      },
      content: {
        en: 'Install the SDK using pip:',
        zh: '使用 pip 安装 SDK：',
      },
      codeExamples: [
        {
          language: 'bash',
          code: 'pip install omem',
        },
      ],
    },
    {
      id: 'requirements',
      heading: {
        en: 'Requirements',
        zh: '环境要求',
      },
      content: {
        en: `- Python 3.8+
- An API key from [qbrain.ai](https://qbrain.ai)`,
        zh: `- Python 3.8+
- 来自 [qbrain.ai](https://qbrain.ai) 的 API 密钥`,
      },
    },
  ],
};

// =============================================================================
// Memory Class Reference
// =============================================================================

export const memoryClass: SdkClass = {
  name: 'Memory',
  description: {
    en: 'Main class for interacting with the Omni Memory service. Handles conversation storage and semantic search.',
    zh: '与 Omni Memory 服务交互的主类。处理对话存储和语义搜索。',
  },
  constructor: {
    parameters: [
      {
        name: 'api_key',
        type: 'str',
        required: true,
        description: {
          en: 'Your API key (starts with `qbk_`). Get one at qbrain.ai.',
          zh: '你的 API 密钥（以 `qbk_` 开头）。在 qbrain.ai 获取。',
        },
      },
      {
        name: 'user_id',
        type: 'str | None',
        required: false,
        default: 'None',
        description: {
          en: 'User identifier for memory isolation in multi-user apps.',
          zh: '用于多用户应用中记忆隔离的用户标识符。',
        },
      },
      {
        name: 'endpoint',
        type: 'str | None',
        required: false,
        default: 'Cloud service',
        description: {
          en: 'Override service endpoint for self-hosted deployments.',
          zh: '自托管部署时覆盖服务端点。',
        },
      },
      {
        name: 'timeout_s',
        type: 'float',
        required: false,
        default: '30.0',
        description: {
          en: 'Request timeout in seconds.',
          zh: '请求超时秒数。',
        },
      },
    ],
    example: {
      language: 'python',
      title: 'Initialization Examples',
      code: `from omem import Memory

# Minimal - just API key
mem = Memory(api_key="qbk_xxx")

# With user isolation (for multi-user apps)
mem = Memory(api_key="qbk_xxx", user_id="user-123")

# Self-hosted deployment
mem = Memory(
    api_key="your-token",
    endpoint="https://my-server.com/api/v1/memory"
)`,
    },
  },
  methods: [
    {
      name: 'add',
      signature: 'add(conversation_id: str, messages: list[dict]) -> None',
      description: {
        en: 'Save a conversation to memory. Fire-and-forget - returns immediately while processing happens asynchronously.',
        zh: '将对话保存到记忆中。即发即忘 - 立即返回，处理在后台异步进行。',
      },
      parameters: [
        {
          name: 'conversation_id',
          type: 'str',
          required: true,
          description: {
            en: 'Unique identifier for the conversation.',
            zh: '对话的唯一标识符。',
          },
        },
        {
          name: 'messages',
          type: 'list[dict]',
          required: true,
          description: {
            en: 'List of messages in OpenAI format (role, content).',
            zh: 'OpenAI 格式的消息列表（role, content）。',
          },
        },
      ],
      returns: {
        type: 'None',
        description: {
          en: 'Returns immediately. Memories become searchable after 5-30 seconds of backend processing.',
          zh: '立即返回。记忆在后台处理 5-30 秒后可被搜索。',
        },
      },
      example: {
        language: 'python',
        code: `# Save a complete conversation
mem.add("conv-001", [
    {"role": "user", "content": "Book a meeting tomorrow at 3pm"},
    {"role": "assistant", "content": "Done! Meeting scheduled for tomorrow at 3pm."},
    {"role": "user", "content": "Thanks!"},
])

# Note: Call once per conversation (not per message) for best results`,
      },
    },
    {
      name: 'search',
      signature: 'search(query: str, *, limit: int = 10, fail_silent: bool = False) -> SearchResult',
      description: {
        en: 'Search memories using natural language. Returns strongly-typed results with relevance scores.',
        zh: '使用自然语言搜索记忆。返回带有相关性分数的强类型结果。',
      },
      parameters: [
        {
          name: 'query',
          type: 'str',
          required: true,
          description: {
            en: 'Natural language search question.',
            zh: '自然语言搜索问题。',
          },
        },
        {
          name: 'limit',
          type: 'int',
          required: false,
          default: '10',
          description: {
            en: 'Maximum number of results to return.',
            zh: '最多返回的结果数量。',
          },
        },
        {
          name: 'fail_silent',
          type: 'bool',
          required: false,
          default: 'False',
          description: {
            en: 'If True, return empty result on error instead of raising exception.',
            zh: '如果为 True，出错时返回空结果而不是抛出异常。',
          },
        },
      ],
      returns: {
        type: 'SearchResult',
        description: {
          en: 'Search results with truthy check, iteration, and LLM formatting support.',
          zh: '支持真值检查、迭代和 LLM 格式化的搜索结果。',
        },
      },
      example: {
        language: 'python',
        code: `result = mem.search("meeting with Caroline")

# Check if results exist
if result:
    # Iterate over results
    for item in result:
        print(f"[{item.score:.2f}] {item.text}")
    
    # Format for LLM context injection
    prompt = result.to_prompt()

# For agent robustness - never raises
result = mem.search("query", fail_silent=True)`,
      },
    },
    {
      name: 'conversation',
      signature: 'conversation(conversation_id: str) -> Conversation',
      description: {
        en: 'Create a conversation buffer for incremental message collection. Useful when messages arrive one at a time.',
        zh: '创建对话缓冲区用于增量消息收集。适用于消息逐条到达的场景。',
      },
      parameters: [
        {
          name: 'conversation_id',
          type: 'str',
          required: true,
          description: {
            en: 'Unique identifier for the conversation.',
            zh: '对话的唯一标识符。',
          },
        },
      ],
      returns: {
        type: 'Conversation',
        description: {
          en: 'A conversation buffer that can be used as a context manager.',
          zh: '可用作上下文管理器的对话缓冲区。',
        },
      },
      example: {
        language: 'python',
        code: `# Option 1: Context manager (auto-commits on exit)
with mem.conversation("conv-001") as conv:
    conv.add({"role": "user", "content": "Hello"})
    conv.add({"role": "assistant", "content": "Hi there!"})
# Auto-commits here

# Option 2: Manual control
conv = mem.conversation("conv-001")
conv.add({"role": "user", "content": "First message"})
conv.add({"role": "assistant", "content": "Reply"})
result = conv.commit()  # Returns AddResult with job_id`,
      },
    },
  ],
};

// =============================================================================
// Error Handling
// =============================================================================

export const errorHandlingSection: DocPage['sections'][0] = {
  id: 'error-handling',
  heading: {
    en: 'Error Handling',
    zh: '错误处理',
  },
  content: {
    en: `The SDK is designed with agent robustness in mind: **memory service failures should not break your agent's conversation flow.**

### Exception Types

| Exception | Description |
|-----------|-------------|
| \`OmemClientError\` | Base exception for all SDK errors |
| \`OmemRateLimitError\` | Rate limit exceeded (has \`retry_after_s\` attribute) |

### Graceful Degradation Pattern`,
    zh: `SDK 的设计原则是保证 Agent 健壮性：**记忆服务故障不应中断 Agent 的对话流程。**

### 异常类型

| 异常 | 描述 |
|------|------|
| \`OmemClientError\` | 所有 SDK 错误的基类 |
| \`OmemRateLimitError\` | 超出速率限制（包含 \`retry_after_s\` 属性） |

### 优雅降级模式`,
  },
  codeExamples: [
    {
      language: 'python',
      title: 'Graceful Degradation',
      code: `from omem import Memory, OmemClientError, OmemRateLimitError

mem = Memory(api_key="qbk_xxx")

# Option 1: fail_silent for search (recommended for agents)
result = mem.search("query", fail_silent=True)
# Returns empty SearchResult on error, never raises

# Option 2: try-except for explicit handling
try:
    mem.add("conv", messages)
except OmemRateLimitError as e:
    print(f"Rate limited. Retry after {e.retry_after_s}s")
except OmemClientError as e:
    print(f"Memory error: {e}")
    # Continue conversation without memory`,
    },
  ],
};

// =============================================================================
// Multi-User Apps
// =============================================================================

export const multiUserSection: DocPage['sections'][0] = {
  id: 'multi-user',
  heading: {
    en: 'Multi-User Applications',
    zh: '多用户应用',
  },
  content: {
    en: `Each user can have their own isolated memory space. Simply pass \`user_id\` during initialization:`,
    zh: `每个用户可以拥有独立的记忆空间。只需在初始化时传入 \`user_id\`：`,
  },
  codeExamples: [
    {
      language: 'python',
      code: `# Create isolated memory instances for different users
mem_alice = Memory(api_key="qbk_xxx", user_id="alice")
mem_bob = Memory(api_key="qbk_xxx", user_id="bob")

# Each user's memories are isolated
mem_alice.add("conv-1", [{"role": "user", "content": "I love coffee"}])
mem_bob.add("conv-1", [{"role": "user", "content": "I love tea"}])

# Searches are scoped to each user
mem_alice.search("what do I like?")  # → coffee
mem_bob.search("what do I like?")    # → tea`,
    },
  ],
};

