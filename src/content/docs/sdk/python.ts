import type { DocPage, SdkClass } from '../types';

// =============================================================================
// Python SDK Quick Start (Combined quickstart + SDK reference)
// =============================================================================

export const pythonSdkPage: DocPage = {
  slug: 'sdk/python',
  title: {
    en: 'Python SDK Quick Start',
    zh: 'Python SDK 快速开始',
  },
  description: {
    en: 'Get started with Omni Memory in 5 minutes. Give your AI agents long-term memory with just a few lines of code.',
    zh: '5 分钟快速上手 Omni Memory。只需几行代码即可为你的 AI Agent 赋予长期记忆。',
  },
  sections: [
    {
      id: 'installation',
      heading: {
        en: 'Installation',
        zh: '安装',
      },
      content: {
        en: `Install the SDK using pip:`,
        zh: `使用 pip 安装 SDK：`,
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
- An API key from [omnimemory.ai](https://omnimemory.ai)

**Get Your API Key:**
1. Sign up at [omnimemory.ai](https://omnimemory.ai)
2. Go to Dashboard → API Keys
3. Create a new API key (starts with \`qbk_\`)`,
        zh: `- Python 3.8+
- 来自 [omnimemory.ai](https://omnimemory.ai) 的 API 密钥

**获取 API 密钥：**
1. 在 [omnimemory.ai](https://omnimemory.ai) 注册
2. 进入控制台 → API 密钥
3. 创建新的 API 密钥（以 \`qbk_\` 开头）`,
      },
    },
    {
      id: 'basic-usage',
      heading: {
        en: 'Basic Usage (30 seconds)',
        zh: '基本用法（30 秒上手）',
      },
      content: {
        en: `Three lines of code is all you need:

1. **Initialize** - Create a Memory instance with your API key
2. **Save** - Add conversations to memory
3. **Search** - Query your memories

:::warning
**Async Processing:** \`add()\` returns immediately (fire-and-forget). The backend takes **5-30 seconds** to process memories before they're searchable. If you need to search right after adding, use \`wait=True\`.
:::`,
        zh: `只需三行代码：

1. **初始化** - 使用 API 密钥创建 Memory 实例
2. **保存** - 将对话添加到记忆中
3. **搜索** - 查询记忆

:::warning
**异步处理：** \`add()\` 会立即返回（即发即忘）。后端需要 **5-30 秒** 处理记忆才能被搜索到。如需立即搜索，请使用 \`wait=True\`。
:::`,
      },
      codeExamples: [
        {
          language: 'python',
          title: 'Python',
          code: `from omem import Memory

mem = Memory(api_key="qbk_xxx")  # That's it!

# Save a conversation (returns immediately, processing is async)
mem.add("conv-001", [
    {"role": "user", "content": "Meeting with Caroline tomorrow at West Lake"},
    {"role": "assistant", "content": "Got it, I'll remember that"},
])

# ⚠️ Wait 5-30 seconds for processing, OR use wait=True (see below)
# Search memories
result = mem.search("When am I going to West Lake?")
if result:
    print(result.to_prompt())  # Formatted for LLM context`,
        },
      ],
    },
    {
      id: 'initialization',
      heading: {
        en: 'Initialization Options',
        zh: '初始化选项',
      },
      content: {
        en: `The Memory class supports several initialization options:

- **api_key** (required): Your API key starting with \`qbk_\`
- **user_id** (optional): User identifier for memory isolation in multi-user apps
- **endpoint** (optional): Override service endpoint for self-hosted deployments
- **timeout_s** (optional): Request timeout in seconds (default: 30.0)`,
        zh: `Memory 类支持多种初始化选项：

- **api_key**（必填）：以 \`qbk_\` 开头的 API 密钥
- **user_id**（可选）：用于多用户应用中记忆隔离的用户标识符
- **endpoint**（可选）：自托管部署时覆盖服务端点
- **timeout_s**（可选）：请求超时秒数（默认：30.0）`,
      },
      codeExamples: [
        {
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
      ],
    },
    {
      id: 'add-method',
      heading: {
        en: 'Saving Conversations',
        zh: '保存对话',
      },
      content: {
        en: `Use \`add()\` to save conversations to memory.

:::info
**Default Behavior (Fire-and-Forget):** \`add()\` returns \`None\` immediately. Processing happens asynchronously on the backend (5-30 seconds). This is ideal for production agents where you don't need to search immediately after adding.

**Blocking Mode:** Use \`wait=True\` to block until processing completes. Returns a \`JobStatus\` object. Use this for testing or when you need immediate searchability.
:::

**Parameters:**
- **conversation_id** (str): Unique identifier for the conversation
- **messages** (list): Messages in OpenAI format (role, content, optional name)
- **wait** (bool): If True, block until backend processing completes (default: False)
- **timeout_s** (float): Timeout in seconds when wait=True (default: 30.0)`,
        zh: `使用 \`add()\` 将对话保存到记忆中。

:::info
**默认行为（即发即忘）：** \`add()\` 立即返回 \`None\`。处理在后端异步进行（5-30 秒）。这适用于不需要在添加后立即搜索的生产环境 Agent。

**阻塞模式：** 使用 \`wait=True\` 阻塞直到处理完成。返回 \`JobStatus\` 对象。用于测试或需要立即搜索的场景。
:::

**参数：**
- **conversation_id** (str)：对话的唯一标识符
- **messages** (list)：OpenAI 格式的消息列表（role, content，可选 name）
- **wait** (bool)：若为 True，则阻塞直到后端处理完成（默认：False）
- **timeout_s** (float)：wait=True 时的超时时间（秒）（默认：30.0）`,
      },
      codeExamples: [
        {
          language: 'python',
          code: `# ============================================================
# Option 1: Fire-and-forget (DEFAULT - recommended for agents)
# ============================================================
# Returns immediately, processing happens async (5-30 seconds)
mem.add("conv-001", [
    {"role": "user", "name": "Caroline", "content": "Hey Mel! How have you been?"},
    {"role": "user", "name": "Melanie", "content": "Hey Caroline! I'm swamped with work."},
])
# ⚠️ Searching immediately after will return EMPTY results!
# Wait 5-30 seconds, or use wait=True

# ============================================================
# Option 2: Wait for completion (for testing / immediate search)
# ============================================================
result = mem.add("conv-002", messages, wait=True, timeout_s=60.0)
if result and result.completed:
    # Now safe to search immediately
    found = mem.search("yesterday meeting")
    print(found.to_prompt())`,
        },
      ],
    },
    {
      id: 'search-method',
      heading: {
        en: 'Searching Memories',
        zh: '搜索记忆',
      },
      content: {
        en: `Use \`search()\` to find relevant memories using natural language.

**Parameters:**
- **query** (str): Natural language search question
- **limit** (int): Maximum results to return (default: 10)
- **fail_silent** (bool): Return empty result on error instead of raising (recommended for agents)`,
        zh: `使用 \`search()\` 通过自然语言搜索相关记忆。

**参数：**
- **query** (str)：自然语言搜索问题
- **limit** (int)：最多返回的结果数量（默认：10）
- **fail_silent** (bool)：出错时返回空结果而不是抛出异常（推荐用于 Agent）`,
      },
      codeExamples: [
        {
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
      ],
    },
    {
      id: 'agent-integration',
      heading: {
        en: 'Agent Integration Pattern',
        zh: 'Agent 集成模式',
      },
      content: {
        en: `Here's a minimal pattern for adding memory to any LLM-based agent:`,
        zh: `以下是将记忆添加到任何基于 LLM 的 Agent 的最简模式：`,
      },
      codeExamples: [
        {
          language: 'python',
          title: 'Agent Integration Pattern',
          code: `from omem import Memory

class MyAgent:
    def __init__(self, api_key: str, user_id: str = None):
        self.mem = Memory(api_key=api_key, user_id=user_id)
        self.messages = []

    def chat(self, user_input: str) -> str:
        # 1. Record user message
        self.messages.append({"role": "user", "content": user_input})

        # 2. Search relevant memories
        memory_context = ""
        result = self.mem.search(user_input, fail_silent=True)
        if result:
            memory_context = f"\\n\\n[Relevant Memories]\\n{result.to_prompt()}"

        # 3. Call LLM with memory context
        response = your_llm.chat(
            system=f"You are a helpful assistant.{memory_context}",
            messages=self.messages,
        )

        # 4. Record assistant response
        self.messages.append({"role": "assistant", "content": response})
        return response

    def end_conversation(self):
        # 5. Save conversation to memory when done
        if self.messages:
            self.mem.add(f"conv-{uuid4()}", self.messages)
            self.messages = []`,
        },
      ],
    },
    {
      id: 'error-handling',
      heading: {
        en: 'Error Handling',
        zh: '错误处理',
      },
      content: {
        en: `The SDK is designed with agent robustness in mind: **memory service failures should not break your agent's conversation flow.**

**Exception Types:**
- \`OmemClientError\` - Base exception for all SDK errors
- \`OmemRateLimitError\` - Rate limit exceeded (has \`retry_after_s\` attribute)`,
        zh: `SDK 的设计原则是保证 Agent 健壮性：**记忆服务故障不应中断 Agent 的对话流程。**

**异常类型：**
- \`OmemClientError\` - 所有 SDK 错误的基类
- \`OmemRateLimitError\` - 超出速率限制（包含 \`retry_after_s\` 属性）`,
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
    },
    {
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
    },
    {
      id: 'advanced-features',
      heading: {
        en: 'Advanced: TKG Features',
        zh: '高级：TKG 功能',
      },
      content: {
        en: `The SDK exposes the Temporal Knowledge Graph (TKG) for advanced use cases:

- **explain_event(item)** - Get full context for a search result (entities, knowledge, places)
- **get_entity_history(entity)** - Get all utterances related to an entity
- **get_evidence_for(item)** - Get source evidence for a specific result

These are useful for citing sources, debugging knowledge, and building grounded responses.`,
        zh: `SDK 公开了时序知识图谱（TKG）用于高级用例：

- **explain_event(item)** - 获取搜索结果的完整上下文（实体、知识、地点）
- **get_entity_history(entity)** - 获取与实体相关的所有话语
- **get_evidence_for(item)** - 获取特定结果的源证据

这些功能对于引用来源、调试知识和构建有根据的响应非常有用。`,
      },
      codeExamples: [
        {
          language: 'python',
          title: 'TKG Example',
          code: `result = mem.search("Caroline support group", limit=1)
item = result.items[0]

# Get full TKG context
ctx = mem.explain_event(item)
if ctx:
    print(f"Entities: {ctx.entities}")
    for k in ctx.knowledge:
        print(f"Fact: {k.summary}")

# Get entity history
history = mem.get_entity_history("Caroline", limit=10)
for e in history:
    print(f"[{e.timestamp}] {e.text}")`,
        },
      ],
    },
    {
      id: 'next-steps',
      heading: {
        en: 'Next Steps',
        zh: '下一步',
      },
      content: {
        en: `- [Core Concepts](/docs/concepts) - Understand how memory works
- [Agent Integration Guide](/docs/guides/agent) - Detailed integration patterns
- [Multi-Speaker Guide](/docs/guides/multi-speaker) - Handle group conversations
- [Error Handling](/docs/reference/errors) - Graceful degradation patterns
- [API Reference](/docs/api/memory) - HTTP API for other languages
- [GitHub Repository](omnimemory.ai) - Source code and examples`,
        zh: `- [核心概念](/docs/concepts) - 了解记忆如何工作
- [Agent 集成指南](/docs/guides/agent) - 详细的集成模式
- [多说话人指南](/docs/guides/multi-speaker) - 处理群组对话
- [错误处理](/docs/reference/errors) - 优雅降级模式
- [API 参考](/docs/api/memory) - 其他语言的 HTTP API
- [GitHub 仓库](omnimemory.ai) - 源代码和示例`,
      },
    },
  ],
};

// =============================================================================
// Memory Class Reference (exported for detailed API docs)
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
          en: 'Your API key (starts with `qbk_`). Get one at omnimemory.ai.',
          zh: '你的 API 密钥（以 `qbk_` 开头）。在 omnimemory.ai 获取。',
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
mem = Memory(api_key="qbk_xxx", user_id="user-123")`,
    },
  },
  methods: [],
};

// Keep exports for backwards compatibility
export const errorHandlingSection = pythonSdkPage.sections.find(s => s.id === 'error-handling')!;
export const multiUserSection = pythonSdkPage.sections.find(s => s.id === 'multi-user')!;
export const tkgFeaturesSection = pythonSdkPage.sections.find(s => s.id === 'advanced-features')!;
