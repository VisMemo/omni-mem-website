import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { BarChart3, Home, KeyRound, Settings, UploadCloud, UserCircle } from 'lucide-react'
import { AuthControl } from './components/auth-control'
import { DashboardShell, type DashboardLink } from './components/dashboard-shell'
import { ThreeDemoSection } from './components/three-demo'
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
import { DocsPage } from './pages/docs'

export function App() {
  const [locale, setLocale] = useState<Locale>(() => getPreferredLocale())
  const [routeKey, setRouteKey] = useState<RouteKey>(() =>
    getRouteFromPathname({ pathname: getBrowserPathname() })
  )
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const content = contentByLocale[locale]
  const { session, isLoading: isSessionLoading } = useSupabaseSession()
  const signInPath = buildLocalePathname({ pathname: ROUTE_PATHS.signIn, locale })
  const signUpPath = buildLocalePathname({ pathname: ROUTE_PATHS.signUp, locale })
  const passwordResetPath = buildLocalePathname({ pathname: ROUTE_PATHS.passwordReset, locale })
  const dashboardPath = buildLocalePathname({ pathname: ROUTE_PATHS.dashboard, locale })
  const apiKeysPath = buildLocalePathname({ pathname: ROUTE_PATHS.apiKeys, locale })
  const uploadsPath = buildLocalePathname({ pathname: ROUTE_PATHS.uploads, locale })
  const usagePath = buildLocalePathname({ pathname: ROUTE_PATHS.usage, locale })
  const memoryPolicyPath = buildLocalePathname({ pathname: ROUTE_PATHS.memoryPolicy, locale })
  const profilePath = buildLocalePathname({ pathname: ROUTE_PATHS.profile, locale })
  const homePath = '/'
  const isMarketing = routeKey === 'marketing'
  const isProtectedRoute = ['dashboard', 'apiKeys', 'uploads', 'usage', 'memoryPolicy', 'profile'].includes(routeKey)

  // Custom cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX - 10, y: e.clientY - 10 })
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.matches('a, button, [data-hover]')) {
        setIsHovering(true)
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.matches('a, button, [data-hover]')) {
        setIsHovering(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [])

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const normalizedPath = stripLocaleFromPathname({ pathname: window.location.pathname })
    if (normalizedPath !== window.location.pathname) {
      const nextUrl = `${normalizedPath}${window.location.search}${window.location.hash}`
      window.history.replaceState(null, '', nextUrl)
      setRouteKey(getRouteFromPathname({ pathname: normalizedPath }))
    }
    document.documentElement.lang = locale
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }, [locale])

  useEffect(() => {
    if (typeof window === 'undefined') return
    function handlePopState() {
      const normalizedPath = stripLocaleFromPathname({ pathname: window.location.pathname })
      if (normalizedPath !== window.location.pathname) {
        const nextUrl = `${normalizedPath}${window.location.search}${window.location.hash}`
        window.history.replaceState(null, '', nextUrl)
      }
      setRouteKey(getRouteFromPathname({ pathname: normalizedPath }))
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
    const nextLocale = getNextLocale({ currentLocale: locale })
    setLocale(nextLocale)
  }

  function handleDashboardClick() {
    if (!session) {
      navigateTo(signInPath)
      return
    }
    navigateTo(dashboardPath)
  }

  function handleSignInClick() {
    navigateTo(signInPath)
  }

  function handleSignUpClick() {
    navigateTo(signUpPath)
  }

  function navigateTo(pathname: string) {
    if (typeof window === 'undefined') return
    window.history.pushState({}, '', pathname)
    setRouteKey(getRouteFromPathname({ pathname }))
  }  const dashboardLinks: DashboardLink[] = [
    { label: '概览', path: dashboardPath, group: 'main', icon: Home },
    { label: 'API 密钥', path: apiKeysPath, group: 'main', icon: KeyRound },
    { label: '上传任务', path: uploadsPath, group: 'main', icon: UploadCloud },
    { label: '用量', path: usagePath, group: 'main', icon: BarChart3 },
    { label: '记忆策略', path: memoryPolicyPath, group: 'main', icon: Settings },
    { label: '个人资料', path: profilePath, group: 'account', icon: UserCircle },
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
    : 'min-h-[70vh] px-6 pb-24 pt-28 sm:px-8'

  return (
    <div className="relative min-h-screen">
      {/* Custom Cursor */}
      <div
        className={`cursor ${isHovering ? 'hovering' : ''}`}
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />

      {/* Noise Texture */}
      <div className="noise" />

      {/* Navbar */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">
          <a href={homePath} className="logo">
            <LogoMark />
            <span>{content.navbar.brandName}</span>
          </a>

          {isMarketing && (
            <div className="navbar-links">
              {content.navbar.navLinks.map((link) => (
                link.dropdown ? (
                  <div key={link.label} className="navbar-dropdown">
                    <button className="navbar-link dropdown-trigger">
                      {link.label}
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="dropdown-chevron">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <div className="dropdown-menu">
                      {link.dropdown.map((item) => (
                        <a key={item.label} href={item.href} className="dropdown-item">
                          {item.icon && <span className="dropdown-icon">{item.icon}</span>}
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <a key={link.label} href={link.href} className="navbar-link">
                    {link.label}
                  </a>
                )
              ))}
            </div>
          )}

          <div className="navbar-actions">
            <button
              onClick={handleLocaleToggle}
              className="btn-ghost"
              style={{ fontSize: '0.875rem' }}
            >
              {content.navbar.toggleLabel}
            </button>
            <AuthControl onSignIn={handleSignInClick} onSignUp={handleSignUpClick} />
            <a href={signUpPath} className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              {content.navbar.ctaLabel}
            </a>
          </div>
        </div>
      </nav>

      {isMarketing ? (
        <main>
          <HeroSection content={content.hero} signUpPath={signUpPath} />
          <MarqueeSection />
          <ThreeDemoSection />
          <StatsSection content={content.stats} />
          <HowItWorksSection content={content.howItWorks} />
          <FeaturesSection content={content.features} />
          <DeveloperSection content={content.developers} signUpPath={signUpPath} />
          <TestimonialsSection content={content.testimonials} />
          <PartnersSection content={content.partners} />
          <PricingSection content={content.pricing} signUpPath={signUpPath} />
          <FaqSection content={content.faq} />
          <CtaSection content={content.cta} signUpPath={signUpPath} />
          <Footer content={content.footer} />
        </main>
      ) : (
        <main className={mainClassName}>
          {isProtectedRoute && (
            <DashboardShell
              title={getDashboardTitle(routeKey)}
              currentPath={currentDashboardPath}
              links={dashboardLinks}
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
              <PasswordResetPage signInPath={signInPath} onNavigate={navigateTo} />
            </div>
          )}
          {routeKey === 'docs' && (
            <DocsPage locale={locale} onNavigate={navigateTo} />
          )}
        </main>
      )}
    </div>
  )
}

// ============ SECTIONS ============

function HeroSection({ content, signUpPath }: { content: HeroContent; signUpPath: string }) {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={containerRef} className="hero">
      <motion.div style={{ y, opacity }}>
        <div className="hero-eyebrow">{content.badge}</div>

        <h1 className="hero-title">
          <span className="line">
            <span className="word">{content.titleLine1}</span>
          </span>
          <span className="line">
            <span className="word">
              {content.titleLine2.split(' ').map((word, i) => (
                <span key={i}>
                  {i === content.titleLine2.split(' ').length - 1 ? (
                    <span className="hero-accent">{word}</span>
                  ) : (
                    word + ' '
                  )}
                </span>
              ))}
            </span>
          </span>
        </h1>

        <p className="hero-description">{content.description}</p>

        <motion.div
          className="flex gap-4 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <a href={signUpPath} className="btn-primary">
            {content.primaryCta}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a href="#developers" className="btn-secondary">
            {content.secondaryCta}
          </a>
        </motion.div>
      </motion.div>

      {/* Floating Memory Fragments */}
      <div className="memory-fragments">
        <motion.div
          className="fragment fragment-1"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="font-mono text-xs text-vermillion">TEXT</span>
          <p className="mt-1 text-ink-muted">Conversation context loggging</p>
        </motion.div>
        <motion.div
          className="fragment fragment-2"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <span className="font-mono text-xs text-gold">AUDIO</span>
          <p className="mt-1 text-ink-muted">Meeting context capturing</p>
        </motion.div>
        <motion.div
          className="fragment fragment-3"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <span className="font-mono text-xs text-petrol">Video</span>
          <p className="mt-1 text-ink-muted">Life moments understanding</p>
        </motion.div>
      </div>
    </section>
  )
}

function MarqueeSection() {
  const items = ['Text', 'Audio', 'Images', 'Events', 'Conversations', 'Videos', 'Memories']

  return (
    <div className="marquee-wrap">
      <div className="marquee">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="marquee-item">
            {item}<span className="dot" />
          </span>
        ))}
      </div>
    </div>
  )
}

function PartnersSection({ content }: { content: PartnersContent }) {
  return (
    <section className="partners-section">
      <div className="container">
        <p className="partners-label">{content.label}</p>
        <div className="partners-grid">
          {content.partners.map((partner) => (
            <div key={partner.name} className="partner-logo">
              <span className="partner-name">{partner.name}</span>
              {partner.nameCn && <span className="partner-name-cn">{partner.nameCn}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSection({ content }: { content: StatsContent }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-section">
      <div className="container">
        <motion.div
          ref={ref}
          className="stats-grid"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {content.items.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function FeaturesSection({ content }: { content: FeaturesSectionContent }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="enterprise" className="py-section">
      <div className="container">
        <div className="section-number">02</div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="section-label">{content.eyebrow}</span>
          <h2 className="mt-6 mb-4 max-w-2xl">{content.title}</h2>
          <p className="text-ink-muted text-lg max-w-xl mb-16">{content.description}</p>
        </motion.div>

        <div className="bento-grid">
          {content.items.map((feature, i) => (
            <motion.div
              key={feature.title}
              className={`bento-card ${i === 0 ? 'bento-large' : 'bento-small'}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="bento-icon">{feature.icon}</div>
              <div className="font-mono text-xs text-vermillion mb-2">{feature.tag}</div>
              <h3 className="bento-title">{feature.title}</h3>
              <p className="bento-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection({ content }: { content: HowItWorksContent }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="how-it-works" className="py-section bg-ivory-dark/30">
      <div className="container">
        <div className="section-number">01</div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="section-label">{content.eyebrow}</span>
            <h2 className="mt-6 mb-4">{content.title}</h2>
            <p className="text-ink-muted text-lg max-w-md">{content.description}</p>
          </motion.div>

          <div className="process-timeline">
            {content.steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="process-step"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <div className="process-number">0{i + 1}</div>
                <h3 className="process-title">{step.title}</h3>
                <p className="process-description">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TypingAnimation({ words }: { words: string[] }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  
  useEffect(() => {
    const currentWord = words[currentWordIndex]
    const typingSpeed = isDeleting ? 50 : 100
    const pauseTime = 2000
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime)
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setCurrentWordIndex((prev) => (prev + 1) % words.length)
        }
      }
    }, typingSpeed)
    
    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentWordIndex, words])
  
  return (
    <span className="typing-text">
      {displayText}
      <span className="typing-cursor">|</span>
    </span>
  )
}

function DeveloperSection({ content, signUpPath }: { content: DeveloperContent; signUpPath: string }) {
  const [activeTab, setActiveTab] = useState(0)
  const sdkWords = ['Python', 'JavaScript', 'REST']

  return (
    <section id="developers" className="split-section">
      <div className="split-left">
        <div className="section-number" style={{ color: 'rgba(252, 250, 245, 0.05)' }}>03</div>
        <span className="section-label" style={{ color: 'rgba(252, 250, 245, 0.5)' }}>
          <span style={{ background: 'rgb(var(--gold))', width: 24, height: 1, display: 'inline-block', marginRight: '1rem' }} />
          {content.eyebrow}
        </span>
        <h2 className="mt-6 mb-6" style={{ color: 'rgb(var(--ivory))' }}>
          Deploy with <TypingAnimation words={sdkWords} />
        </h2>
        <p className="text-lg mb-10" style={{ color: 'rgba(252, 250, 245, 0.6)' }}>{content.description}</p>
        <div className="flex gap-4">
          <a href="/docs" className="btn-primary" style={{ background: 'rgb(var(--vermillion))' }}>
            {content.primaryCta}
          </a>
          <a
            href={signUpPath}
            className="btn-secondary"
            style={{ borderColor: 'rgba(252, 250, 245, 0.2)', color: 'rgb(var(--ivory))' }}
          >
            {content.secondaryCta}
          </a>
        </div>
      </div>

      <div className="split-right">
        <div className="code-editor">
          <div className="code-editor-header">
            <div className="code-editor-dot" />
            <div className="code-editor-dot" />
            <div className="code-editor-dot" />
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
            <pre>
              <code dangerouslySetInnerHTML={{ __html: highlightCode(content.codeTabs[activeTab].code, content.codeTabs[activeTab].label) }} />
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection({ content }: { content: TestimonialsContent }) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section id="testimonials" className="py-section">
      <div className="container">
        <div className="section-number">04</div>

        <span className="section-label">{content.eyebrow}</span>
        <h2 className="mt-6 mb-16 max-w-2xl">{content.title}</h2>

        <div className="testimonial-editorial">
          <motion.p
            key={activeIndex}
            className="testimonial-quote"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {content.items[activeIndex].quote}
          </motion.p>

          <motion.div
            key={`author-${activeIndex}`}
            className="testimonial-author"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="testimonial-avatar">
              {content.items[activeIndex].name[0]}
            </div>
            <div className="testimonial-info">
              <div className="testimonial-name">{content.items[activeIndex].name}</div>
              <div className="testimonial-title">{content.items[activeIndex].title}</div>
            </div>
          </motion.div>
        </div>

        <div className="flex gap-4 mt-12">
          {content.items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="w-12 h-1 rounded-full transition-all"
              style={{
                background: i === activeIndex ? 'rgb(var(--vermillion))' : 'rgb(var(--ink) / 0.1)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection({ content, signUpPath }: { content: PricingContent; signUpPath: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="pricing" className="py-section bg-ivory-dark/30">
      <div className="container">
        <div className="section-number">05</div>

        <motion.div
          ref={ref}
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="section-label">{content.eyebrow}</span>
          <h2 className="mt-6 mb-4">{content.title}</h2>
          <p className="text-ink-muted text-lg">{content.description}</p>
        </motion.div>

        <div className="pricing-grid">
          {content.plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`pricing-card ${i === 1 ? 'featured' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="pricing-badge">{plan.badge}</div>
              <h3 className="pricing-name">{plan.name}</h3>
              <div className="pricing-price">{plan.price}</div>
              <div className="pricing-period">{plan.period}</div>

              <div className="pricing-features">
                {plan.features.map((feature) => (
                  <div key={feature} className="pricing-feature">{feature}</div>
                ))}
              </div>

              <a
                href={signUpPath}
                className={i === 1 ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}
                style={i === 1 ? { background: 'rgb(var(--vermillion))' } : {}}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqSection({ content }: { content: FaqContent }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-section">
      <div className="container">
        <div className="section-number">06</div>

        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <span className="section-label">{content.eyebrow}</span>
            <h2 className="mt-6 mb-4">{content.title}</h2>
            <p className="text-ink-muted text-lg">{content.description}</p>
          </div>

          <div>
            {content.items.map((item, i) => (
              <div key={item.question} className="faq-item" data-open={openIndex === i}>
                <button
                  className="faq-trigger"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <span>{item.question}</span>
                  <span className="faq-icon" />
                </button>
                {openIndex === i && (
                  <motion.div
                    className="faq-content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.answer}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CtaSection({ content, signUpPath }: { content: CtaContent; signUpPath: string }) {
  return (
    <section className="cta-section">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="cta-title">{content.title}</h2>
          <p className="cta-description">{content.description}</p>

          <div className="flex gap-4 mt-10">
            <a
              href={signUpPath}
              className="btn-primary"
              style={{ background: 'rgb(var(--vermillion))' }}
            >
              {content.primaryCta}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a
              href="#developers"
              className="btn-secondary"
              style={{ borderColor: 'rgba(252, 250, 245, 0.2)', color: 'rgb(var(--ivory))' }}
            >
              {content.secondaryCta}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Footer({ content }: { content: FooterContent }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">{content.brandName}</div>
            <p className="footer-tagline">{content.tagline}</p>
          </div>

          <div>
            <div className="footer-heading">Product</div>
            {content.links.slice(0, 2).map((link) => (
              <a key={link.label} href={link.href} className="footer-link">
                {link.label}
              </a>
            ))}
          </div>

          <div>
            <div className="footer-heading">Resources</div>
            {content.links.slice(2).map((link) => (
              <a key={link.label} href={link.href} className="footer-link">
                {link.label}
              </a>
            ))}
          </div>

          <div>
            <div className="footer-heading">Company</div>
            <a href="#" className="footer-link">About</a>
            <a href="#" className="footer-link">Blog</a>
            <a href="#" className="footer-link">Careers</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>{content.copyright}</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-vermillion transition-colors">Privacy</a>
            <a href="#" className="hover:text-vermillion transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ============ COMPONENTS ============

function LogoMark() {
  return (
    <div className="logo-mark">
      <svg viewBox="0 0 32 32" fill="none">
        <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#logo-gradient)" />
        <circle cx="16" cy="16" r="6" fill="rgb(252, 250, 245)" />
        <circle cx="16" cy="16" r="3" fill="url(#logo-gradient)" />
        <defs>
          <linearGradient id="logo-gradient" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#e84132" />
            <stop offset="1" stopColor="#d4af37" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function highlightCode(code: string, lang: string = 'Python'): string {
  if (lang === 'REST') {
    return code
      .replace(/(curl)/g, '<span class="keyword">$1</span>')
      .replace(/(-X|-H|-d)/g, '<span class="property">$1</span>')
      .replace(/(".*?")/g, '<span class="string">$1</span>')
      .replace(/(POST|GET)/g, '<span class="function">$1</span>')
      .replace(/(#.*)/g, '<span class="comment">$1</span>')
      .replace(/(\\)/g, '<span class="comment">$1</span>')
  }
  if (lang === 'JavaScript') {
    return code
      .replace(/(import|from|const|await|new|async|if)/g, '<span class="keyword">$1</span>')
      .replace(/('.*?')/g, '<span class="string">$1</span>')
      .replace(/(Memory|mem|result)/g, '<span class="function">$1</span>')
      .replace(/(apiKey|role|content):/g, '<span class="property">$1</span>:')
      .replace(/(\/\/.*)/g, '<span class="comment">$1</span>')
  }
  // Python (default)
  return code
    .replace(/(from|import|if|def|class)/g, '<span class="keyword">$1</span>')
    .replace(/(".*?")/g, '<span class="string">$1</span>')
    .replace(/(Memory|mem|result)/g, '<span class="function">$1</span>')
    .replace(/(api_key|role|content)=/g, '<span class="property">$1</span>=')
    .replace(/(#.*)/g, '<span class="comment">$1</span>')
}

// ============ UTILITIES ============

function getLocaleFromPathname({ pathname }: { pathname: string }): Locale | null {
  const segment = pathname.split('/').filter(Boolean)[0]
  if (!segment) return null
  if (SUPPORTED_LOCALES.includes(segment as Locale)) return segment as Locale
  return null
}

function buildLocalePathname({ pathname }: { pathname: string; locale: Locale }): string {
  return pathname
}

function getRouteFromPathname({ pathname }: { pathname: string }): RouteKey {
  const strippedPath = stripLocaleFromPathname({ pathname })
  if (strippedPath.startsWith(ROUTE_PATHS.docs)) return 'docs'
  if (strippedPath.startsWith(ROUTE_PATHS.apiKeys)) return 'apiKeys'
  if (strippedPath.startsWith(ROUTE_PATHS.uploads)) return 'uploads'
  if (strippedPath.startsWith(ROUTE_PATHS.usage)) return 'usage'
  if (strippedPath.startsWith(ROUTE_PATHS.memoryPolicy)) return 'memoryPolicy'
  if (strippedPath.startsWith(ROUTE_PATHS.profile)) return 'profile'
  if (strippedPath.startsWith(ROUTE_PATHS.dashboard)) return 'dashboard'
  if (strippedPath.startsWith(ROUTE_PATHS.signIn)) return 'signIn'
  if (strippedPath.startsWith(ROUTE_PATHS.signUp)) return 'signUp'
  if (strippedPath.startsWith(ROUTE_PATHS.passwordReset)) return 'passwordReset'
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

function getDashboardTitle(routeKey: RouteKey) {
  switch (routeKey) {
    case 'apiKeys': return 'API 密钥'
    case 'uploads': return '上传任务'
    case 'usage': return '用量'
    case 'memoryPolicy': return '记忆策略'
    case 'profile': return '个人资料'
    default: return '个人空间概览'
  }
}

function getPreferredLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  const pathLocale = getLocaleFromPathname({ pathname: window.location.pathname })
  if (pathLocale) return pathLocale
  return 'zh'
}

function getNextLocale({ currentLocale }: { currentLocale: Locale }): Locale {
  return currentLocale === 'en' ? 'zh' : 'en'
}

// ============ CONSTANTS ============

const LOCALE_STORAGE_KEY = 'omni-memory-locale'
const SUPPORTED_LOCALES: Locale[] = ['en', 'zh']

const ROUTE_PATHS = {
  home: '/',
  docs: '/docs',
  dashboard: '/dashboard',
  apiKeys: '/dashboard/api-keys',
  uploads: '/dashboard/uploads',
  usage: '/dashboard/usage',
  memoryPolicy: '/dashboard/memory-policy',
  profile: '/dashboard/profile',
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  passwordReset: '/auth/password-reset',
} as const

const CODE_SAMPLE_PYTHON = `from omem import Memory

mem = Memory(api_key="qbk_xxx")  # That's it!

# Save a conversation
mem.add("conv-001", [
    {"role": "user", "content": "鏄庡ぉ鍜?Caroline 鍘昏タ婀?},
    {"role": "assistant", "content": "濂界殑锛屾垜璁颁綇浜?},
])

# Search memories
result = mem.search("鎴戜粈涔堟椂鍊欏幓瑗挎箹锛?)
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
            { label: 'Documentation', href: '/docs', icon: '馃摎' },
            { label: 'API Reference', href: '/docs/api', icon: '鈿? },
            { label: 'Support', href: '/support', icon: '馃挰' },
            { label: 'Discord', href: 'https://discord.gg/omnimemory', icon: '馃幃' },
          ]
        },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Enterprise', href: '#enterprise' },
        { label: 'Research', href: '/research' },
        { label: 'Join Us', href: '/careers' },
      ],
      ctaLabel: 'Get Started',
      toggleLabel: '涓枃',
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
        { value: '<1s', label: 'Retrieval Latency' },
      ],
    },
    features: {
      eyebrow: 'For Enterprise',
      title: 'Production-ready memory infrastructure',
      description: 'Deploy with confidence. Full control over your data and infrastructure.',
      items: [
        { icon: '馃敀', tag: 'Privacy', title: 'Self-Hosted Database', description: 'Deploy on your infrastructure with Qdrant + Neo4j. Your data never leaves your servers. Full data sovereignty.' },
        { icon: '馃殌', tag: 'Deploy', title: 'One-Command Setup', description: 'Docker Compose deployment in minutes. Kubernetes-ready. No complex configuration required.' },
        { icon: '馃懃', tag: 'Support', title: 'Dedicated Team', description: 'SLA-backed enterprise support. Direct access to engineering team. Custom integration assistance.' },
        { icon: '馃搳', tag: 'Console', title: 'API Dashboard', description: 'Monitor usage, manage API keys, configure memory policies. Full observability into your memory layer.' },
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
        { name: 'Sarah Chen', title: 'Head of AI, Aurora Labs', quote: 'We replaced three internal services with Omni Memory. Agent latency dropped 40% immediately鈥攊t just works.' },
        { name: 'Marcus Williams', title: 'VP Product, Northwind', quote: 'Our clinical assistants finally remember patient context across sessions. Game changer for healthcare AI.' },
        { name: 'Elena Rodriguez', title: 'Founder, Signalwave', quote: 'The policy controls let us scope memory by project without building custom infrastructure. Shipped in a week.' },
      ],
    },
    partners: {
      label: 'Trusted by leading research institutions and enterprises',
      partners: [
        { name: 'Tsinghua University', nameCn: '娓呭崕澶у' },
        { name: 'Peking University', nameCn: '鍖椾含澶у' },
        { name: 'Zhejiang University', nameCn: '娴欐睙澶у' },
        { name: 'NUS' },
        { name: 'VU Amsterdam' },
        { name: 'Meituan', nameCn: '缇庡洟' },
      ],
    },
    pricing: {
      eyebrow: 'Pricing',
      title: 'Plans that scale with you',
      description: 'Start free, upgrade as you grow. Predictable, usage-based pricing.',
      plans: [
        { badge: 'Starter', name: 'Build', price: 'Free', period: 'forever', cta: 'Start Free', features: ['2M memories', 'Multi-modal API', 'Community support'] },
        { badge: 'Growth', name: 'Scale', price: '$499', period: '/month', cta: 'Contact Sales', features: ['50M memories', 'Policy engine', 'Priority support', 'Advanced analytics'] },
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
        { question: "What's the retrieval latency?", answer: 'P95 recall under 500ms globally with multi-region caching and hybrid retrieval.' },
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
      ],
      copyright: '漏 2025 Omni Memory. All rights reserved.',
    },
  },
  zh: {
    navbar: {
      brandName: 'Omni Memory',
      navLinks: [
        { 
          label: '寮€鍙戣€?,
          dropdown: [
            { label: '鏂囨。', href: '/docs', icon: '馃摎' },
            { label: 'API 鍙傝€?, href: '/docs/api', icon: '鈿? },
            { label: '鏀寔', href: '/support', icon: '馃挰' },
            { label: 'Discord', href: 'https://discord.gg/omnimemory', icon: '馃幃' },
          ]
        },
        { label: '浠锋牸', href: '#pricing' },
        { label: '浼佷笟鐗?, href: '#enterprise' },
        { label: '鐮旂┒', href: '/research' },
        { label: '鍔犲叆鎴戜滑', href: '/careers' },
      ],
      ctaLabel: '寮€濮嬩娇鐢?,
      toggleLabel: 'EN',
    },
    hero: {
      badge: '鍏祴涓?,
      titleLine1: '璁板繂锛?,
      titleLine2: '鍐冲畾鏅鸿兘涓婇檺',
      description: 'Omni Memory 鏋勫缓澶氭ā鎬佺殑浜虹敓璁板繂绯荤粺锛岃 AI 瓒呰秺鎸囦护銆佺悊瑙ｄ汉锛屽苟闅忕潃浜虹被鐪熷疄鐢熸椿鐨勪笂涓嬫枃涓嶆柇鎴愰暱銆?,
      primaryCta: '寮€濮嬫瀯寤?,
      secondaryCta: '鏌ョ湅鏂囨。',
    },
    stats: {
      items: [
        { value: '#1', label: 'LoCoMo 鍩哄噯娴嬭瘯' },
        { value: '77.8%', label: 'J-Score 鍑嗙‘鐜? },
        { value: '<1s', label: '妫€绱㈠欢杩? },
      ],
    },
    features: {
      eyebrow: '浼佷笟绾ч儴缃?,
      title: '鐢熶骇灏辩华鐨勮蹇嗗熀纭€璁炬柦',
      description: '鑷富閮ㄧ讲锛屽畬鍏ㄦ帉鎺ф暟鎹拰鍩虹璁炬柦銆?,
      items: [
        { icon: '馃敀', tag: '闅愮', title: '鑷墭绠℃暟鎹簱', description: '鍦ㄤ綘鐨勫熀纭€璁炬柦涓婇儴缃?Qdrant + Neo4j銆傛暟鎹案涓嶇寮€浣犵殑鏈嶅姟鍣紝瀹屽叏鐨勬暟鎹富鏉冦€? },
        { icon: '馃殌', tag: '閮ㄧ讲', title: '涓€閿惎鍔?, description: 'Docker Compose 鍒嗛挓绾ч儴缃诧紝鏀寔 Kubernetes锛屾棤闇€澶嶆潅閰嶇疆銆? },
        { icon: '馃懃', tag: '鏀寔', title: '涓撳睘鍥㈤槦', description: 'SLA 淇濋殰鐨勪紒涓氱骇鏀寔锛岀洿鎺ュ鎺ュ伐绋嬪洟闃燂紝鎻愪緵瀹氬埗闆嗘垚鏈嶅姟銆? },
        { icon: '馃搳', tag: '鎺у埗鍙?, title: 'API 绠＄悊闈㈡澘', description: '鐩戞帶鐢ㄩ噺銆佺鐞?API Key銆侀厤缃蹇嗙瓥鐣ャ€傚叏闈㈠彲瑙傛祴鐨勮蹇嗗眰銆? },
      ],
    },
    howItWorks: {
      eyebrow: '宸ヤ綔鍘熺悊',
      title: '浠庢憚鍙栧埌鍙洖',
      description: '绠€鍗曚笁姝ワ紝璁╀綘鐨?AI 鎷ユ湁鎸佷箙璁板繂銆?,
      steps: [
        { title: '鎽勫彇', description: '閫氳繃绠€鍗?API 灏嗗璇濄€佹枃浠跺拰浜嬩欢娴佸叆 Omni Memory銆? },
        { title: '澧炲己', description: '鎴戜滑瀵硅蹇嗗垎绫汇€佸幓閲嶅拰璇勫垎锛屽簲鐢ㄨ“鍑忔洸绾夸繚鎸佸彫鍥炴柊椴溿€? },
        { title: '妫€绱?, description: '鎸夌敤鎴枫€佹剰鍥惧拰鏃堕棿鑼冨洿鏌ヨ銆傛绉掔骇鑾峰彇绛栫暐杩囨护鐨勪笂涓嬫枃銆? },
      ],
    },
    developers: {
      eyebrow: '寮€鍙戣€?,
      title: '鏀寔 Python / JavaScript / REST',
      description: '涓夎浠ｇ爜璁╀綘鐨?AI 鎷ユ湁鎸佷箙璁板繂銆傚垵濮嬪寲銆佸瓨鍌ㄥ璇濄€佸浘澧炲己妫€绱€?,
      primaryCta: '闃呰鏂囨。',
      secondaryCta: '鑱旂郴鎴戜滑',
      codeTabs: [
        { label: 'Python', code: CODE_SAMPLE_PYTHON },
        { label: 'JavaScript', code: CODE_SAMPLE_JS },
        { label: 'REST', code: CODE_SAMPLE_REST },
      ],
    },
    testimonials: {
      eyebrow: '鐢ㄦ埛鏁呬簨',
      title: '浣跨敤 Omni Memory 鐨勫洟闃?,
      items: [
        { name: 'Sarah Chen', title: 'Aurora Labs AI 璐熻矗浜?, quote: '鎴戜滑鐢?Omni Memory 鏇挎崲浜嗕笁涓唴閮ㄦ湇鍔°€傛櫤鑳戒綋寤惰繜绔嬪嵆闄嶄綆 40%鈥斺€斿紑绠卞嵆鐢ㄣ€? },
        { name: 'Marcus Williams', title: 'Northwind 浜у搧鍓€昏', quote: '鎴戜滑鐨勪复搴婂姪鎵嬬粓浜庤兘璺ㄤ細璇濊浣忔偅鑰呬笂涓嬫枃浜嗐€傚尰鐤?AI 鐨勬父鎴忚鍒欐敼鍙樿€呫€? },
        { name: 'Elena Rodriguez', title: 'Signalwave 鍒涘浜?, quote: '绛栫暐鎺у埗璁╂垜浠棤闇€鑷缓鍩虹璁炬柦灏辫兘鎸夐」鐩垝瀹氳蹇嗚寖鍥淬€備竴鍛ㄥ唴涓婄嚎銆? },
      ],
    },
    partners: {
      label: '椤跺皷鐮旂┒鏈烘瀯鍜屼紒涓氱殑淇¤禆涔嬮€?,
      partners: [
        { name: 'Tsinghua University', nameCn: '娓呭崕澶у' },
        { name: 'Peking University', nameCn: '鍖椾含澶у' },
        { name: 'Zhejiang University', nameCn: '娴欐睙澶у' },
        { name: 'NUS' },
        { name: 'VU Amsterdam' },
        { name: 'Meituan', nameCn: '缇庡洟' },
      ],
    },
    pricing: {
      eyebrow: '浠锋牸',
      title: '闅忎綘鎵╁睍鐨勫椁?,
      description: '浠庡厤璐瑰紑濮嬶紝闅忓闀垮崌绾с€傚彲棰勬祴鐨勬寜閲忚璐广€?,
      plans: [
        { badge: '鍏ラ棬', name: '鏋勫缓', price: '鍏嶈垂', period: '姘镐箙', cta: '鍏嶈垂寮€濮?, features: ['200涓囨潯璁板繂', '澶氭ā鎬?API', '绀惧尯鏀寔'] },
        { badge: '鎴愰暱', name: '鎵╁睍', price: '楼3,499', period: '/鏈?, cta: '鑱旂郴閿€鍞?, features: ['5000涓囨潯璁板繂', '绛栫暐寮曟搸', '浼樺厛鏀寔', '楂樼骇鍒嗘瀽'] },
        { badge: '浼佷笟', name: '娌荤悊', price: '瀹氬埗', period: '', cta: '鑱旂郴鎴戜滑', features: ['鏃犻檺璁板繂', '涓撳睘 VPC', '瀹氬埗 SLA', '涓撳睘鏀寔'] },
      ],
    },
    faq: {
      eyebrow: '甯歌闂',
      title: '甯歌闂',
      description: '鍏充簬 Omni Memory 鐨勪竴鍒囥€?,
      items: [
        { question: '鏀寔鍝簺 AI 妯″瀷锛?, answer: '鎴戜滑鍦ㄤ笉鍚屾彁渚涘晢闂寸粺涓€銆備竴娆″啓鍏ワ紝鍙法 GPT銆丆laude銆丟emini 鎴栬嚜瀹氫箟妯″瀷妫€绱€? },
        { question: '鍙互瀛樺偍鍝簺鏁版嵁绫诲瀷锛?, answer: '鏂囨湰銆侀煶棰戣浆褰曘€佸甫涓婁笅鏂囩殑鍥惧儚锛屼互鍙婄粨鏋勫寲浜嬩欢銆傞兘澧炲己浜嗗疄浣撳拰鎰忓浘淇″彿銆? },
        { question: '濡備綍澶勭悊闅愮锛?, answer: '鑷姩 PII 妫€娴嬨€佸彲閰嶇疆淇濈暀鏈熴€佸悓鎰忚拷韪拰閬楀繕鏉冨伐浣滄祦銆傚凡閫氳繃 SOC 2 Type II 璁よ瘉銆? },
        { question: '妫€绱㈠欢杩熸槸澶氬皯锛?, answer: 'P95 鍙洖鍏ㄧ悆浣庝簬 500ms锛屼娇鐢ㄥ鍖哄煙缂撳瓨鍜屾贩鍚堟绱€? },
      ],
    },
    cta: {
      title: '璁╀綘鐨?AI 鎷ユ湁搴斿緱鐨勮蹇?,
      description: '绔嬪嵆寮€濮嬩娇鐢ㄦ寔涔呯殑涓婁笅鏂囪蹇嗐€傚厤璐瑰椁愬彲鐢ㄣ€?,
      primaryCta: '寮€濮嬫瀯寤?,
      secondaryCta: '鏌ョ湅鏂囨。',
    },
    footer: {
      brandName: 'Omni Memory',
      tagline: '鏅鸿兘 AI 搴旂敤鐨勮蹇嗗眰銆?,
      links: [
        { label: '宸ヤ綔鍘熺悊', href: '#how-it-works' },
        { label: '浼佷笟鐗?, href: '#enterprise' },
        { label: '鏂囨。', href: '/docs' },
        { label: '浠锋牸', href: '#pricing' },
      ],
      copyright: '漏 2025 Omni Memory. 淇濈暀鎵€鏈夋潈鍒┿€?,
    },
  },
}

// ============ TYPES ============

type Locale = 'en' | 'zh'
type RouteKey = 'marketing' | 'docs' | 'dashboard' | 'apiKeys' | 'uploads' | 'usage' | 'memoryPolicy' | 'profile' | 'signIn' | 'signUp' | 'passwordReset'

interface AppContent {
  navbar: NavbarContent
  hero: HeroContent
  stats: StatsContent
  features: FeaturesSectionContent
  howItWorks: HowItWorksContent
  developers: DeveloperContent
  testimonials: TestimonialsContent
  partners: PartnersContent
  pricing: PricingContent
  faq: FaqContent
  cta: CtaContent
  footer: FooterContent
}

interface NavLink { 
  label: string
  href?: string
  dropdown?: { label: string; href: string; icon?: string }[]
}
interface NavbarContent { brandName: string; navLinks: NavLink[]; ctaLabel: string; toggleLabel: string }
interface HeroContent { badge: string; titleLine1: string; titleLine2: string; description: string; primaryCta: string; secondaryCta: string }
interface StatsContent { items: { value: string; label: string }[] }
interface FeaturesSectionContent { eyebrow: string; title: string; description: string; items: { icon: string; tag: string; title: string; description: string }[] }
interface HowItWorksContent { eyebrow: string; title: string; description: string; steps: { title: string; description: string }[] }
interface DeveloperContent { eyebrow: string; title: string; description: string; primaryCta: string; secondaryCta: string; codeTabs: { label: string; code: string }[] }
interface TestimonialsContent { eyebrow: string; title: string; items: { name: string; title: string; quote: string }[] }
interface PricingContent { eyebrow: string; title: string; description: string; plans: { badge: string; name: string; price: string; period: string; cta: string; features: string[] }[] }
interface FaqContent { eyebrow: string; title: string; description: string; items: { question: string; answer: string }[] }
interface CtaContent { title: string; description: string; primaryCta: string; secondaryCta: string }
interface PartnersContent { label: string; partners: { name: string; nameCn?: string }[] }
interface FooterContent { brandName: string; tagline: string; links: { label: string; href: string }[]; copyright: string }


