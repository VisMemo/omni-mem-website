import { useEffect, useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { BarChart3, Home, KeyRound, Settings, UploadCloud, UserCircle, Play, Check, X, Linkedin, Github } from 'lucide-react'
import { Analytics } from '@vercel/analytics/react'
import { DashboardShell, type DashboardLink } from './components/dashboard-shell'
import { useSupabaseSession } from './hooks/use-supabase-session'
import { DashboardPage } from './pages/dashboard'
import { ApiKeysPage } from './pages/api-keys'
import { UploadsPage } from './pages/uploads'
import { UsagePage } from './pages/usage'
import { MemoryPolicyPage } from './pages/memory-policy'
import { ProfilePage } from './pages/profile'
import { SignInPage } from './pages/auth/sign-in'
import { SignUpPage } from './pages/auth/sign-up'
import { PasswordResetPage } from './pages/auth/password-reset'
import { UpdatePasswordPage } from './pages/auth/update-password'
import { DocsPage } from './pages/docs'
import { FaqPage } from './pages/faq'

export function App() {
  const [locale, setLocale] = useState<Locale>(() => getPreferredLocale())
  const [routeKey, setRouteKey] = useState<RouteKey>(() =>
    getRouteFromPathname({ pathname: getBrowserPathname() })
  )
  const [isScrolled, setIsScrolled] = useState(false)
  const content = contentByLocale[locale]
  const { session, isLoading: isSessionLoading } = useSupabaseSession()
  const accountDisplayName =
    session?.user?.user_metadata?.name ??
    (session?.user?.email ? session.user.email.split('@')[0] : null)
  const accountEmail = session?.user?.email ?? null
  const signInPath = buildLocalePathname({ pathname: ROUTE_PATHS.signIn, locale })
  const signUpPath = buildLocalePathname({ pathname: ROUTE_PATHS.signUp, locale })
  const passwordResetPath = buildLocalePathname({ pathname: ROUTE_PATHS.passwordReset, locale })
  const updatePasswordPath = buildLocalePathname({ pathname: ROUTE_PATHS.updatePassword, locale })
  const dashboardPath = buildLocalePathname({ pathname: ROUTE_PATHS.dashboard, locale })
  const apiKeysPath = buildLocalePathname({ pathname: ROUTE_PATHS.apiKeys, locale })
  const uploadsPath = buildLocalePathname({ pathname: ROUTE_PATHS.uploads, locale })
  const usagePath = buildLocalePathname({ pathname: ROUTE_PATHS.usage, locale })
  const memoryPolicyPath = buildLocalePathname({ pathname: ROUTE_PATHS.memoryPolicy, locale })
  const profilePath = buildLocalePathname({ pathname: ROUTE_PATHS.profile, locale })
  const homePath = '/'
  const isMarketing = routeKey === 'marketing'
  const isDocs = routeKey === 'docs'
  const isProtectedRoute = ['dashboard', 'apiKeys', 'uploads', 'usage', 'memoryPolicy', 'profile'].includes(routeKey)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // IP-based locale detection on first visit
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Check if we've already detected locale from IP
    const ipLocaleChecked = window.localStorage.getItem(IP_LOCALE_CHECKED_KEY)
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)

    // Only run IP detection if:
    // 1. Never checked before
    // 2. No stored locale preference
    if (ipLocaleChecked || storedLocale) return

    detectLocaleFromIP().then((detectedLocale) => {
      window.localStorage.setItem(IP_LOCALE_CHECKED_KEY, 'true')
      if (detectedLocale && detectedLocale !== locale) {
        setLocale(detectedLocale)
      }
    })
  }, []) // Only run on mount

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Sync locale to document and localStorage
    document.documentElement.lang = locale
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)

    // Update URL to reflect current locale (URL-based i18n)
    const currentPath = window.location.pathname
    const pathLocale = getLocaleFromPathname({ pathname: currentPath })
    const strippedPath = stripLocaleFromPathname({ pathname: currentPath })

    // Build the correct URL for current locale
    const correctPath = buildLocalePathname({ pathname: strippedPath, locale })
    if (currentPath !== correctPath) {
      const nextUrl = `${correctPath}${window.location.search}${window.location.hash}`
      window.history.replaceState(null, '', nextUrl)
    }
  }, [locale])

  useEffect(() => {
    if (typeof window === 'undefined') return
    function handlePopState() {
      const pathname = window.location.pathname
      // Sync locale from URL
      const pathLocale = getLocaleFromPathname({ pathname })
      if (pathLocale && pathLocale !== locale) {
        setLocale(pathLocale)
      }
      // Get route from stripped path
      const strippedPath = stripLocaleFromPathname({ pathname })
      setRouteKey(getRouteFromPathname({ pathname: strippedPath }))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [locale])

  useEffect(() => {
    if (!isProtectedRoute) return
    if (isSessionLoading) return
    if (session) return
    navigateTo(signInPath)
  }, [isProtectedRoute, isSessionLoading, routeKey, session, signInPath])

  function handleLocaleToggle() {
    const newLocale = locale === 'en' ? 'zh' : 'en'
    setLocale(newLocale)
    // URL will be updated by the useEffect that watches locale
  }

  function handleSignInClick() { navigateTo(signInPath) }
  function handleSignUpClick() { navigateTo(signUpPath) }

  function navigateTo(pathname: string) {
    if (typeof window === 'undefined') return
    // Build locale-aware path
    const strippedPath = stripLocaleFromPathname({ pathname })
    const localePath = buildLocalePathname({ pathname: strippedPath, locale })
    window.history.pushState({}, '', localePath)
    setRouteKey(getRouteFromPathname({ pathname: strippedPath }))
  }

  const dashboardLinks: DashboardLink[] = locale === 'zh' ? [
    { label: '概览', path: dashboardPath, group: 'main', icon: Home },
    { label: 'API 密钥', path: apiKeysPath, group: 'main', icon: KeyRound },
    { label: '上传任务', path: uploadsPath, group: 'main', icon: UploadCloud },
    { label: '用量', path: usagePath, group: 'main', icon: BarChart3 },
    { label: '记忆策略', path: memoryPolicyPath, group: 'main', icon: Settings },
    { label: '个人资料', path: profilePath, group: 'account', icon: UserCircle },
  ] : [
    { label: 'Overview', path: dashboardPath, group: 'main', icon: Home },
    { label: 'API Keys', path: apiKeysPath, group: 'main', icon: KeyRound },
    { label: 'Uploads', path: uploadsPath, group: 'main', icon: UploadCloud },
    { label: 'Usage', path: usagePath, group: 'main', icon: BarChart3 },
    { label: 'Memory Policy', path: memoryPolicyPath, group: 'main', icon: Settings },
    { label: 'Profile', path: profilePath, group: 'account', icon: UserCircle },
  ]

  const currentDashboardPath = (() => {
    switch (routeKey) {
      case 'apiKeys': return apiKeysPath
      case 'uploads': return uploadsPath
      case 'usage': return usagePath
      case 'memoryPolicy': return memoryPolicyPath
      case 'profile': return profilePath
      default: return dashboardPath
    }
  })()

  const mainClassName = isProtectedRoute
    ? 'min-h-[70vh]'
    : isDocs
      ? 'min-h-[70vh] pt-0'
      : 'min-h-[70vh] px-6 pb-24 pt-28 sm:px-8'

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      {isMarketing && (
        <div className="announcement-bar">
          <span>UPCOMING UPDATE: OmniMemory 1.1</span>
        </div>
      )}

      {/* Navbar */}
      <nav className={`navbar-v2 ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-v2-inner">
          <a href={homePath} className="logo-v2">
            <img src="/Logo/SVG/Logo-Graphic-OmniMemory.svg" alt="" width={28} height={28} />
            <span>OmniMemory</span>
          </a>

          {isMarketing && (
            <div className="nav-links-v2">
              {content.navbar.navLinks.map((link) => (
                link.dropdown ? (
                  <div key={link.label} className="navbar-dropdown">
                    <button className="nav-link-v2 dropdown-trigger">
                      {link.label}
                      <span className="dropdown-chevron">▾</span>
                    </button>
                    <div className="dropdown-menu">
                      {link.dropdown.map((item) => (
                        <a key={item.label} href={item.href} className="dropdown-item">
                          <span className="dropdown-icon">{item.icon}</span>
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <a key={link.label} href={link.href} className="nav-link-v2">
                    {link.label}
                  </a>
                )
              ))}
            </div>
          )}

          <div className="nav-actions-v2">
            <button onClick={handleLocaleToggle} className="lang-toggle-v2">
              {locale === 'en' ? '中文' : 'EN'}
            </button>
            {isMarketing && (
              <a href="/dashboard" className="btn-primary btn-nav">
                {content.navbar.ctaLabel}
              </a>
            )}
            {!isMarketing && session ? (
              <div className="hidden flex-col items-end text-xs text-ink/60 sm:flex">
                <span className="font-semibold text-ink">
                  {accountDisplayName ?? '账户'}
                </span>
                {accountEmail ? <span>{accountEmail}</span> : null}
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      {isMarketing ? (
        <main>
          <HeroSection content={content.hero} />
          <DemoSection />
          <HowItWorksSection content={content.howItWorks} />
          <BenchmarkSection content={content.stats} />
          <DevelopersSection content={content.developers} />
          <EnterpriseSection content={content.features} />
          <TestimonialsSection content={content.testimonials} />
          <PartnersMarquee content={content.partners} />
          <PricingSection content={content.pricing} />
          <CtaSection content={content.cta} />
          <FooterSection content={content.footer} />
        </main>
      ) : (
        <main className={mainClassName}>
          {isProtectedRoute && (
            <DashboardShell
              title={getDashboardTitle(routeKey, locale)}
              currentPath={currentDashboardPath}
              links={dashboardLinks}
              locale={locale}
              onNavigate={navigateTo}
              onSignIn={handleSignInClick}
              onSignUp={handleSignUpClick}
            >
              {routeKey === 'dashboard' && <DashboardPage />}
              {routeKey === 'apiKeys' && <ApiKeysPage />}
              {routeKey === 'uploads' && <UploadsPage />}
              {routeKey === 'usage' && <UsagePage />}
              {routeKey === 'memoryPolicy' && <MemoryPolicyPage />}
              {routeKey === 'profile' && <ProfilePage />}
            </DashboardShell>
          )}
          {routeKey === 'signIn' && (
            <div className="mx-auto flex w-full max-w-5xl justify-center py-16">
              <SignInPage signUpPath={signUpPath} passwordResetPath={passwordResetPath} dashboardPath={dashboardPath} onNavigate={navigateTo} />
            </div>
          )}
          {routeKey === 'signUp' && (
            <div className="mx-auto flex w-full max-w-5xl justify-center py-16">
              <SignUpPage signInPath={signInPath} dashboardPath={dashboardPath} onNavigate={navigateTo} />
            </div>
          )}
          {routeKey === 'passwordReset' && (
            <div className="mx-auto flex w-full max-w-5xl justify-center py-16">
              <PasswordResetPage
                signInPath={signInPath}
                dashboardPath={dashboardPath}
                updatePasswordPath={updatePasswordPath}
                onNavigate={navigateTo}
              />
            </div>
          )}
          {routeKey === 'updatePassword' && (
            <div className="mx-auto flex w-full max-w-5xl justify-center py-16">
              <UpdatePasswordPage
                dashboardPath={dashboardPath}
                signInPath={signInPath}
                onNavigate={navigateTo}
              />
            </div>
          )}
          {routeKey === 'docs' && (
            <DocsPage locale={locale} onNavigate={navigateTo} onLocaleToggle={handleLocaleToggle} />
          )}
          {routeKey === 'faq' && (
            <FaqPage locale={locale} />
          )}
        </main>
      )}
      <Analytics />
    </div>
  )
}

// ============ HERO SECTION ============
function HeroSection({ content }: { content: HeroContent }) {
  return (
    <section className="hero-v2">
      <div className="hero-v2-bg">
        <img src="/Hero image.jpg" alt="" className="hero-bg-image" />
        <div className="hero-bg-overlay" />
        <div className="hero-particles" />
      </div>
      <div className="hero-v2-content">
        <h1 className="hero-v2-title">
          <span className="hero-v2-line">{content.titleLine1}</span>
          <span className="hero-v2-line hero-accent">{content.titleLine2}</span>
        </h1>
        <p className="hero-v2-subtitle">{content.description}</p>
        <div className="hero-v2-ctas">
          <a href="/dashboard" className="btn-primary">{content.primaryCta}</a>
          <a href="/docs" className="btn-secondary">{content.secondaryCta}</a>
        </div>
      </div>
    </section>
  )
}

// ============ DEMO SECTION (PLACEHOLDER) ============
function DemoSection() {
  const [activeTab, setActiveTab] = useState<'conversation' | 'video'>('conversation')

  return (
    <section className="demo-section">
      <div className="container-v2">
        <h2 className="demo-section-title">Introducing OmniMemory</h2>
        <div className="demo-tabs">
          <button
            className={`demo-tab ${activeTab === 'conversation' ? 'active' : ''}`}
            onClick={() => setActiveTab('conversation')}
          >
            Conversation
          </button>
          <button
            className={`demo-tab ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            Video
          </button>
        </div>
        <div className="demo-content">
          <h3 className="demo-content-title">
            {activeTab === 'conversation' ? 'Interactive Demo' : 'Video Demo'}
          </h3>
          <div className="demo-placeholder">
            <p className="demo-placeholder-text">
              {activeTab === 'conversation'
                ? 'Experience Omni Memory in action. Interactive demo coming soon.'
                : 'Watch how Omni Memory works. Video demo coming soon.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============ BENCHMARK SECTION ============
// Benchmarks: LoCoMo + LongMemEval - see process.md for tracking
function BenchmarkSection({ content }: { content: StatsContent }) {
  const [activeBenchmark, setActiveBenchmark] = useState<'locomo' | 'longmemeval'>('locomo')

  return (
    <section className="benchmark-section">
      <div className="container-v2">
        <p className="module-eyebrow">Multimodal Benchmarks</p>
        <h2 className="module-title">Memory Across All Modalities</h2>
        <p className="module-subtitle">Omni Memory processes and remembers context from conversations, audio, and video.</p>

        {/* Modality Tabs */}
        <div className="benchmark-tabs">
          <button
            className={`benchmark-tab ${activeBenchmark === 'locomo' ? 'active' : ''}`}
            onClick={() => setActiveBenchmark('locomo')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            LoCoMo
          </button>
          <button
            className={`benchmark-tab ${activeBenchmark === 'longmemeval' ? 'active' : ''}`}
            onClick={() => setActiveBenchmark('longmemeval')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            LongMemEval
          </button>
          <button className="benchmark-tab disabled" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            Audio
            <span className="tab-badge">Soon</span>
          </button>
          <button className="benchmark-tab disabled" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
              <line x1="7" y1="2" x2="7" y2="22"/>
              <line x1="17" y1="2" x2="17" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
            Video
            <span className="tab-badge">Soon</span>
          </button>
        </div>

        {activeBenchmark === 'locomo' && (
          <div className="benchmark-content">
            <div className="benchmark-info">
              <h3 className="benchmark-modality-title">LoCoMo Benchmark</h3>
              <p className="benchmark-modality-desc">Long-context conversation memory evaluation with multi-hop reasoning</p>
              <div className="benchmark-modality-stats">
                <div className="benchmark-stat">
                  <span className="benchmark-stat-value">77.8%</span>
                  <span className="benchmark-stat-label">J-Score Accuracy</span>
                </div>
                <div className="benchmark-stat">
                  <span className="benchmark-stat-value">4</span>
                  <span className="benchmark-stat-label">Task Categories</span>
                </div>
                <div className="benchmark-stat">
                  <span className="benchmark-stat-value">&lt;700ms</span>
                  <span className="benchmark-stat-label">Retrieval Latency</span>
                </div>
              </div>
            </div>

            <div className="benchmark-chart">
              <div className="chart-title">LoCoMo Benchmark - J-Score Accuracy (%)</div>
              <div className="chart-bars">
                <div className="chart-bar-group">
                  <div className="chart-bar-label">Omni Memory</div>
                  <div className="chart-bar-container">
                    <div className="chart-bar chart-bar-primary" style={{ width: '77.8%' }}>
                      <span className="chart-bar-value">77.8%</span>
                    </div>
                  </div>
                </div>
                <div className="chart-bar-group">
                  <div className="chart-bar-label">GPT-4 + RAG</div>
                  <div className="chart-bar-container">
                    <div className="chart-bar chart-bar-secondary" style={{ width: '62%' }}>
                      <span className="chart-bar-value">62%</span>
                    </div>
                  </div>
                </div>
                <div className="chart-bar-group">
                  <div className="chart-bar-label">Claude + RAG</div>
                  <div className="chart-bar-container">
                    <div className="chart-bar chart-bar-secondary" style={{ width: '58%' }}>
                      <span className="chart-bar-value">58%</span>
                    </div>
                  </div>
                </div>
                <div className="chart-bar-group">
                  <div className="chart-bar-label">MemGPT</div>
                  <div className="chart-bar-container">
                    <div className="chart-bar chart-bar-secondary" style={{ width: '45%' }}>
                      <span className="chart-bar-value">45%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeBenchmark === 'longmemeval' && (
          <div className="benchmark-content">
            <div className="benchmark-info">
              <h3 className="benchmark-modality-title">LongMemEval Benchmark</h3>
              <p className="benchmark-modality-desc">Comprehensive evaluation across 6 memory dimensions</p>
              <div className="benchmark-modality-stats">
                <div className="benchmark-stat">
                  <span className="benchmark-stat-value">82%</span>
                  <span className="benchmark-stat-label">Overall Accuracy</span>
                </div>
                <div className="benchmark-stat">
                  <span className="benchmark-stat-value">95.6%</span>
                  <span className="benchmark-stat-label">Session Assistant</span>
                </div>
                <div className="benchmark-stat">
                  <span className="benchmark-stat-value">86.8%</span>
                  <span className="benchmark-stat-label">Temporal Reasoning</span>
                </div>
              </div>
            </div>

            <div className="benchmark-chart">
              <div className="chart-title">LongMemEval - Overall Accuracy (%)</div>
              <div className="chart-bars">
                <div className="chart-bar-group">
                  <div className="chart-bar-label">Omni Memory</div>
                  <div className="chart-bar-container">
                    <div className="chart-bar chart-bar-primary" style={{ width: '82%' }}>
                      <span className="chart-bar-value">82%</span>
                    </div>
                  </div>
                </div>
                <div className="chart-bar-group">
                  <div className="chart-bar-label">Mem0</div>
                  <div className="chart-bar-container">
                    <div className="chart-bar chart-bar-secondary" style={{ width: '66.4%' }}>
                      <span className="chart-bar-value">66.4%</span>
                    </div>
                  </div>
                </div>
                <div className="chart-bar-group">
                  <div className="chart-bar-label">Zep</div>
                  <div className="chart-bar-container">
                    <div className="chart-bar chart-bar-secondary" style={{ width: '63.8%' }}>
                      <span className="chart-bar-value">63.8%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// ============ ENTERPRISE SECTION ============
function EnterpriseSection({ content }: { content: FeaturesContent }) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        )
      case 'deploy':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="7.5 4.21 12 6.81 16.5 4.21"/>
            <polyline points="7.5 19.79 7.5 14.6 3 12"/>
            <polyline points="21 12 16.5 14.6 16.5 19.79"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        )
      case 'support':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        )
      case 'dashboard':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <section className="enterprise-section" id="enterprise">
      <div className="container-v2">
        <p className="module-eyebrow">{content.eyebrow}</p>
        <h2 className="module-title">{content.title}</h2>
        <p className="module-subtitle">{content.description}</p>

        <div className="enterprise-grid">
          {content.items.map((item, i) => (
            <div key={i} className="enterprise-card">
              <div className="enterprise-card-header">
                <div className="enterprise-icon">
                  {getIcon(item.icon)}
                </div>
                <span className="enterprise-tag">{item.tag}</span>
              </div>
              <h4 className="enterprise-card-title">{item.title}</h4>
              <p className="enterprise-card-desc">{item.description}</p>
              <div className="enterprise-card-border" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ HOW IT WORKS SECTION ============
function HowItWorksSection({ content }: { content: HowItWorksContent }) {
  return (
    <section className="module-section" id="how-it-works">
      <div className="container-v2">
        <p className="module-eyebrow">{content.eyebrow}</p>
        <h2 className="module-title">{content.title}</h2>
        <p className="module-subtitle">{content.description}</p>

        <div className="steps-grid-v2">
          {content.steps.map((step, i) => (
            <div key={i} className="step-card-v2">
              <span className="step-number">{String(i + 1).padStart(2, '0')}</span>
              <h4 className="step-title">{step.title}</h4>
              <p className="step-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ DEVELOPERS SECTION ============
function DevelopersSection({ content }: { content: DevelopersContent }) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <section className="developers-section" id="developers">
      <div className="developers-split">
        <div className="developers-left">
          <p className="module-eyebrow">{content.eyebrow}</p>
          <h2 className="developers-title">{content.title}</h2>
          <p className="developers-desc">{content.description}</p>
          <div className="developers-ctas">
            <a href="/docs" className="btn-primary">{content.primaryCta}</a>
            <a href="mailto:alice@omnimemory.ai" className="btn-secondary">{content.secondaryCta}</a>
          </div>
        </div>
        <div className="developers-right">
          <div className="code-editor">
            <div className="code-editor-header">
              <span className="code-editor-dot"></span>
              <span className="code-editor-dot"></span>
              <span className="code-editor-dot"></span>
              <div className="code-tabs">
                {content.codeTabs.map((tab, i) => (
                  <button
                    key={tab.label}
                    className={`code-tab ${i === activeTab ? 'active' : ''}`}
                    onClick={() => setActiveTab(i)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="code-editor-body">
              <pre><code>{content.codeTabs[activeTab]?.code}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============ PARTNERS MARQUEE ============
function PartnersMarquee({ content }: { content: PartnersContent }) {
  const duplicatedPartners = [...content.partners, ...content.partners]
  return (
    <section className="partners-marquee-section">
      <div className="partners-marquee-wrapper">
        <div className="partners-marquee">
          {duplicatedPartners.map((partner, i) => (
            <div key={i} className="partners-marquee-item">
              {partner.logo ? (
                <img
                  src={partner.logo}
                  alt={partner.nameCn || partner.name}
                  className="partner-logo-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <span className={partner.logo ? 'hidden' : ''}>{partner.nameCn || partner.name}</span>
              <span className="dot"></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ TESTIMONIALS SECTION ============
function TestimonialsSection({ content }: { content: TestimonialsContent }) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="testimonial-section-v2">
      <div className="testimonial-bg">
        <img src="/Visual/data image.jpg" alt="" className="testimonial-bg-image" />
        <div className="testimonial-bg-overlay" />
      </div>
      <div className="container-v2">
        <p className="module-eyebrow" style={{ color: 'rgb(var(--teal))' }}>{content.eyebrow}</p>
        <h2 className="module-title-light">{content.title}</h2>
        <div className="testimonial-content-v2">
          <blockquote className="testimonial-quote-v2">
            "{content.items[activeIndex].quote}"
          </blockquote>
          <div className="testimonial-author-v2">
            <span>— {content.items[activeIndex].name}, {content.items[activeIndex].title}</span>
          </div>
          <div className="testimonial-dots-v2">
            {content.items.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ============ PRICING SECTION ============
function PricingSection({ content }: { content: PricingContent }) {
  return (
    <section className="module-section" id="pricing">
      <div className="container-v2">
        <p className="module-eyebrow">{content.eyebrow}</p>
        <h2 className="module-title">{content.title}</h2>
        <p className="module-subtitle">{content.description}</p>

        <div className="pricing-grid-v2">
          {content.plans.map((plan, i) => (
            <div key={i} className={`pricing-card-v2 ${plan.badge === 'Enterprise' || plan.badge === '企业' ? 'featured' : ''}`}>
              <span className="pricing-badge">{plan.badge}</span>
              <h3 className="pricing-plan-name">{plan.name}</h3>
              <div className="pricing-price">{plan.price}<span className="pricing-period">{plan.period}</span></div>
              <ul className="pricing-features-v2">
                {plan.features.map((feature, j) => (
                  <li key={j} className="pricing-feature-v2">
                    <Check size={16} className="check-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="btn-pricing">{plan.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ FAQ SECTION ============
function FaqSection({ content }: { content: FaqContent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="module-section module-gray" id="faq">
      <div className="container-v2">
        <p className="module-eyebrow">{content.eyebrow}</p>
        <h2 className="module-title">{content.title}</h2>
        <p className="module-subtitle">{content.description}</p>

        <div className="faq-grid">
          {content.items.map((item, i) => (
            <div key={i} className={`faq-item ${openIndex === i ? 'open' : ''}`}>
              <button className="faq-trigger" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                <span>{item.question}</span>
                <span className="faq-icon">{openIndex === i ? '−' : '+'}</span>
              </button>
              {openIndex === i && (
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============ CTA SECTION ============
function CtaSection({ content }: { content: CtaContent }) {
  return (
    <section className="cta-section-v2">
      <div className="cta-bg">
        <img src="/Visual/Visual-Human-Particles 时间粒子.jpg" alt="" />
        <div className="cta-overlay" />
      </div>
      <div className="container-v2 cta-content">
        <h2 className="cta-title">{content.title}</h2>
        <p className="cta-description">{content.description}</p>
        <div className="cta-buttons">
          <a href="/dashboard" className="btn-cta-primary">{content.primaryCta}</a>
          <a href="/docs" className="btn-cta-secondary">{content.secondaryCta}</a>
        </div>
      </div>
    </section>
  )
}

// ============ FOOTER SECTION ============
function FooterSection({ content }: { content: FooterContent }) {
  return (
    <footer className="footer-v2">
      <div className="container-v2">
        {/* Top Section: Brand + 3 Link Columns */}
        <div className="footer-grid-v2">
          <div className="footer-brand-v2">
            <div className="footer-logo-v2">
              <img src="/Logo/SVG/Logo-Graphic-OmniMemory_White.svg" alt="" width={32} height={32} />
              <span>{content.brandName}</span>
            </div>
            <p className="footer-tagline-v2">{content.tagline}</p>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">USE CASE</h4>
            <a href="#" className="footer-link-v2">AI Assistants</a>
            <a href="#" className="footer-link-v2">Healthcare</a>
            <a href="#" className="footer-link-v2">Customer Service</a>
            <a href="#" className="footer-link-v2">Education</a>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">SOLUTION</h4>
            <a href="#how-it-works" className="footer-link-v2">How it Works</a>
            <a href="#enterprise" className="footer-link-v2">Enterprise</a>
            <a href="/docs" className="footer-link-v2">Documentation</a>
            <a href="#pricing" className="footer-link-v2">Pricing</a>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">CONTACT</h4>
            <a href="mailto:contact@omnimemory.ai" className="footer-link-v2">E. contact@omnimemory.ai</a>
            <a href="https://omnimemory.ai" className="footer-link-v2">W. omnimemory.ai</a>
          </div>
        </div>

        {/* Middle Section: Social Icons + Subscription */}
        <div className="footer-middle">
          <div className="footer-social-v2">
            <a href="#" className="social-icon"><X size={20} /></a>
            <a href="#" className="social-icon"><Linkedin size={20} /></a>
            <a href="#" className="social-icon"><Github size={20} /></a>
            <a href="#" className="social-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
          </div>
          <div className="footer-subscribe">
            <h4 className="footer-subscribe-title">SUBSCRIPTION</h4>
            <form className="footer-subscribe-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="footer-subscribe-input"
                required
              />
              <button type="submit" className="footer-subscribe-btn">SUBMIT</button>
            </form>
          </div>
        </div>

        {/* Bottom Section: Copyright + Nav Links */}
        <div className="footer-bottom-v2">
          <span>{content.copyright}</span>
          <div className="footer-bottom-links">
            <a href="#">Home</a>
            <a href="#">About</a>
            <a href="/docs">API</a>
            <a href="/careers">Join us</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ============ UTILITIES ============
function getLocaleFromPathname({ pathname }: { pathname: string }): Locale | null {
  const segment = pathname.split('/').filter(Boolean)[0]
  if (!segment) return null
  if (SUPPORTED_LOCALES.includes(segment as Locale)) return segment as Locale
  return null
}

function buildLocalePathname({ pathname, locale }: { pathname: string; locale: Locale }): string {
  // For English (default), no prefix needed
  // For other locales, add prefix
  if (locale === 'en') {
    return pathname
  }
  // Don't double-prefix if already has locale
  if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
    return pathname
  }
  return `/${locale}${pathname}`
}

function getRouteFromPathname({ pathname }: { pathname: string }): RouteKey {
  const strippedPath = stripLocaleFromPathname({ pathname })
  if (strippedPath.startsWith(ROUTE_PATHS.docs)) return 'docs'
  if (strippedPath.startsWith(ROUTE_PATHS.faq)) return 'faq'
  if (strippedPath.startsWith(ROUTE_PATHS.apiKeys)) return 'apiKeys'
  if (strippedPath.startsWith(ROUTE_PATHS.uploads)) return 'uploads'
  if (strippedPath.startsWith(ROUTE_PATHS.usage)) return 'usage'
  if (strippedPath.startsWith(ROUTE_PATHS.memoryPolicy)) return 'memoryPolicy'
  if (strippedPath.startsWith(ROUTE_PATHS.profile)) return 'profile'
  if (strippedPath.startsWith(ROUTE_PATHS.dashboard)) return 'dashboard'
  if (strippedPath.startsWith(ROUTE_PATHS.signIn)) return 'signIn'
  if (strippedPath.startsWith(ROUTE_PATHS.signUp)) return 'signUp'
  if (strippedPath.startsWith(ROUTE_PATHS.passwordReset)) return 'passwordReset'
  if (strippedPath.startsWith(ROUTE_PATHS.updatePassword)) return 'updatePassword'
  return 'marketing'
}

function stripLocaleFromPathname({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return '/'
  const [firstSegment, ...rest] = segments
  if (SUPPORTED_LOCALES.includes(firstSegment as Locale)) {
    return `/${rest.join('/')}`
  }
  return `/${segments.join('/')}`
}

function getBrowserPathname() {
  if (typeof window === 'undefined') return '/'
  return window.location.pathname
}

function getDashboardTitle(routeKey: RouteKey, locale: Locale) {
  if (locale === 'zh') {
    switch (routeKey) {
      case 'apiKeys': return 'API 密钥'
      case 'uploads': return '上传任务'
      case 'usage': return '用量'
      case 'memoryPolicy': return '记忆策略'
      case 'profile': return '个人资料'
      default: return '个人空间概览'
    }
  }
  switch (routeKey) {
    case 'apiKeys': return 'API Keys'
    case 'uploads': return 'Uploads'
    case 'usage': return 'Usage'
    case 'memoryPolicy': return 'Memory Policy'
    case 'profile': return 'Profile'
    default: return 'Dashboard Overview'
  }
}

function getPreferredLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  // Check path locale first
  const pathLocale = getLocaleFromPathname({ pathname: window.location.pathname })
  if (pathLocale) return pathLocale
  // Check stored preference
  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  if (storedLocale && SUPPORTED_LOCALES.includes(storedLocale as Locale)) {
    return storedLocale as Locale
  }
  return 'en'
}

// IP-based locale detection for automatic language routing
async function detectLocaleFromIP(): Promise<Locale | null> {
  try {
    // Use a free IP geolocation API
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3000) // 3 second timeout
    })
    if (!response.ok) return null
    const data = await response.json()
    // Check if user is in China (country_code: CN)
    if (data.country_code === 'CN' || data.country === 'China') {
      return 'zh'
    }
    return 'en'
  } catch {
    // Fallback on any error (timeout, network, etc.)
    return null
  }
}

// ============ CONSTANTS ============
const LOCALE_STORAGE_KEY = 'omni-memory-locale'
const IP_LOCALE_CHECKED_KEY = 'omni-memory-ip-locale-checked'
const SUPPORTED_LOCALES: Locale[] = ['en', 'zh']

const ROUTE_PATHS = {
  home: '/',
  docs: '/docs',
  faq: '/faq',
  dashboard: '/dashboard',
  apiKeys: '/dashboard/api-keys',
  uploads: '/dashboard/uploads',
  usage: '/dashboard/usage',
  memoryPolicy: '/dashboard/memory-policy',
  profile: '/dashboard/profile',
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  passwordReset: '/auth/password-reset',
  updatePassword: '/update-password',
} as const

// ============ CODE SAMPLES ============
const CODE_SAMPLE_PYTHON = `from omem import Memory

mem = Memory(api_key="qbk_xxx")  # That's it!

# Save a conversation
mem.add("conv-001", [
    {"role": "user", "content": "Meeting with Caroline tomorrow"},
    {"role": "assistant", "content": "Got it, I will remember"},
])

# Search memories
result = mem.search("When is my meeting?")
if result:
    print(result.to_prompt())`

const CODE_SAMPLE_JS = `import { Memory } from 'omem'

const mem = new Memory({ apiKey: 'qbk_xxx' })

// Save a conversation
await mem.add('conv-001', [
  { role: 'user', content: 'Meeting with Caroline tomorrow' },
  { role: 'assistant', content: 'Got it, I will remember' },
])

// Search memories
const result = await mem.search('When is my meeting?')
if (result) {
  console.log(result.toPrompt())
}`

const CODE_SAMPLE_REST = `# Save a conversation
curl -X POST "https://api.omnimemory.ai/v1/memory/ingest" \\
  -H "x-api-key: qbk_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"session_id": "conv-001", "turns": [...]}'

# Search memories
curl -X POST "https://api.omnimemory.ai/v1/memory/retrieval" \\
  -H "x-api-key: qbk_xxx" \\
  -d '{"query": "When is my meeting?", "topk": 10}'`

// ============ CONTENT ============
const contentByLocale: Record<Locale, AppContent> = {
  en: {
    navbar: {
      brandName: 'Omni Memory',
      navLinks: [
        {
          label: 'Developers',
          dropdown: [
            { label: 'Documentation', href: '/docs' },
            { label: 'API', href: '/docs' },
            { label: 'Support', href: '/support' },
          ]
        },
        {
          label: 'Solutions',
          dropdown: [
            { label: 'AI Companion Robot', href: '#' },
            { label: 'Chatbot', href: '#' },
            { label: 'Robotics', href: '#' },
          ]
        },
        { label: 'Research', href: '/research' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Docs', href: '/docs' },
        { label: 'Join Us', href: '/careers' },
      ],
      ctaLabel: 'Get Started',
    },
    hero: {
      badge: 'Now in Beta',
      titleLine1: 'Agents Live in Moments.',
      titleLine2: 'We Give Them Experience',
      description: 'Omni Memory is a multimodal memory system that enables AI to understand people beyond prompts, powering deeply personalized AI that evolves with human context over time.',
      primaryCta: 'Start Building',
      secondaryCta: 'View Documentation',
    },
    stats: {
      items: [
        { value: '#1', label: 'LoCoMo Benchmark' },
        { value: '77.8%', label: 'J-Score Accuracy' },
        { value: '<700 ms', label: 'Retrieval Latency' },
      ],
    },
    features: {
      eyebrow: 'For Enterprise',
      title: 'Production-ready memory infrastructure',
      description: 'Deploy with confidence. Full control over your data and infrastructure.',
      items: [
        { icon: 'shield', tag: 'Privacy', title: 'Self-Hosted Database', description: 'Deploy on your infrastructure with Qdrant + Neo4j. Your data never leaves your servers. Full data sovereignty.' },
        { icon: 'deploy', tag: 'Deploy', title: 'One-Command Setup', description: 'Docker Compose deployment in minutes. Kubernetes-ready. No complex configuration required.' },
        { icon: 'support', tag: 'Support', title: 'Dedicated Team', description: 'SLA-backed enterprise support. Direct access to engineering team. Custom integration assistance.' },
        { icon: 'dashboard', tag: 'Console', title: 'API Dashboard', description: 'Monitor usage, manage API keys, configure memory policies. Full observability into your memory layer.' },
      ],
    },
    howItWorks: {
      eyebrow: 'Process',
      title: 'From ingestion to recall',
      description: 'A simple three-step process to give your AI persistent memory.',
      steps: [
        { title: 'Ingest', description: 'Stream conversations, files, and events into Omni Memory via our simple API.' },
        { title: 'Enrich', description: 'We classify, dedupe, and score memories with decay curves to keep recall fresh.' },
        { title: 'Retrieve', description: 'Query by user, intent, and time horizon. Get policy-filtered context in milliseconds.' },
      ],
    },
    developers: {
      eyebrow: 'For Developers',
      title: 'Deploy with Python / JavaScript / REST',
      description: 'Three lines of code to give your AI persistent memory. Initialize, store conversations, search with graph-enhanced retrieval.',
      primaryCta: 'Read Docs',
      secondaryCta: 'Talk to Us',
      codeTabs: [
        { label: 'Python', code: CODE_SAMPLE_PYTHON },
        { label: 'JavaScript', code: CODE_SAMPLE_JS },
        { label: 'REST', code: CODE_SAMPLE_REST },
      ],
    },
    testimonials: {
      eyebrow: 'Testimonials',
      title: 'Teams building with Omni Memory',
      items: [
        { name: 'Sarah Chen', title: 'Head of AI, Aurora Labs', quote: 'We replaced three internal services with Omni Memory. Agent latency dropped 40% immediately—it just works.' },
        { name: 'Marcus Williams', title: 'VP Product, Northwind', quote: 'Our clinical assistants finally remember patient context across sessions. Game changer for healthcare AI.' },
        { name: 'Elena Rodriguez', title: 'Founder, Signalwave', quote: 'The policy controls let us scope memory by project without building custom infrastructure. Shipped in a week.' },
      ],
    },
    partners: {
      label: 'Trusted by leading research institutions and enterprises',
      partners: [
        { name: 'Tsinghua University', nameCn: '清华大学', logo: '/partner/tsinghua.png' },
        { name: 'Peking University', nameCn: '北京大学', logo: '/partner/peking.png' },
        { name: 'Zhejiang University', nameCn: '浙江大学', logo: '/partner/zhejiang.png' },
        { name: 'NUS', logo: '/partner/nus.png' },
        { name: 'VU Amsterdam', logo: '/partner/vu-amsterdam.png' },
        { name: 'USC', nameCn: '南加州大学', logo: '/partner/usc.png' },
        { name: 'Virginia Tech', nameCn: '弗吉尼亚理工', logo: '/partner/virginia-tech.png' },
      ],
    },
    pricing: {
      eyebrow: 'Pricing',
      title: 'Plans that scale with you',
      description: 'Start free, upgrade as you grow. Predictable, usage-based pricing.',
      plans: [
        { badge: 'Starter', name: 'Build', price: 'Free', period: 'forever', cta: 'Start Free', features: ['2M memories', 'Multi-modal API', 'Community support'] },
        { badge: 'Enterprise', name: 'Govern', price: 'Custom', period: '', cta: 'Contact Us', features: ['Unlimited memories', 'Dedicated VPC', 'Custom SLAs', 'Dedicated support'] },
      ],
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Common questions',
      description: 'Everything you need to know about Omni Memory.',
      items: [
        { question: 'What AI models are supported?', answer: 'We normalize across providers. Write once, retrieve across GPT, Claude, Gemini, or custom models.' },
        { question: 'What data types can be stored?', answer: 'Text, audio transcripts, images with context, and structured events. All enriched with entity and intent signals.' },
        { question: 'How do you handle privacy?', answer: 'Automated PII detection, configurable retention, consent tracking, and right-to-forget workflows. SOC 2 Type II certified.' },
        { question: "What's the retrieval latency?", answer: 'P95 recall under 700ms  globally with multi-region caching and hybrid retrieval.' },
      ],
    },
    cta: {
      title: 'Give your AI the memory it deserves',
      description: 'Start building with persistent, contextual memory. Free tier available.',
      primaryCta: 'Start Building',
      secondaryCta: 'View Documentation',
    },
    footer: {
      brandName: 'Omni Memory',
      tagline: 'The memory layer for intelligent AI applications.',
      links: [
        { label: 'How it Works', href: '#how-it-works' },
        { label: 'Enterprise', href: '#enterprise' },
        { label: 'Documentation', href: '/docs' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'FAQ', href: '/faq' },
      ],
      copyright: '© 2025 Omni Memory. All rights reserved.',
    },
  },
  zh: {
    navbar: {
      brandName: 'Omni Memory',
      navLinks: [
        {
          label: '开发者',
          dropdown: [
            { label: '文档', href: '/docs' },
            { label: 'API', href: '/docs/api' },
            { label: '支持', href: '/support' },
          ],
        },
        {
          label: '解决方案',
          dropdown: [
            { label: 'AI 伴侣机器人', href: '#' },
            { label: '聊天机器人', href: '#' },
            { label: '机器人技术', href: '#' },
          ]
        },
        { label: '研究', href: '/research' },
        { label: '价格', href: '#pricing' },
        { label: '文档', href: '/docs' },
        { label: '加入我们', href: '/careers' },
      ],
      ctaLabel: '开始使用',
    },
    hero: {
      badge: '公测中',
      titleLine1: '记忆',
      titleLine2: '决定智能上限',
      description: 'Omni Memory 构建多模态记忆系统，让 AI 以真实上下文持续成长，打造真正理解用户的个性化智能。',
      primaryCta: '开始构建',
      secondaryCta: '查看文档',
    },
    stats: {
      items: [
        { value: '#1', label: 'LoCoMo 基准测试' },
        { value: '77.8%', label: 'J-Score 准确率' },
        { value: '<1s', label: '检索延迟' },
      ],
    },
    features: {
      eyebrow: '企业级部署',
      title: '生产就绪的记忆基础设施',
      description: '自托管部署，全面掌控数据与基础设施。',
      items: [
        { icon: 'shield', tag: '隐私', title: '自托管数据库', description: '在你的基础设施上部署 Qdrant + Neo4j，数据不出域。完全数据主权。' },
        { icon: 'deploy', tag: '部署', title: '一键部署', description: 'Docker Compose 快速部署，支持 Kubernetes，无需复杂配置。' },
        { icon: 'support', tag: '支持', title: '专属团队', description: 'SLA 保障的企业支持，直连工程团队，定制集成协助。' },
        { icon: 'dashboard', tag: '控制台', title: 'API 控制台', description: '监控用量、管理 API Key、配置记忆策略，全面可观测。' },
      ],
    },
    howItWorks: {
      eyebrow: '工作原理',
      title: '从摄取到召回',
      description: '简单三步，让 AI 拥有持久记忆。',
      steps: [
        { title: '摄取', description: '通过 API 写入对话、文件和事件。' },
        { title: '增强', description: '分类、去重与衰减评分，保持记忆新鲜。' },
        { title: '检索', description: '按用户与意图检索，毫秒级返回上下文。' },
      ],
    },
    developers: {
      eyebrow: '开发者',
      title: '支持 Python / JavaScript / REST',
      description: '三行代码让你的 AI 拥有持久记忆。初始化、存储对话、图增强检索。',
      primaryCta: '阅读文档',
      secondaryCta: '联系我们',
      codeTabs: [
        { label: 'Python', code: CODE_SAMPLE_PYTHON },
        { label: 'JavaScript', code: CODE_SAMPLE_JS },
        { label: 'REST', code: CODE_SAMPLE_REST },
      ],
    },
    testimonials: {
      eyebrow: '用户故事',
      title: '团队使用 Omni Memory',
      items: [
        { name: 'Sarah Chen', title: 'Aurora Labs AI 负责人', quote: '我们用 Omni Memory 替代了多个内部服务，延迟显著下降。' },
        { name: 'Marcus Williams', title: 'Northwind 产品副总裁', quote: '临床助手终于能跨会话记住上下文，落地速度极快。' },
        { name: 'Elena Rodriguez', title: 'Signalwave 创始人', quote: '策略控制让我们无需重建基础设施即可上线。' },
      ],
    },
    partners: {
      label: '顶尖研究机构与企业的信赖',
      partners: [
        { name: 'Tsinghua University', nameCn: '清华大学', logo: '/partner/tsinghua.png' },
        { name: 'Peking University', nameCn: '北京大学', logo: '/partner/peking.png' },
        { name: 'Zhejiang University', nameCn: '浙江大学', logo: '/partner/zhejiang.png' },
        { name: 'NUS', logo: '/partner/nus.png' },
        { name: 'VU Amsterdam', logo: '/partner/vu-amsterdam.png' },
        { name: 'USC', nameCn: '南加州大学', logo: '/partner/usc.png' },
        { name: 'Virginia Tech', nameCn: '弗吉尼亚理工', logo: '/partner/virginia-tech.png' },
      ],
    },
    pricing: {
      eyebrow: '价格',
      title: '随你扩展的方案',
      description: '从免费开始，随成长升级。可预测的按量计费。',
      plans: [
        { badge: '入门', name: '构建', price: '免费', period: '永久', cta: '免费开始', features: ['200万条记忆', '多模态 API', '社区支持'] },
        { badge: '企业', name: '治理', price: '定制', period: '', cta: '联系我们', features: ['无限记忆', '专属 VPC', '定制 SLA', '专属支持'] },
      ],
    },
    faq: {
      eyebrow: '常见问题',
      title: '常见问题',
      description: '关于 Omni Memory 的常见疑问。',
      items: [
        { question: '支持哪些 AI 模型？', answer: '我们对不同模型提供统一接口，支持 GPT、Claude、Gemini 等。' },
        { question: '可存储哪些数据类型？', answer: '文本、音频转写、带上下文的图像与结构化事件。' },
        { question: '如何处理隐私？', answer: 'PII 检测、保留期配置、同意追踪与删除流程。SOC 2 Type II 认证。' },
        { question: '检索延迟是多少？', answer: 'P95 召回低于 500ms，支持多区域缓存。' },
      ],
    },
    cta: {
      title: '让 AI 拥有应得的记忆',
      description: '立即开始使用持久的上下文记忆。免费套餐可用。',
      primaryCta: '开始构建',
      secondaryCta: '查看文档',
    },
    footer: {
      brandName: 'Omni Memory',
      tagline: '智能 AI 应用的记忆层。',
      links: [
        { label: '工作原理', href: '#how-it-works' },
        { label: '企业', href: '#enterprise' },
        { label: '文档', href: '/docs' },
        { label: '价格', href: '#pricing' },
        { label: '常见问题', href: '/faq' },
      ],
      copyright: '© 2025 Omni Memory. 保留所有权利。',
    },
  },
}

// ============ TYPES ============
type Locale = 'en' | 'zh'
type RouteKey =
  | 'marketing'
  | 'docs'
  | 'faq'
  | 'dashboard'
  | 'apiKeys'
  | 'uploads'
  | 'usage'
  | 'memoryPolicy'
  | 'profile'
  | 'signIn'
  | 'signUp'
  | 'passwordReset'
  | 'updatePassword'

interface AppContent {
  navbar: NavbarContent
  hero: HeroContent
  stats: StatsContent
  features: FeaturesContent
  howItWorks: HowItWorksContent
  developers: DevelopersContent
  testimonials: TestimonialsContent
  partners: PartnersContent
  pricing: PricingContent
  faq: FaqContent
  cta: CtaContent
  footer: FooterContent
}

interface NavbarContent {
  brandName: string
  navLinks: NavLink[]
  ctaLabel: string
}
interface NavLink {
  label: string
  href?: string
  dropdown?: { label: string; href: string; icon?: string }[]
}
interface HeroContent { badge: string; titleLine1: string; titleLine2: string; description: string; primaryCta: string; secondaryCta: string }
interface StatsContent { items: { value: string; label: string }[] }
interface FeaturesContent { eyebrow: string; title: string; description: string; items: { icon: string; tag: string; title: string; description: string }[] }
interface HowItWorksContent { eyebrow: string; title: string; description: string; steps: { title: string; description: string }[] }
interface DevelopersContent { eyebrow: string; title: string; description: string; primaryCta: string; secondaryCta: string; codeTabs: { label: string; code: string }[] }
interface TestimonialsContent { eyebrow: string; title: string; items: { name: string; title: string; quote: string }[] }
interface PartnersContent { label: string; partners: { name: string; nameCn?: string; logo?: string }[] }
interface PricingContent { eyebrow: string; title: string; description: string; plans: { badge: string; name: string; price: string; period: string; cta: string; features: string[] }[] }
interface FaqContent { eyebrow: string; title: string; description: string; items: { question: string; answer: string }[] }
interface CtaContent { title: string; description: string; primaryCta: string; secondaryCta: string }
interface FooterContent { brandName: string; tagline: string; copyright: string; links: { label: string; href: string }[] }
