# Bulk Content Generator Prompt for Wiki Guesser

Use this prompt with Google Gemini (or Claude) to generate a Python script that bulk-generates quiz questions from Wikipedia articles.

---

## The Prompt

```xml
<role>
You are a senior Python developer and data engineer specializing in content generation pipelines. You will create a bulk trivia question generator for a Wikipedia quiz game.
</role>

<context>
I have a quiz game called "Wiki Guesser" connected to a Supabase database with 4 question tables. I need a Python script (`miner.py`) that:
1. Fetches popular Wikipedia articles
2. Generates quiz questions using Google Gemini 2.0 Flash
3. Outputs SQL INSERT statements (or JSON) ready for Supabase import

The script should be modular so the question-generation logic can later be reused in a Supabase Edge Function.
</context>

<database_schema>
-- Table 1: Odd Wiki Out (4 items, 1 impostor)
odd_wiki_out_questions (
    items TEXT[] NOT NULL,           -- Exactly 4 items
    impostor_index INT NOT NULL,     -- 0-3: which item doesn't belong
    connection TEXT NOT NULL,        -- What connects the 3 correct items
    topic TEXT,                      -- Category/topic tag
    wikipedia_url TEXT NOT NULL
)

-- Table 2: When In Wiki (guess the year)
when_in_wiki_questions (
    event TEXT NOT NULL,             -- Historical event description
    correct_year INT NOT NULL,       -- The actual year
    year_options INT[] NOT NULL,     -- Exactly 4 year choices (includes correct)
    topic TEXT,
    wikipedia_url TEXT NOT NULL
)

-- Table 3: Wiki Or Fiction (true/false)
wiki_or_fiction_questions (
    statement TEXT NOT NULL,         -- The claim to evaluate
    is_true BOOLEAN NOT NULL,        -- true or false
    explanation TEXT NOT NULL,       -- Why it's true/false
    topic TEXT,
    wikipedia_url TEXT NOT NULL
)

-- Table 4: Wiki Links (what connects 4 topics)
wiki_links_questions (
    titles TEXT[] NOT NULL,          -- Exactly 4 Wikipedia article titles
    connection TEXT NOT NULL,        -- Correct answer: what links them
    connection_options TEXT[] NOT NULL, -- 4 multiple choice options (includes correct)
    topic TEXT,
    wikipedia_url TEXT NOT NULL
)
</database_schema>

<task>
Create a Python script `miner.py` with the following structure:

1. **FETCH**: Use `pageviewapi` to get the top 100 most-viewed English Wikipedia articles from the last month. Filter out meta-pages (Main_Page, Special:Search, etc.).

2. **EXTRACT**: For each article, use `wikipedia-api` to fetch a summary (first 500 words).

3. **GENERATE**: For each article, call Google Gemini 2.0 Flash API to generate:
   - 1 question for each of the 4 categories (4 questions per article)
   - Output must be strictly valid JSON matching my schema

4. **OUTPUT**: Generate SQL INSERT statements for each table, ready to paste into Supabase SQL Editor.

5. **LIMITS**: Process 20 articles per run (= 80 total questions across 4 categories).
</task>

<gemini_prompt_template>
When calling Gemini, use this system instruction:

"""
You are a trivia question generator for a Wikipedia quiz game. Given an article summary, generate exactly 4 questions in JSON format:

{
  "odd_wiki_out": {
    "items": ["item1", "item2", "item3", "impostor"],
    "impostor_index": 3,
    "connection": "What connects the 3 correct items",
    "topic": "category tag"
  },
  "when_in_wiki": {
    "event": "Description of a historical event from this article",
    "correct_year": 1969,
    "year_options": [1965, 1969, 1972, 1975],
    "topic": "category tag"
  },
  "wiki_or_fiction": {
    "statement": "A surprising true or false claim from the article",
    "is_true": true,
    "explanation": "Why this is true/false",
    "topic": "category tag"
  },
  "wiki_links": {
    "titles": ["Article1", "Article2", "Article3", "Article4"],
    "connection": "What connects these 4 articles",
    "connection_options": ["Correct answer", "Wrong1", "Wrong2", "Wrong3"],
    "topic": "category tag"
  }
}

Rules:
- All arrays must have exactly 4 items
- year_options must include correct_year
- connection_options must include connection as first item
- Make questions challenging but fair
- Use real Wikipedia-verifiable facts only
"""
</gemini_prompt_template>

<requirements>
- Use `google-generativeai` Python SDK (NOT OpenAI)
- Model: gemini-2.0-flash
- Handle rate limiting gracefully (add delays between API calls)
- Include error handling for failed article fetches
- Print progress to console
- Output SQL to a file: `seed_generated.sql`
</requirements>

<output_format>
Provide the complete `miner.py` script with:
1. All imports at the top
2. Configuration section (API keys, limits)
3. Helper functions for fetching, generating, and formatting
4. Main execution block
5. Clear comments explaining each section
</output_format>
```

---

## Usage

1. Copy the prompt above (everything inside the code block)
2. Paste into Google AI Studio or a Gemini API chat
3. The AI will generate a complete `miner.py` script
4. Run the script to generate `seed_generated.sql`
5. Paste the SQL into Supabase SQL Editor to import questions

## Dependencies

```bash
pip install google-generativeai supabase wikipedia-api pageviewapi
```

## Configuration

Set your API key as an environment variable:
```bash
export GOOGLE_API_KEY="your-gemini-api-key"
```

---

*Created by Danny, your Prompt Engineering Assistant* 🎯
