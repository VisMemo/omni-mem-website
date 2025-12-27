import React, { Suspense, useEffect, useState } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Tab,
  Tabs,
} from '@nextui-org/react'
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
import type { FaqSectionContent } from './components/faq-section'
import type { TestimonialsSectionContent } from './components/testimonial-section'

const TestimonialsSection = React.lazy(() =>
  import('./components/testimonial-section').then((module) => ({
    default: module.TestimonialsSection,
  }))
)
const FaqSection = React.lazy(() =>
  import('./components/faq-section').then((module) => ({
    default: module.FaqSection,
  }))
)

export function App() {
  const [locale, setLocale] = useState<Locale>(() => getPreferredLocale())
  const [routeKey, setRouteKey] = useState<RouteKey>(() =>
    getRouteFromPathname({ pathname: getBrowserPathname() })
  )
  const content = contentByLocale[locale]
  const isChinese = locale === 'zh'
  const { session, isLoading: isSessionLoading } = useSupabaseSession()
  const signInPath = buildLocalePathname({ pathname: ROUTE_PATHS.signIn, locale })
  const signUpPath = buildLocalePathname({ pathname: ROUTE_PATHS.signUp, locale })
  const dashboardPath = buildLocalePathname({ pathname: ROUTE_PATHS.dashboard, locale })
  const apiKeysPath = buildLocalePathname({ pathname: ROUTE_PATHS.apiKeys, locale })
  const uploadsPath = buildLocalePathname({ pathname: ROUTE_PATHS.uploads, locale })
  const usagePath = buildLocalePathname({ pathname: ROUTE_PATHS.usage, locale })
  const memoryPolicyPath = buildLocalePathname({ pathname: ROUTE_PATHS.memoryPolicy, locale })
  const profilePath = buildLocalePathname({ pathname: ROUTE_PATHS.profile, locale })
  const homePath = buildLocalePathname({ pathname: ROUTE_PATHS.home, locale })
  const isMarketing = routeKey === 'marketing'
  const isProtectedRoute = ['dashboard', 'apiKeys', 'uploads', 'usage', 'memoryPolicy', 'profile'].includes(routeKey)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const pathLocale = getLocaleFromPathname({ pathname: window.location.pathname })
    if (pathLocale && pathLocale !== locale) {
      setLocale(pathLocale)
      return
    }

    if (!pathLocale) {
      updateLocalePath({ locale, method: 'replace' })
    }

    document.documentElement.lang = locale
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }, [locale])

  useEffect(() => {
    if (typeof window === 'undefined') return

    function handlePopState() {
      const pathLocale = getLocaleFromPathname({ pathname: window.location.pathname })
      if (pathLocale && pathLocale !== locale) {
        setLocale(pathLocale)
      }
      setRouteKey(getRouteFromPathname({ pathname: window.location.pathname }))
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
    updateLocalePath({ locale: nextLocale, method: 'push' })
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

  function navigateTo(pathname: string) {
    if (typeof window === 'undefined') return
    window.history.pushState({}, '', pathname)
    setRouteKey(getRouteFromPathname({ pathname }))
  }

  const dashboardLink = { label: 'Dashboard', href: dashboardPath }
  const navLinks = isMarketing
    ? [dashboardLink, ...content.navbar.navLinks]
    : [{ label: 'Home', href: homePath }, dashboardLink]

  const dashboardLinks = [
    { label: 'Overview', path: dashboardPath },
    { label: 'API Keys', path: apiKeysPath },
    { label: 'Uploads', path: uploadsPath },
    { label: 'Usage', path: usagePath },
    { label: 'Memory Policy', path: memoryPolicyPath },
    { label: 'Profile', path: profilePath },
  ]

  const currentDashboardPath = (() => {
    switch (routeKey) {
      case 'apiKeys':
        return apiKeysPath
      case 'uploads':
        return uploadsPath
      case 'usage':
        return usagePath
      case 'memoryPolicy':
        return memoryPolicyPath
      case 'profile':
        return profilePath
      default:
        return dashboardPath
    }
  })()

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper text-ink">
      <BackgroundOrbs />
      <header>
        <Navbar className="bg-transparent" maxWidth="xl" isBordered={false}>
          <NavbarBrand className="gap-3">
            <LogoMark />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
                {content.navbar.brandName}
              </span>
              <span className="text-xs text-muted">{content.navbar.brandSubtitle}</span>
            </div>
          </NavbarBrand>
          <NavbarContent className="hidden gap-6 md:flex" justify="center">
            {navLinks.map((link) => (
              <NavbarItem key={link.label}>
                {link.href === dashboardPath ? (
                  <button
                    className="text-sm font-medium text-ink/80 hover:text-ink"
                    onClick={handleDashboardClick}
                  >
                    {link.label}
                  </button>
                ) : (
                  <a className="text-sm font-medium text-ink/80 hover:text-ink" href={link.href}>
                    {link.label}
                  </a>
                )}
              </NavbarItem>
            ))}
          </NavbarContent>
          <NavbarContent className="gap-3" justify="end">
            <NavbarItem className="hidden sm:flex">
              <AuthControl onSignIn={handleSignInClick} />
            </NavbarItem>
            <NavbarItem>
              <Button
                className="border border-ink/20 text-ink"
                radius="full"
                size="sm"
                variant="bordered"
                onPress={handleLocaleToggle}
                aria-label={content.navbar.toggleAriaLabel}
              >
                {content.navbar.toggleLabel}
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button
                as="a"
                href={isMarketing ? '#pricing' : signUpPath}
                className="bg-accent text-white shadow-glow"
                radius="full"
              >
                {content.navbar.ctaLabel}
              </Button>
            </NavbarItem>
          </NavbarContent>
        </Navbar>
      </header>

      {isMarketing ? (
        <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10 sm:px-8">
          <HeroSection content={content.hero} />
          <LogoCloud content={content.logoCloud} />
          <FeatureGrid content={content.features} />
          <ModelTabs content={content.modalities} />
          <StepsSection content={content.steps} />
          <UseCases content={content.useCases} />
          <DeveloperSection content={content.developers} />
          <SecuritySection content={content.security} />
          <Suspense fallback={<SectionFallback label={content.fallbacks.stories} />}>
            <TestimonialsSection content={content.testimonials} />
          </Suspense>
          <Suspense fallback={<SectionFallback label={content.fallbacks.answers} />}>
            <FaqSection content={content.faq} />
          </Suspense>
          <PlansSection content={content.pricing} signUpPath={signUpPath} />
          <CTASection content={content.cta} signUpPath={signUpPath} />
        </main>
      ) : (
        <main className="min-h-[70vh] px-6 pb-24 pt-10 sm:px-8">
          {isProtectedRoute ? (
            <DashboardShell
              title={getDashboardTitle(routeKey)}
              currentPath={currentDashboardPath}
              links={dashboardLinks}
              onNavigate={navigateTo}
              onSignIn={handleSignInClick}
            >
              {routeKey === 'dashboard' ? <DashboardPage /> : null}
              {routeKey === 'apiKeys' ? <ApiKeysPage /> : null}
              {routeKey === 'uploads' ? <UploadsPage /> : null}
              {routeKey === 'usage' ? <UsagePage /> : null}
              {routeKey === 'memoryPolicy' ? <MemoryPolicyPage /> : null}
              {routeKey === 'profile' ? <ProfilePage /> : null}
            </DashboardShell>
          ) : null}
          {routeKey === 'signIn' ? (
            <div className="mx-auto flex w-full max-w-5xl justify-center py-16">
              <SignInPage signUpPath={signUpPath} dashboardPath={dashboardPath} onNavigate={navigateTo} />
            </div>
          ) : null}
          {routeKey === 'signUp' ? (
            <div className="mx-auto flex w-full max-w-5xl justify-center py-16">
              <SignUpPage signInPath={signInPath} dashboardPath={dashboardPath} onNavigate={navigateTo} />
            </div>
          ) : null}
        </main>
      )}

      <Footer content={content.footer} />
    </div>
  )
}

function BackgroundOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="hero-surface absolute inset-0" />
      <div className="grid-overlay absolute inset-0" />
      <div className="absolute -top-24 left-0 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(15,139,118,0.25),transparent_70%)] blur-2xl" />
      <div className="absolute right-[-120px] top-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(243,106,61,0.28),transparent_70%)] blur-2xl" />
    </div>
  )
}

function HeroSection({ content }: HeroSectionProps) {
  return (
    <section id="product" className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col gap-6">
        <div
          className="flex flex-wrap items-center gap-3 animate-rise"
          style={{ animationDelay: '60ms' }}
        >
          <Chip className="bg-white/80 text-xs font-semibold uppercase tracking-[0.25em] text-ink">
            {content.badge}
          </Chip>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
            {content.badgeDetail}
          </span>
        </div>
        <div className="space-y-4 animate-rise" style={{ animationDelay: '140ms' }}>
          <h1 className="text-4xl font-semibold sm:text-5xl lg:text-6xl">{content.title}</h1>
          <p className="max-w-xl text-base text-muted sm:text-lg">{content.description}</p>
        </div>
        <div className="flex flex-wrap gap-3 animate-rise" style={{ animationDelay: '220ms' }}>
          <Button as="a" href="#pricing" className="bg-accent text-white shadow-glow" radius="full">
            {content.primaryCta}
          </Button>
          <Button
            as="a"
            href="mailto:hello@omnimemory.ai"
            className="border border-ink/20 text-ink"
            radius="full"
            variant="bordered"
          >
            {content.secondaryCta}
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 animate-rise" style={{ animationDelay: '300ms' }}>
          {content.stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3">
              <p className="text-2xl font-semibold text-ink">{stat.value}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="animate-rise" style={{ animationDelay: '180ms' }}>
        <VideoDemoFlashcards label={content.demoFlashcardsLabel} cards={content.demoFlashcards} />
      </div>
    </section>
  )
}

function VideoDemoFlashcards({ label, cards }: VideoDemoFlashcardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Chip className="bg-white/85 text-xs font-semibold uppercase tracking-[0.25em] text-ink sm:col-span-2">
        {label}
      </Chip>
      {cards.map((card) => (
        <Card key={card.title} className="memory-card overflow-hidden">
          <CardBody className="gap-3">
            <div className={`relative h-32 rounded-xl bg-gradient-to-br ${card.gradient}`}>
              <div className="absolute inset-0 flex items-end gap-[6px] px-4 pb-3">
                {card.waveform.map((value, index) => (
                  <span
                    key={`${card.title}-${index}`}
                    style={{ height: `${value}%` }}
                    className="flex-1 rounded-full bg-white/70 shadow-glow"
                  />
                ))}
              </div>
              <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-ink/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                  {card.marker}
                </span>
                <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink">
                  {card.timestamp}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-ink">{card.title}</p>
              <p className="text-xs text-muted">{card.caption}</p>
              <div className="flex flex-wrap gap-2">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-ink/5 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-ink/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  )
}

function LogoCloud({ content }: LogoCloudProps) {
  return (
    <section className="py-12">
      <div className="flex flex-col gap-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">{content.label}</p>
        <div className="flex flex-wrap gap-4">
          {content.logos.map((logo) => (
            <span
              key={logo}
              className="rounded-full border border-ink/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureGrid({ content }: FeatureGridProps) {
  return (
    <section id="features" className="py-12">
      <div className="grid gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            {content.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{content.title}</h2>
          <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">{content.description}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {content.items.map((feature) => (
            <Card key={feature.title} className="glass-panel">
              <CardHeader className="flex flex-col items-start gap-3">
                <Chip className="bg-accent/10 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  {feature.pill}
                </Chip>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </CardHeader>
              <CardBody className="text-sm text-muted sm:text-base">{feature.description}</CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function ModelTabs({ content }: ModelTabsProps) {
  return (
    <section id="modalities" className="py-12">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            {content.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{content.title}</h2>
          <p className="mt-3 text-base text-muted sm:text-lg">{content.description}</p>
        </div>
        <Card className="glass-panel">
          <CardBody>
            <Tabs aria-label={content.ariaLabel} variant="light" className="w-full">
              {content.items.map((modality) => (
                <Tab key={modality.title} title={modality.title}>
                  <div className="space-y-3 pt-4">
                    <p className="text-sm text-muted sm:text-base">{modality.description}</p>
                    <ul className="space-y-2 text-sm text-ink">
                      {modality.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Tab>
              ))}
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </section>
  )
}

function StepsSection({ content }: StepsSectionProps) {
  return (
    <section id="how-it-works" className="py-12">
      <div className="grid gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            {content.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{content.title}</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {content.items.map((step) => (
            <Card key={step.title} className="glass-panel">
              <CardHeader className="flex flex-col items-start gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  {step.step}
                </span>
                <h3 className="text-xl font-semibold">{step.title}</h3>
              </CardHeader>
              <CardBody className="text-sm text-muted sm:text-base">{step.description}</CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function UseCases({ content }: UseCasesProps) {
  return (
    <section id="use-cases" className="py-12">
      <div className="grid gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            {content.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{content.title}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {content.items.map((useCase) => (
            <Card key={useCase.title} className="glass-panel">
              <CardHeader className="flex flex-col items-start gap-3">
                <h3 className="text-xl font-semibold">{useCase.title}</h3>
                <p className="text-sm text-muted">{useCase.description}</p>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2 text-sm text-ink">
                  {useCase.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent2" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function DeveloperSection({ content }: DeveloperSectionProps) {
  return (
    <section id="developers" className="py-12">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            {content.eyebrow}
          </p>
          <h2 className="text-3xl font-semibold sm:text-4xl">{content.title}</h2>
          <p className="text-base text-muted sm:text-lg">{content.description}</p>
          <div className="flex flex-wrap gap-3">
            <Button as="a" href="#pricing" className="bg-accent text-white" radius="full">
              {content.primaryCta}
            </Button>
            <Button as="a" href="mailto:hello@omnimemory.ai" variant="bordered" radius="full">
              {content.secondaryCta}
            </Button>
          </div>
        </div>
        <Card className="code-surface">
          <CardBody>
            <pre className="overflow-x-auto text-sm text-ink">
              <code>{content.codeSample}</code>
            </pre>
          </CardBody>
        </Card>
      </div>
    </section>
  )
}

function SecuritySection({ content }: SecuritySectionProps) {
  return (
    <section id="security" className="py-12">
      <div className="grid gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            {content.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{content.title}</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {content.items.map((item) => (
            <Card key={item.title} className="glass-panel">
              <CardHeader className="flex flex-col items-start gap-2">
                <h3 className="text-lg font-semibold">{item.title}</h3>
              </CardHeader>
              <CardBody className="text-sm text-muted sm:text-base">{item.description}</CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function PlansSection({ content, signUpPath }: PlansSectionProps) {
  return (
    <section id="pricing" className="py-12">
      <div className="grid gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            {content.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{content.title}</h2>
          <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">{content.description}</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {content.plans.map((plan) => (
            <Card key={plan.title} className="glass-panel h-full">
              <CardHeader className="flex flex-col items-start gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  {plan.badge}
                </p>
                <h3 className="text-xl font-semibold">{plan.title}</h3>
                <p className="text-3xl font-semibold text-ink">{plan.price}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">{plan.caption}</p>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                <ul className="space-y-2 text-sm text-ink">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
                  <Button
                    as="a"
                    href={signUpPath}
                    className="mt-auto bg-accent text-white"
                    radius="full"
                  >
                    {plan.cta}
                  </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection({ content, signUpPath }: CTASectionProps) {
  return (
    <section className="py-16">
      <Card className="glass-panel">
        <CardBody className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
              {content.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">{content.title}</h2>
            <p className="text-base text-muted sm:text-lg">{content.description}</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button as="a" href={signUpPath} className="bg-accent text-white" radius="full">
                {content.primaryCta}
              </Button>
            <Button as="a" href="#developers" variant="bordered" radius="full">
              {content.secondaryCta}
            </Button>
          </div>
        </CardBody>
      </Card>
    </section>
  )
}

function SectionFallback({ label }: SectionFallbackProps) {
  return (
    <div className="my-12 rounded-3xl border border-ink/10 bg-white/70 px-6 py-8 text-sm text-muted">
      {label}
    </div>
  )
}

function Footer({ content }: FooterProps) {
  return (
    <footer className="border-t border-ink/10 bg-white/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <p className="text-sm font-semibold">{content.brandName}</p>
            <p className="text-xs text-muted">{content.brandSubtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.2em] text-muted">
          {content.links.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-ink">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

function LogoMark() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-ink/10 bg-white/80">
      <span className="absolute h-6 w-6 rounded-full bg-accent/70" />
      <span className="absolute h-4 w-4 rounded-full bg-accent2/80" />
      <span className="relative text-xs font-semibold text-white">omni</span>
    </div>
  )
}

function getLocaleFromPathname({ pathname }: LocalePathnameProps): Locale | null {
  const segment = pathname.split('/').filter(Boolean)[0]
  if (!segment) return null
  if (SUPPORTED_LOCALES.includes(segment as Locale)) return segment as Locale
  return null
}

function buildLocalePathname({ pathname, locale }: BuildLocalePathnameProps): string {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return `/${locale}/`

  if (SUPPORTED_LOCALES.includes(segments[0] as Locale)) {
    segments[0] = locale
  } else {
    segments.unshift(locale)
  }

  const joined = `/${segments.join('/')}`
  if (segments.length === 1) return `${joined}/`
  return joined
}

function updateLocalePath({ locale, method }: UpdateLocalePathProps) {
  if (typeof window === 'undefined') return

  const nextPath = buildLocalePathname({ pathname: window.location.pathname, locale })
  const nextUrl = `${nextPath}${window.location.search}${window.location.hash}`
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`

  if (nextUrl === currentUrl) return

  if (method === 'replace') {
    window.history.replaceState(null, '', nextUrl)
    return
  }

  window.history.pushState(null, '', nextUrl)
}

function getRouteFromPathname({ pathname }: RoutePathnameProps): RouteKey {
  const strippedPath = stripLocaleFromPathname({ pathname })
  if (strippedPath.startsWith(ROUTE_PATHS.apiKeys)) return 'apiKeys'
  if (strippedPath.startsWith(ROUTE_PATHS.uploads)) return 'uploads'
  if (strippedPath.startsWith(ROUTE_PATHS.usage)) return 'usage'
  if (strippedPath.startsWith(ROUTE_PATHS.memoryPolicy)) return 'memoryPolicy'
  if (strippedPath.startsWith(ROUTE_PATHS.profile)) return 'profile'
  if (strippedPath.startsWith(ROUTE_PATHS.dashboard)) return 'dashboard'
  if (strippedPath.startsWith(ROUTE_PATHS.signIn)) return 'signIn'
  if (strippedPath.startsWith(ROUTE_PATHS.signUp)) return 'signUp'
  return 'marketing'
}

function stripLocaleFromPathname({ pathname }: RoutePathnameProps) {
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
    case 'apiKeys':
      return 'API Keys'
    case 'uploads':
      return 'Uploads'
    case 'usage':
      return 'Usage'
    case 'memoryPolicy':
      return 'Memory Policy'
    case 'profile':
      return 'Profile'
    default:
      return 'Your SaaS at a glance'
  }
}

function getPreferredLocale(): Locale {
  if (typeof window === 'undefined') return 'en'

  const pathLocale = getLocaleFromPathname({ pathname: window.location.pathname })
  if (pathLocale) return pathLocale

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  if (storedLocale && SUPPORTED_LOCALES.includes(storedLocale as Locale)) return storedLocale as Locale

  const browserLocale = window.navigator.language.toLowerCase()
  if (browserLocale.startsWith('zh')) return 'zh'

  return 'en'
}

function getNextLocale({ currentLocale }: GetNextLocaleProps): Locale {
  if (currentLocale === 'en') return 'zh'
  return 'en'
}

const codeSample = `import { OmniMemory } from '@omni/memory'

const memory = new OmniMemory({
  apiKey: process.env.OMNI_MEMORY_KEY,
})

await memory.write({
  userId: 'user_1287',
  modality: 'audio',
  content: transcript,
  metadata: {
    account: 'northwind',
    sentiment: 'positive',
  },
})

const recall = await memory.search({
  userId: 'user_1287',
  query: 'renewal concerns',
  limit: 6,
})
`

const LOCALE_STORAGE_KEY = 'omni-memory-locale'
const SUPPORTED_LOCALES: Locale[] = ['en', 'zh']

const contentByLocale: ContentByLocale = {
  en: {
    navbar: {
      brandName: 'omni memory',
      brandSubtitle: 'multi-model memory service',
      navLinks: [
        { label: 'Product', href: '#product' },
        { label: 'Features', href: '#features' },
        { label: 'How it works', href: '#how-it-works' },
        { label: 'Developers', href: '#developers' },
        { label: 'Security', href: '#security' },
        { label: 'Pricing', href: '#pricing' },
      ],
      ctaLabel: 'Start building',
      toggleLabel: '中文',
      toggleAriaLabel: 'Switch to Chinese',
    },
    hero: {
      badge: 'New release',
      badgeDetail: 'Multimodal memory system',
      title: 'Agents live in moments. We give them experience.',
      description:
        'Omni Memory is a multimodal memory system that enables AI to understand people beyond prompts, powering deeply personalized AI that evolves with human context over time.',
      primaryCta: 'Start building',
      secondaryCta: 'Book a demo',
      stats: [
        { value: '15B', label: 'memories indexed' },
        { value: '500ms', label: 'p95 recall' },
        { value: '99.99%', label: 'uptime SLA' },
      ],
      demoFlashcardsLabel: 'Video understanding demo',
      demoFlashcards: [
        {
          title: 'Understands what is on screen',
          caption:
            'Tracks the runner, stroller, and skyline so the clip becomes a memory with context.',
          timestamp: '00:12-00:18',
          marker: 'Scene change',
          tags: ['Visual caption', 'Objects tagged', 'Mood: calm'],
          waveform: [18, 32, 58, 74, 62, 48, 68, 36, 22, 40],
          gradient: 'from-accent/20 via-white to-ink/5',
        },
        {
          title: 'Understands actions and intent',
          caption: 'Detects the handshake, luggage pickup, and the host moving toward the guest.',
          timestamp: '00:41-00:49',
          marker: 'Action focus',
          tags: ['Action: greeting', 'Intent: arrival', 'Tone: upbeat'],
          waveform: [28, 64, 72, 46, 55, 68, 62, 38, 30, 44],
          gradient: 'from-accent2/20 via-white to-ink/5',
        },
        {
          title: 'Writes a living memory',
          caption: 'Summarizes the clip and links it to prior visits and preferences automatically.',
          timestamp: '01:12-01:20',
          marker: 'Story node',
          tags: ['Summary ready', 'Face matched', 'Preference linked'],
          waveform: [22, 30, 44, 62, 78, 66, 50, 58, 34, 26],
          gradient: 'from-ink/5 via-white to-accent/20',
        },
      ],
    },
    logoCloud: {
      label: 'Trusted by memory-first teams',
      logos: ['Atlas Robotics', 'Northwind', 'Signalwave', 'Aurora Labs', 'Harbor AI', 'Mosaic Health'],
    },
    features: {
      eyebrow: 'Memory platform',
      title: 'A memory fabric designed for multi-model AI',
      description:
        'Omni Memory orchestrates storage, enrichment, and retrieval so your agents can learn from every interaction without drowning in data.',
      items: [
        {
          pill: 'Recall engine',
          title: 'Context that stays fresh',
          description:
            'Hybrid vector and symbolic retrieval keeps the right memories at the surface, with decay curves and freshness scoring.',
        },
        {
          pill: 'Policy-aware',
          title: 'Fine-grained governance',
          description:
            'Scope by tenant, role, and sensitivity labels. Every memory is filtered before it reaches the model.',
        },
        {
          pill: 'Knowledge graph',
          title: 'Memory relationships at scale',
          description:
            'Entity graphs connect people, projects, and intents so recall spans conversations, docs, and files.',
        },
        {
          pill: 'Observability',
          title: 'Measure recall quality',
          description:
            'Inspect how memories influenced output, tune ranking with feedback loops, and audit usage.',
        },
      ],
    },
    modalities: {
      eyebrow: 'Modalities',
      title: 'Every input becomes memory, not noise',
      description:
        'Normalize multi-modal data into a single timeline. Every write is enriched with intent, entity, and urgency signals.',
      ariaLabel: 'Memory modalities',
      items: [
        {
          title: 'Text',
          description:
            'Streams from chat, docs, and notes are summarized and stored in long-term memory.',
          bullets: ['Entity extraction', 'Intent tagging', 'Automatic summarization'],
        },
        {
          title: 'Audio',
          description:
            'Voice memory layers preserve tone and decisions for support, sales, and care teams.',
          bullets: ['Speaker diarization', 'Highlights and action items', 'Sentiment signals'],
        },
        {
          title: 'Images',
          description:
            'Screenshots and diagrams become searchable context with rich annotations.',
          bullets: ['Visual captioning', 'Object and layout cues', 'Versioned snapshots'],
        },
        {
          title: 'Events',
          description:
            'Product usage and telemetry are rolled into memory for personalized experiences.',
          bullets: ['Session timelines', 'Behavioral triggers', 'Retention scoring'],
        },
      ],
    },
    steps: {
      eyebrow: 'How it works',
      title: 'From ingestion to recall in three steps',
      items: [
        {
          step: 'Step 01',
          title: 'Ingest anything',
          description:
            'Stream conversations, files, events, and embeddings into Omni Memory in real time.',
        },
        {
          step: 'Step 02',
          title: 'Enrich and score',
          description: 'We classify, dedupe, and apply decay to keep recall fresh and relevant.',
        },
        {
          step: 'Step 03',
          title: 'Retrieve with policy',
          description:
            'Query by user, intent, and time horizon to deliver the right context instantly.',
        },
      ],
    },
    useCases: {
      eyebrow: 'Use cases',
      title: 'Built for teams shipping memory-first experiences',
      items: [
        {
          title: 'Agentic copilots',
          description: 'Give agents continuity across sessions and channels.',
          bullets: ['Long-lived memory', 'Cross-tool grounding', 'Persona consistency'],
        },
        {
          title: 'Customer support',
          description: 'Resolve issues faster with a shared memory graph across teams.',
          bullets: ['Account timelines', 'Policy-safe recall', 'Fewer escalations'],
        },
        {
          title: 'Enterprise knowledge',
          description: 'Connect knowledge sources into one memory layer.',
          bullets: ['Doc + chat fusion', 'Role-aware access', 'Adaptive summarization'],
        },
        {
          title: 'Personalization',
          description: 'Remember preferences without storing raw PII.',
          bullets: ['Preference embeddings', 'Privacy controls', 'Predictive insights'],
        },
      ],
    },
    developers: {
      eyebrow: 'Developers',
      title: 'Memory in minutes, not quarters',
      description:
        'Drop in the Omni Memory SDK and start writing memories with structured metadata. Query with filters, decay curves, and safety rails in one call.',
      primaryCta: 'View SDKs',
      secondaryCta: 'Talk to engineering',
      codeSample,
    },
    security: {
      eyebrow: 'Security',
      title: 'Governance, privacy, and control in every recall',
      items: [
        {
          title: 'SOC 2 Type II ready',
          description: 'Enterprise controls, audit trails, and encryption at rest and in transit.',
        },
        {
          title: 'Data residency controls',
          description: 'Pin memory storage to your region with configurable retention windows.',
        },
        {
          title: 'Consent and redaction',
          description: 'Automated PII redaction and consent metadata per memory record.',
        },
      ],
    },
    pricing: {
      eyebrow: 'Pricing',
      title: 'Plans that scale with your memory',
      description:
        'Start free, then upgrade as your memory footprint grows. Usage-based pricing keeps costs predictable as you scale.',
      plans: [
        {
          badge: 'Starter',
          title: 'Build',
          price: 'Free',
          caption: 'Up to 2M memories',
          cta: 'Create account',
          features: ['Multi-model memory API', 'Community support', 'Basic analytics'],
        },
        {
          badge: 'Growth',
          title: 'Scale',
          price: '$499 / mo',
          caption: 'Up to 50M memories',
          cta: 'Talk to sales',
          features: ['Policy filters', 'Priority recall caches', 'Advanced observability'],
        },
        {
          badge: 'Enterprise',
          title: 'Govern',
          price: 'Custom',
          caption: 'Unlimited memories',
          cta: 'Schedule workshop',
          features: ['Dedicated VPC', 'Data residency', 'Custom SLAs'],
        },
      ],
    },
    cta: {
      eyebrow: 'Ready',
      title: 'Give every model the memory it deserves',
      description:
        'Launch faster, ground agents in real context, and make your AI experiences feel human.',
      primaryCta: 'Start a pilot',
      secondaryCta: 'Explore docs',
    },
    footer: {
      brandName: 'omni memory',
      brandSubtitle: 'Memory infrastructure for every model',
      links: [
        { label: 'Product', href: '#product' },
        { label: 'Developers', href: '#developers' },
        { label: 'Security', href: '#security' },
        { label: 'FAQ', href: '#faq' },
      ],
    },
    testimonials: {
      eyebrow: 'Memory in the wild',
      title: 'Teams ship calmer, smarter AI with Omni Memory',
      description:
        'From real-time copilots to enterprise knowledge graphs, Omni Memory keeps every model in sync with the context that matters most.',
      items: [
        {
          name: 'Mira Patel',
          title: 'Director of AI, Atlas Robotics',
          quote:
            'We replaced three internal services with Omni Memory. Our agent latency dropped by 38 percent and recall quality went up immediately.',
        },
        {
          name: 'Jordan Lee',
          title: 'VP Product, Northwind Health',
          quote:
            'Omni Memory gave us a single memory layer across voice and chat. Our nurses trust the assistant because it finally remembers context.',
        },
        {
          name: 'Aria Flores',
          title: 'Founder, Signalwave',
          quote:
            'The policy controls are the real win. We can gate memory by project, user, and sensitivity without custom infra.',
        },
      ],
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Everything you need to know about Omni Memory',
      description:
        'Clear answers for product, security, and data governance. Need more detail? Our team will walk you through the architecture.',
      items: [
        {
          title: 'How does omni memory support multiple models?',
          description:
            'Omni Memory normalizes embeddings, metadata, and policies across providers. You can write once and retrieve across GPT, Claude, Gemini, or custom models.',
        },
        {
          title: 'What types of data can be stored?',
          description:
            'Text, audio transcripts, images with extracted captions, and structured events are all supported. Memory chunks are enriched with entity, intent, and timeline signals.',
        },
        {
          title: 'Can we control retention and access?',
          description:
            'Yes. Set TTLs, per-tenant scopes, and sensitivity labels. Retrieval respects your policy filters before ranking results.',
        },
        {
          title: 'How is latency kept low?',
          description:
            'We use multi-region recall caches, streaming updates, and hybrid vector plus symbolic retrieval to keep p95 recall under 500ms.',
        },
      ],
    },
    fallbacks: {
      stories: 'Loading stories',
      answers: 'Loading answers',
    },
  },
  zh: {
    navbar: {
      brandName: 'omni memory',
      brandSubtitle: '多模态记忆服务',
      navLinks: [
        { label: '产品', href: '#product' },
        { label: '功能', href: '#features' },
        { label: '工作原理', href: '#how-it-works' },
        { label: '开发者', href: '#developers' },
        { label: '安全', href: '#security' },
        { label: '价格', href: '#pricing' },
      ],
      ctaLabel: '开始构建',
      toggleLabel: 'EN',
      toggleAriaLabel: '切换到英文',
    },
    hero: {
      badge: '全新发布',
      badgeDetail: '多模态记忆系统',
      title: '记忆，决定智能上限。',
      description:
        'Omni Memory 构建多模态的人生记忆系统，让 AI 超越指令、理解人，并随着人类真实生活的上下文不断成长。',
      primaryCta: '开始构建',
      secondaryCta: '预约演示',
      stats: [
        { value: '15B', label: '已索引记忆' },
        { value: '500ms', label: 'P95 召回' },
        { value: '99.99%', label: '可用性 SLA' },
      ],
      demoFlashcardsLabel: '视频理解示例',
      demoFlashcards: [
        {
          title: '看懂画面',
          caption: '跟踪跑步者、推车和天际线，让片段变成带语境的记忆。',
          timestamp: '00:12-00:18',
          marker: '场景切换',
          tags: ['视觉字幕', '对象标注', '情绪：平静'],
          waveform: [18, 32, 58, 74, 62, 48, 68, 36, 22, 40],
          gradient: 'from-accent/20 via-white to-ink/5',
        },
        {
          title: '理解动作与意图',
          caption: '识别握手、提起行李，以及主人迎接访客的动作。',
          timestamp: '00:41-00:49',
          marker: '动作聚焦',
          tags: ['动作：问候', '意图：到达', '语气：愉快'],
          waveform: [28, 64, 72, 46, 55, 68, 62, 38, 30, 44],
          gradient: 'from-accent2/20 via-white to-ink/5',
        },
        {
          title: '生成可演进的记忆',
          caption: '总结片段并自动关联到过往拜访与个人偏好。',
          timestamp: '01:12-01:20',
          marker: '故事节点',
          tags: ['摘要就绪', '人脸匹配', '偏好关联'],
          waveform: [22, 30, 44, 62, 78, 66, 50, 58, 34, 26],
          gradient: 'from-ink/5 via-white to-accent/20',
        },
      ],
    },
    logoCloud: {
      label: '受记忆优先团队信赖',
      logos: ['Atlas Robotics', 'Northwind', 'Signalwave', 'Aurora Labs', 'Harbor AI', 'Mosaic Health'],
    },
    features: {
      eyebrow: '记忆平台',
      title: '为多模态 AI 设计的记忆织体',
      description:
        'Omni Memory 协同存储、增强与检索，让你的智能体从每次交互中学习，而不被数据淹没。',
      items: [
        {
          pill: '召回引擎',
          title: '上下文始终新鲜',
          description:
            '混合向量与符号检索让正确记忆浮现，并通过衰减曲线和新鲜度评分保持更新。',
        },
        {
          pill: '策略感知',
          title: '精细化治理',
          description: '按租户、角色与敏感级别划定范围。每条记忆在进入模型前都会被过滤。',
        },
        {
          pill: '知识图谱',
          title: '规模化记忆关系',
          description: '实体图谱连接人、项目与意图，让召回跨越对话、文档与文件。',
        },
        {
          pill: '可观测性',
          title: '衡量召回质量',
          description: '洞察记忆如何影响输出，通过反馈回路调优排序，并审计使用情况。',
        },
      ],
    },
    modalities: {
      eyebrow: '模态',
      title: '每一次输入都是记忆，而非噪音',
      description:
        '将多模态数据归一到同一时间线。每次写入都包含意图、实体与紧急度信号。',
      ariaLabel: '记忆模态',
      items: [
        {
          title: '文本',
          description: '来自聊天、文档与笔记的流式内容会被总结并存入长期记忆。',
          bullets: ['实体抽取', '意图标注', '自动摘要'],
        },
        {
          title: '音频',
          description: '语音记忆层保留语气与决策，服务支持、销售和护理团队。',
          bullets: ['说话人分离', '重点与行动项', '情绪信号'],
        },
        {
          title: '图像',
          description: '截图和示意图通过丰富标注变为可检索上下文。',
          bullets: ['视觉字幕', '对象与布局线索', '版本化快照'],
        },
        {
          title: '事件',
          description: '产品使用与遥测数据被纳入记忆，打造个性化体验。',
          bullets: ['会话时间线', '行为触发器', '留存评分'],
        },
      ],
    },
    steps: {
      eyebrow: '工作原理',
      title: '从摄取到召回只需三步',
      items: [
        {
          step: '步骤 01',
          title: '摄取一切',
          description: '实时将对话、文件、事件和向量嵌入流入 Omni Memory。',
        },
        {
          step: '步骤 02',
          title: '增强与评分',
          description: '我们进行分类、去重并应用衰减，使召回保持新鲜与相关。',
        },
        {
          step: '步骤 03',
          title: '按策略检索',
          description: '按用户、意图和时间范围查询，瞬时提供合适上下文。',
        },
      ],
    },
    useCases: {
      eyebrow: '应用场景',
      title: '为打造记忆优先体验的团队而生',
      items: [
        {
          title: '智能体副驾',
          description: '让智能体跨会话与渠道保持连续性。',
          bullets: ['长期记忆', '跨工具对齐', '角色一致性'],
        },
        {
          title: '客户支持',
          description: '跨团队共享记忆图谱，加速问题解决。',
          bullets: ['账户时间线', '合规召回', '更少升级'],
        },
        {
          title: '企业知识',
          description: '将知识源连接为统一记忆层。',
          bullets: ['文档 + 聊天融合', '角色感知访问', '自适应摘要'],
        },
        {
          title: '个性化',
          description: '在不存储原始 PII 的前提下记住偏好。',
          bullets: ['偏好嵌入', '隐私控制', '预测洞察'],
        },
      ],
    },
    developers: {
      eyebrow: '开发者',
      title: '几分钟接入，而不是几个季度',
      description:
        '接入 Omni Memory SDK，即可写入带结构化元数据的记忆。一个调用内完成过滤、衰减曲线与安全护栏的查询。',
      primaryCta: '查看 SDK',
      secondaryCta: '联系工程团队',
      codeSample,
    },
    security: {
      eyebrow: '安全',
      title: '每次召回都具备治理、隐私与控制',
      items: [
        {
          title: 'SOC 2 Type II 就绪',
          description: '企业级控制、审计追踪，以及静态与传输加密。',
        },
        {
          title: '数据驻留控制',
          description: '将记忆存储固定在指定区域，并可配置保留窗口。',
        },
        {
          title: '同意与脱敏',
          description: '每条记忆记录自动 PII 脱敏并记录同意元数据。',
        },
      ],
    },
    pricing: {
      eyebrow: '价格',
      title: '随记忆规模扩展的套餐',
      description: '从免费开始，随记忆规模增长升级。按量计费让扩展成本可预测。',
      plans: [
        {
          badge: '入门',
          title: '构建',
          price: '免费',
          caption: '最多 200 万条记忆',
          cta: '创建账号',
          features: ['多模态记忆 API', '社区支持', '基础分析'],
        },
        {
          badge: '成长',
          title: '扩展',
          price: '$499 / 月',
          caption: '最多 5000 万条记忆',
          cta: '联系销售',
          features: ['策略过滤', '优先召回缓存', '高级可观测性'],
        },
        {
          badge: '企业',
          title: '治理',
          price: '定制',
          caption: '无限记忆',
          cta: '安排研讨会',
          features: ['专属 VPC', '数据驻留', '定制 SLA'],
        },
      ],
    },
    cta: {
      eyebrow: '准备好了',
      title: '让每个模型拥有应得的记忆',
      description: '更快上线，让智能体扎根真实语境，让 AI 体验更有人情味。',
      primaryCta: '启动试点',
      secondaryCta: '查看文档',
    },
    footer: {
      brandName: 'omni memory',
      brandSubtitle: '面向每个模型的记忆基础设施',
      links: [
        { label: '产品', href: '#product' },
        { label: '开发者', href: '#developers' },
        { label: '安全', href: '#security' },
        { label: '常见问题', href: '#faq' },
      ],
    },
    testimonials: {
      eyebrow: '真实场景中的记忆',
      title: '团队借助 Omni Memory 打造更冷静、更聪明的 AI',
      description:
        '从实时副驾到企业知识图谱，Omni Memory 让每个模型与最重要的上下文保持同步。',
      items: [
        {
          name: 'Mira Patel',
          title: 'Atlas Robotics AI 负责人',
          quote: '我们用 Omni Memory 替换了三个内部服务。智能体延迟降低 38%，召回质量立刻提升。',
        },
        {
          name: 'Jordan Lee',
          title: 'Northwind Health 产品副总裁',
          quote: 'Omni Memory 为语音与聊天提供统一记忆层。护士们信任助手，因为它终于记得上下文。',
        },
        {
          name: 'Aria Flores',
          title: 'Signalwave 创始人',
          quote: '策略控制才是真正的胜利。我们无需自建基础设施，就能按项目、用户与敏感度限制记忆访问。',
        },
      ],
    },
    faq: {
      eyebrow: '常见问题',
      title: '关于 Omni Memory 的一切',
      description: '关于产品、安全与数据治理的清晰解答。需要更多细节？我们的团队将带你了解架构。',
      items: [
        {
          title: 'Omni Memory 如何支持多模型？',
          description:
            'Omni Memory 在不同提供商间统一嵌入、元数据与策略。一次写入，可跨 GPT、Claude、Gemini 或自定义模型检索。',
        },
        {
          title: '可以存储哪些类型的数据？',
          description:
            '支持文本、音频转录、带提取字幕的图像，以及结构化事件。记忆块会被增强为包含实体、意图与时间线信号。',
        },
        {
          title: '能否控制保留周期与访问权限？',
          description:
            '可以。设置 TTL、按租户划定范围与敏感标签。检索在排序前会先遵循你的策略过滤。',
        },
        {
          title: '如何保持低延迟？',
          description:
            '我们使用多区域召回缓存、流式更新以及向量+符号混合检索，将 P95 召回控制在 500ms 内。',
        },
      ],
    },
    fallbacks: {
      stories: '加载案例',
      answers: '加载解答',
    },
  },
}

interface HeroSectionProps {
  content: HeroContent
}

interface VideoDemoFlashcardsProps {
  label: string
  cards: VideoFlashcard[]
}

interface LogoCloudProps {
  content: LogoCloudContent
}

interface FeatureGridProps {
  content: FeatureSectionContent
}

interface ModelTabsProps {
  content: ModalitiesSectionContent
}

interface StepsSectionProps {
  content: StepsSectionContent
}

interface UseCasesProps {
  content: UseCasesSectionContent
}

interface DeveloperSectionProps {
  content: DeveloperSectionContent
}

interface SecuritySectionProps {
  content: SecuritySectionContent
}

interface PlansSectionProps {
  content: PricingSectionContent
  signUpPath: string
}

interface CTASectionProps {
  content: CtaSectionContent
  signUpPath: string
}

interface FooterProps {
  content: FooterContent
}

interface SectionFallbackProps {
  label: string
}

interface LocalePathnameProps {
  pathname: string
}

interface RoutePathnameProps {
  pathname: string
}

interface BuildLocalePathnameProps {
  pathname: string
  locale: Locale
}

interface UpdateLocalePathProps {
  locale: Locale
  method: 'replace' | 'push'
}

interface GetNextLocaleProps {
  currentLocale: Locale
}

interface ContentByLocale {
  en: AppContent
  zh: AppContent
}

interface AppContent {
  navbar: NavbarContent
  hero: HeroContent
  logoCloud: LogoCloudContent
  features: FeatureSectionContent
  modalities: ModalitiesSectionContent
  steps: StepsSectionContent
  useCases: UseCasesSectionContent
  developers: DeveloperSectionContent
  security: SecuritySectionContent
  pricing: PricingSectionContent
  cta: CtaSectionContent
  footer: FooterContent
  testimonials: TestimonialsSectionContent
  faq: FaqSectionContent
  fallbacks: FallbackContent
}

interface NavbarContent {
  brandName: string
  brandSubtitle: string
  navLinks: NavLink[]
  ctaLabel: string
  toggleLabel: string
  toggleAriaLabel: string
}

interface HeroContent {
  badge: string
  badgeDetail: string
  title: string
  description: string
  primaryCta: string
  secondaryCta: string
  stats: StatItem[]
  demoFlashcardsLabel: string
  demoFlashcards: VideoFlashcard[]
}

interface LogoCloudContent {
  label: string
  logos: string[]
}

interface FeatureSectionContent {
  eyebrow: string
  title: string
  description: string
  items: FeatureItem[]
}

interface ModalitiesSectionContent {
  eyebrow: string
  title: string
  description: string
  ariaLabel: string
  items: ModalityItem[]
}

interface StepsSectionContent {
  eyebrow: string
  title: string
  items: StepItem[]
}

interface UseCasesSectionContent {
  eyebrow: string
  title: string
  items: UseCaseItem[]
}

interface DeveloperSectionContent {
  eyebrow: string
  title: string
  description: string
  primaryCta: string
  secondaryCta: string
  codeSample: string
}

interface SecuritySectionContent {
  eyebrow: string
  title: string
  items: SecurityItem[]
}

interface PricingSectionContent {
  eyebrow: string
  title: string
  description: string
  plans: PlanItem[]
}

interface CtaSectionContent {
  eyebrow: string
  title: string
  description: string
  primaryCta: string
  secondaryCta: string
}

interface FooterContent {
  brandName: string
  brandSubtitle: string
  links: NavLink[]
}

interface FallbackContent {
  stories: string
  answers: string
}

interface NavLink {
  label: string
  href: string
}

interface StatItem {
  value: string
  label: string
}

interface VideoFlashcard {
  title: string
  caption: string
  timestamp: string
  marker: string
  tags: string[]
  waveform: number[]
  gradient: string
}

interface FeatureItem {
  pill: string
  title: string
  description: string
}

interface ModalityItem {
  title: string
  description: string
  bullets: string[]
}

interface StepItem {
  step: string
  title: string
  description: string
}

interface UseCaseItem {
  title: string
  description: string
  bullets: string[]
}

interface SecurityItem {
  title: string
  description: string
}

interface PlanItem {
  badge: string
  title: string
  price: string
  caption: string
  cta: string
  features: string[]
}

type Locale = keyof ContentByLocale

type RouteKey =
  | 'marketing'
  | 'dashboard'
  | 'apiKeys'
  | 'uploads'
  | 'usage'
  | 'memoryPolicy'
  | 'profile'
  | 'signIn'
  | 'signUp'

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
} as const
