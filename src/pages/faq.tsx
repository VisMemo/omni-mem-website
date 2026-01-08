import { useState } from 'react'

interface FaqPageProps {
  locale: 'en' | 'zh'
}

export function FaqPage({ locale }: FaqPageProps) {
  const content = locale === 'en' ? contentEN : contentZH
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="faq-page">
      <div className="faq-page-header">
        <div className="container-v2">
          <p className="module-eyebrow">{content.eyebrow}</p>
          <h1 className="faq-page-title">{content.title}</h1>
          <p className="faq-page-description">{content.description}</p>
        </div>
      </div>

      <div className="faq-page-content">
        <div className="container-v2">
          <div className="faq-grid">
            {content.items.map((item, i) => (
              <div key={i} className={`faq-item ${openIndex === i ? 'open' : ''}`}>
                <button className="faq-trigger" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                  <span>{item.question}</span>
                  <span className="faq-icon">{openIndex === i ? '−' : '+'}</span>
                </button>
                {openIndex === i && (
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const contentEN = {
  eyebrow: 'FAQ',
  title: 'Frequently Asked Questions',
  description: 'Everything you need to know about Omni Memory.',
  items: [
    { question: 'What AI models are supported?', answer: 'We normalize across providers. Write once, retrieve across GPT, Claude, Gemini, or custom models.' },
    { question: 'What data types can be stored?', answer: 'Text, audio transcripts, images with context, and structured events. All enriched with entity and intent signals.' },
    { question: 'How do you handle privacy?', answer: 'Automated PII detection, configurable retention, consent tracking, and right-to-forget workflows. SOC 2 Type II certified.' },
    { question: "What's the retrieval latency?", answer: 'P95 recall under 700ms globally with multi-region caching and hybrid retrieval.' },
    { question: 'Can I self-host Omni Memory?', answer: 'Yes. Enterprise plans include self-hosted deployment options with Qdrant + Neo4j. Your data never leaves your servers.' },
    { question: 'How does memory decay work?', answer: 'We use configurable decay curves to score memories by recency and relevance. Older memories naturally fade unless reinforced by access patterns.' },
    { question: 'What languages are supported?', answer: 'Full support for English and Chinese. Additional languages supported through our multi-lingual embedding models.' },
    { question: 'How do I get started?', answer: 'Sign up for a free account, get your API key, and integrate with three lines of code. Check our documentation for quickstart guides.' },
  ],
}

const contentZH = {
  eyebrow: '常见问题',
  title: '常见问题解答',
  description: '关于 Omni Memory 的常见疑问。',
  items: [
    { question: '支持哪些 AI 模型？', answer: '我们对不同模型提供统一接口，支持 GPT、Claude、Gemini 等。' },
    { question: '可存储哪些数据类型？', answer: '文本、音频转写、带上下文的图像与结构化事件。' },
    { question: '如何处理隐私？', answer: 'PII 检测、保留期配置、同意追踪与删除流程。SOC 2 Type II 认证。' },
    { question: '检索延迟是多少？', answer: 'P95 召回低于 700ms，支持多区域缓存。' },
    { question: '可以自托管吗？', answer: '可以。企业版支持 Qdrant + Neo4j 自托管部署，数据不出域。' },
    { question: '记忆衰减如何工作？', answer: '使用可配置的衰减曲线根据新鲜度和相关性评分。旧记忆会自然淡化，除非被访问模式强化。' },
    { question: '支持哪些语言？', answer: '全面支持中英文。其他语言通过多语言嵌入模型支持。' },
    { question: '如何开始使用？', answer: '注册免费账号，获取 API Key，三行代码即可集成。查看文档获取快速入门指南。' },
  ],
}
