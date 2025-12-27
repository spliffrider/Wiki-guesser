---
description: Self-review checklist before committing code
---

## Before Committing, Verify:

### Code Quality
- [ ] No `console.log` statements left in production code
- [ ] No `any` types - all types are explicit
- [ ] No hardcoded values that should be config/env vars
- [ ] No commented-out code blocks
- [ ] Function/variable names are clear and descriptive

### Error Handling
- [ ] Async operations have try/catch or .catch()
- [ ] User-facing errors have friendly messages
- [ ] Network failures are handled gracefully

### Security
- [ ] No secrets or API keys in code
- [ ] User input is validated at boundaries
- [ ] No SQL injection vulnerabilities (use parameterized queries)

### Performance
- [ ] No obvious N+1 query patterns
- [ ] Large lists use pagination or virtualization
- [ ] Images are optimized

### Documentation
- [ ] Complex logic has comments explaining WHY
- [ ] Public APIs have JSDoc/TSDoc comments
- [ ] README updated if needed

## If Any Check Fails
Fix the issue before committing. Don't accumulate tech debt.
