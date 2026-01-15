import type { DocPage } from '../types';

// =============================================================================
// Agent Integration Guide
// =============================================================================

export const agentIntegrationPage: DocPage = {
  slug: 'guides/agent',
  title: {
    en: 'Agent Integration',
    zh: '代理集成',
  },
  description: {
    en: 'Add long-term memory to your LLM-based agent with three simple hooks.',
    zh: '通过三个简单的钩子为基于 LLM 的代理添加长期记忆。',
  },
  sections: [
    {
      id: 'core-concepts',
      heading: {
        en: 'Core Concepts',
        zh: '核心概念',
      },
      content: {
        en: `You only need to remember 5 terms:

- **turn** - A single message (user input, AI response, or tool output)
- **session** - A conversation window, identified by \`session_id\`
- **append** - Add each turn to a local buffer (no network call yet)
- **commit** - Submit buffered turns to the server when conversation ends
- **retrieve** - Search for relevant memories before AI responds

**One-liner summary:** Append every turn, retrieve before LLM calls, commit when done.`,
        zh: `你只需要记住 5 个术语：

- **turn** - 一条消息（用户输入、AI 回复或工具输出）
- **session** - 一个对话窗口，由 \`session_id\` 标识
- **append** - 将每个 turn 追加到本地缓冲区（暂不发网络请求）
- **commit** - 对话结束时将缓冲的 turns 提交到服务器
- **retrieve** - 在 AI 响应前搜索相关记忆

**一句话总结：** 每个 turn 都 append，LLM 调用前 retrieve，结束时 commit。`,
      },
    },
    {
      id: 'three-hooks',
      heading: {
        en: 'Three Hooks Pattern',
        zh: '三钩子模式',
      },
      content: {
        en: `Think of the SDK as three hooks in your agent:

1. **on_message** (every user/AI/tool message) → \`session.append_turn(...)\`
2. **before_llm_call** (preparing to call LLM) → \`client.retrieve(...)\`
3. **on_session_close** (conversation ends) → \`session.commit()\`

This pattern ensures your agent has context from past conversations while keeping memory failures from breaking the conversation flow.`,
        zh: `将 SDK 视为代理中的三个钩子：

1. **on_message**（每次用户/AI/工具消息）→ \`session.append_turn(...)\`
2. **before_llm_call**（准备调用 LLM）→ \`client.retrieve(...)\`
3. **on_session_close**（对话结束）→ \`session.commit()\`

此模式确保代理具有来自过去对话的上下文，同时防止记忆故障中断对话流程。`,
      },
    },
    {
      id: 'basic-pattern',
      heading: {
        en: 'Minimal Integration',
        zh: '最小集成',
      },
      content: {
        en: `Here's a minimal example of adding memory to any LLM agent:`,
        zh: `以下是为任何 LLM 代理添加记忆的最小示例：`,
      },
      codeExamples: [
        {
          language: 'python',
          title: 'Agent with Memory',
          code: `from omem import Memory
from uuid import uuid4

class MyAgent:
    def __init__(self, api_key: str):
        self.mem = Memory(api_key=api_key)
        self.messages = []
        self.session_id = f"conv-{uuid4()}"

    def chat(self, user_input: str) -> str:
        # 1. Record user message
        self.messages.append({"role": "user", "content": user_input})

        # 2. Search for relevant memories (fail_silent for robustness)
        memory_context = ""
        result = self.mem.search(user_input, fail_silent=True)
        if result:
            memory_context = f"\\n\\n[Memories]\\n{result.to_prompt()}"

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
            self.mem.add(self.session_id, self.messages)
            self.messages = []`,
        },
      ],
    },
    {
      id: 'fail-silent',
      heading: {
        en: 'Fail-Silent Pattern',
        zh: '静默失败模式',
      },
      content: {
        en: `Always use \`fail_silent=True\` for search operations. This ensures memory failures don't break your agent's conversation flow.

**Why it matters:**
- Network issues shouldn't stop conversations
- Rate limits should degrade gracefully
- Agent should work even if memory service is down

**Example:**
\`\`\`python
# Good - never raises
result = self.mem.search(query, fail_silent=True)
if result:
    # Use memories
    pass
else:
    # Continue without memory (graceful degradation)
    pass

# Bad - can break conversation
result = self.mem.search(query)  # May raise exception
\`\`\``,
        zh: `始终对搜索操作使用 \`fail_silent=True\`。这确保记忆故障不会中断代理的对话流程。

**为什么重要：**
- 网络问题不应停止对话
- 速率限制应该优雅降级
- 即使记忆服务关闭，代理也应该工作

**示例：**
\`\`\`python
# 好 - 从不抛出异常
result = self.mem.search(query, fail_silent=True)
if result:
    # 使用记忆
    pass
else:
    # 在没有记忆的情况下继续（优雅降级）
    pass

# 坏 - 可能中断对话
result = self.mem.search(query)  # 可能抛出异常
\`\`\``,
      },
    },
    {
      id: 'advanced-patterns',
      heading: {
        en: 'Advanced Patterns',
        zh: '高级模式',
      },
      content: {
        en: `### Using TKG Context

For more precise responses, use TKG context to get structured facts:

\`\`\`python
result = self.mem.search(user_input, fail_silent=True)
if result and result.items:
    # Get TKG context for top result
    ctx = self.mem.explain_event(result.items[0])
    if ctx:
        # Use extracted knowledge instead of raw text
        facts = [k.summary for k in ctx.knowledge]
        memory_context = f"\\n\\n[Facts]\\n" + "\\n".join(facts)
\`\`\`

### Incremental Saving

For long conversations, save periodically instead of only at the end:

\`\`\`python
def chat(self, user_input: str) -> str:
    # ... search and respond ...
    
    # Save every 10 messages
    if len(self.messages) % 10 == 0:
        self.mem.add(f"{self.session_id}-chunk-{len(self.messages)//10}", self.messages[-10:])
    
    return response
\`\`\``,
        zh: `### 使用 TKG 上下文

为了获得更精确的响应，使用 TKG 上下文获取结构化事实：

\`\`\`python
result = self.mem.search(user_input, fail_silent=True)
if result and result.items:
    # 获取顶部结果的 TKG 上下文
    ctx = self.mem.explain_event(result.items[0])
    if ctx:
        # 使用提取的知识而非原始文本
        facts = [k.summary for k in ctx.knowledge]
        memory_context = f"\\n\\n[事实]\\n" + "\\n".join(facts)
\`\`\`

### 增量保存

对于长对话，定期保存而不是仅在结束时保存：

\`\`\`python
def chat(self, user_input: str) -> str:
    # ... 搜索和响应 ...

    # 每 10 条消息保存一次
    if len(self.messages) % 10 == 0:
        self.mem.add(f"{self.session_id}-chunk-{len(self.messages)//10}", self.messages[-10:])

    return response
\`\`\``,
      },
    },
    {
      id: 'common-pitfalls',
      heading: {
        en: 'Common Pitfalls',
        zh: '常见陷阱',
      },
      content: {
        en: `**1. Forgetting to save assistant responses**

Always save both user and assistant messages. Missing assistant responses breaks context extraction.

**2. Saving too frequently**

Call \`add()\` once per conversation, not per message. Frequent saves create fragmented knowledge.

**3. Not using fail_silent**

Memory failures should never break your agent. Always use \`fail_silent=True\` for search.

**4. Async processing time**

After \`add()\`, memories take 5-30 seconds to become searchable. Use \`wait=True\` if you need immediate searchability.`,
        zh: `**1. 忘记保存助手响应**

始终保存用户和助手消息。缺少助手响应会破坏上下文提取。

**2. 保存过于频繁**

每次对话调用一次 \`add()\`，而不是每条消息。频繁保存会产生碎片化知识。

**3. 未使用 fail_silent**

记忆故障不应中断代理。搜索时始终使用 \`fail_silent=True\`。

**4. 异步处理时间**

\`add()\` 后，记忆需要 5-30 秒才能被搜索到。如需立即可搜索，使用 \`wait=True\`。`,
      },
    },
  ],
};

