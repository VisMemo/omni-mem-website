import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { AuthControl } from './components/auth-control'
import { DashboardShell } from './components/dashboard-shell'
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
  }

  const dashboardLinks = [
    { label: '概览', path: dashboardPath },
    { label: 'API Key', path: apiKeysPath },
    { label: '上传任务', path: uploadsPath },
    { label: '用量', path: usagePath },
    { label: '通用设置', path: memoryPolicyPath },
    { label: '个人资料', path: profilePath },
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
                <a key={link.label} href={link.href} className="navbar-link">
                  {link.label}
                </a>
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
          <StatsSection content={content.stats} />
          <FeaturesSection content={content.features} />
          <HowItWorksSection content={content.howItWorks} />
          <DeveloperSection content={content.developers} signUpPath={signUpPath} />
          <TestimonialsSection content={content.testimonials} />
          <PricingSection content={content.pricing} signUpPath={signUpPath} />
          <FaqSection content={content.faq} />
          <CtaSection content={content.cta} signUpPath={signUpPath} />
          <Footer content={content.footer} />
        </main>
      ) : (
        <main className="min-h-[70vh] px-6 pb-24 pt-28 sm:px-8">
          {isProtectedRoute && (
            <DashboardShell
              title={getDashboardTitle(routeKey)}
              currentPath={currentDashboardPath}
              links={dashboardLinks}
              onNavigate={navigateTo}
              onSignIn={handleSignInClick}
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
          <p className="mt-1 text-ink-muted">User prefers concise responses</p>
        </motion.div>
        <motion.div
          className="fragment fragment-2"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <span className="font-mono text-xs text-gold">AUDIO</span>
          <p className="mt-1 text-ink-muted">Meeting context captured</p>
        </motion.div>
        <motion.div
          className="fragment fragment-3"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <span className="font-mono text-xs text-petrol">EVENT</span>
          <p className="mt-1 text-ink-muted">Project milestone reached</p>
        </motion.div>
      </div>
    </section>
  )
}

function MarqueeSection() {
  const items = ['Text', 'Audio', 'Images', 'Events', 'Conversations', 'Documents', 'Memories']

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
    <section id="features" className="py-section">
      <div className="container">
        <div className="section-number">01</div>

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
        <div className="section-number">02</div>

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

function DeveloperSection({ content, signUpPath }: { content: DeveloperContent; signUpPath: string }) {
  return (
    <section id="developers" className="split-section">
      <div className="split-left">
        <div className="section-number" style={{ color: 'rgba(252, 250, 245, 0.05)' }}>03</div>
        <span className="section-label" style={{ color: 'rgba(252, 250, 245, 0.5)' }}>
          <span style={{ background: 'rgb(var(--gold))', width: 24, height: 1, display: 'inline-block', marginRight: '1rem' }} />
          {content.eyebrow}
        </span>
        <h2 className="mt-6 mb-6" style={{ color: 'rgb(var(--ivory))' }}>{content.title}</h2>
        <p className="text-lg mb-10" style={{ color: 'rgba(252, 250, 245, 0.6)' }}>{content.description}</p>
        <div className="flex gap-4">
          <a href={signUpPath} className="btn-primary" style={{ background: 'rgb(var(--vermillion))' }}>
            {content.primaryCta}
          </a>
          <a
            href="#"
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
          </div>
          <div className="code-editor-body">
            <pre>
              <code dangerouslySetInnerHTML={{ __html: highlightCode(content.code) }} />
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

function highlightCode(code: string): string {
  return code
    .replace(/(import|from|const|await|new|async)/g, '<span class="keyword">$1</span>')
    .replace(/('.*?')/g, '<span class="string">$1</span>')
    .replace(/(OmniMemory|memory)/g, '<span class="function">$1</span>')
    .replace(/(apiKey|userId|modality|content|metadata|query|limit):/g, '<span class="property">$1</span>:')
    .replace(/(\/\/.*)/g, '<span class="comment">$1</span>')
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
    case 'apiKeys': return 'API Key'
    case 'uploads': return '上传任务'
    case 'usage': return '用量'
    case 'memoryPolicy': return '通用设置'
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

const CODE_SAMPLE = `import { OmniMemory } from '@omni/memory'

const memory = new OmniMemory({
  apiKey: process.env.OMNI_MEMORY_KEY,
})

// Write a memory
await memory.write({
  userId: 'user_1287',
  modality: 'audio',
  content: transcript,
  metadata: { sentiment: 'positive' },
})

// Search memories
const recall = await memory.search({
  userId: 'user_1287',
  query: 'recent discussions',
  limit: 5,
})`

// ============ CONTENT ============

const contentByLocale: Record<Locale, AppContent> = {
  en: {
    navbar: {
      brandName: 'Omni Memory',
      navLinks: [
        { label: 'Features', href: '#features' },
        { label: 'How it Works', href: '#how-it-works' },
        { label: 'Developers', href: '#developers' },
        { label: 'Pricing', href: '#pricing' },
      ],
      ctaLabel: 'Get Started',
      toggleLabel: '中文',
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
        { value: '15B+', label: 'Memories Stored' },
        { value: '<500ms', label: 'Recall Latency' },
        { value: '99.99%', label: 'Uptime SLA' },
      ],
    },
    features: {
      eyebrow: 'Capabilities',
      title: 'Memory infrastructure built for AI',
      description: 'Everything you need to give your AI persistent, contextual memory that scales.',
      items: [
        { icon: '', tag: 'Recall', title: 'Intelligent Retrieval', description: 'Hybrid vector and symbolic search with decay curves. Get the right context at the right time, every time.' },
        { icon: '', tag: 'Policy', title: 'Access Control', description: 'Scope memories by tenant, role, and sensitivity.' },
        { icon: '', tag: 'Graph', title: 'Connected Memory', description: 'Entity graphs link people, projects, and intents.' },
        { icon: '', tag: 'Analytics', title: 'Memory Insights', description: 'Trace how memories influence outputs.' },
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
      title: 'Memory in minutes, not months',
      description: 'Drop in the SDK and start writing memories with structured metadata. Query with filters and safety rails in one API call.',
      primaryCta: 'Read Docs',
      secondaryCta: 'Talk to Us',
      code: CODE_SAMPLE,
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
    pricing: {
      eyebrow: 'Pricing',
      title: 'Plans that scale with you',
      description: 'Start free, upgrade as you grow. Predictable, usage-based pricing.',
      plans: [
        { badge: 'Starter', name: 'Build', price: 'Free', period: 'forever', cta: 'Start Free', features: ['2M memories', 'Multi-modal API', 'Community support'] },
        { badge: 'Growth', name: 'Scale', price: '$499', period: '/month', cta: 'Start Trial', features: ['50M memories', 'Policy engine', 'Priority support', 'Advanced analytics'] },
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
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Documentation', href: '#developers' },
        { label: 'FAQ', href: '#faq' },
      ],
      copyright: '© 2025 Omni Memory. All rights reserved.',
    },
  },
  zh: {
    navbar: {
      brandName: 'Omni Memory',
      navLinks: [
        { label: '功能', href: '#features' },
        { label: '原理', href: '#how-it-works' },
        { label: '开发者', href: '#developers' },
        { label: '价格', href: '#pricing' },
      ],
      ctaLabel: '开始使用',
      toggleLabel: 'EN',
    },
    hero: {
      badge: '公测中',
      titleLine1: '记忆，决定智能上限',
      titleLine2: '记忆，决定智能上限',
      description: 'Omni Memory 构建多模态的人生记忆系统，让 AI 超越指令、理解人，并随着人类真实生活的上下文不断成长。',
      primaryCta: '开始构建',
      secondaryCta: '查看文档',
    },
    stats: {
      items: [
        { value: '150亿+', label: '记忆存储' },
        { value: '<500ms', label: '召回延迟' },
        { value: '99.99%', label: '可用性 SLA' },
      ],
    },
    features: {
      eyebrow: '核心能力',
      title: '为 AI 构建的记忆基础设施',
      description: '一切所需，让你的 AI 拥有持久的、可扩展的上下文记忆。',
      items: [
        { icon: '', tag: '召回', title: '智能检索', description: '混合向量与符号检索，配合衰减曲线。在正确的时间获取正确的上下文。' },
        { icon: '', tag: '策略', title: '访问控制', description: '按租户、角色和敏感级别划定记忆范围。' },
        { icon: '', tag: '图谱', title: '关联记忆', description: '实体图谱连接人、项目和意图。' },
        { icon: '', tag: '分析', title: '记忆洞察', description: '追踪记忆如何影响输出。' },
      ],
    },
    howItWorks: {
      eyebrow: '工作原理',
      title: '从摄取到召回',
      description: '简单三步，让你的 AI 拥有持久记忆。',
      steps: [
        { title: '摄取', description: '通过简单 API 将对话、文件和事件流入 Omni Memory。' },
        { title: '增强', description: '我们对记忆分类、去重和评分，应用衰减曲线保持召回新鲜。' },
        { title: '检索', description: '按用户、意图和时间范围查询。毫秒级获取策略过滤的上下文。' },
      ],
    },
    developers: {
      eyebrow: '开发者',
      title: '分钟级接入，而非数月',
      description: '接入 SDK 即可写入带结构化元数据的记忆。一次 API 调用完成过滤和安全护栏的查询。',
      primaryCta: '阅读文档',
      secondaryCta: '联系我们',
      code: CODE_SAMPLE,
    },
    testimonials: {
      eyebrow: '用户故事',
      title: '使用 Omni Memory 的团队',
      items: [
        { name: 'Sarah Chen', title: 'Aurora Labs AI 负责人', quote: '我们用 Omni Memory 替换了三个内部服务。智能体延迟立即降低 40%——开箱即用。' },
        { name: 'Marcus Williams', title: 'Northwind 产品副总裁', quote: '我们的临床助手终于能跨会话记住患者上下文了。医疗 AI 的游戏规则改变者。' },
        { name: 'Elena Rodriguez', title: 'Signalwave 创始人', quote: '策略控制让我们无需自建基础设施就能按项目划定记忆范围。一周内上线。' },
      ],
    },
    pricing: {
      eyebrow: '价格',
      title: '随你扩展的套餐',
      description: '从免费开始，随增长升级。可预测的按量计费。',
      plans: [
        { badge: '入门', name: '构建', price: '免费', period: '永久', cta: '免费开始', features: ['200万条记忆', '多模态 API', '社区支持'] },
        { badge: '成长', name: '扩展', price: '¥3,499', period: '/月', cta: '开始试用', features: ['5000万条记忆', '策略引擎', '优先支持', '高级分析'] },
        { badge: '企业', name: '治理', price: '定制', period: '', cta: '联系我们', features: ['无限记忆', '专属 VPC', '定制 SLA', '专属支持'] },
      ],
    },
    faq: {
      eyebrow: '常见问题',
      title: '常见问题',
      description: '关于 Omni Memory 的一切。',
      items: [
        { question: '支持哪些 AI 模型？', answer: '我们在不同提供商间统一。一次写入，可跨 GPT、Claude、Gemini 或自定义模型检索。' },
        { question: '可以存储哪些数据类型？', answer: '文本、音频转录、带上下文的图像，以及结构化事件。都增强了实体和意图信号。' },
        { question: '如何处理隐私？', answer: '自动 PII 检测、可配置保留期、同意追踪和遗忘权工作流。已通过 SOC 2 Type II 认证。' },
        { question: '检索延迟是多少？', answer: 'P95 召回全球低于 500ms，使用多区域缓存和混合检索。' },
      ],
    },
    cta: {
      title: '让你的 AI 拥有应得的记忆',
      description: '立即开始使用持久的上下文记忆。免费套餐可用。',
      primaryCta: '开始构建',
      secondaryCta: '查看文档',
    },
    footer: {
      brandName: 'Omni Memory',
      tagline: '智能 AI 应用的记忆层。',
      links: [
        { label: '功能', href: '#features' },
        { label: '价格', href: '#pricing' },
        { label: '文档', href: '#developers' },
        { label: '常见问题', href: '#faq' },
      ],
      copyright: '© 2025 Omni Memory. 保留所有权利。',
    },
  },
}

// ============ TYPES ============

type Locale = 'en' | 'zh'
type RouteKey = 'marketing' | 'dashboard' | 'apiKeys' | 'uploads' | 'usage' | 'memoryPolicy' | 'profile' | 'signIn' | 'signUp' | 'passwordReset'

interface AppContent {
  navbar: NavbarContent
  hero: HeroContent
  stats: StatsContent
  features: FeaturesSectionContent
  howItWorks: HowItWorksContent
  developers: DeveloperContent
  testimonials: TestimonialsContent
  pricing: PricingContent
  faq: FaqContent
  cta: CtaContent
  footer: FooterContent
}

interface NavbarContent { brandName: string; navLinks: { label: string; href: string }[]; ctaLabel: string; toggleLabel: string }
interface HeroContent { badge: string; titleLine1: string; titleLine2: string; description: string; primaryCta: string; secondaryCta: string }
interface StatsContent { items: { value: string; label: string }[] }
interface FeaturesSectionContent { eyebrow: string; title: string; description: string; items: { icon: string; tag: string; title: string; description: string }[] }
interface HowItWorksContent { eyebrow: string; title: string; description: string; steps: { title: string; description: string }[] }
interface DeveloperContent { eyebrow: string; title: string; description: string; primaryCta: string; secondaryCta: string; code: string }
interface TestimonialsContent { eyebrow: string; title: string; items: { name: string; title: string; quote: string }[] }
interface PricingContent { eyebrow: string; title: string; description: string; plans: { badge: string; name: string; price: string; period: string; cta: string; features: string[] }[] }
interface FaqContent { eyebrow: string; title: string; description: string; items: { question: string; answer: string }[] }
interface CtaContent { title: string; description: string; primaryCta: string; secondaryCta: string }
interface FooterContent { brandName: string; tagline: string; links: { label: string; href: string }[]; copyright: string }
