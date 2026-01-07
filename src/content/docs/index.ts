/**
 * Documentation Content Index
 * 
 * This file exports all documentation content for the Omni Memory website.
 * Import from this file to access all docs content with type safety.
 */

// Types
export * from './types';

// Quick Start
export { quickstartPage } from './quickstart';

// SDK Reference
export { 
  pythonSdkPage, 
  memoryClass,
  errorHandlingSection,
  multiUserSection,
} from './sdk/python';

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
        { title: { en: 'Quick Start', zh: '快速开始' }, href: '/docs/quickstart' },
      ],
    },
    {
      title: { en: 'SDK Reference', zh: 'SDK 参考' },
      items: [
        { title: { en: 'Python SDK', zh: 'Python SDK' }, href: '/docs/sdk/python' },
      ],
    },
    {
      title: { en: 'API Reference', zh: 'API 参考' },
      items: [
        { 
          title: { en: 'Memory', zh: '记忆' }, 
          href: '/docs/api/memory',
          items: [
            { title: { en: 'Save Conversation', zh: '保存对话' }, href: '/docs/api/memory#ingest' },
            { title: { en: 'Search Memories', zh: '搜索记忆' }, href: '/docs/api/memory#retrieval' },
          ],
        },
        { 
          title: { en: 'Management', zh: '管理' }, 
          href: '/docs/api/management',
          items: [
            { title: { en: 'API Keys', zh: 'API 密钥' }, href: '/docs/api/management#apikeys' },
            { title: { en: 'Uploads', zh: '上传' }, href: '/docs/api/management#uploads' },
            { title: { en: 'Usage & Balance', zh: '用量与余额' }, href: '/docs/api/management#usage' },
          ],
        },
      ],
    },
    {
      title: { en: 'Reference', zh: '参考' },
      items: [
        { title: { en: 'Error Codes', zh: '错误码' }, href: '/docs/reference/errors' },
        { title: { en: 'Limits', zh: '限制' }, href: '/docs/reference/limits' },
        { title: { en: 'Changelog', zh: '更新日志' }, href: '/docs/reference/changelog' },
      ],
    },
  ],
};

// =============================================================================
// All Pages (for static generation)
// =============================================================================

import { quickstartPage } from './quickstart';
import { pythonSdkPage } from './sdk/python';
import { errorsPage } from './reference/errors';
import { limitsPage } from './reference/limits';
import { changelogPage } from './reference/changelog';

export const allDocPages = [
  quickstartPage,
  pythonSdkPage,
  errorsPage,
  limitsPage,
  changelogPage,
];

