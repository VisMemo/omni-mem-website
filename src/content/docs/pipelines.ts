import type { DocPage } from './types';

// =============================================================================
// Pipelines Overview Page
// =============================================================================

export const pipelinesPage: DocPage = {
  slug: 'pipelines',
  title: {
    en: 'Pipelines',
    zh: '处理管线',
  },
  description: {
    en: 'Omni Memory processes data through specialized pipelines. Currently supporting Text/Dialog with Video coming soon.',
    zh: 'Omni Memory 通过专门的管线处理数据。目前支持文本/对话，视频即将推出。',
  },
  sections: [
    {
      id: 'overview',
      heading: {
        en: 'Available Pipelines',
        zh: '可用管线',
      },
      content: {
        en: `Omni Memory supports multiple data types through specialized processing pipelines:

**Text/Dialog Pipeline** - Available now
- Process conversations, chat logs, and transcripts
- Uses OpenAI message format
- Perfect for AI agents and chatbots

**Video Pipeline** - Coming soon
- Process video files for visual memories
- Extract faces, scenes, and objects
- Multi-modal search capabilities`,
        zh: `Omni Memory 通过专门的处理管线支持多种数据类型：

**文本/对话管线** - 现已可用
- 处理对话、聊天记录和转录文本
- 使用 OpenAI 消息格式
- 适合 AI 代理和聊天机器人

**视频管线** - 即将推出
- 处理视频文件以获取视觉记忆
- 提取人脸、场景和物体
- 多模态搜索功能`,
      },
    },
    {
      id: 'text-pipeline',
      heading: {
        en: 'Text/Dialog Pipeline',
        zh: '文本/对话管线',
      },
      content: {
        en: `The Text/Dialog pipeline processes conversational data in OpenAI message format.

**Key Features:**
- **Multi-speaker support** - Distinguish speakers using the \`name\` field
- **Entity extraction** - Automatically identifies people, places, and concepts
- **Event extraction** - Creates events from conversation turns
- **Knowledge extraction** - Extracts structured facts
- **Temporal context** - Tracks when events occurred

**How It Works:**
1. Send conversation messages to the Ingest API
2. Async processing extracts entities, events, and knowledge
3. Data stored as vector embeddings + Temporal Knowledge Graph
4. Hybrid search combines semantic vectors and graph structure

**Processing Time:** 5-30 seconds after ingestion`,
        zh: `文本/对话管线处理 OpenAI 消息格式的对话数据。

**主要功能：**
- **多说话人支持** - 使用 \`name\` 字段区分说话人
- **实体提取** - 自动识别人物、地点和概念
- **事件提取** - 从对话轮次创建事件
- **知识提取** - 提取结构化事实
- **时间上下文** - 跟踪事件发生时间

**工作原理：**
1. 将对话消息发送到摄取 API
2. 异步处理提取实体、事件和知识
3. 数据存储为向量嵌入 + 时序知识图谱
4. 混合搜索结合语义向量和图结构

**处理时间：** 摄取后 5-30 秒`,
      },
      codeExamples: [
        {
          language: 'python',
          title: 'Text Pipeline Example',
          code: `from omem import Memory

mem = Memory(api_key="qbk_xxx")

# Save a multi-speaker conversation
mem.add("conv-001", [
    {"role": "user", "name": "Caroline", "content": "I went to a support group yesterday."},
    {"role": "user", "name": "Melanie", "content": "That's awesome! How did it go?"},
    {"role": "user", "name": "Caroline", "content": "It was meaningful. Going to Seattle next week."},
])

# Wait ~5-30 seconds for processing, then search
result = mem.search("What did Caroline do recently?")
if result:
    for item in result:
        print(f"[{item.score:.2f}] {item.text}")`,
        },
      ],
    },
    {
      id: 'video-pipeline',
      heading: {
        en: 'Video Pipeline (Coming Soon)',
        zh: '视频管线（即将推出）',
      },
      content: {
        en: `The Video pipeline will process video files to extract visual memories, face detections, scene classifications, and temporal events.

**Planned Features:**
- **Face detection and recognition** - Track people across video frames
- **Scene classification** - Understand visual context and settings
- **Object detection** - Identify objects and their relationships
- **Temporal events** - Aggregate frames into semantic events
- **Audio transcription** - Extract spoken content from video

**Planned Use Cases:**
- Personal video archives
- Meeting recordings
- Security footage analysis
- Content indexing and search

Stay tuned for updates on the video pipeline release.`,
        zh: `视频管线将处理视频文件以提取视觉记忆、人脸检测、场景分类和时间事件。

**计划功能：**
- **人脸检测和识别** - 跨视频帧跟踪人物
- **场景分类** - 理解视觉上下文和设置
- **物体检测** - 识别物体及其关系
- **时间事件** - 将帧聚合为语义事件
- **音频转录** - 从视频中提取语音内容

**计划用例：**
- 个人视频档案
- 会议录音
- 安全录像分析
- 内容索引和搜索

请关注视频管线发布的更新。`,
      },
    },
    {
      id: 'choosing-pipeline',
      heading: {
        en: 'Choosing a Pipeline',
        zh: '选择管线',
      },
      content: {
        en: `**Use Text/Dialog Pipeline when:**
- You have chat logs, transcripts, or conversational data
- You need fast ingestion and search (5-30 seconds)
- Speaker identity is known (via \`name\` field)
- Building AI agents or chatbots with memory

**Use Video Pipeline when (coming soon):**
- You have video recordings to index
- Visual context is important for your use case
- You need to track people across video frames
- Audio transcription from video is needed`,
        zh: `**使用文本/对话管线当：**
- 您有聊天记录、转录文本或对话数据
- 需要快速摄取和搜索（5-30 秒）
- 说话人身份已知（通过 \`name\` 字段）
- 构建具有记忆功能的 AI 代理或聊天机器人

**使用视频管线当（即将推出）：**
- 您有要索引的视频录制
- 视觉上下文对您的用例很重要
- 需要跨视频帧跟踪人物
- 需要从视频中转录音频`,
      },
    },
  ],
};
