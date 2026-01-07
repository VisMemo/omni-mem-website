import { useState, useEffect } from 'react'
import { 
  docsNavigation, 
  quickstartPage,
  pythonSdkPage,
  errorsPage,
  limitsPage,
  changelogPage,
  ingestEndpoint,
  retrievalEndpoint,
  managementEndpoints,
} from '../content/docs'
import type { DocPage, ApiEndpoint, LocalizedString } from '../content/docs/types'

type Locale = 'en' | 'zh'

interface DocsPageProps {
  locale: Locale
  onNavigate: (path: string) => void
}

// Map slugs to pages
const pageMap: Record<string, DocPage> = {
  'quickstart': quickstartPage,
  'sdk/python': pythonSdkPage,
  'reference/errors': errorsPage,
  'reference/limits': limitsPage,
  'reference/changelog': changelogPage,
}

export function DocsPage({ locale, onNavigate }: DocsPageProps) {
  const [currentSlug, setCurrentSlug] = useState('quickstart')
  
  // Parse slug from URL
  useEffect(() => {
    const path = window.location.pathname
    const match = path.match(/\/docs\/(.+)/)
    if (match) {
      setCurrentSlug(match[1])
    } else if (path === '/docs' || path === '/docs/') {
      setCurrentSlug('quickstart')
    }
  }, [])

  const currentPage = pageMap[currentSlug]
  const t = (str: LocalizedString) => str[locale]

  const handleNavClick = (href: string) => {
    const slug = href.replace('/docs/', '').replace('/docs', 'quickstart')
    setCurrentSlug(slug || 'quickstart')
    onNavigate(href)
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-ink/10 bg-ivory-dark/30 p-6 overflow-y-auto fixed h-[calc(100vh-80px)] top-20">
        <nav>
          {docsNavigation.sections.map((section, i) => (
            <div key={i} className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">
                {t(section.title)}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item, j) => (
                  <li key={j}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault()
                        handleNavClick(item.href)
                      }}
                      className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                        item.href === `/docs/${currentSlug}` || (item.href === '/docs/quickstart' && currentSlug === 'quickstart')
                          ? 'bg-vermillion/10 text-vermillion font-medium'
                          : 'text-ink-muted hover:text-ink hover:bg-ink/5'
                      }`}
                    >
                      {t(item.title)}
                    </a>
                    {item.items && (
                      <ul className="ml-4 mt-1 space-y-1 border-l border-ink/10 pl-3">
                        {item.items.map((subItem, k) => (
                          <li key={k}>
                            <a
                              href={subItem.href}
                              onClick={(e) => {
                                e.preventDefault()
                                handleNavClick(subItem.href)
                              }}
                              className="block py-1 text-sm text-ink-muted hover:text-ink"
                            >
                              {t(subItem.title)}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 max-w-4xl">
        {currentPage ? (
          <DocPageContent page={currentPage} locale={locale} />
        ) : currentSlug === 'api/memory' ? (
          <ApiPageContent 
            title={{ en: 'Memory API', zh: '记忆 API' }}
            description={{ en: 'Save and search memories via HTTP API.', zh: '通过 HTTP API 保存和搜索记忆。' }}
            endpoints={[ingestEndpoint, retrievalEndpoint]} 
            locale={locale} 
          />
        ) : currentSlug === 'api/management' ? (
          <ApiPageContent 
            title={{ en: 'Management API', zh: '管理 API' }}
            description={{ en: 'Manage API keys, uploads, and usage.', zh: '管理 API 密钥、上传和用量。' }}
            endpoints={managementEndpoints} 
            locale={locale} 
          />
        ) : (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
            <p className="text-ink-muted">The documentation page "{currentSlug}" doesn't exist.</p>
          </div>
        )}
      </main>
    </div>
  )
}

// Render a documentation page
function DocPageContent({ page, locale }: { page: DocPage; locale: Locale }) {
  const t = (str: LocalizedString) => str[locale]

  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">{t(page.title)}</h1>
      <p className="text-lg text-ink-muted mb-8">{t(page.description)}</p>

      {page.sections.map((section) => (
        <section key={section.id} id={section.id} className="mb-12">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-ink/10">
            {t(section.heading)}
          </h2>
          <div 
            className="prose prose-ink max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(t(section.content)) }}
          />
          {section.codeExamples?.map((example, i) => (
            <CodeBlock key={i} code={example.code} language={example.language} title={example.title} />
          ))}
        </section>
      ))}
    </article>
  )
}

// Render API endpoint documentation
function ApiPageContent({ 
  title, 
  description, 
  endpoints, 
  locale 
}: { 
  title: LocalizedString
  description: LocalizedString
  endpoints: ApiEndpoint[]
  locale: Locale 
}) {
  const t = (str: LocalizedString) => str[locale]

  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">{t(title)}</h1>
      <p className="text-lg text-ink-muted mb-8">{t(description)}</p>

      {endpoints.map((endpoint, i) => (
        <section key={i} id={endpoint.path.replace(/[/:]/g, '-')} className="mb-12 p-6 bg-ivory-dark/30 rounded-lg border border-ink/10">
          {/* Method + Path */}
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-2 py-1 text-xs font-mono font-bold rounded ${
              endpoint.method === 'GET' ? 'bg-petrol/20 text-petrol' :
              endpoint.method === 'POST' ? 'bg-vermillion/20 text-vermillion' :
              endpoint.method === 'DELETE' ? 'bg-red-500/20 text-red-600' :
              'bg-gold/20 text-gold'
            }`}>
              {endpoint.method}
            </span>
            <code className="text-lg font-mono">{endpoint.path}</code>
          </div>

          {/* Title + Description */}
          <h3 className="text-xl font-semibold mb-2">{t(endpoint.title)}</h3>
          <p className="text-ink-muted mb-4">{t(endpoint.description)}</p>

          {/* Request Body Parameters */}
          {endpoint.requestBody && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">{locale === 'zh' ? '请求体' : 'Request Body'}</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink/10">
                    <th className="text-left py-2 pr-4">{locale === 'zh' ? '参数' : 'Parameter'}</th>
                    <th className="text-left py-2 pr-4">{locale === 'zh' ? '类型' : 'Type'}</th>
                    <th className="text-left py-2 pr-4">{locale === 'zh' ? '必填' : 'Required'}</th>
                    <th className="text-left py-2">{locale === 'zh' ? '描述' : 'Description'}</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoint.requestBody.parameters.map((param, j) => (
                    <tr key={j} className="border-b border-ink/5">
                      <td className="py-2 pr-4 font-mono text-vermillion">{param.name}</td>
                      <td className="py-2 pr-4 font-mono text-ink-muted">{param.type}</td>
                      <td className="py-2 pr-4">{param.required ? '✓' : '—'}</td>
                      <td className="py-2 text-ink-muted">{t(param.description)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Code Examples */}
          {endpoint.codeExamples?.map((example, j) => (
            <CodeBlock key={j} code={example.code} language={example.language} title={example.title} />
          ))}

          {/* Response Examples */}
          {endpoint.responses.filter(r => r.example).map((resp, j) => (
            <div key={j} className="mt-4">
              <h4 className="font-semibold mb-2">
                {locale === 'zh' ? '响应' : 'Response'} {resp.status}
              </h4>
              <CodeBlock code={resp.example!} language="json" />
            </div>
          ))}
        </section>
      ))}
    </article>
  )
}

// Simple code block component
function CodeBlock({ code, language, title }: { code: string; language: string; title?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-ink/10">
      {title && (
        <div className="bg-ink/5 px-4 py-2 text-sm font-medium border-b border-ink/10 flex justify-between items-center">
          <span>{title}</span>
          <span className="text-xs text-ink-muted font-mono">{language}</span>
        </div>
      )}
      <div className="relative">
        <pre className="bg-[#1a1a2e] text-[#e0e0e0] p-4 overflow-x-auto text-sm font-mono">
          <code>{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
        >
          {copied ? '✓' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

// Simple markdown to HTML (handles basic formatting)
function markdownToHtml(md: string): string {
  return md
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-ink/5 p-4 rounded-lg overflow-x-auto"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-ink/10 px-1 rounded text-vermillion">$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-vermillion hover:underline">$1</a>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>')
    // Lists
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    // Tables (basic)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(Boolean).map(c => c.trim())
      if (cells.every(c => c.match(/^-+$/))) return ''
      return `<tr>${cells.map(c => `<td class="border border-ink/10 px-3 py-2">${c}</td>`).join('')}</tr>`
    })
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="mb-4">')
    // Wrap in paragraph
    .replace(/^(.+)$/m, '<p class="mb-4">$1')
}

