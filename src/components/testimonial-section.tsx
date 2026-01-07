import { Avatar, Card, CardBody } from '@nextui-org/react'

export function TestimonialsSection({ content }: TestimonialsSectionProps) {
  return (
    <section id="stories" className="py-16">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            {content.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{content.title}</h2>
          <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">{content.description}</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {content.items.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card className="glass-panel h-full">
      <CardBody className="flex h-full flex-col gap-6">
        <p className="text-base leading-relaxed text-ink">"{testimonial.quote}"</p>
        <div className="mt-auto flex items-center gap-3">
          <Avatar name={testimonial.name} className="bg-vermillion text-white" />
          <div>
            <p className="text-sm font-semibold text-ink">{testimonial.name}</p>
            <p className="text-xs text-muted">{testimonial.title}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export interface TestimonialsSectionContent {
  eyebrow: string
  title: string
  description: string
  items: Testimonial[]
}

export interface Testimonial {
  name: string
  title: string
  quote: string
}

interface TestimonialsSectionProps {
  content: TestimonialsSectionContent
}

interface TestimonialCardProps {
  testimonial: Testimonial
}
