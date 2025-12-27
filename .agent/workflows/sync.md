---
description: Synchronize shared context files across agents
---

# /sync - Context Synchronization

Use this workflow at the start of a session to sync with shared context.

## When to Use
- Starting a new session
- Before beginning significant work
- After being away for a while
- When another agent has been working

## Steps

### 1. Read Orchestra Status
// turbo
Check what's currently happening:
```
View .agent/context/orchestra.md
```

### 2. Read Project Memory
// turbo
Refresh your understanding of decisions:
```
View .agent/context/memory.md
```

### 3. Check Handoffs
// turbo
See if there's work waiting for you:
```
View .agent/context/handoffs.md
```

### 4. Read Issues Log
// turbo
Check for recent bugs and solutions:
```
View ISSUES_LOG.md
```

### 5. Claim Your Work
If there's work assigned to your agent type (GEMINI/CLAUDE):
- Update handoffs.md status to 🔄 In Progress
- Add yourself to orchestra.md Active Streams

### 6. Update Memory (if needed)
If you learned something important during sync, add it to memory.md.

## Quick Sync (Abbreviated)

For quick context refresh, just read:
1. `orchestra.md` - What's active
2. `handoffs.md` - What's waiting

Then start working!
