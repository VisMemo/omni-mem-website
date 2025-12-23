import { Accordion, AccordionItem, Card, CardBody } from '@nextui-org/react'

export function FaqSection({ content }: FaqSectionProps) {
  return (
    <section id="faq" className="py-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            {content.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{content.title}</h2>
          <p className="mt-3 text-base text-muted sm:text-lg">{content.description}</p>
        </div>
        <Card className="glass-panel">
          <CardBody>
            <Accordion selectionMode="multiple">
              {content.items.map((faq) => (
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

export interface FaqSectionContent {
  eyebrow: string
  title: string
  description: string
  items: FaqItem[]
}

export interface FaqItem {
  title: string
  description: string
}

interface FaqSectionProps {
  content: FaqSectionContent
}
