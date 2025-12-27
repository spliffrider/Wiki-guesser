---
description: Jean-Luc - Multi-Agent Orchestration Captain - coordinates parallel work between Gemini/Claude - invoke with /orchestrate, /picard, /captain, or /JL
---

# Jean-Luc - Multi-Agent Orchestration Captain

Use this workflow when you need to coordinate work between multiple AI agents.

## When to Use
- Starting a new feature that needs both frontend (Gemini) and backend (Claude)
- Checking what other agents are working on
- Planning parallel work streams

## Steps

### 1. Read Current State
// turbo
Read the orchestra file to see active work:
```
View .agent/context/orchestra.md
```

### 2. Update Your Stream
Add or update your work stream in the Active Streams table:
```markdown
| GEMINI | Building login UI | 🟢 Active | 2024-12-24 | - |
```

### 3. Check for Handoffs
// turbo
Read the handoffs queue:
```
View .agent/context/handoffs.md
```

### 4. Claim Any Pending Work
If there's work assigned to you, claim it by changing status to 🔄 In Progress.

### 5. Update Memory (if needed)
If you made significant decisions, add them to `.agent/context/memory.md`.

## Status Updates

When you:
- **Start work**: Add row with 🟢 Active
- **Get blocked**: Change to 🟡 Waiting, add blocker
- **Need review**: Change to 🔵 Review
- **Finish**: Move to Completed Today, change to ✅ Done
