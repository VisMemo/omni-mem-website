import { Card, CardBody, CardHeader, Select, SelectItem } from '@nextui-org/react'

export function MemoryPolicyPage() {
  return (
    <Card className="glass-panel">
      <CardHeader className="flex flex-col items-start gap-2">
        <h3 className="text-lg font-semibold">Memory Policy</h3>
        <p className="text-sm text-muted">Control default scope for memory isolation.</p>
      </CardHeader>
      <CardBody className="space-y-6">
        <Select label="Default scope" defaultSelectedKeys={['user']}>
          <SelectItem key="user">User</SelectItem>
          <SelectItem key="apikey">API Key</SelectItem>
        </Select>
        <div className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm text-muted">
          API key overrides will appear here once configured.
        </div>
      </CardBody>
    </Card>
  )
}
