import { useMemo, useState, type ReactNode } from 'react'
import { Bell, HelpCircle, LogOut, Menu, PanelLeft, X, type LucideIcon } from 'lucide-react'
import { useSupabaseSession } from '../hooks/use-supabase-session'
import { signOut } from '../lib/auth'
import { UserFeedbackWidget } from './user-feedback-widget'

export interface DashboardLink {
  label: string
  path: string
  group?: 'main' | 'account'
  icon?: LucideIcon
}

interface DashboardShellProps {
  title: string
  children: ReactNode
  currentPath: string
  links: DashboardLink[]
  locale?: 'en' | 'zh'
  onNavigate: (path: string) => void
  onSignIn: () => void
  onSignUp?: () => void
}

type NavSection = {
  title: string
  items: DashboardLink[]
}

export function DashboardShell({
  title,
  children,
  currentPath,
  links,
  locale = 'en',
  onNavigate,
  onSignIn,
  onSignUp,
}: DashboardShellProps) {
  const { client, session, error } = useSupabaseSession()
  const [navOpen, setNavOpen] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const labels = locale === 'zh' ? {
    featureNav: '功能导航',
    account: '账户',
    nav: '导航',
    closeNav: '关闭导航',
    openNav: '打开导航',
    loggedIn: '已登录',
    signingOut: '退出中…',
    signOut: '退出登录',
    signOutFailed: '退出登录失败。',
    signIn: '登录',
    signUp: '注册',
  } : {
    featureNav: 'Navigation',
    account: 'Account',
    nav: 'Navigation',
    closeNav: 'Close navigation',
    openNav: 'Open navigation',
    loggedIn: 'Logged in',
    signingOut: 'Signing out…',
    signOut: 'Sign out',
    signOutFailed: 'Sign out failed.',
    signIn: 'Sign in',
    signUp: 'Sign up',
  }

  const sections = useMemo<NavSection[]>(() => {
    const mainLinks = links.filter((link) => link.group !== 'account')
    const accountLinks = links.filter((link) => link.group === 'account')
    return [
      { title: labels.featureNav, items: mainLinks },
      { title: labels.account, items: accountLinks },
    ].filter((section) => section.items.length > 0)
  }, [links, labels.featureNav, labels.account])

  async function handleSignOut() {
    if (!client || isSigningOut) return
    setIsSigningOut(true)
    setSignOutError(null)
    const result = await signOut({ client })
    if (!result.ok) {
      setSignOutError(result.error ?? labels.signOutFailed)
    }
    setIsSigningOut(false)
  }

  const accountName = session?.user?.user_metadata?.name
  const accountLabel =
    accountName && String(accountName).trim()
      ? String(accountName)
      : session?.user?.email ?? labels.loggedIn

  const mobileNav = navOpen ? (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={() => setNavOpen(false)}
      />
      <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-ivory p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">{labels.nav}</div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 bg-white/80 text-ink/60"
            aria-label={labels.closeNav}
            onClick={() => setNavOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-2">
          <NavSections
            sections={sections}
            currentPath={currentPath}
            onNavigate={(path) => {
              onNavigate(path)
              setNavOpen(false)
            }}
          />
          <div className="mt-6 border-t border-ink/10 pt-4">
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
            {session ? (
              <div className="space-y-3">
                <p className="text-xs text-ink/60">{accountLabel}</p>
                <button
                  type="button"
                  className="w-full rounded-md bg-deep-blue px-3 py-2 text-xs font-semibold text-ivory hover:bg-teal transition-colors"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? labels.signingOut : labels.signOut}
                </button>
                {signOutError ? (
                  <p className="text-xs text-red-600">{signOutError}</p>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-md border border-ink/10 bg-white/80 px-3 py-2 text-xs font-semibold text-ink/70"
                  onClick={onSignIn}
                  disabled={!onSignIn}
                >
                  {labels.signIn}
                </button>
                <button
                  type="button"
                  className="rounded-md bg-teal px-3 py-2 text-xs font-semibold text-ivory hover:bg-seafoam transition-colors"
                  onClick={onSignUp ?? onSignIn}
                  disabled={!onSignUp && !onSignIn}
                >
                  {labels.signUp}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <div className="dashboard-shell min-h-screen bg-ivory text-ink">
      {mobileNav}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-ink/10 bg-white/80 text-ink/70 lg:hidden"
              onClick={() => setNavOpen(true)}
              aria-label={labels.openNav}
            >
              <Menu className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="hidden h-9 w-9 items-center justify-center rounded-md border border-ink/10 bg-white/80 text-ink/70 lg:flex"
              onClick={() => setIsCollapsed((prev) => !prev)}
              aria-label={labels.nav}
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src="/Logo/SVG/Logo-Graphic-OmniMemory.svg"
                alt=""
                width={28}
                height={28}
              />
              <span className="text-sm font-semibold tracking-[0.08em]">OmniMemory</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden h-9 w-9 items-center justify-center rounded-md border border-ink/10 bg-white/80 text-ink/70 hover:bg-ink/5 sm:flex"
              aria-label="通知"
            >
              <Bell className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="hidden h-9 w-9 items-center justify-center rounded-md border border-ink/10 bg-white/80 text-ink/70 hover:bg-ink/5 sm:flex"
              aria-label="帮助"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            {session ? (
              <div className="flex items-center gap-3">
                <div className="hidden flex-col items-end text-xs text-ink/60 sm:flex">
                  <span className="font-semibold text-ink">{accountLabel}</span>
                  {session?.user?.email ? <span>{session.user.email}</span> : null}
                </div>
                <button
                  type="button"
                  className="flex h-9 items-center gap-2 rounded-md bg-deep-blue px-3 text-xs font-semibold text-ivory hover:bg-teal transition-colors"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {isSigningOut ? labels.signingOut : labels.signOut}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md border border-ink/10 bg-white/80 px-3 py-2 text-xs font-semibold text-ink/70 hover:border-teal hover:text-teal transition-colors"
                  onClick={onSignIn}
                  disabled={!onSignIn}
                >
                  {labels.signIn}
                </button>
                <button
                  type="button"
                  className="rounded-md bg-teal px-3 py-2 text-xs font-semibold text-ivory hover:bg-seafoam transition-colors"
                  onClick={onSignUp ?? onSignIn}
                  disabled={!onSignUp && !onSignIn}
                >
                  {labels.signUp}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1360px] gap-6 px-4 py-6">
        <aside
          className={`dashboard-sidebar shrink-0 ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="rounded-xl bg-white/70 p-4">
            <NavSections
              sections={sections}
              currentPath={currentPath}
              onNavigate={onNavigate}
              collapsed={isCollapsed}
            />
            {error ? <p className="mt-4 text-xs text-red-600">{error}</p> : null}
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <h1 className="sr-only">{title}</h1>
          {children}
        </main>
      </div>
      {signOutError ? (
        <div className="mx-auto w-full max-w-[1360px] px-4 pb-4">
          <p className="text-xs text-red-600">{signOutError}</p>
        </div>
      ) : null}
      <UserFeedbackWidget />
    </div>
  )
}

function NavSections({
  sections,
  currentPath,
  onNavigate,
  collapsed = false,
}: {
  sections: NavSection[]
  currentPath: string
  onNavigate: (path: string) => void
  collapsed?: boolean
}) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title} className="space-y-2">
          <p
            className={`text-xs font-semibold uppercase tracking-[0.2em] text-ink/50 ${
              collapsed ? 'sr-only' : ''
            }`}
          >
            {section.title}
          </p>
          <div className="space-y-1">
            {section.items.map((item) => {
              const isActive = currentPath === item.path
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`flex w-full items-center ${
                    collapsed ? 'justify-center' : 'gap-2'
                  } rounded-md px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-deep-blue text-ivory shadow-sm'
                      : 'text-ink/70 hover:bg-teal/10 hover:text-teal'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  <span className={collapsed ? 'sr-only' : ''}>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
