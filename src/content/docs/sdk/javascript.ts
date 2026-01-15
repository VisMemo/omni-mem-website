import type { DocPage } from '../types';

// =============================================================================
// JavaScript SDK Quick Start (Coming Soon)
// =============================================================================

export const javascriptSdkPage: DocPage = {
  slug: 'sdk/javascript',
  title: {
    en: 'JavaScript SDK Quick Start',
    zh: 'JavaScript SDK 快速开始',
  },
  description: {
    en: 'Give your Node.js and browser-based AI agents long-term memory.',
    zh: '为您的 Node.js 和浏览器端 AI Agent 赋予长期记忆。',
  },
  sections: [
    {
      id: 'coming-soon',
      heading: {
        en: 'Coming Soon',
        zh: '即将推出',
      },
      content: {
        en: `The JavaScript SDK is currently under development and will be available soon.

**Planned Features:**
- Full TypeScript support with type definitions
- Works in Node.js and modern browsers
- Promise-based async API
- Same functionality as Python SDK (add, search, TKG features)
- ESM and CommonJS module support

**In the meantime, you can:**
- Use the [HTTP API](/docs/api/memory) directly from JavaScript
- Use the [Python SDK](/docs/sdk/python) if you're working with a Python backend

**Stay Updated:**
- Star our [GitHub repository](https://github.com/omnimemory) to get notified
- Follow us on Twitter for announcements`,
        zh: `JavaScript SDK 目前正在开发中，即将推出。

**计划功能：**
- 完整的 TypeScript 支持和类型定义
- 支持 Node.js 和现代浏览器
- 基于 Promise 的异步 API
- 与 Python SDK 相同的功能（add、search、TKG 功能）
- 支持 ESM 和 CommonJS 模块

**目前，您可以：**
- 直接从 JavaScript 使用 [HTTP API](/docs/api/memory)
- 如果您使用 Python 后端，可以使用 [Python SDK](/docs/sdk/python)

**保持关注：**
- Star 我们的 [GitHub 仓库](https://github.com/omnimemory) 以获取通知
- 在 Twitter 上关注我们获取公告`,
      },
    },
    {
      id: 'http-api-example',
      heading: {
        en: 'Using HTTP API (Available Now)',
        zh: '使用 HTTP API（现已可用）',
      },
      content: {
        en: `While the SDK is in development, you can use the HTTP API directly:`,
        zh: `在 SDK 开发期间，您可以直接使用 HTTP API：`,
      },
      codeExamples: [
        {
          language: 'javascript',
          title: 'Node.js / Browser',
          code: `// Save a conversation
const response = await fetch('https://api.omnimemory.ai/v1/memory/ingest', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer qbk_xxx',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    conversation_id: 'conv-001',
    turns: [
      { role: 'user', content: 'Meeting with Caroline tomorrow' },
      { role: 'assistant', content: 'Got it!' },
    ],
  }),
});

// Search memories
const searchResponse = await fetch('https://api.omnimemory.ai/v1/memory/retrieval', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer qbk_xxx',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'When is my meeting with Caroline?',
    limit: 10,
  }),
});

const results = await searchResponse.json();
console.log(results);`,
        },
      ],
    },
    {
      id: 'typescript-preview',
      heading: {
        en: 'SDK Preview (TypeScript)',
        zh: 'SDK 预览（TypeScript）',
      },
      content: {
        en: `Here's a preview of what the JavaScript SDK will look like:`,
        zh: `以下是 JavaScript SDK 的预览：`,
      },
      codeExamples: [
        {
          language: 'typescript',
          title: 'Coming Soon',
          code: `import { Memory } from '@omnimemory/sdk';

// Initialize
const mem = new Memory({ apiKey: 'qbk_xxx' });

// Save a conversation
await mem.add('conv-001', [
  { role: 'user', content: 'Meeting with Caroline tomorrow' },
  { role: 'assistant', content: 'Got it!' },
]);

// Search memories
const result = await mem.search('When is my meeting?');
if (result.items.length > 0) {
  console.log(result.toPrompt());
}

// With user isolation
const userMem = new Memory({
  apiKey: 'qbk_xxx',
  userId: 'user-123'
});`,
        },
      ],
    },
    {
      id: 'notify-me',
      heading: {
        en: 'Get Notified',
        zh: '获取通知',
      },
      content: {
        en: `Want to be notified when the JavaScript SDK is released?

- Star our [GitHub repository](https://github.com/omnimemory)
- Join our [Discord community](https://discord.gg/omnimemory)
- Follow [@omnimemory](https://twitter.com/omnimemory) on Twitter

We're actively developing the SDK and expect to release it soon!`,
        zh: `想要在 JavaScript SDK 发布时收到通知？

- Star 我们的 [GitHub 仓库](https://github.com/omnimemory)
- 加入我们的 [Discord 社区](https://discord.gg/omnimemory)
- 在 Twitter 上关注 [@omnimemory](https://twitter.com/omnimemory)

我们正在积极开发 SDK，预计很快发布！`,
      },
    },
  ],
};
