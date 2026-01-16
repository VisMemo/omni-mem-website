import type { DocPage } from '../types';

// =============================================================================
// Multi-Speaker Guide
// =============================================================================

export const multiSpeakerPage: DocPage = {
  slug: 'guides/multi-speaker',
  title: {
    en: 'Multi-Speaker Conversations',
    zh: '多说话人对话',
  },
  description: {
    en: 'Handle conversations with multiple participants using the name field.',
    zh: '使用 name 字段处理多个参与者的对话。',
  },
  sections: [
    {
      id: 'overview',
      heading: {
        en: 'Why the name Field Matters',
        zh: '为什么 name 字段很重要',
      },
      content: {
        en: `The \`name\` field determines how entities are created in the Temporal Knowledge Graph (TKG).

**Without \`name\`:**
- All user messages are attributed to a single "user" entity
- You lose speaker distinction
- Entity-based search becomes less precise

**With \`name\`:**
- Each speaker becomes a distinct entity
- TKG tracks who said what
- Entity history and search work correctly`,
        zh: `\`name\` 字段决定了如何在时序知识图谱 (TKG) 中创建实体。

**没有 \`name\`：**
- 所有用户消息都归因于单个 "user" 实体
- 您失去了说话人区分
- 基于实体的搜索变得不那么精确

**使用 \`name\`：**
- 每个说话人成为不同的实体
- TKG 跟踪谁说了什么
- 实体历史和搜索正常工作`,
      },
    },
    {
      id: 'basic-usage',
      heading: {
        en: 'Basic Usage',
        zh: '基本用法',
      },
      content: {
        en: `Include the \`name\` field for each message to identify the speaker:`,
        zh: `为每条消息包含 \`name\` 字段以识别说话人：`,
      },
      codeExamples: [
        {
          language: 'python',
          title: 'Multi-Speaker Conversation',
          code: `from omem import Memory

mem = Memory(api_key="qbk_xxx")

# Multi-speaker conversation (like LoCoMo)
mem.add("conv-001", [
    {"role": "user", "name": "Caroline", "content": "Hey Mel! Good to see you!"},
    {"role": "user", "name": "Melanie", "content": "Hey Caroline! I'm swamped with work."},
    {"role": "user", "name": "Caroline", "content": "I went to a support group yesterday."},
    {"role": "user", "name": "Melanie", "content": "That's awesome! How did it go?"},
])

# Now you can search by speaker
result = mem.search("What did Caroline do?")
# Returns only Caroline's messages

history = mem.get_entity_history("Caroline")
# Returns all evidence for Caroline entity`,
        },
      ],
    },
    {
      id: 'entity-creation',
      heading: {
        en: 'How Entities Are Created',
        zh: '实体如何创建',
      },
      content: {
        en: `The backend uses the \`name\` field (mapped to \`speaker\`) to create entities:

| Input | Backend Speaker | Entity Created |
|-------|-----------------|----------------|
| \`{"role": "user", "name": "Caroline", ...}\` | "Caroline" | \`Entity(name="Caroline", type="PERSON")\` |
| \`{"role": "user", "name": "Melanie", ...}\` | "Melanie" | \`Entity(name="Melanie", type="PERSON")\` |
| \`{"role": "user", ...}\` (no name) | "user" | \`Entity(name="user", type="PERSON")\` |

**Important:** The SDK automatically maps \`name\` to \`speaker\` for the backend. You only need to provide \`name\` in your messages.`,
        zh: `后端使用 \`name\` 字段（映射到 \`speaker\`）来创建实体：

| 输入 | 后端说话人 | 创建的实体 |
|------|-----------|-----------|
| \`{"role": "user", "name": "Caroline", ...}\` | "Caroline" | \`Entity(name="Caroline", type="PERSON")\` |
| \`{"role": "user", "name": "Melanie", ...}\` | "Melanie" | \`Entity(name="Melanie", type="PERSON")\` |
| \`{"role": "user", ...}\` (无 name) | "user" | \`Entity(name="user", type="PERSON")\` |

**重要：** SDK 自动将 \`name\` 映射到后端的 \`speaker\`。您只需在消息中提供 \`name\`。`,
      },
    },
    {
      id: 'with-assistant',
      heading: {
        en: 'Including Assistant Messages',
        zh: '包含助手消息',
      },
      content: {
        en: `You can mix human speakers with assistant messages:

\`\`\`python
mem.add("conv-002", [
    {"role": "user", "name": "Caroline", "content": "What's the weather like?"},
    {"role": "assistant", "content": "It's sunny and 72°F."},
    {"role": "user", "name": "Melanie", "content": "Thanks!"},
])
\`\`\`

**Note:** Assistant messages don't need a \`name\` field - they're automatically attributed to the assistant entity.`,
        zh: `您可以混合人类说话人和助手消息：

\`\`\`python
mem.add("conv-002", [
    {"role": "user", "name": "Caroline", "content": "天气怎么样？"},
    {"role": "assistant", "content": "晴天，72°F。"},
    {"role": "user", "name": "Melanie", "content": "谢谢！"},
])
\`\`\`

**注意：** 助手消息不需要 \`name\` 字段 - 它们自动归因于助手实体。`,
      },
    },
    {
      id: 'best-practices',
      heading: {
        en: 'Best Practices',
        zh: '最佳实践',
      },
      content: {
        en: `1. **Always use \`name\` for multi-party conversations**
   - Essential for entity tracking
   - Enables speaker-specific search

2. **Use consistent names**
   - "Caroline" and "caroline" create different entities
   - Normalize names in your application

3. **Single-user conversations can omit \`name\`**
   - For one-on-one chats, \`name\` is optional
   - All messages will be attributed to "user" entity

4. **Combine with entity history**
   - Use \`get_entity_history("Caroline")\` to get all of Caroline's messages
   - Useful for building speaker-specific timelines`,
        zh: `1. **多参与者对话始终使用 \`name\`**
   - 对实体跟踪至关重要
   - 启用说话人特定搜索

2. **使用一致的名称**
   - "Caroline" 和 "caroline" 创建不同的实体
   - 在应用程序中规范化名称

3. **单用户对话可以省略 \`name\`**
   - 对于一对一聊天，\`name\` 是可选的
   - 所有消息将归因于 "user" 实体

4. **与实体历史结合使用**
   - 使用 \`get_entity_history("Caroline")\` 获取 Caroline 的所有消息
   - 用于构建说话人特定的时间线`,
      },
    },
  ],
};

