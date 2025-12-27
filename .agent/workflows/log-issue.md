---
description: Log a bug fix to ISSUES_LOG.md - quick entry for Paul
---

# Log Issue to ISSUES_LOG.md

Use this workflow to quickly log a bug you just fixed.

## CRITICAL RULES

> [!CAUTION]
> **APPEND ONLY** - The ISSUES_LOG.md is a PERMANENT logbook.
> - Location: `c:/antigravity/ISSUES_LOG.md` (workspace ROOT, NOT per-project)
> - NEVER overwrite or recreate this file
> - ONLY append new entries at the TOP (after line 38)
> - New entries go ABOVE older entries (newest first)

## Required Information

Provide the following:
1. **Project name** (e.g., stickfinity, wiki-guesser, my-astro-journey)
2. **Brief description** of the issue
3. **Symptoms** - What error/behavior did you see?
4. **Root cause** - Why did it happen?
5. **Solution** - What fixed it?
6. **What didn't work** (optional) - Failed attempts

## Entry Format

```markdown
### [YYYY-MM-DD] - [project] - Brief Description

**Symptoms:**
- What the user saw / error message

**Root Cause:**
- Why it happened

**Solution:**
- What fixed it

**What Didn't Work:**
- Failed attempts (saves time in future)

---
```

## Example

```
/log-issue
Project: wiki-guesser
Issue: Supabase type error on build
Symptoms: 'never' type error on Vercel, worked locally
Cause: Strict Database generic causing inference issues
Fix: Removed <Database> generic from createBrowserClient()
```

Paul will format and add the entry to `c:/antigravity/ISSUES_LOG.md`.
