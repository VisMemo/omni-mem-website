/**
 * Documentation Content Index
 *
 * This file exports all documentation content for the Omni Memory website.
 * Import from this file to access all docs content with type safety.
 */

// Types
export * from './types';

// Core Concepts
export { conceptsPage } from './concepts';

// SDK Reference
export {
  pythonSdkPage,
  memoryClass,
  errorHandlingSection,
  multiUserSection,
  tkgFeaturesSection,
} from './sdk/python';

export { javascriptSdkPage } from './sdk/javascript';

// Guides
export { agentIntegrationPage } from './guides/agent';
export { multiSpeakerPage } from './guides/multi-speaker';

// Pipelines
export { pipelinesPage } from './pipelines';

// API Reference - Memory
export {
  ingestEndpoint,
  retrievalEndpoint,
  turnSchema,
  memoryEndpoints,
} from './api/memory';

// API Reference - Management
export {
  listApiKeysEndpoint,
  createApiKeyEndpoint,
  revokeApiKeyEndpoint,
  uploadDirectEndpoint,
  uploadStatusEndpoint,
  usageSummaryEndpoint,
  balanceEndpoint,
  apiKeyEndpoints,
  uploadEndpoints,
  usageEndpoints,
  managementEndpoints,
} from './api/management';

// Reference
export { errorsPage } from './reference/errors';
export { limitsPage } from './reference/limits';
export { changelogPage } from './reference/changelog';

// =============================================================================
// Navigation Structure
// =============================================================================

import type { DocsNav } from './types';

export const docsNavigation: DocsNav = {
  sections: [
    {
      title: { en: 'Getting Started', zh: '开始使用' },
      items: [
        {
          title: { en: 'Python SDK', zh: 'Python SDK' },
          href: '/docs/sdk/python',
          description: { en: 'Get memory working in 5 minutes', zh: '5 分钟内让记忆工作' },
        },
        {
          title: { en: 'Core Concepts', zh: '核心概念' },
          href: '/docs/concepts',
          description: { en: 'Understand save, search, and retrieval', zh: '了解保存、搜索和检索' },
        },
        {
          title: { en: 'Pipelines', zh: '处理管线' },
          href: '/docs/pipelines',
          description: { en: 'Text ✅ vs Video 🚧', zh: '文本 ✅ vs 视频 🚧' },
        },
      ],
    },
    {
      title: { en: 'API Reference', zh: 'API 参考' },
      items: [
        {
          title: { en: 'Memory', zh: '记忆' },
          href: '/docs/api/memory',
          description: { en: 'HTTP endpoints for any language', zh: '适用于任何语言的 HTTP 端点' },
        },
        {
          title: { en: 'Management', zh: '管理' },
          href: '/docs/api/management',
          description: { en: 'API keys and usage', zh: 'API 密钥和用量' },
        },
      ],
    },
    {
      title: { en: 'Guides', zh: '指南' },
      items: [
        {
          title: { en: 'Agent Integration', zh: '代理集成' },
          href: '/docs/guides/agent',
          description: { en: 'Add memory to your LLM agent', zh: '为您的 LLM 代理添加记忆' },
        },
        {
          title: { en: 'Multi-Speaker', zh: '多说话人' },
          href: '/docs/guides/multi-speaker',
          description: { en: 'Handle conversations with multiple people', zh: '处理多人对话' },
        },
      ],
    },
    {
      title: { en: 'Reference', zh: '参考' },
      items: [
        {
          title: { en: 'Error Codes', zh: '错误码' },
          href: '/docs/reference/errors',
          description: { en: 'Handle failures gracefully', zh: '优雅地处理失败' },
        },
        {
          title: { en: 'Limits', zh: '限制' },
          href: '/docs/reference/limits',
          description: { en: 'Rate limits and quotas', zh: '速率限制和配额' },
        },
        { title: { en: 'Changelog', zh: '更新日志' }, href: '/docs/reference/changelog' },
      ],
    },
  ],
};

// =============================================================================
// All Pages (for static generation)
// =============================================================================

import { conceptsPage } from './concepts';
import { pythonSdkPage } from './sdk/python';
import { javascriptSdkPage } from './sdk/javascript';
import { agentIntegrationPage } from './guides/agent';
import { multiSpeakerPage } from './guides/multi-speaker';
import { pipelinesPage } from './pipelines';
import { errorsPage } from './reference/errors';
import { limitsPage } from './reference/limits';
import { changelogPage } from './reference/changelog';

export const allDocPages = [
  pythonSdkPage,
  javascriptSdkPage,
  conceptsPage,
  pipelinesPage,
  agentIntegrationPage,
  multiSpeakerPage,
  errorsPage,
  limitsPage,
  changelogPage,
];


