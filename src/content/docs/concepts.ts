import type { DocPage } from './types';

// =============================================================================
// Core Concepts Page
// =============================================================================

export const conceptsPage: DocPage = {
  slug: 'concepts',
  title: {
    en: 'Core Concepts',
    zh: '核心概念',
  },
  description: {
    en: 'Understand how Omni Memory works: save, search, and retrieve memories.',
    zh: '了解 Omni Memory 的工作原理：保存、搜索和检索记忆。',
  },
  sections: [
    {
      id: 'overview',
      heading: {
        en: 'How Omni Memory Works',
        zh: 'Omni Memory 工作原理',
      },
      content: {
        en: `Omni Memory gives your AI agents long-term memory by storing conversations, extracting structured knowledge, and enabling semantic search.

The service processes your data in three main steps:

1. **Save** - Send conversations to the cloud
2. **Extract** - Automatic entity and fact extraction (happens in background)
3. **Search** - Query memories using natural language`,
        zh: `Omni Memory 通过存储对话、提取结构化知识并启用语义搜索，为您的 AI 代理提供长期记忆。

服务通过三个主要步骤处理您的数据：

1. **保存** - 将对话发送到云端
2. **提取** - 自动实体和事实提取（在后台进行）
3. **搜索** - 使用自然语言查询记忆`,
      },
    },
    {
      id: 'save',
      heading: {
        en: 'Save Conversations',
        zh: '保存对话',
      },
      content: {
        en: `When you call \`mem.add()\`, your conversation is sent to the Omni Memory cloud service.

**What happens:**
- Your messages are queued for processing
- The service returns immediately (fire-and-forget)
- Processing happens asynchronously in the background

**Timeline:**
- \`add()\` returns: **Immediately** (0-1 seconds)
- Memories become searchable: **5-30 seconds** later

**Example:**
\`\`\`python
mem.add("conv-001", [
    {"role": "user", "name": "Caroline", "content": "I went to a support group yesterday."},
])
# Returns immediately - processing happens in background
\`\`\``,
        zh: `当您调用 \`mem.add()\` 时，您的对话会发送到 Omni Memory 云服务。

**发生的情况：**
- 您的消息被排队等待处理
- 服务立即返回（即发即忘）
- 处理在后台异步进行

**时间线：**
- \`add()\` 返回：**立即**（0-1 秒）
- 记忆可搜索：**5-30 秒**后

**示例：**
\`\`\`python
mem.add("conv-001", [
    {"role": "user", "name": "Caroline", "content": "我昨天去了支持小组。"},
])
# 立即返回 - 处理在后台进行
\`\`\``,
      },
    },
    {
      id: 'search',
      heading: {
        en: 'Search Memories',
        zh: '搜索记忆',
      },
      content: {
        en: `When you call \`mem.search()\`, Omni Memory uses hybrid retrieval to find relevant memories.

**How it works:**
- **Vector search** - Semantic similarity matching
- **Graph search** - Entity and relationship matching
- **Ranking** - Results sorted by relevance and recency

**What you get:**
- Ranked list of relevant memories
- Relevance scores (0.0 to 1.0)
- Source information (vector, graph, or knowledge)

**Example:**
\`\`\`python
result = mem.search("What did Caroline do recently?")
if result:
    for item in result:
        print(f"[{item.score:.2f}] {item.text}")
        print(f"  Source: {item.source}")  # E_graph, E_vec, or K_vec
\`\`\``,
        zh: `当您调用 \`mem.search()\` 时，Omni Memory 使用混合检索来查找相关记忆。

**工作原理：**
- **向量搜索** - 语义相似度匹配
- **图谱搜索** - 实体和关系匹配
- **排序** - 结果按相关性和时间排序

**您获得的内容：**
- 相关记忆的排序列表
- 相关性分数（0.0 到 1.0）
- 来源信息（向量、图谱或知识）

**示例：**
\`\`\`python
result = mem.search("Caroline 最近做了什么？")
if result:
    for item in result:
        print(f"[{item.score:.2f}] {item.text}")
        print(f"  来源: {item.source}")  # E_graph, E_vec, 或 K_vec
\`\`\``,
      },
    },
    {
      id: 'tkg',
      heading: {
        en: 'Temporal Knowledge Graph (TKG)',
        zh: '时序知识图谱 (TKG)',
      },
      content: {
        en: `The TKG automatically extracts structured knowledge from your conversations.

**What gets extracted:**
- **Entities** - People, places, organizations mentioned
- **Facts** - Structured knowledge (e.g., "Caroline went to support group on 2026-01-14")
- **Relationships** - Connections between entities
- **Timeline** - When events occurred

**Why it matters:**
- More precise search results
- Evidence tracing back to source
- Structured facts instead of raw text

**Example:**
\`\`\`python
result = mem.search("support group", limit=1)
ctx = mem.explain_event(result.items[0])

if ctx:
    # Entities mentioned
    print(f"Entities: {ctx.entities}")  # ['Caroline (PERSON)']
    
    # Extracted facts
    for k in ctx.knowledge:
        print(f"Fact: {k.summary}")  # "Caroline went to support group on 2026-01-14"
\`\`\``,
        zh: `TKG 自动从您的对话中提取结构化知识。

**提取的内容：**
- **实体** - 提到的人物、地点、组织
- **事实** - 结构化知识（例如，"Caroline 于 2026-01-14 去了支持小组"）
- **关系** - 实体之间的连接
- **时间线** - 事件发生的时间

**为什么重要：**
- 更精确的搜索结果
- 可追溯到源的证据
- 结构化事实而非原始文本

**示例：**
\`\`\`python
result = mem.search("支持小组", limit=1)
ctx = mem.explain_event(result.items[0])

if ctx:
    # 提到的实体
    print(f"实体: {ctx.entities}")  # ['Caroline (PERSON)']
    
    # 提取的事实
    for k in ctx.knowledge:
        print(f"事实: {k.summary}")  # "Caroline 于 2026-01-14 去了支持小组"
\`\`\``,
      },
    },
    {
      id: 'evidence',
      heading: {
        en: 'Evidence Tracing',
        zh: '证据追踪',
      },
      content: {
        en: `Every fact in Omni Memory can be traced back to its source utterance.

**Use cases:**
- **Citations** - Show where information came from
- **Debugging** - Understand why the agent "knows" something
- **Verification** - Confirm accuracy of extracted facts

**Example:**
\`\`\`python
# Get evidence for a search result
result = mem.search("tech conference", limit=1)
evidence = mem.get_evidence_for(result.items[0])

for e in evidence:
    print(f"Source: {e.text}")
    print(f"  Confidence: {e.confidence:.2f}")
    print(f"  Timestamp: {e.timestamp}")
\`\`\``,
        zh: `Omni Memory 中的每个事实都可以追溯到其源话语。

**用例：**
- **引用** - 显示信息来源
- **调试** - 理解代理为何"知道"某事
- **验证** - 确认提取事实的准确性

**示例：**
\`\`\`python
# 获取搜索结果的证据
result = mem.search("技术会议", limit=1)
evidence = mem.get_evidence_for(result.items[0])

for e in evidence:
    print(f"来源: {e.text}")
    print(f"  置信度: {e.confidence:.2f}")
    print(f"  时间戳: {e.timestamp}")
\`\`\``,
      },
    },
  ],
};

