// Question Loader - Loads curated questions from Supabase with JSON fallback

import oddWikiOutData from '@/data/questions/odd-wiki-out.json';
import whenInWikiData from '@/data/questions/when-in-wiki.json';
import wikiOrFictionData from '@/data/questions/wiki-or-fiction.json';
import wikiLinksData from '@/data/questions/wiki-links.json';
import {
    OddWikiOutData,
    WhenInWikiData,
    WikiOrFictionData,
    WikiLinksData,
    QuestionCategory,
    WikiTopic,
} from '@/types';
import {
    getRandomOddWikiOutFromDB,
    getRandomWhenInWikiFromDB,
    getRandomWikiOrFictionFromDB,
    getRandomWikiLinksFromDB,
    getRandomWikiWhatFromDB,
} from './supabaseQuestions';

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ============================================================================
// QUESTION FETCHERS - Try Supabase first, fall back to JSON
// ============================================================================

/**
 * Get random "Odd Wiki Out" questions.
 * Tries Supabase first, falls back to static JSON if empty/error.
 */
export async function getRandomOddWikiOut(count: number = 1): Promise<OddWikiOutData[]> {
    // Try Supabase first
    const dbQuestions = await getRandomOddWikiOutFromDB(count);
    if (dbQuestions.length > 0) {
        return dbQuestions;
    }

    if (count === 0) return [];

    // Fallback to JSON
    console.log('[questions] Falling back to JSON for odd_wiki_out');
    const shuffled = shuffleArray(oddWikiOutData.questions as OddWikiOutData[]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get random "When In Wiki" questions.
 * Tries Supabase first, falls back to static JSON if empty/error.
 */
export async function getRandomWhenInWiki(count: number = 1): Promise<WhenInWikiData[]> {
    // Try Supabase first
    const dbQuestions = await getRandomWhenInWikiFromDB(count);
    if (dbQuestions.length > 0) {
        return dbQuestions;
    }

    if (count === 0) return [];

    // Fallback to JSON
    console.log('[questions] Falling back to JSON for when_in_wiki');
    const shuffled = shuffleArray(whenInWikiData.questions as WhenInWikiData[]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get random "Wiki Or Fiction" questions.
 * Tries Supabase first, falls back to static JSON if empty/error.
 */
export async function getRandomWikiOrFiction(count: number = 1): Promise<WikiOrFictionData[]> {
    // Try Supabase first
    const dbQuestions = await getRandomWikiOrFictionFromDB(count);
    if (dbQuestions.length > 0) {
        return dbQuestions;
    }

    if (count === 0) return [];

    // Fallback to JSON
    console.log('[questions] Falling back to JSON for wiki_or_fiction');
    const shuffled = shuffleArray(wikiOrFictionData.questions as WikiOrFictionData[]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get random "Wiki Links" questions.
 * Tries Supabase first, falls back to static JSON if empty/error.
 */
export async function getRandomWikiLinks(count: number = 1): Promise<WikiLinksData[]> {
    // Try Supabase first
    const dbQuestions = await getRandomWikiLinksFromDB(count);
    if (dbQuestions.length > 0) {
        return dbQuestions;
    }

    if (count === 0) return [];

    // Fallback to JSON
    console.log('[questions] Falling back to JSON for wiki_links');
    const shuffled = shuffleArray(wikiLinksData.questions as WikiLinksData[]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get random "Wiki What" questions.
 * Fetches pre-curated Wikipedia articles from Supabase.
 * Returns empty array if no data (no JSON fallback for this category).
 */
export async function getRandomWikiWhat(count: number = 1): Promise<Array<{ topic: WikiTopic; wrongOptions: string[] }>> {
    const dbQuestions = await getRandomWikiWhatFromDB(count);
    if (dbQuestions.length > 0) {
        return dbQuestions;
    }

    if (count === 0) return [];

    // No JSON fallback for wiki_what - return empty array
    // The game logic should skip this category if no questions available
    console.log('[questions] No wiki_what questions in database');
    return [];
}

// ============================================================================
// SYNCHRONOUS VERSIONS - For backwards compatibility where async isn't needed
// These only use JSON (useful for initial load or when you know DB is empty)
// ============================================================================

export function getRandomOddWikiOutSync(count: number = 1): OddWikiOutData[] {
    const shuffled = shuffleArray(oddWikiOutData.questions as OddWikiOutData[]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getRandomWhenInWikiSync(count: number = 1): WhenInWikiData[] {
    const shuffled = shuffleArray(whenInWikiData.questions as WhenInWikiData[]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getRandomWikiOrFictionSync(count: number = 1): WikiOrFictionData[] {
    const shuffled = shuffleArray(wikiOrFictionData.questions as WikiOrFictionData[]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getRandomWikiLinksSync(count: number = 1): WikiLinksData[] {
    const shuffled = shuffleArray(wikiLinksData.questions as WikiLinksData[]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ============================================================================
// CATEGORY UTILITIES
// ============================================================================

/**
 * Get a random category for variety in gameplay
 */
export function getRandomCategory(): QuestionCategory {
    // All categories now use fast Supabase queries (no live Wikipedia API calls)
    const categories: QuestionCategory[] = [
        'wiki_what',
        'odd_wiki_out',
        'when_in_wiki',
        'wiki_or_fiction',
        'wiki_links',
    ];
    return categories[Math.floor(Math.random() * categories.length)];
}

/**
 * Get display name for category
 */
export function getCategoryDisplayName(category: QuestionCategory): string {
    switch (category) {
        case 'wiki_what':
            return 'Wiki What?';
        case 'odd_wiki_out':
            return 'Odd Wiki Out';
        case 'when_in_wiki':
            return 'When in Wiki?';
        case 'wiki_or_fiction':
            return 'Wiki or Fiction?';
        case 'wiki_links':
            return 'Wiki Links';
    }
}

/**
 * Get prompt text for category
 */
export function getCategoryPrompt(category: QuestionCategory): string {
    switch (category) {
        case 'wiki_what':
            return 'What is this Wikipedia article about?';
        case 'odd_wiki_out':
            return 'Which one doesn\'t belong?';
        case 'when_in_wiki':
            return 'When did this happen?';
        case 'wiki_or_fiction':
            return 'Is this fact true or false?';
        case 'wiki_links':
            return 'What connects these topics?';
    }
}
