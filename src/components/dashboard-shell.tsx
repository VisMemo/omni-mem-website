import { useMemo, useState, type ReactNode } from 'react'
import { Bell, ChevronDown, Menu, X, type LucideIcon } from 'lucide-react'
import { useSupabaseSession } from '../hooks/use-supabase-session'
import { signOut } from '../lib/auth'

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
  onNavigate,
  onSignIn,
  onSignUp,
}: DashboardShellProps) {
  const { client, session, error } = useSupabaseSession()
  const [navOpen, setNavOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const sections = useMemo<NavSection[]>(() => {
    const mainLinks = links.filter((link) => link.group !== 'account')
    const accountLinks = links.filter((link) => link.group === 'account')
    return [
      { title: '功能导航', items: mainLinks },
      { title: '账户', items: accountLinks },
    ].filter((section) => section.items.length > 0)
  }, [links])

  async function handleSignOut() {
    if (!client || isSigningOut) return
    setIsSigningOut(true)
    setSignOutError(null)
    const result = await signOut({ client })
    if (!result.ok) {
      setSignOutError(result.error ?? '退出登录失败。')
    } else {
      setAccountOpen(false)
    }
    setIsSigningOut(false)
  }

  const accountLabel = session?.user?.email ?? '已登录'

  const mobileNav = navOpen ? (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={() => setNavOpen(false)}
      />
      <div className="absolute left-0 top-0 h-full w-72 bg-ivory p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">导航</div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 bg-white/80 text-ink/60"
            aria-label="关闭导航"
            onClick={() => setNavOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <NavSections
          sections={sections}
          currentPath={currentPath}
          onNavigate={(path) => {
            onNavigate(path)
            setNavOpen(false)
          }}
        />
      </div>
    </div>
  ) : null

  return (
    <div className="dashboard-shell min-h-screen bg-ivory text-ink">
      {mobileNav}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-ivory/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-white/80 text-ink/70 lg:hidden"
              onClick={() => setNavOpen(true)}
              aria-label="打开导航"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-ink/10 bg-white/80">
                <span className="absolute h-6 w-6 rounded-full bg-vermillion/70" />
                <span className="absolute h-4 w-4 rounded-full bg-gold/80" />
                <span className="relative text-xs font-semibold text-white">omni</span>
              </div>
              <div>
                <p className="text-sm font-semibold">Omni Memory 控制台</p>
                <p className="text-xs text-ink/60">个人空间</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-white/80 text-ink/70"
              aria-label="通知"
            >
              <Bell className="h-4 w-4" />
            </button>
            {error ? (
              <button
                type="button"
                className="rounded-full border border-ink/10 bg-white/80 px-3 py-2 text-xs text-ink/50"
                disabled
                title={error}
              >
                认证不可用
              </button>
            ) : session ? (
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-ink/10 bg-white/80 px-2 py-1 text-sm"
                  onClick={() => setAccountOpen((prev) => !prev)}
                >
                  <span className="h-7 w-7 rounded-full bg-ink/10" />
                  <span className="hidden text-sm font-medium sm:inline">{accountLabel}</span>
                  <ChevronDown className="h-4 w-4 text-ink/60" />
                </button>
                {accountOpen ? (
                  <div className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-ink/10 bg-white p-2 shadow-lg">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-ink/80 hover:bg-ink/5"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                    >
                      <span>{isSigningOut ? '退出中…' : '退出登录'}</span>
                    </button>
                    {signOutError ? (
                      <p className="px-3 pt-1 text-xs text-red-600">{signOutError}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full border border-ink/10 bg-white/80 px-3 py-2 text-xs font-semibold text-ink/70"
                  onClick={onSignIn}
                  disabled={!onSignIn}
                >
                  登录
                </button>
                <button
                  type="button"
                  className="rounded-full bg-ink px-3 py-2 text-xs font-semibold text-ivory"
                  onClick={onSignUp ?? onSignIn}
                  disabled={!onSignUp && !onSignIn}
                >
                  注册
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-6 py-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="rounded-xl border border-ink/10 bg-white/80 p-4">
            <NavSections sections={sections} currentPath={currentPath} onNavigate={onNavigate} />
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <h1 className="sr-only">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  )
}

function NavSections({
  sections,
  currentPath,
  onNavigate,
}: {
  sections: NavSection[]
  currentPath: string
  onNavigate: (path: string) => void
}) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title} className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
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
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-ink text-ivory shadow-sm'
                      : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
