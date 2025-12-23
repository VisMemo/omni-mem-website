import { Accordion, AccordionItem, Card, CardBody } from '@nextui-org/react'

export function FaqSection() {
  return (
    <section id="faq" className="py-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Everything you need to know about Omni Memory
          </h2>
          <p className="mt-3 text-base text-muted sm:text-lg">
            Clear answers for product, security, and data governance. Need more detail? Our team will walk
            you through the architecture.
          </p>
        </div>
        <Card className="glass-panel">
          <CardBody>
            <Accordion selectionMode="multiple">
              {faqs.map((faq) => (
                <AccordionItem key={faq.title} aria-label={faq.title} title={faq.title}>
                  <p className="text-sm text-muted">{faq.description}</p>
                </AccordionItem>
              ))}
            </Accordion>
          </CardBody>
        </Card>
      </div>
    </section>
  )
}

const faqs: FaqItem[] = [
  {
    title: 'How does omni memory support multiple models?',
    description:
      'Omni Memory normalizes embeddings, metadata, and policies across providers. You can write once and retrieve across GPT, Claude, Gemini, or custom models.',
  },
  {
    title: 'What types of data can be stored?',
    description:
      'Text, audio transcripts, images with extracted captions, and structured events are all supported. Memory chunks are enriched with entity, intent, and timeline signals.',
  },
  {
    title: 'Can we control retention and access?',
    description:
      'Yes. Set TTLs, per-tenant scopes, and sensitivity labels. Retrieval respects your policy filters before ranking results.',
  },
  {
    title: 'How is latency kept low?',
    description:
      'We use multi-region recall caches, streaming updates, and hybrid vector plus symbolic retrieval to keep p95 recall under 500ms.',
  },
]

interface FaqItem {
  title: string
  description: string
}
