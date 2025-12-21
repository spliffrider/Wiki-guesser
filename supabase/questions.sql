-- Wiki Guesser - Curated Question Tables
-- Run this script in Supabase SQL Editor
-- Creates tables for 4 question categories with proper constraints and RLS

-- =============================================================================
-- ODD WIKI OUT: 4 items, 3 belong together, 1 is the impostor
-- =============================================================================
CREATE TABLE IF NOT EXISTS odd_wiki_out_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    items TEXT[] NOT NULL,
    impostor_index INT NOT NULL,
    connection TEXT NOT NULL,
    wikipedia_url TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Exactly 4 items required
    CONSTRAINT items_length_check CHECK (array_length(items, 1) = 4),
    -- Impostor index must be 0-3
    CONSTRAINT impostor_index_check CHECK (impostor_index >= 0 AND impostor_index <= 3)
);

-- =============================================================================
-- WHEN IN WIKI: Guess the year of a historical event
-- =============================================================================
CREATE TABLE IF NOT EXISTS when_in_wiki_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event TEXT NOT NULL,
    correct_year INT NOT NULL,
    year_options INT[] NOT NULL,
    wikipedia_url TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Exactly 4 year options required
    CONSTRAINT year_options_length_check CHECK (array_length(year_options, 1) = 4),
    -- Correct year must be in options
    CONSTRAINT correct_year_in_options CHECK (correct_year = ANY(year_options))
);

-- =============================================================================
-- WIKI OR FICTION: True or false statements about Wikipedia facts
-- =============================================================================
CREATE TABLE IF NOT EXISTS wiki_or_fiction_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    statement TEXT NOT NULL,
    is_true BOOLEAN NOT NULL,
    explanation TEXT NOT NULL,
    wikipedia_url TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- WIKI LINKS: What connects these 4 Wikipedia articles?
-- =============================================================================
CREATE TABLE IF NOT EXISTS wiki_links_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titles TEXT[] NOT NULL,
    connection TEXT NOT NULL,
    connection_options TEXT[] NOT NULL,
    wikipedia_url TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Exactly 4 titles required
    CONSTRAINT titles_length_check CHECK (array_length(titles, 1) = 4),
    -- Exactly 4 connection options required
    CONSTRAINT connection_options_length_check CHECK (array_length(connection_options, 1) = 4),
    -- Correct connection must be in options
    CONSTRAINT connection_in_options CHECK (connection = ANY(connection_options))
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- Public read access, admin-only write (via Supabase dashboard)
-- =============================================================================

-- Odd Wiki Out
ALTER TABLE odd_wiki_out_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for odd_wiki_out" ON odd_wiki_out_questions;
CREATE POLICY "Public read access for odd_wiki_out" ON odd_wiki_out_questions
    FOR SELECT USING (true);

-- When In Wiki
ALTER TABLE when_in_wiki_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for when_in_wiki" ON when_in_wiki_questions;
CREATE POLICY "Public read access for when_in_wiki" ON when_in_wiki_questions
    FOR SELECT USING (true);

-- Wiki Or Fiction
ALTER TABLE wiki_or_fiction_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for wiki_or_fiction" ON wiki_or_fiction_questions;
CREATE POLICY "Public read access for wiki_or_fiction" ON wiki_or_fiction_questions
    FOR SELECT USING (true);

-- Wiki Links
ALTER TABLE wiki_links_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access for wiki_links" ON wiki_links_questions;
CREATE POLICY "Public read access for wiki_links" ON wiki_links_questions
    FOR SELECT USING (true);

-- =============================================================================
-- INDEXES for better query performance
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_odd_wiki_out_created_at ON odd_wiki_out_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_when_in_wiki_created_at ON when_in_wiki_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wiki_or_fiction_created_at ON wiki_or_fiction_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wiki_links_created_at ON wiki_links_questions(created_at DESC);
