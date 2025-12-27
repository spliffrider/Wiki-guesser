---
description: Safe refactoring that doesn't break existing functionality
---

## Golden Rules
1. Refactoring ≠ Adding Features (never mix them)
2. Existing behavior must be preserved
3. Small, testable changes beat big rewrites

## Before Starting
// turbo
1. Verify current state works
   `npm run build && npm test`

2. Commit current state as baseline

## During Refactoring
3. Make ONE type of change at a time:
   - Rename → commit
   - Extract function → commit
   - Move file → commit

4. After each change:
   - Build still works
   - Tests still pass
   - Feature still works manually

## Safe Refactoring Patterns
- **Extract function**: Pull logic into named function
- **Rename**: Make names clearer
- **Inline**: Remove unnecessary abstraction
- **Move**: Relocate code to better location
- **Split**: Break large file into smaller ones

## Dangerous Refactoring (Extra Care)
- Changing function signatures
- Modifying shared utilities
- Restructuring data models
- Changing API contracts

## After Refactoring
5. Full test suite passes
6. Manual testing of affected features
7. Commit with `refactor:` prefix
8. Consider updating documentation

## When to Stop
- If refactoring scope keeps growing, STOP
- Commit what you have
- Create TODO for remaining work
