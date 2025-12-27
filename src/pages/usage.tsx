import { Card, CardBody, CardHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@nextui-org/react'

export function UsagePage() {
  const rows = getUsageRows()

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="glass-panel">
        <CardHeader className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold">Usage Summary</h3>
          <p className="text-sm text-muted">Monthly usage grouped by account.</p>
        </CardHeader>
        <CardBody>
          <Table removeWrapper aria-label="Usage summary">
            <TableHeader>
              <TableColumn>Account</TableColumn>
              <TableColumn>Processed</TableColumn>
              <TableColumn>Storage</TableColumn>
              <TableColumn>Cost</TableColumn>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.account}>
                  <TableCell>{row.account}</TableCell>
                  <TableCell>{row.processed}</TableCell>
                  <TableCell>{row.storage}</TableCell>
                  <TableCell>{row.cost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Card className="glass-panel">
        <CardHeader className="flex flex-col items-start gap-2">
          <h3 className="text-lg font-semibold">Highlights</h3>
          <p className="text-sm text-muted">Quick stats for the current period.</p>
        </CardHeader>
        <CardBody className="space-y-4">
          <MetricRow label="Uploads processed" value="1,248" />
          <MetricRow label="Avg processing time" value="2.4s" />
          <MetricRow label="Active API keys" value="5" />
          <MetricRow label="Projected spend" value="$182" />
        </CardBody>
      </Card>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/70 px-4 py-3">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
    </div>
  )
}

function getUsageRows() {
  return [
    { account: 'Primary workspace', processed: '1,024', storage: '12.4 GB', cost: '$120' },
    { account: 'Research team', processed: '224', storage: '3.1 GB', cost: '$62' },
  ]
}
