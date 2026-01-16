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
      id: 'setup',
      heading: {
        en: 'Set Up Your Account (One-Time)',
        zh: '设置账户（一次性）',
      },
      content: {
        en: `Before using the SDK, complete these one-time setup steps:

1. **Sign up** at [omnimemory.ai](https://omnimemory.ai)
2. **Create an API Key** — Dashboard → API Keys → Create New (starts with \`qbk_\`)
3. **Configure LLM** — Dashboard → Memory Policy → Add your LLM key (e.g., OpenAI \`sk-...\`)

⚠️ **LLM configuration is required!** Without it, you'll get a "Missing required data" error.

👉 **[Detailed Setup Guide](/docs/guides/setup)** — Step-by-step instructions with troubleshooting`,
        zh: `使用 SDK 之前，请完成以下一次性设置步骤：

1. **注册** [omnimemory.ai](https://omnimemory.ai)
2. **创建 API 密钥** — 控制台 → API 密钥 → 创建新密钥（以 \`qbk_\` 开头）
3. **配置 LLM** — 控制台 → 记忆策略 → 添加您的 LLM 密钥（如 OpenAI \`sk-...\`）

⚠️ **LLM 配置是必需的！** 没有它，您会收到"缺少必需数据"错误。

👉 **[详细设置指南](/docs/guides/setup)** — 包含故障排除的分步说明`,
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
        en: `- [Account Setup Guide](/docs/guides/setup) - API keys & LLM configuration (BYOK)
- [SDK Reference](/docs/sdk/python) - Full API documentation
- [Agent Integration](/docs/guides/agent) - Add memory to your LLM agent
- [Error Handling](/docs/reference/errors) - Graceful degradation`,
        zh: `- [账户设置指南](/docs/guides/setup) - API 密钥和 LLM 配置 (BYOK)
- [SDK 参考](/docs/sdk/python) - 完整 API 文档
- [Agent 集成](/docs/guides/agent) - 为 LLM Agent 添加记忆
- [错误处理](/docs/reference/errors) - 优雅降级`,
      },
    },
  ],
};


