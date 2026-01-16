from omem import Memory

mem = Memory(api_key="qbk_4900762127d14db2870380e8e5460a66")  # That's it!

# Save a conversation
mem.add("conv-002", [
    {"role": "user", "content": "Meeting with Caroline tomorrow at West Lake"},
    {"role": "assistant", "content": "Got it, I'll remember that"},
])

# Search memories
result = mem.search("When am I going to West Lake?")
if result:
    print(result.to_prompt())  # Formatted for LLM context