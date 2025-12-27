---
description: Enforce strict Git discipline before, during, and after work
---

## Before Starting Work
// turbo
1. Check current git status
   `git status`

2. If there are uncommitted changes:
   - Review what's changed: `git diff`
   - Either commit them or stash them: `git stash`
   - Never start new work on top of uncommitted changes

## During Work
3. Commit frequently with semantic messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `refactor:` for code restructuring
   - `docs:` for documentation
   - `chore:` for maintenance

4. Keep commits atomic - one logical change per commit

## After Completing Work
// turbo
5. Verify all changes are committed: `git status`
// turbo
6. Push to remote: `git push`
7. Verify push succeeded - check for errors

## Critical Rules
- Never leave work uncommitted overnight
- WIP commits are acceptable with `WIP:` prefix
- Always verify push succeeded before closing session
