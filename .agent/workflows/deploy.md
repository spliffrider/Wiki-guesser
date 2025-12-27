---
description: Safe deployment checklist with rollback awareness
---

## Pre-Deployment Checks

// turbo
1. Ensure all changes are committed and pushed
   `git status`

// turbo  
2. Build locally to catch errors early
   `npm run build`

3. Verify environment variables:
   - [ ] All required env vars are set in production
   - [ ] No development values in production config
   - [ ] Secrets are properly configured

4. Database considerations:
   - [ ] Run any pending migrations
   - [ ] Backup database if making schema changes
   - [ ] Verify migration rollback exists

## Deployment

5. Deploy using your platform's method (Vercel, etc.)

6. Document the deployment:
   - Commit hash deployed
   - Time of deployment
   - Any notable changes

## Post-Deployment Verification

7. Smoke tests - verify critical paths:
   - [ ] Application loads
   - [ ] User can log in
   - [ ] Core features work
   - [ ] No console errors

8. Monitor for 15 minutes:
   - Check error logs
   - Watch for performance issues

## Rollback Plan

If issues are detected:
1. Vercel: Instant rollback to previous deployment
2. Git: `git revert <commit>` and redeploy
3. Database: Run rollback migration

Never deploy on Fridays unless critical.
