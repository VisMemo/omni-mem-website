# Feature Request: Session-Based Search Filtering

**Product:** OmniMemory SDK (`omem`)  
**Date:** January 16, 2026  
**Priority:** High  
**Category:** API Enhancement

---

## Summary

Add the ability to filter `mem.search()` results by `session_id` (conversation ID) to enable scoped memory retrieval within specific conversation contexts.

---

## Problem Statement

Currently, `mem.search()` queries all memories stored under an API key without the ability to scope results to a specific session or conversation. This creates challenges for:

1. **Multi-tenant applications** - Apps serving multiple users/projects need isolated memory spaces
2. **Context-aware agents** - Agents that should only recall memories from the current conversation thread
3. **Project organization** - Developers managing multiple distinct memory pools under one account

### Current Behavior

```python
# Stores with session_id
mem.add("project-alpha", [{"role": "user", "content": "Alpha details..."}])
mem.add("project-beta", [{"role": "user", "content": "Beta details..."}])

# Search returns results from BOTH sessions - no way to filter
result = mem.search("project details")  # Returns mixed results
```

### Current Workarounds

| Workaround | Limitation |
|------------|------------|
| Separate API keys | Requires managing multiple keys; increases complexity |
| Client-side filtering | Inefficient; wastes API calls and bandwidth |
| Natural language filtering | Unreliable; depends on query phrasing |

---

## Proposed Solution

### Option A: `session_id` Parameter (Recommended)

Add an optional `session_id` parameter to `mem.search()`:

```python
# Search within a specific session
result = mem.search(
    "project details",
    session_id="project-alpha",  # NEW: Filter by session
    limit=10
)

# Search all sessions (current default behavior)
result = mem.search("project details", limit=10)
```

### Option B: `session_ids` Parameter (Multiple Sessions)

Support filtering by multiple sessions:

```python
result = mem.search(
    "meeting notes",
    session_ids=["conv-001", "conv-002", "conv-003"],
    limit=10
)
```

### Option C: Tags/Labels System

Add a tagging system at ingestion time:

```python
# Ingestion with tags
mem.add("conv-001", messages, tags=["project-alpha", "2026-Q1", "client-acme"])

# Search with tag filters
result = mem.search("budget discussion", tags=["project-alpha"])
```

---

## REST API Changes

### Current Retrieval Endpoint

```bash
POST /api/v1/memory/retrieval
{
    "query": "What did Caroline do?",
    "topk": 5
}
```

### Proposed Retrieval Endpoint

```bash
POST /api/v1/memory/retrieval
{
    "query": "What did Caroline do?",
    "topk": 5,
    "session_id": "conv-001",        # NEW: Single session filter
    "session_ids": ["conv-001", "conv-002"]  # OR: Multiple sessions
}
```

---

## Use Cases

### 1. Multi-Project Agent

```python
# Agent handling multiple projects
class ProjectAgent:
    def __init__(self, api_key):
        self.mem = Memory(api_key=api_key)
    
    def recall(self, project_id, query):
        # Only retrieve memories from this project
        return self.mem.search(query, session_id=project_id)
    
    def store(self, project_id, messages):
        self.mem.add(project_id, messages)
```

### 2. Conversation Thread Memory

```python
# Chat application with thread-specific memory
def handle_message(thread_id, user_message):
    # Search only within this thread's history
    context = mem.search(
        user_message,
        session_id=thread_id,
        limit=5
    )
    return generate_response(user_message, context)
```

### 3. Time-Based Organization

```python
# Daily conversation logs
today = "2026-01-16"
mem.add(f"daily-{today}", todays_conversations)

# Search only today's memories
result = mem.search("morning meeting", session_id=f"daily-{today}")
```

---

## Benefits

| Benefit | Impact |
|---------|--------|
| **Reduced complexity** | No need for multiple API keys |
| **Better performance** | Server-side filtering vs client-side |
| **Improved accuracy** | Scoped results = more relevant |
| **Cleaner architecture** | Single Memory instance per app |
| **Cost efficiency** | Fewer irrelevant results returned |

---

## Implementation Considerations

1. **Backward compatibility** - Parameter should be optional; default behavior unchanged
2. **Index optimization** - Session-based filtering should be efficient at the database level
3. **TKG integration** - Ensure TKG entity resolution respects session boundaries when filtered
4. **Documentation** - Update SDK docs and AGENT_GUIDE.md

---

## Priority Justification

This feature is fundamental for production applications that need:
- Memory isolation without API key proliferation
- Predictable, scoped memory retrieval
- Clean multi-tenant architectures

---

## Contact

For questions or discussion about this feature request, please reach out through:
- GitHub Issues: [Repository Issues Page]
- Email: [Support Email]

---

*Thank you for considering this enhancement to OmniMemory!*
