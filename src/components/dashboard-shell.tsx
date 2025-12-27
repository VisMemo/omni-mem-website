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
}

export function DashboardShell({
  title,
  children,
  currentPath,
  links,
  onNavigate,
  onSignIn,
}: DashboardShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl gap-6 px-6 pb-24 pt-10 sm:px-8">
      <aside className="hidden w-60 flex-shrink-0 lg:block">
        <div className="glass-panel sticky top-6 space-y-2 rounded-3xl p-4">
          <div className="px-2 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            User Management
          </div>
          {links.map((link) => (
            <Button
              key={link.path}
              fullWidth
              radius="lg"
              variant={currentPath === link.path ? 'solid' : 'light'}
              className={currentPath === link.path ? 'bg-accent text-white' : 'justify-start'}
              onPress={() => onNavigate(link.path)}
            >
              {link.label}
            </Button>
          ))}
          <div className="pt-4">
            <AuthControl onSignIn={onSignIn} className="w-full justify-center" />
          </div>
        </div>
      </aside>
      <section className="min-w-0 flex-1">
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Dashboard</p>
          <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
        </div>
        {children}
      </section>
    </div>
  )
}
