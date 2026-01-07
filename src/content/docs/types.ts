/**
 * Documentation Content Types
 * 
 * These types define the structure for bilingual (en/zh) documentation content.
 * Content is stored as structured TypeScript data for type safety and easy locale switching.
 */

// =============================================================================
// Base Types
// =============================================================================

export interface LocalizedString {
  en: string;
  zh: string;
}

export interface CodeExample {
  language: 'python' | 'bash' | 'curl' | 'typescript' | 'javascript' | 'json';
  title?: string;
  code: string;
}

// =============================================================================
// Documentation Page Types
// =============================================================================

export interface DocSection {
  id: string;
  heading: LocalizedString;
  content: LocalizedString;  // Markdown content
  codeExamples?: CodeExample[];
}

export interface DocPage {
  slug: string;
  title: LocalizedString;
  description: LocalizedString;
  sections: DocSection[];
}

// =============================================================================
// API Reference Types
// =============================================================================

export interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: LocalizedString;
}

export interface ApiResponse {
  status: number;
  description: LocalizedString;
  example?: string;  // JSON string
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  title: LocalizedString;
  description: LocalizedString;
  auth: 'api_key' | 'bearer' | 'public';
  requestBody?: {
    contentType: string;
    parameters: ApiParameter[];
    example?: string;
  };
  queryParams?: ApiParameter[];
  pathParams?: ApiParameter[];
  responses: ApiResponse[];
  codeExamples?: CodeExample[];
}

// =============================================================================
// SDK Reference Types
// =============================================================================

export interface SdkMethod {
  name: string;
  signature: string;
  description: LocalizedString;
  parameters: ApiParameter[];
  returns: {
    type: string;
    description: LocalizedString;
  };
  example: CodeExample;
}

export interface SdkClass {
  name: string;
  description: LocalizedString;
  constructor: {
    parameters: ApiParameter[];
    example: CodeExample;
  };
  methods: SdkMethod[];
}

// =============================================================================
// Navigation Types
// =============================================================================

export interface NavItem {
  title: LocalizedString;
  href: string;
  items?: NavItem[];
}

export interface DocsNav {
  sections: {
    title: LocalizedString;
    items: NavItem[];
  }[];
}

