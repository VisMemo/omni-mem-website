import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  docsNavigation,
  conceptsPage,
  pythonSdkPage,
  javascriptSdkPage,
  setupGuidePage,
  agentIntegrationPage,
  multiSpeakerPage,
  pipelinesPage,
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
  onLocaleToggle?: () => void
}

const pageMap: Record<string, DocPage> = {
  'guides/setup': setupGuidePage,
  'sdk/python': pythonSdkPage,
  'sdk/javascript': javascriptSdkPage,
  'concepts': conceptsPage,
  'guides/agent': agentIntegrationPage,
  'guides/multi-speaker': multiSpeakerPage,
  'pipelines': pipelinesPage,
  'reference/errors': errorsPage,
  'reference/limits': limitsPage,
  'reference/changelog': changelogPage,
}

const pageOrder = [
  'guides/setup',
  'sdk/python',
  'sdk/javascript',
  'concepts',
  'pipelines',
  'guides/agent',
  'guides/multi-speaker',
  'reference/errors',
  'reference/limits',
  'reference/changelog',
]

// Build search index from all pages
interface SearchItem {
  title: string
  slug: string
  section?: string
  sectionId?: string
  content: string
}

function buildSearchIndex(locale: Locale): SearchItem[] {
  const items: SearchItem[] = []
  const t = (s: LocalizedString) => s[locale]

  Object.entries(pageMap).forEach(([slug, page]) => {
    // Add page title
    items.push({
      title: t(page.title),
      slug,
      content: t(page.description),
    })

    // Add sections
    page.sections.forEach((section) => {
      items.push({
        title: t(page.title),
        slug,
        section: t(section.heading),
        sectionId: section.id,
        content: t(section.content),
      })
    })
  })

  return items
}

export function DocsPage({ locale, onNavigate, onLocaleToggle }: DocsPageProps) {
  const [currentSlug, setCurrentSlug] = useState('guides/setup')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const searchIndex = useMemo(() => buildSearchIndex(locale), [locale])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return searchIndex
      .filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.section?.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
      )
      .slice(0, 8)
  }, [searchQuery, searchIndex])

  useEffect(() => {
    const path = window.location.pathname
    const hash = window.location.hash.slice(1)
    const match = path.match(/\/docs\/(.+)/)
    if (match) {
      setCurrentSlug(match[1])
      if (hash) {
        setTimeout(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
        }, 300)
      }
    } else if (path === '/docs' || path === '/docs/') {
      setCurrentSlug('guides/setup')
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-100px 0px -70% 0px' }
    )
    document.querySelectorAll('section[id]').forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [currentSlug])

  useEffect(() => { setSidebarOpen(false) }, [currentSlug])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
        setSearchOpen(false)
        setSearchQuery('')
      }
      // Cmd+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const currentPage = pageMap[currentSlug]
  const t = (str: LocalizedString) => str[locale]

  const handleNavClick = useCallback((href: string) => {
    const [path, hash] = href.split('#')
    const slug = path.replace('/docs/', '').replace('/docs', 'guides/setup')
    setCurrentSlug(slug || 'guides/setup')
    onNavigate(path)
    setSidebarOpen(false)
    setSearchOpen(false)
    setSearchQuery('')
    if (hash) {
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 200)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [onNavigate])

  const handleSearchSelect = useCallback((item: SearchItem) => {
    const href = item.sectionId
      ? `/docs/${item.slug}#${item.sectionId}`
      : `/docs/${item.slug}`
    handleNavClick(href)
  }, [handleNavClick])

  return (
    <div className="mintlify-docs">
      {sidebarOpen && <div className="mintlify-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Search Modal */}
      {searchOpen && (
        <>
          <div className="mintlify-overlay" onClick={() => { setSearchOpen(false); setSearchQuery('') }} />
          <div className="mintlify-search-modal">
            <div className="search-modal-input">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder={locale === 'en' ? 'Search documentation...' : '搜索文档...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <kbd>ESC</kbd>
            </div>
            {searchResults.length > 0 && (
              <div className="search-modal-results">
                {searchResults.map((item, i) => (
                  <button
                    key={`${item.slug}-${item.sectionId || i}`}
                    className="search-result-item"
                    onClick={() => handleSearchSelect(item)}
                  >
                    <div className="search-result-title">
                      {item.section ? (
                        <>
                          <span className="search-result-page">{item.title}</span>
                          <span className="search-result-separator">/</span>
                          <span>{item.section}</span>
                        </>
                      ) : (
                        <span>{item.title}</span>
                      )}
                    </div>
                    <div className="search-result-preview">
                      {item.content.slice(0, 100)}...
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchQuery && searchResults.length === 0 && (
              <div className="search-modal-empty">
                {locale === 'en' ? 'No results found' : '未找到结果'}
              </div>
            )}
          </div>
        </>
      )}

      {/* Mobile Toggle */}
      <button className="mintlify-mobile-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          {sidebarOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`mintlify-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="mintlify-sidebar-inner">
          <header className="mintlify-sidebar-header">
            <a href="/" className="mintlify-logo">
              <img src="/Logo/SVG/Logo-Graphic-OmniMemory.svg" alt="" />
              <span>OmniMemory</span>
            </a>
          </header>

          <button className="mintlify-search" onClick={() => setSearchOpen(true)}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <span>{locale === 'en' ? 'Search...' : '搜索...'}</span>
            <kbd>⌘K</kbd>
          </button>

          <nav className="mintlify-nav">
            {docsNavigation.sections.map((section, i) => (
              <div key={i} className="mintlify-nav-section">
                <h3>{t(section.title)}</h3>
                <ul>
                  {section.items.map((item, j) => {
                    const slug = item.href.replace('/docs/', '')
                    const active = slug === currentSlug || (item.href === '/docs/sdk/python' && currentSlug === 'sdk/python')
                    return (
                      <li key={j}>
                        <a href={item.href} onClick={(e) => { e.preventDefault(); handleNavClick(item.href) }} className={active ? 'active' : ''}>
                          {t(item.title)}
                        </a>
                        {item.items && (
                          <ul className="mintlify-nav-sub">
                            {item.items.map((sub, k) => (
                              <li key={k}>
                                <a href={sub.href} onClick={(e) => { e.preventDefault(); handleNavClick(sub.href) }}>
                                  {t(sub.title)}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <footer className="mintlify-sidebar-footer">
            {onLocaleToggle && (
              <button className="mintlify-lang-toggle" onClick={onLocaleToggle}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                {locale === 'en' ? '中文' : 'English'}
              </button>
            )}
            <a href="/AGENT_GUIDE.md" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Agent Guide
            </a>
            <a href="https://github.com/omnimemory" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </footer>
        </div>
      </aside>

      {/* Main */}
      <main className="mintlify-main">
        <article className="mintlify-article">
          {currentPage ? (
            <DocContent page={currentPage} locale={locale} slug={currentSlug} onNav={handleNavClick} />
          ) : currentSlug === 'api/memory' ? (
            <ApiContent
              title={{ en: 'Memory API', zh: '记忆 API' }}
              desc={{ en: 'Save and search memories via HTTP API.', zh: '通过 HTTP API 保存和搜索记忆。' }}
              endpoints={[ingestEndpoint, retrievalEndpoint]}
              locale={locale}
            />
          ) : currentSlug === 'api/management' ? (
            <ApiContent
              title={{ en: 'Management API', zh: '管理 API' }}
              desc={{ en: 'Manage API keys, uploads, and usage.', zh: '管理 API 密钥、上传和用量。' }}
              endpoints={managementEndpoints}
              locale={locale}
            />
          ) : (
            <NotFound slug={currentSlug} onNav={handleNavClick} />
          )}
        </article>
      </main>

      {/* TOC */}
      {currentPage && currentPage.sections.length > 0 && (
        <aside className="mintlify-toc">
          <div className="mintlify-toc-inner">
            <h4>{locale === 'en' ? 'On this page' : '本页内容'}</h4>
            <ul>
              {currentPage.sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={activeSection === s.id ? 'active' : ''}
                    onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }) }}
                  >
                    {(s.heading as LocalizedString)[locale]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
      {/* API TOC */}
      {currentSlug === 'api/memory' && (
        <aside className="mintlify-toc">
          <div className="mintlify-toc-inner">
            <h4>{locale === 'en' ? 'On this page' : '本页内容'}</h4>
            <ul>
              {[ingestEndpoint, retrievalEndpoint].map((ep) => {
                const sectionId = ep.path.replace(/[/:]/g, '-')
                return (
                  <li key={sectionId}>
                    <a
                      href={`#${sectionId}`}
                      className={activeSection === sectionId ? 'active' : ''}
                      onClick={(e) => { e.preventDefault(); document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' }) }}
                    >
                      {ep.title[locale]}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>
      )}
      {currentSlug === 'api/management' && (
        <aside className="mintlify-toc">
          <div className="mintlify-toc-inner">
            <h4>{locale === 'en' ? 'On this page' : '本页内容'}</h4>
            <ul>
              {managementEndpoints.map((ep) => {
                const sectionId = ep.path.replace(/[/:]/g, '-')
                return (
                  <li key={sectionId}>
                    <a
                      href={`#${sectionId}`}
                      className={activeSection === sectionId ? 'active' : ''}
                      onClick={(e) => { e.preventDefault(); document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' }) }}
                    >
                      {ep.title[locale]}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>
      )}
    </div>
  )
}

function DocContent({ page, locale, slug, onNav }: { page: DocPage; locale: Locale; slug: string; onNav: (h: string) => void }) {
  const t = (s: LocalizedString) => s[locale]
  const idx = pageOrder.indexOf(slug)
  const prev = idx > 0 ? pageMap[pageOrder[idx - 1]] : null
  const next = idx < pageOrder.length - 1 ? pageMap[pageOrder[idx + 1]] : null
  const prevSlug = idx > 0 ? pageOrder[idx - 1] : null
  const nextSlug = idx < pageOrder.length - 1 ? pageOrder[idx + 1] : null

  return (
    <>
      <header className="mintlify-header">
        <div className="mintlify-breadcrumb">
          <a href="/docs" onClick={(e) => { e.preventDefault(); onNav('/docs/quickstart') }}>Docs</a>
          <span>/</span>
          <span>{t(page.title)}</span>
        </div>
        <h1>{t(page.title)}</h1>
        <p>{t(page.description)}</p>
      </header>

      <div className="mintlify-content">
        {page.sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2>
              <a href={`#${section.id}`} className="mintlify-anchor">#</a>
              {t(section.heading)}
            </h2>
            <Prose content={t(section.content)} onNav={onNav} />
            {section.codeExamples && section.codeExamples.length > 0 && (
              <CodeTabs examples={section.codeExamples} />
            )}
          </section>
        ))}
      </div>

      <nav className="mintlify-pagination">
        {prev && prevSlug ? (
          <a href={`/docs/${prevSlug}`} onClick={(e) => { e.preventDefault(); onNav(`/docs/${prevSlug}`) }} className="prev">
            <span>← Previous</span>
            <strong>{t(prev.title)}</strong>
          </a>
        ) : <div />}
        {next && nextSlug && (
          <a href={`/docs/${nextSlug}`} onClick={(e) => { e.preventDefault(); onNav(`/docs/${nextSlug}`) }} className="next">
            <span>Next →</span>
            <strong>{t(next.title)}</strong>
          </a>
        )}
      </nav>

      <footer className="mintlify-feedback">
        <span>Was this page helpful?</span>
        <button className="yes">👍 Yes</button>
        <button className="no">👎 No</button>
      </footer>
    </>
  )
}

function ApiContent({ title, desc, endpoints, locale }: { title: LocalizedString; desc: LocalizedString; endpoints: ApiEndpoint[]; locale: Locale }) {
  const t = (s: LocalizedString) => s[locale]
  return (
    <>
      <header className="mintlify-header">
        <h1>{t(title)}</h1>
        <p>{t(desc)}</p>
      </header>
      <div className="mintlify-content">
        {endpoints.map((ep, i) => (
          <section key={i} id={ep.path.replace(/[/:]/g, '-')}>
            <div className="mintlify-endpoint">
              <span className={`method ${ep.method.toLowerCase()}`}>{ep.method}</span>
              <code>{ep.path}</code>
            </div>
            <h3>{t(ep.title)}</h3>
            <p className="desc">{t(ep.description)}</p>
            {ep.requestBody && (
              <div className="mintlify-params">
                <h4>Parameters</h4>
                <div className="params-list">
                  {ep.requestBody.parameters.map((p, j) => (
                    <div key={j} className="param">
                      <div className="param-header">
                        <code className="param-name">{p.name}</code>
                        <span className="param-type">{p.type}</span>
                        {p.required && <span className="param-required">required</span>}
                      </div>
                      <p className="param-desc">{t(p.description)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {ep.codeExamples && <CodeTabs examples={ep.codeExamples} />}
            {ep.responses.filter(r => r.example).map((r, j) => (
              <div key={j} className="mintlify-response">
                <h4>Response <code>{r.status}</code></h4>
                <CodeBlock code={r.example!} lang="json" />
              </div>
            ))}
          </section>
        ))}
      </div>
    </>
  )
}

function NotFound({ slug, onNav }: { slug: string; onNav: (h: string) => void }) {
  return (
    <div className="mintlify-notfound">
      <div className="icon">📄</div>
      <h1>Page not found</h1>
      <p>The page <code>{slug}</code> doesn't exist.</p>
      <a href="/docs/sdk/python" onClick={(e) => { e.preventDefault(); onNav('/docs/sdk/python') }}>
        Go to Python SDK →
      </a>
    </div>
  )
}

function Prose({ content, onNav }: { content: string; onNav?: (href: string) => void }) {
  // Better markdown parser
  const parseMarkdown = (text: string): string => {
    let html = text

    // Callouts first (before other processing)
    html = html.replace(/:::info\n([\s\S]*?):::/g, '<div class="callout info"><div class="callout-icon">💡</div><div class="callout-content">$1</div></div>')
    html = html.replace(/:::warning\n([\s\S]*?):::/g, '<div class="callout warning"><div class="callout-icon">⚠️</div><div class="callout-content">$1</div></div>')
    html = html.replace(/:::tip\n([\s\S]*?):::/g, '<div class="callout tip"><div class="callout-icon">✨</div><div class="callout-content">$1</div></div>')

    // Tables (before code blocks to avoid conflicts)
    html = html.replace(/\n\|(.+)\|\n\|([-:| ]+)\|\n((?:\|.+\|\n?)+)/g, (match, header, separator, body) => {
      const headers = header.split('|').filter(c => c.trim()).map(h => {
        const trimmed = h.trim()
        // Process markdown in headers (bold, links, etc.)
        let processed = trimmed
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        return `<th>${processed}</th>`
      }).join('')
      
      const rows = body.trim().split('\n').filter(row => row.trim()).map(row => {
        const cells = row.split('|').filter(c => c.trim()).map(c => {
          const trimmed = c.trim()
          // Process markdown in cells (bold, links, code, etc.)
          let processed = trimmed
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
          return `<td>${processed}</td>`
        }).join('')
        return `<tr>${cells}</tr>`
      }).join('')
      
      return `<table class="mintlify-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`
    })

    // Code blocks (before inline code)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block"><code class="lang-$1">$2</code></pre>')

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

    // Bold and italic
    html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

    // Links - handle internal docs links specially
    html = html.replace(/\[([^\]]+)\]\(\/docs\/([^)]+)\)/g, '<a href="/docs/$2" class="internal-link" data-href="/docs/$2">$1</a>')
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

    // Headers
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')

    // Split into lines for list processing
    const lines = html.split('\n')
    const processed: string[] = []
    let inOrderedList = false
    let inUnorderedList = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const orderedMatch = line.match(/^(\d+)\.\s+(.+)$/)
      const unorderedMatch = line.match(/^-\s+(.+)$/)

      if (orderedMatch) {
        if (!inOrderedList) {
          if (inUnorderedList) {
            processed.push('</ul>')
            inUnorderedList = false
          }
          processed.push('<ol>')
          inOrderedList = true
        }
        processed.push(`<li>${orderedMatch[2]}</li>`)
      } else if (unorderedMatch) {
        if (!inUnorderedList) {
          if (inOrderedList) {
            processed.push('</ol>')
            inOrderedList = false
          }
          processed.push('<ul>')
          inUnorderedList = true
        }
        processed.push(`<li>${unorderedMatch[1]}</li>`)
      } else {
        if (inOrderedList) {
          processed.push('</ol>')
          inOrderedList = false
        }
        if (inUnorderedList) {
          processed.push('</ul>')
          inUnorderedList = false
        }
        processed.push(line)
      }
    }

    // Close any open lists
    if (inOrderedList) processed.push('</ol>')
    if (inUnorderedList) processed.push('</ul>')

    html = processed.join('\n')

    // Paragraphs - wrap text blocks
    html = html.split('\n\n').map(block => {
      block = block.trim()
      if (!block) return ''
      // Don't wrap if it's already an HTML element
      if (block.startsWith('<h') ||
          block.startsWith('<ul') ||
          block.startsWith('<ol') ||
          block.startsWith('<pre') ||
          block.startsWith('<div') ||
          block.startsWith('<li') ||
          block.startsWith('<table')) {
        return block
      }
      return `<p>${block}</p>`
    }).join('')

    // Clean up empty paragraphs and fix whitespace
    html = html.replace(/<p>\s*<\/p>/g, '')
    html = html.replace(/<p>(<[huo])/g, '$1')
    html = html.replace(/(<\/[huo][l1-6]?>)<\/p>/g, '$1')

    return html
  }

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'A' && target.classList.contains('internal-link')) {
      e.preventDefault()
      const href = target.getAttribute('data-href')
      if (href && onNav) {
        onNav(href)
      }
    }
  }

  return (
    <div
      className="mintlify-prose"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
      onClick={handleClick}
    />
  )
}

function CodeTabs({ examples }: { examples: { code: string; language: string; title?: string }[] }) {
  const [active, setActive] = useState(0)
  if (examples.length === 1) {
    return <CodeBlock code={examples[0].code} lang={examples[0].language} title={examples[0].title} />
  }
  return (
    <div className="mintlify-codetabs">
      <div className="tabs">
        {examples.map((ex, i) => (
          <button key={i} className={i === active ? 'active' : ''} onClick={() => setActive(i)}>
            {ex.title || ex.language}
          </button>
        ))}
      </div>
      <CodeBlock code={examples[active].code} lang={examples[active].language} />
    </div>
  )
}

function CodeBlock({ code, lang, title }: { code: string; lang: string; title?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="mintlify-codeblock">
      {title && <div className="codeblock-title">{title}</div>}
      <div className="codeblock-body">
        <pre><code className={`lang-${lang}`}>{code}</code></pre>
        <button className="copy-btn" onClick={copy}>
          {copied ? (
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
          ) : (
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
          )}
        </button>
      </div>
    </div>
  )
}
