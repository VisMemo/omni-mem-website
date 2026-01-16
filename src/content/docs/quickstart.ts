import type { DocPage, CodeExample } from './types';

// =============================================================================
// Quick Start Page Content
// =============================================================================

export const quickstartPage: DocPage = {
  slug: 'quickstart',
  title: {
    en: 'Quick Start',
    zh: '快速开始',
  },
  description: {
    en: 'Get started with Omni Memory in 5 minutes. Learn how to save and search memories with just a few lines of code.',
    zh: '5 分钟快速上手 Omni Memory。只需几行代码即可保存和搜索记忆。',
  },
  sections: [
    {
      id: 'installation',
      heading: {
        en: 'Installation',
        zh: '安装',
      },
      content: {
        en: 'Install the Python SDK using pip:',
        zh: '使用 pip 安装 Python SDK：',
      },
      codeExamples: [
        {
          language: 'bash',
          code: 'pip install omem',
        },
      ],
    },
    {
      id: 'get-api-key',
      heading: {
        en: 'Get Your API Key',
        zh: '获取 API 密钥',
      },
      content: {
        en: `1. Sign up at [omnimemory.ai](https://omnimemory.ai)
2. Go to Dashboard → API Keys
3. Create a new API key (starts with \`qbk_\`)`,
        zh: `1. 在 [omnimemory.ai](https://omnimemory.ai) 注册
2. 进入控制台 → API 密钥
3. 创建新的 API 密钥（以 \`qbk_\` 开头）`,
      },
    },
    {
      id: 'configure-llm',
      heading: {
        en: 'Configure LLM Provider (Required)',
        zh: '配置 LLM 提供商（必需）',
      },
      content: {
        en: `**Important:** Before using the SDK, you must configure an LLM provider. Omni Memory uses LLMs to extract entities, events, and semantic information from your conversations.

1. Go to Dashboard → Memory Policy
2. Add your LLM key (e.g., OpenAI \`sk-...\`, DeepSeek, Qwen, etc.)
3. Select the provider and model
4. Set binding to "All API Keys" (or bind to specific keys)

Supported providers: OpenAI, OpenRouter, Qwen, GLM, Gemini, DeepSeek, Moonshot`,
        zh: `**重要提示：** 使用 SDK 之前，必须配置 LLM 提供商。Omni Memory 使用 LLM 从对话中提取实体、事件和语义信息。

1. 进入控制台 → 记忆策略
2. 添加您的 LLM 密钥（如 OpenAI \`sk-...\`、DeepSeek、通义千问等）
3. 选择平台和模型
4. 将绑定范围设置为"所有 API 密钥"（或绑定到特定密钥）

支持的提供商：OpenAI、OpenRouter、通义千问、智谱、Gemini、DeepSeek、Moonshot`,
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
3. **Search** - Query your memories`,
        zh: `只需三行代码：

1. **初始化** - 使用 API 密钥创建 Memory 实例
2. **保存** - 将对话添加到记忆中
3. **搜索** - 查询记忆`,
      },
      codeExamples: [
        {
          language: 'python',
          title: 'Python',
          code: `from omem import Memory

mem = Memory(api_key="qbk_xxx")  # That's it!

# Save a conversation
mem.add("conv-001", [
    {"role": "user", "content": "Meeting with Caroline tomorrow at West Lake"},
    {"role": "assistant", "content": "Got it, I'll remember that"},
])

# Search memories
result = mem.search("When am I going to West Lake?")
if result:
    print(result.to_prompt())  # Formatted for LLM context`,
        },
      ],
    },
    {
      id: 'whats-happening',
      heading: {
        en: "What's Happening Behind the Scenes",
        zh: '后台发生了什么',
      },
      content: {
        en: `When you call \`add()\`:
- Your conversation is sent to the Omni Memory cloud
- We extract entities, events, and semantic information
- Memories become searchable within 5-30 seconds

When you call \`search()\`:
- We find relevant memories using hybrid vector + knowledge graph search
- Results are ranked by relevance and recency
- You get structured evidence to inject into your LLM context`,
        zh: `当你调用 \`add()\` 时：
- 对话被发送到 Omni Memory 云端
- 我们提取实体、事件和语义信息
- 记忆在 5-30 秒内变得可搜索

当你调用 \`search()\` 时：
- 我们使用混合向量 + 知识图谱搜索找到相关记忆
- 结果按相关性和时间排序
- 你获得结构化的证据注入到 LLM 上下文中`,
      },
    },
    {
      id: 'agent-integration',
      heading: {
        en: 'Integrate with Your Agent',
        zh: '集成到你的 Agent',
      },
      content: {
        en: 'Here\'s a minimal pattern for adding memory to any LLM-based agent:',
        zh: '以下是将记忆添加到任何基于 LLM 的 Agent 的最简模式：',
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
      id: 'next-steps',
      heading: {
        en: 'Next Steps',
        zh: '下一步',
      },
      content: {
        en: `- [SDK Reference](/docs/sdk/python) - Full API documentation
- [API Reference](/docs/api) - HTTP API for direct integration
- [Multi-user Apps](/docs/guides/multi-user) - User isolation patterns
- [Error Handling](/docs/reference/errors) - Graceful degradation`,
        zh: `- [SDK 参考](/docs/sdk/python) - 完整 API 文档
- [API 参考](/docs/api) - HTTP API 直接集成
- [多用户应用](/docs/guides/multi-user) - 用户隔离模式
- [错误处理](/docs/reference/errors) - 优雅降级`,
      },
    },
  ],
};


