# Issues Log

A persistent record of bugs, issues, and their solutions. **Check this first when debugging.**

---

> [!IMPORTANT]
> **LATEST HANDOFF (Dec 24, 2025):** 
> The UGC System (Phases 1-3) is complete. 
> Please read **`wiki-guesser/UGC_HANDOFF.md`** for full architectural details, schema layouts, and the verification methods used. 
> Everything is deployed to production.

## How to Use This Log

1. **When debugging**: Search this file for keywords related to your issue
2. **After fixing**: Add a new entry with the template below
3. **Failed attempts**: Document what DIDN'T work to avoid repeating mistakes

---

## Entry Template

```markdown
### [DATE] - [PROJECT] - Brief Description

**Symptoms:**
- What the user saw / error message

**Root Cause:**
- Why it happened

**Solution:**
- What fixed it

**What Didn't Work:**
- Failed attempts (saves time in future)

**Related:**
- Links to similar issues, docs, etc.
```

---

<!-- New issues should be added at the top, newest first -->

### 2025-12-26 - wiki-guesser - Session Handoff & Features

**Status:** ALL GREEN
- **Anonymous UGC**: Implemented & Deployed (`/submit-anonymous`)
- **Question Ratings**: Implemented (`QuestionRatingModal`)
- **Creator Hub**: Enhanced with Random URL generator.

**State:**
- Branch: `main`
- Clean git status.
- Next: Monitor ratings and admin queue.
- **See `walkthrough.md` for details.**

---

### 2025-12-25 - general - Claude Opus 4.5 crashes when using Supabase MCP

> [!WARNING]
> **This may be a temporary issue.** Claude Opus 4.5 was released on Nov 24, 2025. As the model matures and Anthropic releases patches, this issue may already be resolved. **Test again before assuming it still exists.**

**Symptoms:**
- Agent crashes immediately when any MCP tool is invoked while using Claude Opus 4.5
- Same Supabase MCP configuration works fine with Claude Sonnet and Gemini models
- No specific error message visible (complete crash/hang)

**Root Cause:**
- Known compatibility issue between Claude Opus 4.5 and MCP servers
- Opus 4.5 has more complex "extended thinking" that appears to conflict with MCP connection handling
- Reports of `MCP error -32000: Connection closed` and API overload errors
- Model's longer processing times may cause MCP connections to timeout/close prematurely

**Solution:**
- **Workaround**: Use Claude Sonnet or Gemini models for any MCP-related work
- **Long-term**: Wait for Anthropic to patch Opus 4.5 stability issues
- Monitor [Supabase MCP GitHub issues](https://github.com/supabase/mcp-server/issues) for updates

**What Didn't Work:**
- N/A - this is a model-side issue, not configuration

**Related:**
- Multiple Reddit threads and GitHub issues report same pattern
- Some users advise avoiding Supabase MCP with Claude entirely due to instability
- General Opus 4.5 issues: context management failures, "thinking" process interruptions

---

### 2025-12-25 - wiki-guesser - Session paused

**Symptoms:**
- User logged off, wants to resume tomorrow.

**Root Cause:**
- No further work needed now.

**Solution:**
- All changes committed and pushed. State saved.

**What Didn't Work:**
- N/A

**Related:**
- Previous entries.

---


### 2025-12-24 - wiki-guesser - False Positive "Falling back to JSON" logs

**Symptoms:**
- Browser console logs `[questions] No wiki_what questions in database` and `[questions] Falling back to JSON` for various categories.
- Game loads and plays fine, but logs imply database failure.

**Root Cause:**
- `useGame.ts` calculates random questions counts (e.g., `wikiWhatCount: 0`).
- It calls `getRandomWikiWhat(0)`.
- Supabase fetch correctly returns 0 rows (limit=0).
- `getRandomWikiWhat` sees 0 rows and logged the warning/fallback message, assuming it was an error condition rather than an intentional 0-count request.

**Solution:**
- Updated `src/lib/questions.ts` to check `if (count === 0) return [];` before logging warning/fallback.

**What Didn't Work:**
- N/A

**Related:**
- Debugging Supabase connectivity issues (where we thought API was failing).

---

### 2025-12-24 - wiki-guesser - Game loading hangs silently on play screen

**Symptoms:**
- Single player game stuck on "Loading your Wikipedia adventure..." spinner indefinitely
- No errors visible in browser console (only CSS preload warnings which are harmless)
- F12 Network tab shows no failed requests

**Root Cause:**
- Supabase queries in `supabaseQuestions.ts` were hanging without timing out
- When Supabase connection is slow or unresponsive, Promise.all() never resolves
- No timeout mechanism existed to catch these silent hangs
- **UPDATE**: On 2025-12-24 this was caused by a Supabase infrastructure outage

**Solution:**
- Added `withTimeout()` helper function that wraps Promises with a 5-second timeout
- Applied timeout wrapper to all 5 question fetcher functions
- When queries timeout, they return empty array triggering JSON fallback
- Added wiki_what → wiki_or_fiction substitution (wiki_what has no JSON fallback)
- Added null checks to all category cases for better error messages

**Files Changed:**
- `src/lib/supabaseQuestions.ts`
- `src/hooks/useGame.ts`

**What Didn't Work:**
- N/A - identified root cause from pattern of silent hang without errors

**Related:**
- Similar to 2025-12-23 "Game infinite loading on Vercel" but different root cause (timeout vs API rate limit)
- Check [status.supabase.com](https://status.supabase.com) for service outages

---

### 2025-12-24 - wiki-guesser - Build fail due to Property Name Mismatch (camelCase vs snake_case)

**Symptoms:**
- `npm run build` failed with `Type error: Property 'rewardType' does not exist on type 'UserReward'.`
- `Property 'question_data' does not exist on type 'CurationCandidateView'`
- Mismatch between TypeScript interfaces and Supabase view/table results

**Root Cause:**
- TypeScript interfaces in `src/types/ugc.ts` were using `camelCase` (standard TS).
- Supabase returns data in `snake_case` (DB standard).
- We were not using a transformer or alias, so runtime data was snake_case but types expected camelCase.

**Solution:**
- Refactored `src/types/ugc.ts` interfaces to use `snake_case` keys:
  - `userId` -> `user_id`
  - `rewardType` -> `reward_type`
  - `createdAt` -> `created_at`
  - etc.
- Updated `useUGC.ts` hook logic to access snake_case properties.
- Updated `submit/page.tsx` and `QuestionCard.tsx` to read snake_case properties.

**What Didn't Work:**
- Trying to manually map every single field in the fetcher (too verbose/maintenance heavy).
- Keeping types camelCase led to `undefined` values at runtime.

**Related:**
- Common issue when using Supabase without a generated `Database` type that strictly enforces schema names.

---

### 2025-12-24 - wiki-guesser - "Read on Wikipedia" link resets quiz instead of opening Wikipedia

**Symptoms:**
- Clicking "Read on Wikipedia" link after answering a question stays in the app
- Quiz resets instead of opening Wikipedia in a new tab

**Root Cause:**
- `createPlaceholderTopic()` was creating topics with empty `pageUrl: ''`
- For non-wiki_what categories, the Wikipedia URL from database wasn't being passed through
- Empty href caused default link behavior (navigating to `/` and resetting state)

**Solution:**
- Added `source?: string` field to all category data types (`OddWikiOutData`, `WhenInWikiData`, `WikiOrFictionData`, `WikiLinksData`)
- Updated Supabase fetchers to include `source: row.wikipedia_url`
- Modified `createPlaceholderTopic()` to accept optional `pageUrl` parameter
- Updated all category cases in `useGame.ts` to pass `data.source` to `createPlaceholderTopic()`

**Files Changed:**
- `src/types/index.ts`
- `src/lib/supabaseQuestions.ts`
- `src/hooks/useGame.ts`

---

### 2025-12-23 - wiki-guesser - Game infinite loading on Vercel (Wikipedia API)

**Symptoms:**
- Single player stuck on "Loading your Wikipedia adventure..."
- 404 errors in console for icon-192.png (unrelated)

**Root Cause:**
- `wiki_what` category made 10+ sequential Wikipedia API calls via `getTopicsForTier()` and `getRelatedTopics()`
- Wikipedia API was rate-limiting or slow from Vercel's edge, causing infinite hang

**Solution:**
- Created `wiki_what_questions` table in Supabase with pre-curated questions
- Added `getRandomWikiWhatFromDB()` fetcher in `supabaseQuestions.ts`
- Replaced Wikipedia API calls with parallel Supabase fetch via `Promise.all()`
- Seeded 10 initial wiki_what questions (Einstein, Great Wall, Beatles, etc.)

**What Didn't Work:**
- N/A - identified root cause quickly from console network inspection

**Related:**
- Similar pattern to 2025-12-22 SSR issue below, but different root cause (API vs SSR)

---

### 2025-12-23 - wiki-guesser - Security Definer View (Supabase advisor)

**Symptoms:**
- Supabase advisor flagged `leaderboard_alltime`, `leaderboard_daily`, `leaderboard_weekly` as CRITICAL

**Root Cause:**
- Views created without explicit `security_invoker` default to `SECURITY DEFINER`
- This bypasses RLS policies and runs with creator's permissions

**Solution:**
- Recreate views with `WITH (security_invoker = true)` clause
- Grant SELECT to `authenticated, anon` roles

**What Didn't Work:**
- N/A

---

### 2025-12-23 - wiki-guesser - Function Search Path Mutable (Supabase advisor)

**Symptoms:**
- Supabase advisor flagged `handle_new_user` and `update_profile_stats` as WARN

**Root Cause:**
- Functions without `SET search_path` can be exploited via schema injection attacks

**Solution:**
- Recreate functions with `SET search_path = ''`
- Use fully qualified table names (e.g., `public.profiles`)

---

### 2025-12-23 - wiki-guesser - Extension in Public Schema (Supabase advisor)

**Symptoms:**
- Supabase advisor flagged `vector` extension in public schema as WARN

**Root Cause:**
- Extensions in public schema can pose security risks and clutter the namespace

**Solution:**
- Move to dedicated `extensions` schema:
  ```sql
  CREATE SCHEMA IF NOT EXISTS extensions;
  DROP EXTENSION IF EXISTS vector;
  CREATE EXTENSION vector SCHEMA extensions;
  GRANT USAGE ON SCHEMA extensions TO authenticated, anon, service_role;
  ```

---

### 2025-12-22 - wiki-guesser - Loading hang due to Supabase SSR initialization

**Symptoms:**
- Game stuck on "Loading your Wikipedia adventure..." spinner indefinitely.
- No explicit error in logs (sometimes `browserClient` not initialized).

**Root Cause:**
- `createBrowserClient` from `@supabase/ssr` was being called during server-side rendering (SSR) or before hydration.
- The browser-specific logic was blocking the fetch process in the Next.js execution context.

**Solution:**
- Added safety checks in `src/lib/supabaseQuestions.ts`: `if (typeof window === 'undefined') return [];`
- This ensures the fetcher immediately returns an empty array during SSR, allowing the page to render and trigger the JSON fallback logic or retry on the client side.

**What Didn't Work:**
- N/A

**Related:**
- Common practice for `@supabase/ssr` to ensure code only runs on the client when using browser-specific clients.

---

### 2024-12-20 - wiki-guesser - Supabase 'never' type error on Vercel build

**Symptoms:**
- `Type error: Argument of type '{ username: string; }' is not assignable to parameter of type 'never'`
- Build passed locally but failed on Vercel

**Root Cause:**
- Supabase client with strict `Database` generic type caused TypeScript to infer `never` for update operations
- Our custom Database type didn't match Supabase's expected schema format exactly

**Solution:**
- Removed the `<Database>` generic from `createBrowserClient()` in `src/lib/supabase.ts`
- Let Supabase use loose typing instead of strict schema typing

**What Didn't Work:**
- N/A - this was the same pattern that fixed stickfinity's similar issue

**Related:**
- Same root cause as stickfinity dashboard type error (2024-12-20 entry below)

---

### 2024-12-20 - stickfinity - Type error on dashboard

**Symptoms:**
- `Type error: Property 'id' does not exist on type 'never'` during Vercel build
- Local build worked fine

**Root Cause:**
- TypeScript couldn't infer the array type from Supabase query
- Empty array was typed as `never[]`

**Solution:**
- Explicitly type the response: `const { data } = await supabase.from('boards').select('*') as { data: Board[] | null }`

**What Didn't Work:**
- Adding `!` non-null assertion (doesn't fix the type)

**Related:**
- Common Supabase + TypeScript issue

---

### 2024-12-17 - stickfinity - Deployment failing with uncommitted files

**Symptoms:**
- Vercel deploying old code
- Fixes made locally not appearing in production

**Root Cause:**
- Changes committed but not pushed
- Or changes made to wrong branch

**Solution:**
- Always run `git status` then `git push` 
- Verify on GitHub that changes appear before expecting Vercel to pick them up

**What Didn't Work:**
- Re-triggering Vercel deploy (it was deploying the correct commit, just not the one expected)

---

### 2024-12-15 - stickfinity - Supabase tables not existing in production

**Symptoms:**
- Features work locally but fail in production
- "relation does not exist" errors

**Root Cause:**
- SQL scripts not run on production Supabase database
- Only ran on local/dev database

**Solution:**
- Manually execute SQL scripts (`connections.sql`, `schema.sql`, `storage.sql`) on production Supabase

**What Didn't Work:**
- N/A - once scripts were run, it worked

---
