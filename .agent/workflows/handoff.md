---
description: Tony - Context Engineering Agent (alias for /tony)
---

# Tony - Context Engineering Agent 📦

**This is an alias.** See [tony.md](file:///c:/antigravity/.agent/workflows/tony.md) for Tony's full workflow.

Invoke with `/tony` or `/handoff` to summon Tony, your precision context engineer for LLM-to-LLM transitions.

---

## Handoff Protocol Reference

Use this protocol when you need to pass work to another agent (Gemini ↔ Claude).

## When to Use
- Frontend done, needs backend implementation
- Backend API ready, needs UI integration
- You hit a blocker that another agent specializes in

## Steps

### 1. Document Your Work
Before handing off, ensure:
- [ ] Code is committed and pushed
- [ ] Any new files are documented
- [ ] Current state is working (no broken builds)

### 2. Create Handoff Entry
Add to `.agent/context/handoffs.md`:

```markdown
| # | From | To | Task | Context | Status |
|---|------|----|----- |---------|--------|
| 1 | GEMINI | CLAUDE | Implement auth API | UI at /auth/login ready, needs signIn() function | 🆕 New |
```

### 3. Provide Context
In the Context column, include:
- What files to look at
- What's already done
- What needs to happen next
- Any gotchas or decisions made

### 4. Update Orchestra
In `.agent/context/orchestra.md`:
- Move your row to Completed Today (or set 🟡 Waiting)
- Note the handoff in Notes section

### 5. Notify User (Optional)
If urgent, use notify_user to let the user know about the handoff.

## Handoff Template

```markdown
## Handoff: [TASK NAME]
**From**: GEMINI/CLAUDE
**To**: CLAUDE/GEMINI
**Date**: YYYY-MM-DD

### What's Done
- List completed work
- Link to relevant files

### What's Needed
- Describe what the receiving agent should do

### Files to Review
- `path/to/file1.ts`
- `path/to/file2.tsx`

### Decisions Made
- Any choices that affect the receiving agent's work
```
