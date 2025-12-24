# UGC System Implementation Log & Handoff

**Date:** December 24, 2025
**Feature:** User-Generated Content (UGC) System (Phases 1-3)
**Status:** ✅ Complete & Deployed

---

## 🏗️ Architecture Overview

The UGC system allows users to submit quiz questions, vote on them, and eventually have them integrated into the main game.

### Data Flow
1.  **Submission:** User submits form at `/submit/[category]` -> stored in `user_submitted_questions` (status: `pending`).
2.  **Moderation:** Admin reviews at `/admin` -> status changes to `approved` (or `rejected`).
3.  **Voting:** Community views at `/vote` -> users upvote/downvote.
4.  **Curation:** Questions exceeding a net vote threshold (default: 10) become `curated`.
5.  **Integration:** Game logic in `supabaseQuestions.ts` fetches both Official + `curated` questions for gameplay.

---

## 🗃️ Key Files & Components

### Types
*   **`src/types/ugc.ts`**: Contains all interfaces.
    *   **NOTE:** Keys are now **snake_case** to match Supabase database schema directly (e.g., `user_id`, `question_data`, `created_at`).
    *   `QuestionData` is a discriminated union type for the JSONB payload of each category.

### Hooks
*   **`src/hooks/useUGC.ts`**: The central logic hub.
    *   `submitQuestion()`: Inserts into DB.
    *   `getQuestionsForVoting()`: Fetches `curation_candidates_view`.
    *   `voteOnQuestion()`: Inserts into `question_votes` table.
    *   `reviewQuestion()`: Calls `approve_question` or `reject_question` RPCs.

### Pages & Routes
*   **`/submit` (`src/app/submit/page.tsx`)**: Creator dashboard. Shows points, rewards, and category links.
*   **`/submit/[category]`**: Dynamic form route. Renders specific fields based on URL param.
*   **`/vote` (`src/app/vote/page.tsx`)**: Public feed for approving content.
*   **`/admin` (`src/app/admin/page.tsx`)**: Protected route for admins to moderate pending items.

### Game Integration
*   **`src/lib/supabaseQuestions.ts`**:
    *   Updated all `getRandom[*]()` functions.
    *   They now execute **two** parallel queries: one to the main table, one to `user_submitted_questions`.
    *   Results are mixed, shuffled, and returned seamlessly.

---

## 🛢️ Database Schema (Supabase)

### Tables
*   `user_submitted_questions`: The core table. Contains a `question_data` JSONB column.
*   `question_votes`: Tracks up/down votes. Unique constraint on `(user_id, question_id)`.
*   `user_rewards`: Logs points earned (e.g., +10 for approval).
*   `app_config`: Admin settings (e.g., points values, curation threshold).

### Views
*   `pending_questions_view`: For Admins. Shows items needing review.
*   `curation_candidates_view`: For `/vote` page. Shows approved items needing votes.

### Functions (RPC)
*   `approve_question` / `reject_question`: Atomic updates that also log admin metadata.
*   `promote_to_curated`: **To be run via cron/job**. Promotes qualifying questions and awards bonus points.

---

## 🐛 Recent Fixes & "Gotchas"

1.  **CamelCase vs Snake_case Mismatch**:
    *   Originally defined types in camelCase, but Supabase views return snake_case.
    *   **Fix:** Refactored `src/types/ugc.ts` to use snake_case.
    *   **Watch out:** If you add new fields, ensure the TypeScript interface matches the DB column name exactly!

2.  **Optimistic Voting**:
    *   The `VoteControls` component updates the UI immediately.
    *   It silently reverts if the API call fails.
    *   This provides a snappy UX but might hide persistent network errors if console is ignored.

---

## 🚀 Verification Status

*   [x] **Submission**: Works for all 5 categories. Validations active.
*   [x] **Voting**: Up/Down works. Counts update in DB.
*   [x] **Admin**: Approval moves item to voting pool. Rejection hides it.
*   [x] **Rewards**: Points update in header correctly.
*   [x] **Build**: `npm run build` passes with zero type errors.

---

## 📝 Next Steps / Backlog

*   **Cron Job**: Set up a scheduled task to run `select promote_to_curated()` daily/hourly. (Currently manual).
*   **Realtime**: Add Supabase Realtime subscription to `/vote` page for live updates.
*   **Edit Mode**: Allow users to edit their pending submissions.
