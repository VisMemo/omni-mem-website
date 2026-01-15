import type { DocPage } from '../types';

// =============================================================================
// Changelog
// =============================================================================

export const changelogPage: DocPage = {
  slug: 'reference/changelog',
  title: {
    en: 'Changelog',
    zh: '更新日志',
  },
  description: {
    en: 'Release notes and version history for the Omni Memory SDK and API.',
    zh: 'Omni Memory SDK 和 API 的发布说明和版本历史。',
  },
  sections: [
    {
      id: 'v2.2.0',
      heading: {
        en: 'v2.2.0 (2026-01-07)',
        zh: 'v2.2.0 (2026-01-07)',
      },
      content: {
        en: `### Major Simplification

- **Breaking:** Only \`api_key\` is required for initialization - no more \`endpoint\` or \`tenant_id\`
- **New:** \`user_id\` parameter for memory isolation in multi-user apps
- **Default:** Connects to cloud service; only specify \`endpoint\` for self-hosted
- **Internal:** \`tenant_id\` is now automatically parsed from API key by the gateway`,
        zh: `### 重大简化

- **破坏性变更：** 初始化只需 \`api_key\` - 不再需要 \`endpoint\` 或 \`tenant_id\`
- **新增：** 用于多用户应用记忆隔离的 \`user_id\` 参数
- **默认：** 连接云服务；仅自托管时需指定 \`endpoint\`
- **内部：** \`tenant_id\` 现由网关从 API 密钥自动解析`,
      },
      codeExamples: [
        {
          language: 'python',
          title: 'Before vs After',
          code: `# Before (v2.1)
mem = Memory(
    endpoint="https://api.omnimemory.ai",
    api_key="qbk_xxx",
    tenant_id="my-tenant"
)

# After (v2.2) - Much simpler!
mem = Memory(api_key="qbk_xxx")`,
        },
      ],
    },
    {
      id: 'v2.1.0',
      heading: {
        en: 'v2.1.0 (2026-01-07)',
        zh: 'v2.1.0 (2026-01-07)',
      },
      content: {
        en: `### API Simplification

- **Simplified:** \`add()\` is now the recommended primary write method
- **Moved:** \`Conversation\` buffer moved to advanced usage
- **Improved:** Error handling with \`fail_silent\` parameter
- **Docs:** Complete documentation rewrite focused on developer experience`,
        zh: `### API 简化

- **简化：** \`add()\` 现为推荐的主要写入方法
- **移动：** \`Conversation\` 缓冲区移至高级用法
- **改进：** 通过 \`fail_silent\` 参数改进错误处理
- **文档：** 完全重写文档，专注于开发者体验`,
      },
    },
    {
      id: 'v2.0.0',
      heading: {
        en: 'v2.0.0 (2026-01-01)',
        zh: 'v2.0.0 (2026-01-01)',
      },
      content: {
        en: `### Initial Public Release

- Core memory operations: \`add()\`, \`search()\`
- Conversation buffer for incremental writes
- Multi-user support via \`user_id\`
- Strongly-typed \`SearchResult\` with LLM formatting
- Error handling with \`OmemClientError\` hierarchy`,
        zh: `### 首次公开发布

- 核心记忆操作：\`add()\`、\`search()\`
- 用于增量写入的对话缓冲区
- 通过 \`user_id\` 支持多用户
- 带 LLM 格式化的强类型 \`SearchResult\`
- 使用 \`OmemClientError\` 层次结构处理错误`,
      },
    },
  ],
};


