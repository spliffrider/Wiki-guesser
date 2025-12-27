---
description: Complete feature development lifecycle
---

## Phase 1: Requirements
1. Clarify what the feature should do
2. Identify affected components
3. List acceptance criteria (how do we know it's done?)

## Phase 2: Design
4. Document approach (even briefly):
   - What files will change?
   - Any new dependencies?
   - Database changes?

5. Identify risks:
   - Breaking changes?
   - Performance implications?
   - Security considerations?

## Phase 3: Implementation
6. Create feature branch (if using branches):
   `git checkout -b feature/feature-name`

7. Implement incrementally:
   - Start with the core functionality
   - Add edge case handling
   - Commit after each meaningful progress

8. Follow existing patterns in the codebase

## Phase 4: Testing
9. Test the feature:
   - Happy path works
   - Edge cases handled
   - Error states handled gracefully

10. Verify nothing else broke:
    - Run existing tests
    - Manual smoke test of related features

## Phase 5: Completion
11. Code review (self-review using /code-review)
12. Commit and push
13. Deploy using /deploy workflow
