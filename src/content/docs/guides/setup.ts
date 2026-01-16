import type { DocPage } from '../types';

// =============================================================================
// Setup Guide - API Keys & BYOK LLM Configuration
// =============================================================================

export const setupGuidePage: DocPage = {
  slug: 'guides/setup',
  title: {
    en: 'Account Setup',
    zh: '账户设置',
  },
  description: {
    en: 'Complete guide to setting up your Omni Memory account: create API keys and configure your LLM provider.',
    zh: '完整的 Omni Memory 账户设置指南：创建 API 密钥并配置 LLM 提供商。',
  },
  sections: [
    {
      id: 'overview',
      heading: {
        en: 'Overview',
        zh: '概述',
      },
      content: {
        en: `Before using Omni Memory, you need to complete two setup steps:

1. **Create an API Key** — Authenticates your SDK/API calls
2. **Configure an LLM Provider (BYOK)** — Powers entity extraction and knowledge processing

Both steps take about 2 minutes total.`,
        zh: `在使用 Omni Memory 之前，您需要完成两个设置步骤：

1. **创建 API 密钥** — 用于 SDK/API 调用的身份验证
2. **配置 LLM 提供商 (BYOK)** — 驱动实体提取和知识处理

两个步骤总共大约需要 2 分钟。`,
      },
    },
    {
      id: 'create-account',
      heading: {
        en: 'Step 1: Create Your Account',
        zh: '第一步：创建账户',
      },
      content: {
        en: `1. Go to [omnimemory.ai](https://omnimemory.ai) and click **Sign Up**
2. Enter your email and create a password
3. Verify your email address
4. You'll be redirected to the Dashboard`,
        zh: `1. 访问 [omnimemory.ai](https://omnimemory.ai) 并点击**注册**
2. 输入您的邮箱并创建密码
3. 验证您的邮箱地址
4. 您将被重定向到控制台`,
      },
    },
    {
      id: 'create-api-key',
      heading: {
        en: 'Step 2: Create an API Key',
        zh: '第二步：创建 API 密钥',
      },
      content: {
        en: `Your API key authenticates all SDK and API requests. Each key starts with \`qbk_\`.

### How to Create

1. Go to **Dashboard → API Keys** (or click "API 密钥" in the sidebar)
2. Click **Create New Key** (创建新密钥)
3. Enter a descriptive label (e.g., "Production", "Development", "My Agent")
4. Click **Create**
5. **Copy the key immediately** — it won't be shown again!

### Best Practices

- **Use separate keys for dev/prod** — Easier debugging and usage tracking
- **Never commit keys to git** — Use environment variables instead
- **Rotate keys periodically** — Security hygiene
- **Label keys descriptively** — Know which app uses which key

### Example Usage

\`\`\`python
import os
from omem import Memory

# Load from environment variable (recommended)
mem = Memory(api_key=os.environ["OMEM_API_KEY"])

# Or directly (for testing only)
mem = Memory(api_key="qbk_your_key_here")
\`\`\``,
        zh: `API 密钥用于验证所有 SDK 和 API 请求。每个密钥以 \`qbk_\` 开头。

### 如何创建

1. 进入**控制台 → API 密钥**（或点击侧边栏的"API 密钥"）
2. 点击**创建新密钥**
3. 输入描述性标签（如"生产环境"、"开发环境"、"我的 Agent"）
4. 点击**创建**
5. **立即复制密钥** — 它不会再次显示！

### 最佳实践

- **为开发/生产使用不同密钥** — 更容易调试和追踪用量
- **不要将密钥提交到 git** — 使用环境变量代替
- **定期轮换密钥** — 安全习惯
- **使用描述性标签** — 知道哪个应用使用哪个密钥

### 使用示例

\`\`\`python
import os
from omem import Memory

# 从环境变量加载（推荐）
mem = Memory(api_key=os.environ["OMEM_API_KEY"])

# 或直接使用（仅用于测试）
mem = Memory(api_key="qbk_your_key_here")
\`\`\``,
      },
    },
    {
      id: 'why-llm-required',
      heading: {
        en: 'Step 3: Why LLM Configuration is Required',
        zh: '第三步：为什么需要配置 LLM',
      },
      content: {
        en: `Omni Memory uses LLMs to process your conversations and extract structured knowledge:

- **Entities** — People, places, organizations
- **Events** — Meetings, trips, deadlines
- **Relationships** — Connections between entities
- **Temporal Info** — Dates, times, durations

**Without an LLM configured, you'll see this error:**

\`\`\`
OmemValidationError: http_400: Missing required data for core ingest
{"missing": ["llm_api_key", "llm_provider", "llm_model"]}
\`\`\`

### BYOK (Bring Your Own Key)

We use a **BYOK model** — you provide your own LLM API key. This means:

- ✅ **You control costs** — Pay your LLM provider directly
- ✅ **You choose the model** — Use GPT-4, DeepSeek, Qwen, etc.
- ✅ **No vendor lock-in** — Switch providers anytime
- ✅ **Data privacy** — Your LLM key, your terms`,
        zh: `Omni Memory 使用 LLM 处理您的对话并提取结构化知识：

- **实体** — 人物、地点、组织
- **事件** — 会议、旅行、截止日期
- **关系** — 实体之间的连接
- **时间信息** — 日期、时间、持续时间

**如果没有配置 LLM，您会看到此错误：**

\`\`\`
OmemValidationError: http_400: Missing required data for core ingest
{"missing": ["llm_api_key", "llm_provider", "llm_model"]}
\`\`\`

### BYOK（自带密钥）

我们使用 **BYOK 模式** — 您提供自己的 LLM API 密钥。这意味着：

- ✅ **您控制成本** — 直接向 LLM 提供商付费
- ✅ **您选择模型** — 使用 GPT-4、DeepSeek、通义千问等
- ✅ **无供应商锁定** — 随时切换提供商
- ✅ **数据隐私** — 您的 LLM 密钥，您的条款`,
      },
    },
    {
      id: 'configure-llm',
      heading: {
        en: 'Step 4: Configure Your LLM Provider',
        zh: '第四步：配置 LLM 提供商',
      },
      content: {
        en: `### Supported Providers

| Provider | Models | Get API Key |
|----------|--------|-------------|
| **OpenAI** | gpt-4o, gpt-4o-mini, gpt-4-turbo | [platform.openai.com](https://platform.openai.com/api-keys) |
| **DeepSeek** | deepseek-chat, deepseek-coder | [platform.deepseek.com](https://platform.deepseek.com/) |
| **Qwen (通义千问)** | qwen-turbo, qwen-plus, qwen-max | [dashscope.console.aliyun.com](https://dashscope.console.aliyun.com/) |
| **GLM (智谱)** | glm-4, glm-4-flash | [open.bigmodel.cn](https://open.bigmodel.cn/) |
| **Gemini** | gemini-pro, gemini-1.5-pro | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **Moonshot (月之暗面)** | moonshot-v1-8k, moonshot-v1-32k | [platform.moonshot.cn](https://platform.moonshot.cn/) |
| **OpenRouter** | Various models | [openrouter.ai](https://openrouter.ai/keys) |

### How to Add Your LLM Key

1. Go to **Dashboard → Memory Policy** (记忆策略)
2. Scroll to **"Add LLM Key"** (添加 LLM 密钥) section
3. Fill in the form:
   - **Label** (备注) — A name to identify this key (e.g., "My OpenAI Key")
   - **LLM Key** (LLM 密钥) — Your API key from the provider (e.g., \`sk-proj-xxx...\`)
   - **Provider** (平台) — Select from dropdown (e.g., OpenAI)
   - **Model** (模型名称) — Auto-loads after selecting provider (e.g., gpt-4o-mini)
4. Click **Add** (添加)
5. Set **Binding Scope** (绑定范围):
   - **All API Keys** (所有 API 密钥) — This LLM key is used for all your Omni Memory API keys (recommended for most users)
   - **Specific API Key** — Only used when that specific API key makes requests

### Recommended Setup

For most users, we recommend:

- **Provider:** OpenAI or DeepSeek (best balance of quality/cost)
- **Model:** gpt-4o-mini or deepseek-chat (cost-effective, good extraction)
- **Binding:** All API Keys (simplest setup)`,
        zh: `### 支持的提供商

| 提供商 | 模型 | 获取 API 密钥 |
|--------|------|---------------|
| **OpenAI** | gpt-4o, gpt-4o-mini, gpt-4-turbo | [platform.openai.com](https://platform.openai.com/api-keys) |
| **DeepSeek** | deepseek-chat, deepseek-coder | [platform.deepseek.com](https://platform.deepseek.com/) |
| **通义千问** | qwen-turbo, qwen-plus, qwen-max | [dashscope.console.aliyun.com](https://dashscope.console.aliyun.com/) |
| **智谱 GLM** | glm-4, glm-4-flash | [open.bigmodel.cn](https://open.bigmodel.cn/) |
| **Gemini** | gemini-pro, gemini-1.5-pro | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **月之暗面** | moonshot-v1-8k, moonshot-v1-32k | [platform.moonshot.cn](https://platform.moonshot.cn/) |
| **OpenRouter** | 多种模型 | [openrouter.ai](https://openrouter.ai/keys) |

### 如何添加 LLM 密钥

1. 进入**控制台 → 记忆策略**
2. 滚动到**"添加 LLM 密钥"**部分
3. 填写表单：
   - **备注** — 用于识别此密钥的名称（如"我的 OpenAI 密钥"）
   - **LLM 密钥** — 来自提供商的 API 密钥（如 \`sk-proj-xxx...\`）
   - **平台** — 从下拉菜单选择（如 OpenAI）
   - **模型名称** — 选择平台后自动加载（如 gpt-4o-mini）
4. 点击**添加**
5. 设置**绑定范围**：
   - **所有 API 密钥** — 此 LLM 密钥用于您所有的 Omni Memory API 密钥（大多数用户推荐）
   - **特定 API 密钥** — 仅在该特定 API 密钥发出请求时使用

### 推荐设置

对于大多数用户，我们推荐：

- **平台：** OpenAI 或 DeepSeek（质量/成本最佳平衡）
- **模型：** gpt-4o-mini 或 deepseek-chat（性价比高，提取效果好）
- **绑定：** 所有 API 密钥（最简单的设置）`,
      },
    },
    {
      id: 'verify-setup',
      heading: {
        en: 'Step 5: Verify Your Setup',
        zh: '第五步：验证设置',
      },
      content: {
        en: `Run this quick test to verify everything is configured correctly:

\`\`\`python
from omem import Memory

mem = Memory(api_key="qbk_your_key_here")

# Test: Save a conversation
mem.add("test-conv-001", [
    {"role": "user", "content": "Meeting with Alice tomorrow at 3pm"},
    {"role": "assistant", "content": "Got it, I'll remember that."},
])

print("✅ Setup successful! Memory saved.")

# Wait ~10 seconds for processing, then search
import time
time.sleep(10)

result = mem.search("meeting with Alice")
if result:
    print(f"✅ Search works! Found {len(result.items)} results")
    print(result.to_prompt())
else:
    print("⏳ No results yet - try again in a few seconds")
\`\`\`

### Expected Output

\`\`\`
✅ Setup successful! Memory saved.
✅ Search works! Found 1 results
[Memory]
- Meeting with Alice tomorrow at 3pm
\`\`\`

### Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| \`Missing required data for core ingest\` | No LLM configured | Add LLM key in Memory Policy |
| \`OmemAuthError: http_401\` | Invalid API key | Check your \`qbk_\` key is correct |
| \`OmemForbiddenError: http_403\` | Key disabled or expired | Create a new API key |
| \`OmemRateLimitError: http_429\` | Too many requests | Wait and retry, or upgrade plan |
| Search returns empty | Processing not complete | Wait 10-30 seconds after \`add()\` |`,
        zh: `运行此快速测试以验证一切配置正确：

\`\`\`python
from omem import Memory

mem = Memory(api_key="qbk_your_key_here")

# 测试：保存对话
mem.add("test-conv-001", [
    {"role": "user", "content": "明天下午3点和 Alice 开会"},
    {"role": "assistant", "content": "好的，我记住了。"},
])

print("✅ 设置成功！记忆已保存。")

# 等待约10秒处理，然后搜索
import time
time.sleep(10)

result = mem.search("和 Alice 开会")
if result:
    print(f"✅ 搜索有效！找到 {len(result.items)} 条结果")
    print(result.to_prompt())
else:
    print("⏳ 暂无结果 - 几秒后重试")
\`\`\`

### 预期输出

\`\`\`
✅ 设置成功！记忆已保存。
✅ 搜索有效！找到 1 条结果
[Memory]
- 明天下午3点和 Alice 开会
\`\`\`

### 故障排除

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| \`Missing required data for core ingest\` | 未配置 LLM | 在记忆策略中添加 LLM 密钥 |
| \`OmemAuthError: http_401\` | API 密钥无效 | 检查 \`qbk_\` 密钥是否正确 |
| \`OmemForbiddenError: http_403\` | 密钥已禁用或过期 | 创建新的 API 密钥 |
| \`OmemRateLimitError: http_429\` | 请求过多 | 等待后重试，或升级计划 |
| 搜索返回空 | 处理未完成 | 在 \`add()\` 后等待 10-30 秒 |`,
      },
    },
    {
      id: 'advanced-binding',
      heading: {
        en: 'Advanced: Multiple LLM Keys',
        zh: '高级：多个 LLM 密钥',
      },
      content: {
        en: `You can configure multiple LLM keys for different use cases. For example:

**Use Case 1: Different Models for Dev vs Prod**
- Dev API key → Use cheaper model (gpt-4o-mini)
- Prod API key → Use better model (gpt-4o)

**Use Case 2: Cost Optimization**
- High-volume agent → Use DeepSeek (cheap)
- Premium users → Use OpenAI (best quality)

### How to Set Up

1. Add multiple LLM keys in Memory Policy
2. For each LLM key, change **Binding Scope** from "All API Keys" to a specific API key
3. Requests using that API key will use the bound LLM`,
        zh: `您可以为不同用例配置多个 LLM 密钥。例如：

**用例 1：开发环境和生产环境使用不同模型**
- 开发 API 密钥 → 使用更便宜的模型（gpt-4o-mini）
- 生产 API 密钥 → 使用更好的模型（gpt-4o）

**用例 2：成本优化**
- 高流量 Agent → 使用 DeepSeek（便宜）
- 高级用户 → 使用 OpenAI（最佳质量）

### 如何设置

1. 在记忆策略中添加多个 LLM 密钥
2. 对于每个 LLM 密钥，将**绑定范围**从"所有 API 密钥"更改为特定 API 密钥
3. 使用该 API 密钥的请求将使用绑定的 LLM`,
      },
    },
    {
      id: 'next-steps',
      heading: {
        en: 'Next Steps',
        zh: '下一步',
      },
      content: {
        en: `You're all set! Here's what to do next:

- 📚 [Python SDK Reference](/docs/sdk/python) — Full API documentation
- 🤖 [Agent Integration](/docs/guides/agent) — Add memory to your LLM agent
- 👥 [Multi-Speaker Conversations](/docs/guides/multi-speaker) — Handle group chats
- ❓ [Error Codes](/docs/reference/errors) — Troubleshoot issues`,
        zh: `设置完成！接下来可以：

- 📚 [Python SDK 参考](/docs/sdk/python) — 完整 API 文档
- 🤖 [Agent 集成](/docs/guides/agent) — 为您的 LLM Agent 添加记忆
- 👥 [多说话人对话](/docs/guides/multi-speaker) — 处理群聊
- ❓ [错误码](/docs/reference/errors) — 问题排查`,
      },
    },
  ],
};
