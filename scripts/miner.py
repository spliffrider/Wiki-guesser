#!/usr/bin/env python3
"""
Wiki Guesser - Bulk Question Generator (miner.py)
==================================================
Fetches popular Wikipedia articles and generates trivia questions
using Google Gemini 2.0 Flash, outputting SQL INSERT statements.

Usage:
    python miner.py

Requirements:
    pip install google-generativeai wikipedia-api pageviewapi python-dotenv

Configuration:
    Set GOOGLE_API_KEY environment variable or create .env file

Created for Wiki Guesser quiz game - December 2024
"""

import os
import json
import time
import random
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv

# Third-party imports
try:
    import google.generativeai as genai
except ImportError:
    print("ERROR: google-generativeai not installed. Run: pip install google-generativeai")
    exit(1)

try:
    import wikipediaapi
except ImportError:
    print("ERROR: wikipedia-api not installed. Run: pip install wikipedia-api")
    exit(1)

try:
    from pageviewapi import period as pageview_period
except ImportError:
    print("ERROR: pageviewapi not installed. Run: pip install pageviewapi")
    exit(1)

# =============================================================================
# CONFIGURATION
# =============================================================================

load_dotenv()

# API Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MODEL_NAME = "gemini-2.0-flash"

# Processing Limits
MAX_ARTICLES = 20  # Number of Wikipedia articles to process
MAX_SUMMARY_WORDS = 500  # Maximum words to extract from each article
API_DELAY_SECONDS = 1.5  # Delay between Gemini API calls (rate limiting)

# Output Configuration
OUTPUT_FILE = "seed_generated.sql"

# Exclusion patterns for meta pages
EXCLUDED_PATTERNS = [
    "Main_Page",
    "Special:",
    "Wikipedia:",
    "Portal:",
    "Help:",
    "File:",
    "Category:",
    "Template:",
    "Talk:",
    "User:",
    "MediaWiki:",
    "Book:",
    "Draft:",
    "TimedText:",
    "Module:",
]


# =============================================================================
# GEMINI PROMPT TEMPLATE
# =============================================================================

SYSTEM_INSTRUCTION = """
You are a trivia question generator for a Wikipedia quiz game called "Wiki Guesser". 
Given an article title and summary, generate exactly 4 quiz questions in JSON format.

You MUST return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "odd_wiki_out": {
    "items": ["item1", "item2", "item3", "impostor"],
    "impostor_index": 3,
    "connection": "What connects the 3 correct items",
    "topic": "category tag (e.g., Science, History, Sports, Entertainment)"
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
    "explanation": "Why this is true/false (cite the article fact)",
    "topic": "category tag"
  },
  "wiki_links": {
    "titles": ["Article1", "Article2", "Article3", "Article4"],
    "connection": "What connects these 4 articles",
    "connection_options": ["Correct answer", "Wrong1", "Wrong2", "Wrong3"],
    "topic": "category tag"
  }
}

CRITICAL RULES:
1. All items/titles arrays must have EXACTLY 4 elements
2. impostor_index must be 0, 1, 2, or 3 (corresponding to the impostor's position)
3. year_options must include correct_year as one of the 4 options
4. connection_options[0] MUST be the correct connection (it gets shuffled later)
5. For odd_wiki_out: 3 items belong together, 1 is the impostor (doesn't fit)
6. For wiki_links: Use REAL Wikipedia article titles that exist
7. Make questions challenging but fair - based on real facts
8. Use diverse topic tags: Science, History, Technology, Sports, Entertainment, Geography, Arts, Politics
9. Events in when_in_wiki should have verifiable years
10. wiki_or_fiction statements should be surprising but accurate
"""


# =============================================================================
# HELPER FUNCTIONS: Wikipedia Fetching
# =============================================================================

def get_top_articles(count: int = 100) -> list[str]:
    """
    Fetch the most-viewed Wikipedia articles from the last 30 days.
    Returns a list of article titles (already filtered for meta pages).
    """
    print(f"\n📡 Fetching top {count} Wikipedia articles from pageviews...")
    
    # Calculate date range (last 30 days)
    end_date = datetime.now() - timedelta(days=1)
    start_date = end_date - timedelta(days=30)
    
    try:
        # Get pageview data for the last month
        result = pageview_period.top(
            project="en.wikipedia",
            access="all-access",
            year=end_date.year,
            month=f"{end_date.month:02d}",
            day=f"{end_date.day:02d}",
            limit=count * 2  # Fetch more to account for filtering
        )
        
        articles = []
        if result and "items" in result:
            for item in result["items"]:
                if "articles" in item:
                    for article in item["articles"]:
                        title = article.get("article", "")
                        # Filter out meta pages
                        if not any(pattern in title for pattern in EXCLUDED_PATTERNS):
                            # Replace underscores with spaces for readability
                            articles.append(title.replace("_", " "))
                            if len(articles) >= count:
                                break
                        
        print(f"✅ Found {len(articles)} valid articles")
        return articles[:count]
        
    except Exception as e:
        print(f"❌ Error fetching pageviews: {e}")
        print("   Falling back to curated popular topics...")
        return get_fallback_articles(count)


def get_fallback_articles(count: int) -> list[str]:
    """
    Fallback list of popular Wikipedia topics in case pageview API fails.
    """
    fallback = [
        "Albert Einstein", "World War II", "The Beatles", "Moon landing",
        "Leonardo da Vinci", "Eiffel Tower", "Amazon River", "Olympics",
        "William Shakespeare", "Ancient Egypt", "Great Wall of China",
        "Artificial intelligence", "Solar System", "Renaissance",
        "Michael Jackson", "Great Barrier Reef", "Roman Empire",
        "Charles Darwin", "Mount Everest", "Pablo Picasso",
        "French Revolution", "Internet", "Quantum mechanics",
        "Vincent van Gogh", "Napoleon Bonaparte", "Climate change"
    ]
    random.shuffle(fallback)
    return fallback[:count]


def get_article_summary(title: str, max_words: int = 500) -> Optional[str]:
    """
    Fetch the summary of a Wikipedia article using wikipedia-api.
    Returns the first N words of the article summary.
    """
    wiki = wikipediaapi.Wikipedia(
        user_agent="WikiGuesserBot/1.0 (https://wiki-guesser.vercel.app)",
        language="en"
    )
    
    try:
        page = wiki.page(title)
        if not page.exists():
            print(f"   ⚠️ Article '{title}' not found")
            return None
            
        summary = page.summary
        words = summary.split()
        truncated = " ".join(words[:max_words])
        return truncated
        
    except Exception as e:
        print(f"   ❌ Error fetching '{title}': {e}")
        return None


# =============================================================================
# HELPER FUNCTIONS: Gemini Question Generation
# =============================================================================

def initialize_gemini() -> Optional[genai.GenerativeModel]:
    """
    Initialize the Gemini model with API key and configuration.
    """
    if not GOOGLE_API_KEY:
        print("❌ ERROR: GOOGLE_API_KEY not set!")
        print("   Set it in your environment or create a .env file")
        return None
        
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            system_instruction=SYSTEM_INSTRUCTION,
            generation_config={
                "temperature": 0.8,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 2048,
            }
        )
        print(f"✅ Initialized {MODEL_NAME} model")
        return model
    except Exception as e:
        print(f"❌ Error initializing Gemini: {e}")
        return None


def generate_questions(model: genai.GenerativeModel, title: str, summary: str) -> Optional[dict]:
    """
    Call Gemini API to generate quiz questions for an article.
    Returns parsed JSON or None on failure.
    """
    prompt = f"""
Generate 4 quiz questions based on this Wikipedia article:

**Article Title:** {title}

**Article Summary:**
{summary}

Remember: Return ONLY valid JSON (no markdown, no code blocks). The first connection_option must be the correct answer.
"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up response (remove markdown code blocks if present)
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
        response_text = response_text.strip()
        
        # Parse JSON
        questions = json.loads(response_text)
        
        # Validate structure
        required_keys = ["odd_wiki_out", "when_in_wiki", "wiki_or_fiction", "wiki_links"]
        if not all(key in questions for key in required_keys):
            print("   ⚠️ Missing required keys in response")
            return None
            
        return questions
        
    except json.JSONDecodeError as e:
        print(f"   ⚠️ JSON parse error: {e}")
        return None
    except Exception as e:
        print(f"   ❌ Gemini API error: {e}")
        return None


# =============================================================================
# HELPER FUNCTIONS: SQL Generation
# =============================================================================

def escape_sql_string(s: str) -> str:
    """Escape single quotes for SQL strings."""
    if s is None:
        return ""
    return str(s).replace("'", "''")


def format_array_for_sql(items: list) -> str:
    """Format a Python list as a PostgreSQL array literal."""
    if not items:
        return "ARRAY[]::TEXT[]"
    escaped = [escape_sql_string(str(item)) for item in items]
    return "ARRAY[" + ", ".join(f"'{item}'" for item in escaped) + "]"


def format_int_array_for_sql(items: list) -> str:
    """Format a Python list of integers as a PostgreSQL array literal."""
    return "ARRAY[" + ", ".join(str(int(item)) for item in items) + "]"


def generate_sql_insert(category: str, data: dict, wikipedia_url: str) -> str:
    """
    Generate SQL INSERT statement for a question category.
    """
    url = escape_sql_string(wikipedia_url)
    
    if category == "odd_wiki_out":
        items = format_array_for_sql(data.get("items", []))
        impostor = int(data.get("impostor_index", 0))
        connection = escape_sql_string(data.get("connection", ""))
        topic = escape_sql_string(data.get("topic", ""))
        
        return f"""INSERT INTO odd_wiki_out_questions (items, impostor_index, connection, topic, wikipedia_url)
VALUES ({items}, {impostor}, '{connection}', '{topic}', '{url}');"""

    elif category == "when_in_wiki":
        event = escape_sql_string(data.get("event", ""))
        correct_year = int(data.get("correct_year", 2000))
        year_options = format_int_array_for_sql(data.get("year_options", [2000, 2001, 2002, 2003]))
        topic = escape_sql_string(data.get("topic", ""))
        
        return f"""INSERT INTO when_in_wiki_questions (event, correct_year, year_options, topic, wikipedia_url)
VALUES ('{event}', {correct_year}, {year_options}, '{topic}', '{url}');"""

    elif category == "wiki_or_fiction":
        statement = escape_sql_string(data.get("statement", ""))
        is_true = "true" if data.get("is_true", False) else "false"
        explanation = escape_sql_string(data.get("explanation", ""))
        topic = escape_sql_string(data.get("topic", ""))
        
        return f"""INSERT INTO wiki_or_fiction_questions (statement, is_true, explanation, topic, wikipedia_url)
VALUES ('{statement}', {is_true}, '{explanation}', '{topic}', '{url}');"""

    elif category == "wiki_links":
        titles = format_array_for_sql(data.get("titles", []))
        connection = escape_sql_string(data.get("connection", ""))
        # Shuffle options so correct answer isn't always first
        options = data.get("connection_options", ["", "", "", ""])
        if options and len(options) >= 4:
            # Keep track of correct answer, shuffle, then update
            correct = options[0]
            random.shuffle(options)
            options_sql = format_array_for_sql(options)
        else:
            options_sql = format_array_for_sql(options)
        topic = escape_sql_string(data.get("topic", ""))
        
        return f"""INSERT INTO wiki_links_questions (titles, connection, connection_options, topic, wikipedia_url)
VALUES ({titles}, '{connection}', {options_sql}, '{topic}', '{url}');"""
    
    return ""


# =============================================================================
# MAIN EXECUTION
# =============================================================================

def main():
    """
    Main execution flow:
    1. Initialize Gemini model
    2. Fetch top Wikipedia articles
    3. For each article: fetch summary, generate questions, create SQL
    4. Write all SQL to output file
    """
    print("=" * 60)
    print("🎮 Wiki Guesser - Bulk Question Generator")
    print("=" * 60)
    
    # Initialize Gemini
    model = initialize_gemini()
    if not model:
        return
    
    # Fetch top articles
    articles = get_top_articles(MAX_ARTICLES * 2)  # Get extra in case some fail
    if not articles:
        print("❌ No articles to process")
        return
    
    # Track all generated SQL statements
    sql_statements = {
        "odd_wiki_out": [],
        "when_in_wiki": [],
        "wiki_or_fiction": [],
        "wiki_links": []
    }
    
    processed = 0
    success = 0
    
    print(f"\n📝 Processing {MAX_ARTICLES} articles...")
    print("-" * 40)
    
    for title in articles:
        if processed >= MAX_ARTICLES:
            break
            
        processed += 1
        print(f"\n[{processed}/{MAX_ARTICLES}] {title}")
        
        # Fetch article summary
        summary = get_article_summary(title, MAX_SUMMARY_WORDS)
        if not summary:
            continue
        print(f"   📖 Got {len(summary.split())} words")
        
        # Generate questions via Gemini
        questions = generate_questions(model, title, summary)
        if not questions:
            continue
        print("   ✨ Generated questions")
        
        # Create Wikipedia URL
        wiki_url = f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"
        
        # Generate SQL for each category
        for category in sql_statements.keys():
            if category in questions:
                sql = generate_sql_insert(category, questions[category], wiki_url)
                if sql:
                    sql_statements[category].append(sql)
        
        success += 1
        
        # Rate limiting delay
        if processed < MAX_ARTICLES:
            time.sleep(API_DELAY_SECONDS)
    
    # Write output file
    print(f"\n{'=' * 40}")
    print("📁 Writing SQL to file...")
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("-- Wiki Guesser - Generated Questions\n")
        f.write(f"-- Generated on {datetime.now().isoformat()}\n")
        f.write(f"-- Articles processed: {success}/{processed}\n")
        f.write(f"-- Total questions: {sum(len(v) for v in sql_statements.values())}\n\n")
        
        for category, statements in sql_statements.items():
            if statements:
                f.write(f"\n-- =============================================================================\n")
                f.write(f"-- {category.upper().replace('_', ' ')} ({len(statements)} questions)\n")
                f.write(f"-- =============================================================================\n\n")
                for sql in statements:
                    f.write(sql + "\n\n")
    
    # Summary
    print(f"\n{'=' * 60}")
    print("📊 SUMMARY")
    print("-" * 40)
    print(f"   Articles processed: {success}/{processed}")
    for category, statements in sql_statements.items():
        print(f"   {category}: {len(statements)} questions")
    print(f"   Total: {sum(len(v) for v in sql_statements.values())} questions")
    print(f"\n✅ Output written to: {OUTPUT_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()
