#!/usr/bin/env python3
"""
Wiki Guesser - Open Trivia DB Importer
=======================================
Fetches trivia questions from the Open Trivia Database (opentdb.com)
and generates SQL INSERT statements for the wiki_or_fiction_questions table.

Usage:
    python opentdb_importer.py

No API key required! Rate limit: 1 request per 5 seconds.
"""

import json
import time
import random
import html
from datetime import datetime
from urllib.request import urlopen
from urllib.error import URLError

# =============================================================================
# CONFIGURATION
# =============================================================================

# Open Trivia DB API endpoint
API_BASE = "https://opentdb.com/api.php"

# How many questions to fetch per category (max 50 per request)
QUESTIONS_PER_CATEGORY = 20

# Delay between API calls (seconds) - API rate limit is 1 per 5 seconds
API_DELAY = 5.5

# Output file
OUTPUT_FILE = "seed_opentdb.sql"

# Categories to fetch (category_id: name) - from opentdb.com/api_category.php
CATEGORIES = {
    9: "General Knowledge",
    17: "Science & Nature",
    18: "Computers",
    21: "Sports",
    22: "Geography",
    23: "History",
    24: "Politics",
    25: "Art",
    26: "Celebrities",
    27: "Animals",
}


# =============================================================================
# API FETCHING
# =============================================================================

def fetch_questions(category_id: int, amount: int = 20, difficulty: str = None) -> list:
    """
    Fetch questions from Open Trivia DB API.
    
    Args:
        category_id: The category ID to fetch from
        amount: Number of questions (max 50)
        difficulty: Optional - 'easy', 'medium', 'hard'
    
    Returns:
        List of question dictionaries
    """
    url = f"{API_BASE}?amount={amount}&category={category_id}&type=boolean&encode=url3986"
    if difficulty:
        url += f"&difficulty={difficulty}"
    
    try:
        with urlopen(url, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
            
        if data.get("response_code") == 0:
            return data.get("results", [])
        elif data.get("response_code") == 1:
            print(f"   ⚠️ Not enough questions in category {category_id}")
            return []
        else:
            print(f"   ❌ API error code: {data.get('response_code')}")
            return []
            
    except URLError as e:
        print(f"   ❌ Network error: {e}")
        return []
    except json.JSONDecodeError as e:
        print(f"   ❌ JSON parse error: {e}")
        return []


def decode_question(q: dict) -> dict:
    """Decode URL-encoded question data."""
    from urllib.parse import unquote
    return {
        "category": unquote(q.get("category", "")),
        "difficulty": q.get("difficulty", "medium"),
        "question": unquote(q.get("question", "")),
        "correct_answer": unquote(q.get("correct_answer", "")),
    }


# =============================================================================
# TRANSFORMATION: Open Trivia DB -> Wiki or Fiction format
# =============================================================================

def transform_to_wiki_or_fiction(question: dict, category_name: str) -> dict:
    """
    Transform an Open Trivia DB boolean question to wiki_or_fiction format.
    
    Open Trivia DB boolean questions have:
    - question: The statement
    - correct_answer: "True" or "False"
    
    Wiki or Fiction needs:
    - statement: The claim
    - is_true: boolean
    - explanation: Why it's true/false
    - topic: category tag
    - wikipedia_url: Link to Wikipedia
    """
    statement = question["question"]
    is_true = question["correct_answer"].lower() == "true"
    
    # Generate a simple explanation based on the answer
    if is_true:
        explanation = f"This is a verified fact from the category: {category_name}."
    else:
        explanation = f"This is actually false. This is a common misconception in the field of {category_name}."
    
    # Create a Wikipedia search URL (not a direct article URL, but useful)
    # Extract key terms from the question for the Wikipedia link
    search_terms = statement.replace("?", "").replace(".", "").split()[:5]
    wiki_search = "+".join(search_terms)
    wikipedia_url = f"https://en.wikipedia.org/wiki/Special:Search?search={wiki_search}"
    
    return {
        "statement": statement,
        "is_true": is_true,
        "explanation": explanation,
        "topic": category_name,
        "wikipedia_url": wikipedia_url
    }


# =============================================================================
# SQL GENERATION
# =============================================================================

def escape_sql_string(s: str) -> str:
    """Escape single quotes for SQL strings."""
    if s is None:
        return ""
    # Decode HTML entities first
    s = html.unescape(str(s))
    return s.replace("'", "''")


def generate_sql_insert(data: dict) -> str:
    """Generate SQL INSERT statement for wiki_or_fiction_questions."""
    statement = escape_sql_string(data["statement"])
    is_true = "true" if data["is_true"] else "false"
    explanation = escape_sql_string(data["explanation"])
    topic = escape_sql_string(data["topic"])
    url = escape_sql_string(data["wikipedia_url"])
    
    return f"""INSERT INTO wiki_or_fiction_questions (statement, is_true, explanation, topic, wikipedia_url)
VALUES ('{statement}', {is_true}, '{explanation}', '{topic}', '{url}');"""


# =============================================================================
# MAIN EXECUTION
# =============================================================================

def main():
    print("=" * 60)
    print("🎮 Wiki Guesser - Open Trivia DB Importer")
    print("=" * 60)
    print(f"\nFetching {QUESTIONS_PER_CATEGORY} boolean questions from {len(CATEGORIES)} categories...")
    print(f"Rate limit delay: {API_DELAY}s between requests\n")
    
    all_questions = []
    
    for cat_id, cat_name in CATEGORIES.items():
        print(f"📚 Fetching: {cat_name} (ID: {cat_id})")
        
        questions = fetch_questions(cat_id, QUESTIONS_PER_CATEGORY)
        
        if questions:
            decoded = [decode_question(q) for q in questions]
            transformed = [transform_to_wiki_or_fiction(q, cat_name) for q in decoded]
            all_questions.extend(transformed)
            print(f"   ✅ Got {len(questions)} questions")
        else:
            print(f"   ⚠️ No questions retrieved")
        
        # Rate limiting
        time.sleep(API_DELAY)
    
    print(f"\n{'=' * 40}")
    print(f"📊 Total questions: {len(all_questions)}")
    
    # Generate SQL
    print(f"📁 Writing SQL to: {OUTPUT_FILE}")
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("-- Wiki Guesser - Open Trivia DB Import\n")
        f.write(f"-- Generated on {datetime.now().isoformat()}\n")
        f.write(f"-- Source: opentdb.com (Creative Commons BY-SA 4.0)\n")
        f.write(f"-- Total questions: {len(all_questions)}\n\n")
        
        f.write("-- =============================================================================\n")
        f.write("-- WIKI OR FICTION QUESTIONS\n")
        f.write("-- =============================================================================\n\n")
        
        for q in all_questions:
            sql = generate_sql_insert(q)
            f.write(sql + "\n\n")
    
    print(f"\n✅ Done! Generated {len(all_questions)} questions.")
    print(f"   Run the SQL in Supabase SQL Editor to import.")
    print("=" * 60)


if __name__ == "__main__":
    main()
