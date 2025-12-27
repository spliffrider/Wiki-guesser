---
description: Systematic debugging approach - no random trial and error
---

## Step 0: Check the Issues Log FIRST
// turbo
1. Read ISSUES_LOG.md at the workspace root
2. Search for keywords matching your error or symptoms
3. If a matching issue exists, try the documented solution first
4. If no match, proceed with systematic debugging below

## Step 1: Reproduce
5. Get exact reproduction steps
6. Confirm you can reproduce the bug
7. Note the expected vs actual behavior

## Step 2: Isolate
8. Narrow down where the bug occurs:
   - Which component/file?
   - Which function?
   - Which line range?

9. Use tools:
   - Console logs (temporary)
   - Debugger breakpoints
   - Network tab for API issues

## Step 3: Hypothesize
10. Based on evidence, form a hypothesis:
    "I believe the bug is caused by X because Y"

11. Don't change code randomly hoping it fixes things

## Step 4: Test Hypothesis
12. Make ONE change that should fix the bug
13. Test if the bug is fixed
14. If not fixed, revert and try next hypothesis

## Step 5: Verify
15. Confirm the fix works
16. Check that the fix didn't break anything else
17. Add test or documentation to prevent recurrence

## Step 6: Document in Issues Log
18. Add entry to ISSUES_LOG.md with:
    - Date, project, brief description
    - Symptoms / error message
    - Root cause
    - Solution that worked
    - What DIDN'T work (saves future time)

19. Commit with clear message explaining:
    - What the bug was
    - What caused it
    - How it was fixed

## Anti-Patterns to Avoid
- Skipping the issues log check
- Changing multiple things at once
- Not understanding WHY it's broken before fixing
- Leaving debug code in place
- Not logging the fix for future reference
