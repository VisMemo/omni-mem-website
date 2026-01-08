// ============ CONTENT BACKUP ============
// This file contains all bilingual content from the original landing page
// Use this as reference when rebuilding the page

export const CODE_SAMPLE_PYTHON = `from omem import Memory

mem = Memory(api_key="qbk_xxx")  # That's it!

# Save a conversation
mem.add("conv-001", [
    {"role": "user", "content": "Meeting with Caroline tomorrow"},
    {"role": "assistant", "content": "Got it, I will remember"},
])

# Search memories
result = mem.search("When is my meeting?")
if result:
    print(result.to_prompt())`

export const CODE_SAMPLE_JS = `import { Memory } from 'omem'

const mem = new Memory({ apiKey: 'qbk_xxx' })

// Save a conversation
await mem.add('conv-001', [
  { role: 'user', content: 'Meeting with Caroline tomorrow' },
  { role: 'assistant', content: 'Got it, I will remember' },
])

// Search memories
const result = await mem.search('When is my meeting?')
if (result) {
  console.log(result.toPrompt())
}`

export const CODE_SAMPLE_REST = `# Save a conversation
curl -X POST "https://api.omnimemory.ai/v1/memory/ingest" \\
  -H "x-api-key: qbk_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{"session_id": "conv-001", "turns": [...]}'

# Search memories
curl -X POST "https://api.omnimemory.ai/v1/memory/retrieval" \\
  -H "x-api-key: qbk_xxx" \\
  -d '{"query": "When is my meeting?", "topk": 10}'`

export const contentEN = {
  navbar: {
    brandName: 'Omni Memory',
    navLinks: [
      {
        label: 'Developers',
        dropdown: [
          { label: 'Documentation', href: '/docs', icon: '📚' },
          { label: 'API Reference', href: '/docs/api', icon: 'API' },
          { label: 'Support', href: '/support', icon: '💬' },
          { label: 'Discord', href: 'https://discord.gg/omnimemory', icon: '🎮' },
        ]
      },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Enterprise', href: '#enterprise' },
      { label: 'Research', href: '/research' },
      { label: 'Join Us', href: '/careers' },
    ],
    ctaLabel: 'Get Started',
    toggleLabel: '中文',
  },
  hero: {
    badge: 'Now in Beta',
    titleLine1: 'Agents Live in Moments.',
    titleLine2: 'We Give Them Experience',
    description: 'Omni Memory is a multimodal memory system that enables AI to understand people beyond prompts, powering deeply personalized AI that evolves with human context over time.',
    primaryCta: 'Start Building',
    secondaryCta: 'View Documentation',
  },
  stats: {
    items: [
      { value: '#1', label: 'LoCoMo Benchmark' },
      { value: '77.8%', label: 'J-Score Accuracy' },
      { value: '<1s', label: 'Retrieval Latency' },
    ],
  },
  features: {
    eyebrow: 'For Enterprise',
    title: 'Production-ready memory infrastructure',
    description: 'Deploy with confidence. Full control over your data and infrastructure.',
    items: [
      { icon: '🔐', tag: 'Privacy', title: 'Self-Hosted Database', description: 'Deploy on your infrastructure with Qdrant + Neo4j. Your data never leaves your servers. Full data sovereignty.' },
      { icon: '🚀', tag: 'Deploy', title: 'One-Command Setup', description: 'Docker Compose deployment in minutes. Kubernetes-ready. No complex configuration required.' },
      { icon: '🤝', tag: 'Support', title: 'Dedicated Team', description: 'SLA-backed enterprise support. Direct access to engineering team. Custom integration assistance.' },
      { icon: '📊', tag: 'Console', title: 'API Dashboard', description: 'Monitor usage, manage API keys, configure memory policies. Full observability into your memory layer.' },
    ],
  },
  howItWorks: {
    eyebrow: 'Process',
    title: 'From ingestion to recall',
    description: 'A simple three-step process to give your AI persistent memory.',
    steps: [
      { title: 'Ingest', description: 'Stream conversations, files, and events into Omni Memory via our simple API.' },
      { title: 'Enrich', description: 'We classify, dedupe, and score memories with decay curves to keep recall fresh.' },
      { title: 'Retrieve', description: 'Query by user, intent, and time horizon. Get policy-filtered context in milliseconds.' },
    ],
  },
  developers: {
    eyebrow: 'For Developers',
    title: 'Deploy with Python / JavaScript / REST',
    description: 'Three lines of code to give your AI persistent memory. Initialize, store conversations, search with graph-enhanced retrieval.',
    primaryCta: 'Read Docs',
    secondaryCta: 'Talk to Us',
    codeTabs: [
      { label: 'Python', code: CODE_SAMPLE_PYTHON },
      { label: 'JavaScript', code: CODE_SAMPLE_JS },
      { label: 'REST', code: CODE_SAMPLE_REST },
    ],
  },
  testimonials: {
    eyebrow: 'Testimonials',
    title: 'Teams building with Omni Memory',
    items: [
      { name: 'Sarah Chen', title: 'Head of AI, Aurora Labs', quote: 'We replaced three internal services with Omni Memory. Agent latency dropped 40% immediately—it just works.' },
      { name: 'Marcus Williams', title: 'VP Product, Northwind', quote: 'Our clinical assistants finally remember patient context across sessions. Game changer for healthcare AI.' },
      { name: 'Elena Rodriguez', title: 'Founder, Signalwave', quote: 'The policy controls let us scope memory by project without building custom infrastructure. Shipped in a week.' },
    ],
  },
  partners: {
    label: 'Trusted by leading research institutions and enterprises',
    partners: [
      { name: 'Tsinghua University', nameCn: '清华大学' },
      { name: 'Peking University', nameCn: '北京大学' },
      { name: 'Zhejiang University', nameCn: '浙江大学' },
      { name: 'NUS' },
      { name: 'VU Amsterdam' },
    ],
  },
  pricing: {
    eyebrow: 'Pricing',
    title: 'Plans that scale with you',
    description: 'Start free, upgrade as you grow. Predictable, usage-based pricing.',
    plans: [
      { badge: 'Starter', name: 'Build', price: 'Free', period: 'forever', cta: 'Start Free', features: ['2M memories', 'Multi-modal API', 'Community support'] },
      { badge: 'Enterprise', name: 'Govern', price: 'Custom', period: '', cta: 'Contact Us', features: ['Unlimited memories', 'Dedicated VPC', 'Custom SLAs', 'Dedicated support'] },
    ],
  },
  faq: {
    eyebrow: 'FAQ',
    title: 'Common questions',
    description: 'Everything you need to know about Omni Memory.',
    items: [
      { question: 'What AI models are supported?', answer: 'We normalize across providers. Write once, retrieve across GPT, Claude, Gemini, or custom models.' },
      { question: 'What data types can be stored?', answer: 'Text, audio transcripts, images with context, and structured events. All enriched with entity and intent signals.' },
      { question: 'How do you handle privacy?', answer: 'Automated PII detection, configurable retention, consent tracking, and right-to-forget workflows. SOC 2 Type II certified.' },
      { question: "What's the retrieval latency?", answer: 'P95 recall under 700ms globally with multi-region caching and hybrid retrieval.' },
    ],
  },
  cta: {
    title: 'Give your AI the memory it deserves',
    description: 'Start building with persistent, contextual memory. Free tier available.',
    primaryCta: 'Start Building',
    secondaryCta: 'View Documentation',
  },
  footer: {
    brandName: 'Omni Memory',
    tagline: 'The memory layer for intelligent AI applications.',
    links: [
      { label: 'How it Works', href: '#how-it-works' },
      { label: 'Enterprise', href: '#enterprise' },
      { label: 'Documentation', href: '/docs' },
      { label: 'Pricing', href: '#pricing' },
    ],
    copyright: '© 2025 Omni Memory. All rights reserved.',
  },
}

export const contentZH = {
  navbar: {
    brandName: 'Omni Memory',
    navLinks: [
      {
        label: '开发者',
        dropdown: [
          { label: '文档', href: '/docs', icon: 'DOC' },
          { label: 'API 参考', href: '/docs/api', icon: 'API' },
          { label: '支持', href: '/support', icon: 'SUP' },
          { label: 'Discord', href: 'https://discord.gg/omnimemory', icon: 'CHAT' },
        ],
      },
      { label: '价格', href: '#pricing' },
      { label: '企业', href: '#enterprise' },
      { label: '研究', href: '/research' },
      { label: '加入我们', href: '/careers' },
    ],
    ctaLabel: '开始使用',
    toggleLabel: 'EN',
  },
  hero: {
    badge: '公测中',
    titleLine1: '记忆',
    titleLine2: '决定智能上限',
    description: 'Omni Memory 构建多模态记忆系统，让 AI 以真实上下文持续成长。',
    primaryCta: '开始构建',
    secondaryCta: '查看文档',
  },
  stats: {
    items: [
      { value: '#1', label: 'LoCoMo 基准测试' },
      { value: '77.8%', label: 'J-Score 准确率' },
      { value: '<1s', label: '检索延迟' },
    ],
  },
  features: {
    eyebrow: '企业级部署',
    title: '生产就绪的记忆基础设施',
    description: '自托管部署，全面掌控数据与基础设施。',
    items: [
      { icon: 'LOCK', tag: '隐私', title: '自托管数据库', description: '在你的基础设施上部署 Qdrant + Neo4j，数据不出域。' },
      { icon: 'DEPLOY', tag: '部署', title: '一键部署', description: 'Docker Compose 快速部署，支持 Kubernetes。' },
      { icon: 'SUPPORT', tag: '支持', title: '专属团队', description: 'SLA 保障，工程团队直连与定制集成。' },
      { icon: 'CONSOLE', tag: '控制台', title: 'API 控制台', description: '监控用量、管理 API Key、配置记忆策略。' },
    ],
  },
  howItWorks: {
    eyebrow: '工作原理',
    title: '从摄取到召回',
    description: '简单三步，让 AI 拥有持久记忆。',
    steps: [
      { title: '摄取', description: '通过 API 写入对话、文件和事件。' },
      { title: '增强', description: '分类、去重与衰减评分，保持记忆新鲜。' },
      { title: '检索', description: '按用户与意图检索，毫秒级返回上下文。' },
    ],
  },
  developers: {
    eyebrow: '开发者',
    title: '支持 Python / JavaScript / REST',
    description: '三行代码让你的 AI 拥有持久记忆。初始化、存储对话、图增强检索。',
    primaryCta: '阅读文档',
    secondaryCta: '联系我们',
    codeTabs: [
      { label: 'Python', code: CODE_SAMPLE_PYTHON },
      { label: 'JavaScript', code: CODE_SAMPLE_JS },
      { label: 'REST', code: CODE_SAMPLE_REST },
    ],
  },
  testimonials: {
    eyebrow: '用户故事',
    title: '团队使用 Omni Memory',
    items: [
      { name: 'Sarah Chen', title: 'Aurora Labs AI 负责人', quote: '我们用 Omni Memory 替代了多个内部服务，延迟显著下降。' },
      { name: 'Marcus Williams', title: 'Northwind 产品副总裁', quote: '临床助手终于能跨会话记住上下文，落地速度极快。' },
      { name: 'Elena Rodriguez', title: 'Signalwave 创始人', quote: '策略控制让我们无需重建基础设施即可上线。' },
    ],
  },
  partners: {
    label: '顶尖研究机构与企业的信赖',
    partners: [
      { name: 'Tsinghua University', nameCn: '清华大学' },
      { name: 'Peking University', nameCn: '北京大学' },
      { name: 'Zhejiang University', nameCn: '浙江大学' },
      { name: 'NUS' },
      { name: 'VU Amsterdam' },
    ],
  },
  pricing: {
    eyebrow: '价格',
    title: '随你扩展的方案',
    description: '从免费开始，随成长升级。可预测的按量计费。',
    plans: [
      { badge: '入门', name: '构建', price: '免费', period: '永久', cta: '免费开始', features: ['200万条记忆', '多模态 API', '社区支持'] },
      { badge: '企业', name: '治理', price: '定制', period: '', cta: '联系我们', features: ['无限记忆', '专属 VPC', '定制 SLA', '专属支持'] },
    ],
  },
  faq: {
    eyebrow: '常见问题',
    title: '常见问题',
    description: '关于 Omni Memory 的常见疑问。',
    items: [
      { question: '支持哪些 AI 模型？', answer: '我们对不同模型提供统一接口，支持 GPT、Claude、Gemini 等。' },
      { question: '可存储哪些数据类型？', answer: '文本、音频转写、带上下文的图像与结构化事件。' },
      { question: '如何处理隐私？', answer: 'PII 检测、保留期配置、同意追踪与删除流程。' },
      { question: '检索延迟是多少？', answer: 'P95 召回低于 500ms，支持多区域缓存。' },
    ],
  },
  cta: {
    title: '让 AI 拥有应得的记忆',
    description: '立即开始使用持久的上下文记忆。免费套餐可用。',
    primaryCta: '开始构建',
    secondaryCta: '查看文档',
  },
  footer: {
    brandName: 'Omni Memory',
    tagline: '智能 AI 应用的记忆层。',
    links: [
      { label: '工作原理', href: '#how-it-works' },
      { label: '企业', href: '#enterprise' },
      { label: '文档', href: '/docs' },
      { label: '价格', href: '#pricing' },
    ],
    copyright: '© 2025 Omni Memory. 保留所有权利。',
  },
}

// Marquee items
export const marqueeItems = ['Text', 'Audio', 'Images', 'Events', 'Conversations', 'Videos', 'Memories']

// Visual Assets Reference
export const visualAssets = {
  logos: {
    main: '/Logo/SVG/OmniMemory Logo.svg',
    white: '/Logo/SVG/OmniMemory Logo White.svg',
    darkGrey: '/Logo/SVG/OmniMemory Logo Dark Grey.svg',
    graphic: '/Logo/SVG/Logo-Graphic-OmniMemory.svg',
    graphicWhite: '/Logo/SVG/Logo-Graphic-OmniMemory_White.svg',
    graphicBlack: '/Logo/SVG/Logo-Graphic-OmniMemory_Black.svg',
  },
  visuals: {
    hero: '/Hero image.jpg',
    memoryWoman: '/Visual/Visual-1 Memory woman 流动记忆体.jpg',
    memoryWomanBlurred: '/Visual/Visual-1 Memory woman Blurred 流动记忆体.jpg',
    timeSlices: '/Visual/Visual-time slices 时间切片 - .jpg',
    brain: '/Visual/Visual-Brain 粒子脑.jpg',
    humanParticles: '/Visual/Visual-Human-Particles 时间粒子.jpg',
    dataImage: '/Visual/data image.jpg',
  },
  video: '/Video/OmniMemory 流动的记忆.mp4',
}
