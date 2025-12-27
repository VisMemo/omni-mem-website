import { Button, Card, CardBody, CardHeader, Input } from '@nextui-org/react'

export function ProfilePage() {
  return (
    <Card className="glass-panel">
      <CardHeader className="flex flex-col items-start gap-2">
        <h3 className="text-lg font-semibold">Profile</h3>
        <p className="text-sm text-muted">Update your personal details.</p>
      </CardHeader>
      <CardBody className="space-y-4">
        <Input label="Display name" placeholder="Jane Doe" />
        <Input label="Email" placeholder="jane@example.com" type="email" />
        <Input label="Company" placeholder="Omni Memory" />
        <Button className="bg-accent text-white" radius="full">
          Save changes
        </Button>
      </CardBody>
    </Card>
  )
}
