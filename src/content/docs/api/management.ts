import type { ApiEndpoint } from '../types';

// =============================================================================
// API Key Management Endpoints
// =============================================================================

export const listApiKeysEndpoint: ApiEndpoint = {
  method: 'GET',
  path: '/api/v1/apikeys',
  title: {
    en: 'List API Keys',
    zh: '列出 API 密钥',
  },
  description: {
    en: 'Get a paginated list of all API keys for your account.',
    zh: '获取账户下所有 API 密钥的分页列表。',
  },
  auth: 'api_key',
  queryParams: [
    {
      name: 'page',
      type: 'integer',
      required: false,
      default: '1',
      description: {
        en: 'Page number.',
        zh: '页码。',
      },
    },
    {
      name: 'pageSize',
      type: 'integer',
      required: false,
      default: '50',
      description: {
        en: 'Number of items per page.',
        zh: '每页条目数。',
      },
    },
  ],
  responses: [
    {
      status: 200,
      description: {
        en: 'List of API keys.',
        zh: 'API 密钥列表。',
      },
      example: `{
  "data": [
    {
      "api_key_id": "key_abc123",
      "label": "Production",
      "created_at": "2025-01-01T00:00:00Z",
      "last_used_at": "2025-01-07T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 1
  }
}`,
    },
  ],
  codeExamples: [
    {
      language: 'curl',
      code: `curl "https://api.omnimemory.ai/api/v1/apikeys" \\
  -H "x-api-key: qbk_xxx"`,
    },
  ],
};

export const createApiKeyEndpoint: ApiEndpoint = {
  method: 'POST',
  path: '/api/v1/apikeys',
  title: {
    en: 'Create API Key',
    zh: '创建 API 密钥',
  },
  description: {
    en: 'Create a new API key. The plaintext key is only shown once in the response.',
    zh: '创建新的 API 密钥。明文密钥仅在响应中显示一次。',
  },
  auth: 'api_key',
  requestBody: {
    contentType: 'application/json',
    parameters: [
      {
        name: 'label',
        type: 'string',
        required: false,
        description: {
          en: 'Optional label for the API key (e.g., "Production", "Development").',
          zh: 'API 密钥的可选标签（如 "Production"、"Development"）。',
        },
      },
    ],
    example: `{
  "label": "Production"
}`,
  },
  responses: [
    {
      status: 200,
      description: {
        en: 'API key created. Save the plaintext key - it cannot be retrieved again.',
        zh: 'API 密钥已创建。请保存明文密钥 - 无法再次获取。',
      },
      example: `{
  "api_key_id": "key_abc123",
  "api_key_plaintext": "qbk_live_xxxxxxxxxxxx",
  "label": "Production",
  "created_at": "2025-01-07T10:30:00Z"
}`,
    },
  ],
  codeExamples: [
    {
      language: 'curl',
      code: `curl -X POST "https://api.omnimemory.ai/api/v1/apikeys" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: qbk_xxx" \\
  -d '{"label": "Production"}'`,
    },
  ],
};

export const revokeApiKeyEndpoint: ApiEndpoint = {
  method: 'POST',
  path: '/api/v1/apikeys/:id/revoke',
  title: {
    en: 'Revoke API Key',
    zh: '撤销 API 密钥',
  },
  description: {
    en: 'Revoke an API key. The key will immediately stop working.',
    zh: '撤销 API 密钥。密钥将立即失效。',
  },
  auth: 'api_key',
  pathParams: [
    {
      name: 'id',
      type: 'string',
      required: true,
      description: {
        en: 'API key ID to revoke.',
        zh: '要撤销的 API 密钥 ID。',
      },
    },
  ],
  responses: [
    {
      status: 200,
      description: {
        en: 'API key revoked.',
        zh: 'API 密钥已撤销。',
      },
      example: `{
  "status": "revoked",
  "api_key_id": "key_abc123"
}`,
    },
  ],
  codeExamples: [
    {
      language: 'curl',
      code: `curl -X POST "https://api.omnimemory.ai/api/v1/apikeys/key_abc123/revoke" \\
  -H "x-api-key: qbk_xxx"`,
    },
  ],
};

// =============================================================================
// Upload Endpoints
// =============================================================================

export const uploadDirectEndpoint: ApiEndpoint = {
  method: 'POST',
  path: '/api/v1/uploads/direct',
  title: {
    en: 'Direct Upload',
    zh: '直接上传',
  },
  description: {
    en: 'Upload a file directly to memory. The file will be processed and its contents will become searchable.',
    zh: '直接上传文件到记忆中。文件将被处理，其内容将变得可搜索。',
  },
  auth: 'api_key',
  requestBody: {
    contentType: 'multipart/form-data',
    parameters: [
      {
        name: 'file',
        type: 'binary',
        required: true,
        description: {
          en: 'The file to upload.',
          zh: '要上传的文件。',
        },
      },
      {
        name: 'filename',
        type: 'string',
        required: true,
        description: {
          en: 'Original filename.',
          zh: '原始文件名。',
        },
      },
      {
        name: 'mime',
        type: 'string',
        required: true,
        description: {
          en: 'MIME type (e.g., "application/pdf", "text/plain").',
          zh: 'MIME 类型（如 "application/pdf"、"text/plain"）。',
        },
      },
    ],
  },
  responses: [
    {
      status: 200,
      description: {
        en: 'Upload accepted for processing.',
        zh: '上传已接受处理。',
      },
      example: `{
  "upload_id": "upload_abc123",
  "status": "queued",
  "filename": "meeting-notes.pdf",
  "memory_scope": "user"
}`,
    },
  ],
  codeExamples: [
    {
      language: 'curl',
      code: `curl -X POST "https://api.omnimemory.ai/api/v1/uploads/direct" \\
  -H "x-api-key: qbk_xxx" \\
  -F "file=@meeting-notes.pdf" \\
  -F "filename=meeting-notes.pdf" \\
  -F "mime=application/pdf"`,
    },
  ],
};

export const uploadStatusEndpoint: ApiEndpoint = {
  method: 'GET',
  path: '/api/v1/uploads/:id',
  title: {
    en: 'Upload Status',
    zh: '上传状态',
  },
  description: {
    en: 'Check the processing status of an upload.',
    zh: '检查上传的处理状态。',
  },
  auth: 'api_key',
  pathParams: [
    {
      name: 'id',
      type: 'string',
      required: true,
      description: {
        en: 'Upload ID returned from the upload endpoint.',
        zh: '上传端点返回的上传 ID。',
      },
    },
  ],
  responses: [
    {
      status: 200,
      description: {
        en: 'Upload status.',
        zh: '上传状态。',
      },
      example: `{
  "upload_id": "upload_abc123",
  "status": "done",
  "filename": "meeting-notes.pdf",
  "memory_scope": "user",
  "updated_at": "2025-01-07T10:35:00Z"
}`,
    },
  ],
  codeExamples: [
    {
      language: 'curl',
      code: `curl "https://api.omnimemory.ai/api/v1/uploads/upload_abc123" \\
  -H "x-api-key: qbk_xxx"`,
    },
  ],
};

// =============================================================================
// Usage & Balance Endpoints
// =============================================================================

export const usageSummaryEndpoint: ApiEndpoint = {
  method: 'GET',
  path: '/api/v1/usage/summary',
  title: {
    en: 'Usage Summary',
    zh: '用量汇总',
  },
  description: {
    en: 'Get aggregated usage statistics for your account.',
    zh: '获取账户的汇总用量统计。',
  },
  auth: 'api_key',
  queryParams: [
    {
      name: 'from',
      type: 'string',
      required: false,
      description: {
        en: 'Start date (ISO 8601).',
        zh: '开始日期（ISO 8601）。',
      },
    },
    {
      name: 'to',
      type: 'string',
      required: false,
      description: {
        en: 'End date (ISO 8601).',
        zh: '结束日期（ISO 8601）。',
      },
    },
    {
      name: 'groupBy',
      type: 'string',
      required: false,
      default: '"account"',
      description: {
        en: 'Group by: "account", "apikey", or "user".',
        zh: '分组方式："account"、"apikey" 或 "user"。',
      },
    },
  ],
  responses: [
    {
      status: 200,
      description: {
        en: 'Usage summary.',
        zh: '用量汇总。',
      },
      example: `{
  "data": [
    {
      "key": "account_abc123",
      "total": 1500,
      "events": {
        "ingest": 1000,
        "retrieval": 500
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 1
  }
}`,
    },
  ],
  codeExamples: [
    {
      language: 'curl',
      code: `curl "https://api.omnimemory.ai/api/v1/usage/summary?from=2025-01-01&to=2025-01-31" \\
  -H "x-api-key: qbk_xxx"`,
    },
  ],
};

export const balanceEndpoint: ApiEndpoint = {
  method: 'GET',
  path: '/api/v1/balance',
  title: {
    en: 'Balance',
    zh: '余额',
  },
  description: {
    en: 'Get your current account balance.',
    zh: '获取当前账户余额。',
  },
  auth: 'api_key',
  responses: [
    {
      status: 200,
      description: {
        en: 'Current balance.',
        zh: '当前余额。',
      },
      example: `{
  "balance": 10000
}`,
    },
  ],
  codeExamples: [
    {
      language: 'curl',
      code: `curl "https://api.omnimemory.ai/api/v1/balance" \\
  -H "x-api-key: qbk_xxx"`,
    },
  ],
};

// =============================================================================
// Export all management endpoints
// =============================================================================

export const apiKeyEndpoints = [
  listApiKeysEndpoint,
  createApiKeyEndpoint,
  revokeApiKeyEndpoint,
];

export const uploadEndpoints = [
  uploadDirectEndpoint,
  uploadStatusEndpoint,
];

export const usageEndpoints = [
  usageSummaryEndpoint,
  balanceEndpoint,
];

export const managementEndpoints = [
  ...apiKeyEndpoints,
  ...uploadEndpoints,
  ...usageEndpoints,
];


