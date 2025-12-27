import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { useState } from 'react'

export function UploadsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  return (
    <Card className="glass-panel">
      <CardHeader className="flex flex-col items-start gap-2">
        <h3 className="text-lg font-semibold">Uploads</h3>
        <p className="text-sm text-muted">Select a file to see its size before upload.</p>
      </CardHeader>
      <CardBody className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              setSelectedFile(file)
            }}
          />
          <Button
            className="bg-accent text-white"
            radius="full"
            isDisabled={!selectedFile}
          >
            Upload file (UI only)
          </Button>
          <div className="text-sm text-muted">
            {selectedFile ? `Size: ${formatBytes(selectedFile.size)}` : 'No file selected'}
          </div>
        </div>

        <Table removeWrapper aria-label="Uploads">
          <TableHeader>
            <TableColumn>File</TableColumn>
            <TableColumn>Status</TableColumn>
            <TableColumn>Scope</TableColumn>
            <TableColumn>Updated</TableColumn>
          </TableHeader>
          <TableBody>
            {getUploads().map((row) => (
              <TableRow key={row.file}>
                <TableCell>{row.file}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.scope}</TableCell>
                <TableCell>{row.updatedAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

function getUploads() {
  return [
    { file: 'meeting-notes.pdf', status: 'Done', scope: 'user', updatedAt: '2025-12-24 10:12' },
    { file: 'brainstorm.mp4', status: 'Processing', scope: 'apikey', updatedAt: '2025-12-24 09:45' },
    { file: 'spec.docx', status: 'Uploaded', scope: 'user', updatedAt: '2025-12-24 09:02' },
  ]
}
