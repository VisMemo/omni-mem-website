import React, { Suspense } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Tab,
  Tabs,
} from '@nextui-org/react'

const TestimonialsSection = React.lazy(() =>
  import('./components/testimonial-section').then((module) => ({
    default: module.TestimonialsSection,
  }))
)
const FaqSection = React.lazy(() =>
  import('./components/faq-section').then((module) => ({
    default: module.FaqSection,
  }))
)

export function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-paper text-ink">
      <BackgroundOrbs />
      <header>
        <Navbar className="bg-transparent" maxWidth="xl" isBordered={false}>
          <NavbarBrand className="gap-3">
            <LogoMark />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">
                omni memory
              </span>
              <span className="text-xs text-muted">multi-model memory service</span>
            </div>
          </NavbarBrand>
          <NavbarContent className="hidden gap-6 md:flex" justify="center">
            {navLinks.map((link) => (
              <NavbarItem key={link.label}>
                <a className="text-sm font-medium text-ink/80 hover:text-ink" href={link.href}>
                  {link.label}
                </a>
              </NavbarItem>
            ))}
          </NavbarContent>
          <NavbarContent justify="end">
            <NavbarItem>
              <Button
                as="a"
                href="#pricing"
                className="bg-accent text-white shadow-glow"
                radius="full"
              >
                Start building
              </Button>
            </NavbarItem>
          </NavbarContent>
        </Navbar>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10 sm:px-8">
        <HeroSection />
        <LogoCloud />
        <FeatureGrid />
        <ModelTabs />
        <StepsSection />
        <UseCases />
        <DeveloperSection />
        <SecuritySection />
        <Suspense fallback={<SectionFallback label="Loading stories" />}>
          <TestimonialsSection />
        </Suspense>
        <Suspense fallback={<SectionFallback label="Loading answers" />}>
          <FaqSection />
        </Suspense>
        <PlansSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  )
}

function BackgroundOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="hero-surface absolute inset-0" />
      <div className="grid-overlay absolute inset-0" />
      <div className="absolute -top-24 left-0 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(15,139,118,0.25),transparent_70%)] blur-2xl" />
      <div className="absolute right-[-120px] top-32 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(243,106,61,0.28),transparent_70%)] blur-2xl" />
    </div>
  )
}

function HeroSection() {
  return (
    <section id="product" className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3 animate-rise" style={{ animationDelay: '60ms' }}>
          <Chip className="bg-white/80 text-xs font-semibold uppercase tracking-[0.25em] text-ink">
            New release
          </Chip>
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
            Multi-model memory routing
          </span>
        </div>
        <div className="space-y-4 animate-rise" style={{ animationDelay: '140ms' }}>
          <h1 className="text-4xl font-semibold sm:text-5xl lg:text-6xl">
            Omni Memory powers calm, grounded AI with perfect recall.
          </h1>
          <p className="max-w-xl text-base text-muted sm:text-lg">
            A unified memory layer for text, audio, images, and events. Capture every signal, enforce
            policy-aware access, and retrieve the right context in under 500ms.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 animate-rise" style={{ animationDelay: '220ms' }}>
          <Button as="a" href="#pricing" className="bg-accent text-white shadow-glow" radius="full">
            Start building
          </Button>
          <Button
            as="a"
            href="mailto:hello@omnimemory.ai"
            className="border border-ink/20 text-ink"
            radius="full"
            variant="bordered"
          >
            Book a demo
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 animate-rise" style={{ animationDelay: '300ms' }}>
          {heroStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-ink/10 bg-white/70 px-4 py-3">
              <p className="text-2xl font-semibold text-ink">{stat.value}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="animate-rise" style={{ animationDelay: '180ms' }}>
        <MemoryPanel />
      </div>
    </section>
  )
}

function MemoryPanel() {
  return (
    <Card className="memory-card animate-float">
      <CardHeader className="flex flex-col items-start gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Live memory stream</p>
        <h3 className="text-2xl font-semibold">Omni Memory Cloud</h3>
      </CardHeader>
      <CardBody className="gap-5">
        <div className="space-y-3">
          {memorySignals.map((signal) => (
            <MemorySignal key={signal.label} signal={signal} />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {memoryMetrics.map((metric) => (
            <div key={metric.label} className="rounded-xl border border-ink/10 bg-white px-3 py-3">
              <p className="text-lg font-semibold text-ink">{metric.value}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">{metric.label}</p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

function MemorySignal({ signal }: MemorySignalProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3">
      <span className="mt-2 h-2 w-2 rounded-full bg-accent" />
      <div>
        <p className="text-sm font-semibold text-ink">{signal.label}</p>
        <p className="text-xs text-muted">{signal.description}</p>
      </div>
    </div>
  )
}

function LogoCloud() {
  return (
    <section className="py-12">
      <div className="flex flex-col gap-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          Trusted by memory-first teams
        </p>
        <div className="flex flex-wrap gap-4">
          {logos.map((logo) => (
            <span
              key={logo}
              className="rounded-full border border-ink/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureGrid() {
  return (
    <section id="features" className="py-12">
      <div className="grid gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">Memory platform</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            A memory fabric designed for multi-model AI
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">
            Omni Memory orchestrates storage, enrichment, and retrieval so your agents can learn from
            every interaction without drowning in data.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="glass-panel">
              <CardHeader className="flex flex-col items-start gap-3">
                <Chip className="bg-accent/10 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  {feature.pill}
                </Chip>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </CardHeader>
              <CardBody className="text-sm text-muted sm:text-base">{feature.description}</CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function ModelTabs() {
  return (
    <section id="modalities" className="py-12">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">Modalities</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Every input becomes memory, not noise
          </h2>
          <p className="mt-3 text-base text-muted sm:text-lg">
            Normalize multi-modal data into a single timeline. Every write is enriched with intent,
            entity, and urgency signals.
          </p>
        </div>
        <Card className="glass-panel">
          <CardBody>
            <Tabs aria-label="Memory modalities" variant="light" className="w-full">
              {modalities.map((modality) => (
                <Tab key={modality.title} title={modality.title}>
                  <div className="space-y-3 pt-4">
                    <p className="text-sm text-muted sm:text-base">{modality.description}</p>
                    <ul className="space-y-2 text-sm text-ink">
                      {modality.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Tab>
              ))}
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </section>
  )
}

function StepsSection() {
  return (
    <section id="how-it-works" className="py-12">
      <div className="grid gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            From ingestion to recall in three steps
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.title} className="glass-panel">
              <CardHeader className="flex flex-col items-start gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  {step.step}
                </span>
                <h3 className="text-xl font-semibold">{step.title}</h3>
              </CardHeader>
              <CardBody className="text-sm text-muted sm:text-base">{step.description}</CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function UseCases() {
  return (
    <section id="use-cases" className="py-12">
      <div className="grid gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">Use cases</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Built for teams shipping memory-first experiences
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {useCases.map((useCase) => (
            <Card key={useCase.title} className="glass-panel">
              <CardHeader className="flex flex-col items-start gap-3">
                <h3 className="text-xl font-semibold">{useCase.title}</h3>
                <p className="text-sm text-muted">{useCase.description}</p>
              </CardHeader>
              <CardBody>
                <ul className="space-y-2 text-sm text-ink">
                  {useCase.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent2" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function DeveloperSection() {
  return (
    <section id="developers" className="py-12">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">Developers</p>
          <h2 className="text-3xl font-semibold sm:text-4xl">Memory in minutes, not quarters</h2>
          <p className="text-base text-muted sm:text-lg">
            Drop in the Omni Memory SDK and start writing memories with structured metadata. Query
            with filters, decay curves, and safety rails in one call.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button as="a" href="#pricing" className="bg-accent text-white" radius="full">
              View SDKs
            </Button>
            <Button as="a" href="mailto:hello@omnimemory.ai" variant="bordered" radius="full">
              Talk to engineering
            </Button>
          </div>
        </div>
        <Card className="code-surface">
          <CardBody>
            <pre className="overflow-x-auto text-sm text-ink">
              <code>{codeSample}</code>
            </pre>
          </CardBody>
        </Card>
      </div>
    </section>
  )
}

function SecuritySection() {
  return (
    <section id="security" className="py-12">
      <div className="grid gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">Security</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Governance, privacy, and control in every recall
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {securityItems.map((item) => (
            <Card key={item.title} className="glass-panel">
              <CardHeader className="flex flex-col items-start gap-2">
                <h3 className="text-lg font-semibold">{item.title}</h3>
              </CardHeader>
              <CardBody className="text-sm text-muted sm:text-base">{item.description}</CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function PlansSection() {
  return (
    <section id="pricing" className="py-12">
      <div className="grid gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Plans that scale with your memory</h2>
          <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">
            Start free, then upgrade as your memory footprint grows. Usage-based pricing keeps costs
            predictable as you scale.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.title} className="glass-panel h-full">
              <CardHeader className="flex flex-col items-start gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                  {plan.badge}
                </p>
                <h3 className="text-xl font-semibold">{plan.title}</h3>
                <p className="text-3xl font-semibold text-ink">{plan.price}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">{plan.caption}</p>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                <ul className="space-y-2 text-sm text-ink">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  as="a"
                  href="mailto:hello@omnimemory.ai"
                  className="mt-auto bg-accent text-white"
                  radius="full"
                >
                  {plan.cta}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-16">
      <Card className="glass-panel">
        <CardBody className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent">Ready</p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Give every model the memory it deserves
            </h2>
            <p className="text-base text-muted sm:text-lg">
              Launch faster, ground agents in real context, and make your AI experiences feel human.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Button as="a" href="mailto:hello@omnimemory.ai" className="bg-accent text-white" radius="full">
              Start a pilot
            </Button>
            <Button as="a" href="#developers" variant="bordered" radius="full">
              Explore docs
            </Button>
          </div>
        </CardBody>
      </Card>
    </section>
  )
}

function SectionFallback({ label }: SectionFallbackProps) {
  return (
    <div className="my-12 rounded-3xl border border-ink/10 bg-white/70 px-6 py-8 text-sm text-muted">
      {label}
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-white/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <p className="text-sm font-semibold">omni memory</p>
            <p className="text-xs text-muted">Memory infrastructure for every model</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.2em] text-muted">
          <a href="#product" className="hover:text-ink">Product</a>
          <a href="#developers" className="hover:text-ink">Developers</a>
          <a href="#security" className="hover:text-ink">Security</a>
          <a href="#faq" className="hover:text-ink">FAQ</a>
        </div>
      </div>
    </footer>
  )
}

function LogoMark() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-ink/10 bg-white/80">
      <span className="absolute h-6 w-6 rounded-full bg-accent/70" />
      <span className="absolute h-4 w-4 rounded-full bg-accent2/80" />
      <span className="relative text-xs font-semibold text-white">omni</span>
    </div>
  )
}

const navLinks: NavLink[] = [
  { label: 'Product', href: '#product' },
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Developers', href: '#developers' },
  { label: 'Security', href: '#security' },
  { label: 'Pricing', href: '#pricing' },
]

const heroStats: StatItem[] = [
  { value: '15B', label: 'memories indexed' },
  { value: '500ms', label: 'p95 recall' },
  { value: '99.99%', label: 'uptime SLA' },
]

const memorySignals: MemorySignalItem[] = [
  {
    label: 'Meeting transcript',
    description: 'Auto-tagged with intent, owners, and next steps.',
  },
  {
    label: 'Product screenshot',
    description: 'Visual context stored with semantic overlays.',
  },
  {
    label: 'Customer escalation',
    description: 'Urgency scores trigger prioritized recall.',
  },
]

const memoryMetrics: StatItem[] = [
  { value: '4.2M', label: 'daily writes' },
  { value: '63%', label: 'higher CSAT' },
  { value: '3.4x', label: 'longer sessions' },
  { value: '2.1x', label: 'faster onboarding' },
]

const logos: string[] = [
  'Atlas Robotics',
  'Northwind',
  'Signalwave',
  'Aurora Labs',
  'Harbor AI',
  'Mosaic Health',
]

const features: FeatureItem[] = [
  {
    pill: 'Recall engine',
    title: 'Context that stays fresh',
    description:
      'Hybrid vector and symbolic retrieval keeps the right memories at the surface, with decay curves and freshness scoring.',
  },
  {
    pill: 'Policy-aware',
    title: 'Fine-grained governance',
    description:
      'Scope by tenant, role, and sensitivity labels. Every memory is filtered before it reaches the model.',
  },
  {
    pill: 'Knowledge graph',
    title: 'Memory relationships at scale',
    description:
      'Entity graphs connect people, projects, and intents so recall spans conversations, docs, and files.',
  },
  {
    pill: 'Observability',
    title: 'Measure recall quality',
    description:
      'Inspect how memories influenced output, tune ranking with feedback loops, and audit usage.',
  },
]

const modalities: ModalityItem[] = [
  {
    title: 'Text',
    description: 'Streams from chat, docs, and notes are summarized and stored in long-term memory.',
    bullets: ['Entity extraction', 'Intent tagging', 'Automatic summarization'],
  },
  {
    title: 'Audio',
    description: 'Voice memory layers preserve tone and decisions for support, sales, and care teams.',
    bullets: ['Speaker diarization', 'Highlights and action items', 'Sentiment signals'],
  },
  {
    title: 'Images',
    description: 'Screenshots and diagrams become searchable context with rich annotations.',
    bullets: ['Visual captioning', 'Object and layout cues', 'Versioned snapshots'],
  },
  {
    title: 'Events',
    description: 'Product usage and telemetry are rolled into memory for personalized experiences.',
    bullets: ['Session timelines', 'Behavioral triggers', 'Retention scoring'],
  },
]

const steps: StepItem[] = [
  {
    step: 'Step 01',
    title: 'Ingest anything',
    description: 'Stream conversations, files, events, and embeddings into Omni Memory in real time.',
  },
  {
    step: 'Step 02',
    title: 'Enrich and score',
    description: 'We classify, dedupe, and apply decay to keep recall fresh and relevant.',
  },
  {
    step: 'Step 03',
    title: 'Retrieve with policy',
    description: 'Query by user, intent, and time horizon to deliver the right context instantly.',
  },
]

const useCases: UseCaseItem[] = [
  {
    title: 'Agentic copilots',
    description: 'Give agents continuity across sessions and channels.',
    bullets: ['Long-lived memory', 'Cross-tool grounding', 'Persona consistency'],
  },
  {
    title: 'Customer support',
    description: 'Resolve issues faster with a shared memory graph across teams.',
    bullets: ['Account timelines', 'Policy-safe recall', 'Fewer escalations'],
  },
  {
    title: 'Enterprise knowledge',
    description: 'Connect knowledge sources into one memory layer.',
    bullets: ['Doc + chat fusion', 'Role-aware access', 'Adaptive summarization'],
  },
  {
    title: 'Personalization',
    description: 'Remember preferences without storing raw PII.',
    bullets: ['Preference embeddings', 'Privacy controls', 'Predictive insights'],
  },
]

const securityItems: SecurityItem[] = [
  {
    title: 'SOC 2 Type II ready',
    description: 'Enterprise controls, audit trails, and encryption at rest and in transit.',
  },
  {
    title: 'Data residency controls',
    description: 'Pin memory storage to your region with configurable retention windows.',
  },
  {
    title: 'Consent and redaction',
    description: 'Automated PII redaction and consent metadata per memory record.',
  },
]

const plans: PlanItem[] = [
  {
    badge: 'Starter',
    title: 'Build',
    price: 'Free',
    caption: 'Up to 2M memories',
    cta: 'Create account',
    features: ['Multi-model memory API', 'Community support', 'Basic analytics'],
  },
  {
    badge: 'Growth',
    title: 'Scale',
    price: '$499 / mo',
    caption: 'Up to 50M memories',
    cta: 'Talk to sales',
    features: ['Policy filters', 'Priority recall caches', 'Advanced observability'],
  },
  {
    badge: 'Enterprise',
    title: 'Govern',
    price: 'Custom',
    caption: 'Unlimited memories',
    cta: 'Schedule workshop',
    features: ['Dedicated VPC', 'Data residency', 'Custom SLAs'],
  },
]

const codeSample = `import { OmniMemory } from '@omni/memory'

const memory = new OmniMemory({
  apiKey: process.env.OMNI_MEMORY_KEY,
})

await memory.write({
  userId: 'user_1287',
  modality: 'audio',
  content: transcript,
  metadata: {
    account: 'northwind',
    sentiment: 'positive',
  },
})

const recall = await memory.search({
  userId: 'user_1287',
  query: 'renewal concerns',
  limit: 6,
})
`

interface NavLink {
  label: string
  href: string
}

interface StatItem {
  value: string
  label: string
}

interface MemorySignalItem {
  label: string
  description: string
}

interface MemorySignalProps {
  signal: MemorySignalItem
}

interface FeatureItem {
  pill: string
  title: string
  description: string
}

interface ModalityItem {
  title: string
  description: string
  bullets: string[]
}

interface StepItem {
  step: string
  title: string
  description: string
}

interface UseCaseItem {
  title: string
  description: string
  bullets: string[]
}

interface SecurityItem {
  title: string
  description: string
}

interface PlanItem {
  badge: string
  title: string
  price: string
  caption: string
  cta: string
  features: string[]
}

interface SectionFallbackProps {
  label: string
}
