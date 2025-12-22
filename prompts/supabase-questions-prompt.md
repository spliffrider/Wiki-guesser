# Supabase Question Banks Implementation Prompt

Use this prompt with Claude Opus 4.5 to implement curated question tables in your Wiki Guesser project.

---

```xml
<role>
You are a senior full-stack developer specializing in Next.js, TypeScript, and Supabase. You write clean, type-safe code that integrates seamlessly with existing codebases. You understand database design and create efficient schemas with proper constraints.
</role>

<context>
I'm building "Wiki Guesser," a trivia game with 5 question categories. The project already runs on:
- Next.js 14+ with App Router
- TypeScript (strict mode)
- Supabase for auth and database
- CSS Modules for styling

The game currently loads questions from static JSON files (for 4 categories) and Wikipedia API (for 1 category). I want to migrate to Supabase tables for curated question storage, allowing me to add/manage questions over time.

Workspace: c:\antigravity\wiki-guesser

Existing type definitions are in src/types/index.ts:
- OddWikiOutData: { items: string[], impostorIndex: number, connection: string }
- WhenInWikiData: { event: string, correctYear: number, yearOptions: number[] }
- WikiOrFictionData: { statement: string, isTrue: boolean, explanation: string }
- WikiLinksData: { titles: string[], connection: string, connectionOptions?: string[] }
</context>

<task>
Create Supabase tables and TypeScript integration for 4 question categories. Do NOT modify the wiki_what category (it uses live Wikipedia API).

1. **Create SQL schema file** (supabase/questions.sql):

   Create 4 tables with these specifications:
   
   **odd_wiki_out_questions:**
   - id (uuid, primary key)
   - items (text[] - exactly 4 items)
   - impostor_index (int - 0-3)
   - connection (text - what connects the 3 correct items)
   - wikipedia_url (text - source article)
   - image_url (text, nullable - external URL)
   - created_at (timestamptz)
   - CHECK constraint: array_length(items, 1) = 4
   - CHECK constraint: impostor_index >= 0 AND impostor_index <= 3
   
   **when_in_wiki_questions:**
   - id (uuid, primary key)
   - event (text - event description)
   - correct_year (int)
   - year_options (int[] - exactly 4 years, must include correct_year)
   - wikipedia_url (text)
   - image_url (text, nullable)
   - created_at (timestamptz)
   - CHECK constraint: array_length(year_options, 1) = 4
   - CHECK constraint: correct_year = ANY(year_options)
   
   **wiki_or_fiction_questions:**
   - id (uuid, primary key)
   - statement (text)
   - is_true (boolean)
   - explanation (text)
   - wikipedia_url (text)
   - image_url (text, nullable)
   - created_at (timestamptz)
   
   **wiki_links_questions:**
   - id (uuid, primary key)
   - titles (text[] - exactly 4 article titles)
   - connection (text)
   - connection_options (text[] - exactly 4 options, must include connection)
   - wikipedia_url (text)
   - image_url (text, nullable)
   - created_at (timestamptz)
   - CHECK constraint: array_length(titles, 1) = 4
   - CHECK constraint: array_length(connection_options, 1) = 4
   - CHECK constraint: connection = ANY(connection_options)
   
   Enable Row Level Security on all tables. Add policies for:
   - Public read access (anyone can SELECT)
   - No public write access (admin only via Supabase dashboard)

2. **Create question fetcher utility** (src/lib/supabaseQuestions.ts):
   
   Export async functions:
   - `getRandomOddWikiOutFromDB(count: number): Promise<OddWikiOutData[]>`
   - `getRandomWhenInWikiFromDB(count: number): Promise<WhenInWikiData[]>`
   - `getRandomWikiOrFictionFromDB(count: number): Promise<WikiOrFictionData[]>`
   - `getRandomWikiLinksFromDB(count: number): Promise<WikiLinksData[]>`
   
   Each function should:
   - Use the existing Supabase client from src/lib/supabase.ts
   - Fetch random rows using: `.order('created_at', { ascending: false }).limit(count * 3)` then shuffle and slice
   - Map database columns to existing TypeScript interfaces
   - Handle empty results gracefully (return empty array)
   - Log errors to console

3. **Update the questions loader** (src/lib/questions.ts):
   
   Modify the existing functions to:
   - First try fetching from Supabase
   - Fall back to static JSON if Supabase returns empty/errors
   - Export the same function signatures so no changes needed in useGame.ts
</task>

<requirements>
- Use existing Supabase client from src/lib/supabase.ts
- Match existing TypeScript interfaces exactly (OddWikiOutData, etc.)
- Keep backwards compatibility with static JSON fallback
- Use proper TypeScript types (no 'any')
- Add JSDoc comments to exported functions
- SQL must be idempotent (use CREATE TABLE IF NOT EXISTS)
</requirements>

<output_format>
Provide complete, copy-paste ready code for:
1. supabase/questions.sql (full schema)
2. src/lib/supabaseQuestions.ts (new file)
3. src/lib/questions.ts (updated file with Supabase integration)

Include brief comments explaining key decisions.
</output_format>
```

---

## How to Use This Prompt

1. Copy everything between the ``` xml ``` blocks above
2. Paste into Claude Opus 4.5
3. Review the generated code
4. Run the SQL in Supabase SQL Editor
5. Create the new TypeScript file
6. Update the existing questions.ts

## What You'll Get

- **4 Supabase tables** with proper constraints and RLS
- **Type-safe fetcher functions** matching your existing interfaces
- **Graceful fallback** to JSON if Supabase is empty
- **Zero breaking changes** to existing game logic
