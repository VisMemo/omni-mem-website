import { Avatar, Card, CardBody } from '@nextui-org/react'

export function TestimonialsSection() {
  return (
    <section id="stories" className="py-16">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
            Memory in the wild
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Teams ship calmer, smarter AI with Omni Memory
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">
            From real-time copilots to enterprise knowledge graphs, Omni Memory keeps every model in sync
            with the context that matters most.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
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
          <Avatar name={testimonial.name} className="bg-accent text-white" />
          <div>
            <p className="text-sm font-semibold text-ink">{testimonial.name}</p>
            <p className="text-xs text-muted">{testimonial.title}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

const testimonials: Testimonial[] = [
  {
    name: 'Mira Patel',
    title: 'Director of AI, Atlas Robotics',
    quote:
      'We replaced three internal services with Omni Memory. Our agent latency dropped by 38 percent and recall quality went up immediately.',
  },
  {
    name: 'Jordan Lee',
    title: 'VP Product, Northwind Health',
    quote:
      'Omni Memory gave us a single memory layer across voice and chat. Our nurses trust the assistant because it finally remembers context.',
  },
  {
    name: 'Aria Flores',
    title: 'Founder, Signalwave',
    quote:
      'The policy controls are the real win. We can gate memory by project, user, and sensitivity without custom infra.',
  },
]

interface Testimonial {
  name: string
  title: string
  quote: string
}

interface TestimonialCardProps {
  testimonial: Testimonial
}
