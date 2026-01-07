import { Button } from '@nextui-org/react'
import { AuthControl } from './auth-control'

interface DashboardShellProps {
  title: string
  children: React.ReactNode
  currentPath: string
  links: DashboardLink[]
  onNavigate: (path: string) => void
  onSignIn: () => void
}

interface DashboardLink {
  label: string
  path: string
  group?: 'main' | 'account'
}

export function DashboardShell({
  title,
  children,
  currentPath,
  links,
  onNavigate,
  onSignIn,
}: DashboardShellProps) {
  const mainLinks = links.filter((link) => link.group !== 'account')
  const accountLinks = links.filter((link) => link.group === 'account')

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10 sm:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">个人空间</p>
          <p className="text-lg font-semibold text-ink">控制台</p>
        </div>
        <AuthControl onSignIn={onSignIn} className="justify-center" />
      </div>

      <div className="flex gap-6">
        <aside className="hidden w-60 flex-shrink-0 lg:block">
          <div className="glass-panel sticky top-6 space-y-4 rounded-3xl p-4">
            <div>
              <div className="px-2 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                功能导航
              </div>
              <div className="space-y-2">
                {mainLinks.map((link) => (
                  <Button
                    key={link.path}
                    fullWidth
                    radius="md"
                    variant={currentPath === link.path ? 'solid' : 'light'}
                    className={currentPath === link.path ? 'bg-accent text-white' : 'justify-start'}
                    onPress={() => onNavigate(link.path)}
                  >
                    {link.label}
                  </Button>
                ))}
              </div>
            </div>
            {accountLinks.length > 0 ? (
              <div>
                <div className="px-2 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  账户
                </div>
                <div className="space-y-2">
                  {accountLinks.map((link) => (
                    <Button
                      key={link.path}
                      fullWidth
                      radius="md"
                      variant={currentPath === link.path ? 'solid' : 'light'}
                      className={currentPath === link.path ? 'bg-accent text-white' : 'justify-start'}
                      onPress={() => onNavigate(link.path)}
                    >
                      {link.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <h1 className="sr-only">{title}</h1>
          {children}
        </section>
      </div>
    </div>
  )
}
