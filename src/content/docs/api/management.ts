import type { ApiEndpoint } from '../types';

// =============================================================================
// Management API Endpoints (Authenticated)
// =============================================================================

export const listApiKeysEndpoint: ApiEndpoint = {
  method: 'GET',
  path: '/apikeys',
  title: { en: 'List API Keys', zh: 'List API Keys' },
  description: {
    en: 'List API keys for the current account.',
    zh: 'List API keys for the current account.',
  },
  auth: 'bearer',
  queryParams: [
    {
      name: 'page',
      type: 'integer',
      required: false,
      default: '1',
      description: { en: 'Page number (1-based).', zh: 'Page number (1-based).' },
    },
    {
      name: 'pageSize',
      type: 'integer',
      required: false,
      default: '10',
      description: { en: 'Items per page.', zh: 'Items per page.' },
    },
  ],
  responses: [
    {
      status: 200,
      description: { en: 'List of API keys.', zh: 'List of API keys.' },
      example: `{
  "data": [
    { "id": "key_123", "label": "production", "key_prefix": "qbk_" }
  ]
}`,
    },
  ],
};

export const createApiKeyEndpoint: ApiEndpoint = {
  method: 'POST',
  path: '/apikeys',
  title: { en: 'Create API Key', zh: 'Create API Key' },
  description: {
    en: 'Create a new API key for the current account.',
    zh: 'Create a new API key for the current account.',
  },
  auth: 'bearer',
  requestBody: {
    contentType: 'application/json',
    parameters: [
      {
        name: 'label',
        type: 'string',
        required: true,
        description: { en: 'Display label for the key.', zh: 'Display label for the key.' },
      },
    ],
    example: `{
  "label": "production"
}`,
  },
  responses: [
    {
      status: 200,
      description: { en: 'API key created.', zh: 'API key created.' },
      example: `{
  "api_key_id": "key_123",
  "api_key_plaintext": "qbk_xxx"
}`,
    },
  ],
};

export const uploadDirectEndpoint: ApiEndpoint = {
  method: 'POST',
  path: '/uploads/direct',
  title: { en: 'Direct Upload', zh: 'Direct Upload' },
  description: {
    en: 'Request a direct upload URL for file ingestion.',
    zh: 'Request a direct upload URL for file ingestion.',
  },
  auth: 'bearer',
  requestBody: {
    contentType: 'application/json',
    parameters: [
      {
        name: 'filename',
        type: 'string',
        required: true,
        description: { en: 'Original file name.', zh: 'Original file name.' },
      },
      {
        name: 'mime',
        type: 'string',
        required: true,
        description: { en: 'File MIME type.', zh: 'File MIME type.' },
      },
    ],
  },
  responses: [
    {
      status: 200,
      description: { en: 'Upload initialized.', zh: 'Upload initialized.' },
    },
  ],
};

export const uploadStatusEndpoint: ApiEndpoint = {
  method: 'GET',
  path: '/uploads/:id',
  title: { en: 'Upload Status', zh: 'Upload Status' },
  description: {
    en: 'Check the status of a file upload.',
    zh: 'Check the status of a file upload.',
  },
  auth: 'bearer',
  pathParams: [
    {
      name: 'id',
      type: 'string',
      required: true,
      description: { en: 'Upload ID.', zh: 'Upload ID.' },
    },
  ],
  responses: [
    {
      status: 200,
      description: { en: 'Current upload status.', zh: 'Current upload status.' },
    },
  ],
};

export const usageSummaryEndpoint: ApiEndpoint = {
  method: 'GET',
  path: '/usage/summary',
  title: { en: 'Usage Summary', zh: 'Usage Summary' },
  description: {
    en: 'Get recent usage summary for the current account.',
    zh: 'Get recent usage summary for the current account.',
  },
  auth: 'bearer',
  responses: [
    {
      status: 200,
      description: { en: 'Usage summary payload.', zh: 'Usage summary payload.' },
    },
  ],
};

export const balanceEndpoint: ApiEndpoint = {
  method: 'GET',
  path: '/balance',
  title: { en: 'Balance', zh: 'Balance' },
  description: {
    en: 'Fetch remaining credit balance for the current account.',
    zh: 'Fetch remaining credit balance for the current account.',
  },
  auth: 'bearer',
  responses: [
    {
      status: 200,
      description: { en: 'Current balance.', zh: 'Current balance.' },
      example: `{
  "balance": 1500
}`,
    },
  ],
};

export const apiKeyEndpoints: ApiEndpoint[] = [
  listApiKeysEndpoint,
  createApiKeyEndpoint,
];

export const uploadEndpoints: ApiEndpoint[] = [
  uploadDirectEndpoint,
  uploadStatusEndpoint,
];

export const usageEndpoints: ApiEndpoint[] = [
  usageSummaryEndpoint,
  balanceEndpoint,
];

export const managementEndpoints: ApiEndpoint[] = [
  ...apiKeyEndpoints,
  ...uploadEndpoints,
  ...usageEndpoints,
];
