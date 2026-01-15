import { useMemo, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Input, Textarea } from '@nextui-org/react'
import { MessageSquare, X } from 'lucide-react'
import { useSupabaseSession } from '../hooks/use-supabase-session'
import { getApiEnv } from '../lib/env'

const FIELD_LIMITS = {
  title: 120,
  content: 2000,
}

export function UserFeedbackWidget() {
  const { session, refreshSession } = useSupabaseSession()
  const apiBaseUrl = useMemo(() => getApiEnv().apiBaseUrl, [])
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false
    if (!content.trim()) return false
    if (isSubmitting) return false
    return true
  }, [content, isSubmitting, title])

  if (!session) return null

  async function getActiveSession() {
    const refreshed = await refreshSession()
    return refreshed ?? session
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setMessage(null)

    try {
      const active = await getActiveSession()
      if (!active?.access_token) {
        setMessage('请先登录后再提交。')
        return
      }

      const response = await fetch(`${apiBaseUrl}/user-feedback`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${active.access_token}`,
          'Content-Type': 'application/json',
          'X-Principal-User-Id': active.user.id,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        const errorMessage = parseApiErrorMessage(errorText)
        setMessage(errorMessage || '提交失败，请稍后再试。')
        return
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '提交失败，请稍后再试。')
      return
    } finally {
      setIsSubmitting(false)
    }

    setTitle('')
    setContent('')
    setMessage('已收到你的反馈，感谢支持。')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen ? (
        <Card className="w-[320px] border border-ink/10 bg-white/95 shadow-xl">
          <CardHeader className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-ink">用户反馈</p>
              <p className="text-xs text-ink/50">告诉我们你的问题或建议</p>
            </div>
            <Button
              isIconOnly
              radius="full"
              variant="light"
              aria-label="关闭反馈"
              onPress={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardBody className="space-y-3">
            <Input
              label="标题"
              placeholder="请输入反馈标题"
              value={title}
              maxLength={FIELD_LIMITS.title}
              onValueChange={setTitle}
            />
            <Textarea
              label="内容"
              placeholder="请输入反馈内容"
              value={content}
              maxLength={FIELD_LIMITS.content}
              minRows={5}
              onValueChange={setContent}
            />
            {message ? <p className="text-xs text-ink/60">{message}</p> : null}
            <Button
              className="bg-deep-blue text-white hover:bg-teal"
              radius="full"
              isLoading={isSubmitting}
              isDisabled={!canSubmit}
              onPress={handleSubmit}
            >
              提交反馈
            </Button>
          </CardBody>
        </Card>
      ) : null}

      <Button
        isIconOnly
        radius="full"
        className="h-12 w-12 bg-deep-blue text-white shadow-lg hover:bg-teal"
        aria-label="打开用户反馈"
        onPress={() => setIsOpen((prev) => !prev)}
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
    </div>
  )
}

function parseApiErrorMessage(text: string) {
  if (!text) return ''
  try {
    const data = JSON.parse(text) as { message?: string }
    return data?.message ?? ''
  } catch {
    return text.slice(0, 200)
  }
}
