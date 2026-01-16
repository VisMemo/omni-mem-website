---
name: Omni Memory
version: 1.0.0
description: Long-term memory for AI agents - store, search, and retrieve conversational memories
tags: [memory, AI, agents, SDK, API, TKG, knowledge-graph]
updated: 2026-01-15
---

# Omni Memory

Give your AI agents long-term memory. Store conversations, search semantically, and retrieve structured knowledge.

---

## What is Omni Memory?

Omni Memory is a memory service for AI agents that:

- **Stores conversations** with multi-speaker support
- **Extracts knowledge** using a Temporal Knowledge Graph (TKG)
- **Enables semantic search** with hybrid vector + graph retrieval
- **Provides evidence tracing** back to source utterances

---

## Quick Start

```python
from omem import Memory

# Initialize with your API key
mem = Memory(api_key="qbk_xxx")

# Store a conversation (returns immediately - async processing)
mem.add("conv-001", [
    {"role": "user", "name": "Caroline", "content": "I went to a support group yesterday."},
    {"role": "user", "name": "Melanie", "content": "That's awesome! How did it go?"},
])

# ⚠️ IMPORTANT: Memories take 5-30 seconds to process before becoming searchable
# For immediate searchability, use wait=True:
# mem.add("conv-001", messages, wait=True, timeout_s=60.0)

# Search memories (after processing completes)
result = mem.search("What did Caroline do recently?")
if result:
    print(result.to_prompt())  # Ready for LLM context injection
```

---

## Installation

```bash
pip install omem
```

**Requirements:** Python 3.8+, API key from [omnimemory.ai](https://omnimemory.ai)

---

## API Reference

### Core Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `mem.add(session_id, messages)` | Store conversation (async) | None (fire-and-forget) |
| `mem.add(..., wait=True)` | Store and wait for completion | `JobStatus` |
| `mem.search(query, limit=10)` | Semantic search | `SearchResult` |
| `mem.explain_event(item)` | Get TKG context for result | `EventContext` or None |
| `mem.get_entity_history(name)` | All evidence for entity | `List[Evidence]` |
| `mem.get_evidence_for(item)` | Source for search result | `List[Evidence]` |

---

### `mem.add(session_id, messages, wait=False, timeout_s=30.0)`

Store a conversation in memory.

**Parameters:**
- `session_id` (str): Unique conversation identifier
- `messages` (list): List of message dicts
- `wait` (bool): If True, block until processing completes (default: False)
- `timeout_s` (float): Timeout in seconds when wait=True (default: 30.0)

**Returns:**
- `None` when `wait=False` (default) - processing is async
- `JobStatus` when `wait=True` - contains `completed`, `status`, `error` fields

**Message Format:**
```python
{
    "role": "user",           # Required: "user" or "assistant"
    "content": "message text", # Required: the message content
    "name": "Caroline",        # Optional but recommended for multi-speaker
}
```

**Example:**
```python
# Fire-and-forget (default) - returns immediately
mem.add("conv-001", [
    {"role": "user", "name": "Caroline", "content": "Hey Mel!"},
    {"role": "user", "name": "Melanie", "content": "Hey Caroline!"},
])
# ⚠️ Memories not immediately searchable - wait 5-30 seconds

# Wait for completion - blocks until processed
result = mem.add("conv-002", [
    {"role": "user", "content": "Book a meeting at 3pm"},
    {"role": "assistant", "content": "Done!"},
], wait=True, timeout_s=60.0)
if result.completed:
    # Now safe to search immediately
    mem.search("meeting")
```

**Important:** The `name` field creates distinct entities in the TKG. Without it, all messages are attributed to a generic "user" entity.

---

### `mem.search(query, limit=10, fail_silent=False)`

Search memories using natural language.

**Parameters:**
- `query` (str): Natural language question
- `limit` (int): Max results (default: 10)
- `fail_silent` (bool): Return empty result on error instead of raising

**Returns:** `SearchResult` with:
- `items`: List of `MemoryItem` objects
- `latency_ms`: Query latency
- Truthy check: `if result: ...`
- Iteration: `for item in result: ...`
- LLM formatting: `result.to_prompt()`

**Example:**
```python
result = mem.search("What did Caroline do?", limit=5)

if result:
    for item in result:
        print(f"[{item.score:.2f}] {item.text}")
        print(f"  Source: {item.source}")  # E_graph, E_vec, or K_vec
    
    # For LLM context injection
    context = result.to_prompt()
```

**For agent robustness:**
```python
result = mem.search("query", fail_silent=True)  # Never raises
```

---

### `mem.explain_event(item)`

Get full TKG context for a search result.

**Parameters:**
- `item` (MemoryItem): From `mem.search()` results

**Returns:** `EventContext` with:
- `entities`: List of entity names (e.g., "Caroline (PERSON)")
- `knowledge`: List of `ExtractedKnowledge` facts
- `places`: Location names
- `utterances`: Source texts
- `timestamp`: When it occurred

**Example:**
```python
result = mem.search("support group", limit=1)
ctx = mem.explain_event(result.items[0])

if ctx:
    print(f"Entities: {ctx.entities}")
    for k in ctx.knowledge:
        print(f"Fact: {k.summary}")  # "Caroline went to support group on 2026-01-14"
```

**Note:** Only works for `E_graph` results (TKG). Returns `None` for vector-only results (`E_vec`).

---

### `mem.get_entity_history(entity, limit=10)`

Get all evidence/utterances for an entity.

**Parameters:**
- `entity` (str): Entity name (e.g., "Caroline")
- `limit` (int): Max results (default: 10, max: 200)

**Returns:** `List[Evidence]` ordered by time

**Example:**
```python
history = mem.get_entity_history("Caroline", limit=20)
for e in history:
    print(f"[{e.timestamp}] {e.text}")
```

---

### `mem.get_evidence_for(item)`

Get source evidence for a specific search result.

**Parameters:**
- `item` (MemoryItem): From `mem.search()` results

**Returns:** `List[Evidence]`

**Example:**
```python
result = mem.search("tech conference", limit=1)
evidence = mem.get_evidence_for(result.items[0])
for e in evidence:
    print(f"Source: {e.text}")
```

---

## Data Models

### SearchResult
```python
result.items      # List[MemoryItem]
result.latency_ms # float
result.to_prompt() # str - formatted for LLM
bool(result)      # True if has items
```

### MemoryItem
```python
item.text       # str - the memory content
item.score      # float - relevance (0-1)
item.timestamp  # datetime or None
item.source     # str - "E_graph", "E_vec", or "K_vec"
item.event_id   # str or None - for TKG results
item.entities   # List[str] - mentioned entities
```

### EventContext
```python
ctx.entities    # List[str] - ["Caroline (PERSON)"]
ctx.knowledge   # List[ExtractedKnowledge]
ctx.places      # List[str]
ctx.utterances  # List[str] - source texts
ctx.timestamp   # datetime
ctx.session_kind # str - e.g., "dialog_session"
```

### ExtractedKnowledge
```python
k.summary      # str - "Caroline went to support group"
k.importance   # float - 0.0 to 1.0
k.timestamp    # datetime or None
```

### Evidence
```python
e.text         # str - source text
e.confidence   # float - 0.0 to 1.0
e.timestamp    # datetime or None
e.entity_id    # str - related entity
```

---

## REST API

### POST /api/v1/memory/ingest

Save a conversation.

```bash
curl -X POST "https://api.omnimemory.ai/api/v1/memory/ingest" \
  -H "Content-Type: application/json" \
  -H "x-api-key: qbk_xxx" \
  -d '{
    "session_id": "conv-001",
    "turns": [
      {"role": "user", "name": "Caroline", "content": "Hello!"},
      {"role": "user", "name": "Melanie", "content": "Hi Caroline!"}
    ]
  }'
```

### POST /api/v1/memory/retrieval

Search memories.

```bash
curl -X POST "https://api.omnimemory.ai/api/v1/memory/retrieval" \
  -H "Content-Type: application/json" \
  -H "x-api-key: qbk_xxx" \
  -d '{
    "query": "What did Caroline do?",
    "topk": 5
  }'
```

---

## Pipelines

| Pipeline | Status | Use Case |
|----------|--------|----------|
| **Text/Dialog** | Available | Conversations, chat logs, transcripts |
| **Video** | Coming Soon | Video memories, visual context |

---

## Error Handling

```python
from omem import OmemClientError, OmemRateLimitError

try:
    mem.add("conv", messages)
except OmemRateLimitError as e:
    print(f"Rate limited. Retry after {e.retry_after_s}s")
except OmemClientError as e:
    print(f"Error: {e}")
```

**Best practice for agents:** Use `fail_silent=True` so memory failures don't break conversation flow.

---

## Important Notes

1. **Processing delay**: Memories become searchable ~5-30 seconds after `add()`
2. **Multi-speaker**: Use `name` field to distinguish speakers (essential for TKG entity extraction)
3. **Data isolation**: All data is isolated per API key
4. **Fire-and-forget**: `add()` returns immediately; processing is async

---

## Links

- **SDK Docs**: [/docs/sdk/python](/docs/sdk/python)
- **API Reference**: [/docs/api/memory](/docs/api/memory)
- **Pipelines**: [/docs/pipelines](/docs/pipelines)
- **Get API Key**: [omnimemory.ai](https://omnimemory.ai)
