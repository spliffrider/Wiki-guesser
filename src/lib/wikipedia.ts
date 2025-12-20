// Wiki Guesser - Wikipedia API Integration

import { WikiTopic, WikiSearchResult } from '@/types';

const WIKI_API_BASE = 'https://en.wikipedia.org/api/rest_v1';
const WIKI_ACTION_API = 'https://en.wikipedia.org/w/api.php';

/**
 * Fetches random Wikipedia articles
 */
export async function getRandomTopics(count: number = 5): Promise<WikiTopic[]> {
    try {
        // Use the random article API
        const response = await fetch(
            `${WIKI_ACTION_API}?action=query&list=random&rnnamespace=0&rnlimit=${count}&format=json&origin=*`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch random articles');
        }

        const data = await response.json();
        const randomPages = data.query.random;

        // Fetch details for each random article
        const topics = await Promise.all(
            randomPages.map((page: { title: string }) => getArticleDetails(page.title))
        );

        // Filter out any failed fetches
        return topics.filter((topic): topic is WikiTopic => topic !== null);
    } catch (error) {
        console.error('Error fetching random topics:', error);
        return [];
    }
}

/**
 * Fetches detailed information about a specific Wikipedia article
 */
export async function getArticleDetails(title: string): Promise<WikiTopic | null> {
    try {
        // Fetch summary from REST API
        const encodedTitle = encodeURIComponent(title);
        const response = await fetch(
            `${WIKI_API_BASE}/page/summary/${encodedTitle}`
        );

        if (!response.ok) {
            // Article might not exist or be a redirect
            return null;
        }

        const data = await response.json();

        // Skip disambiguation pages and lists
        if (data.type === 'disambiguation' || data.title.startsWith('List of')) {
            return null;
        }

        // Get categories
        const categories = await getArticleCategories(title);

        return {
            id: data.pageid?.toString() || title,
            title: data.title,
            excerpt: data.extract || '',
            imageUrl: data.thumbnail?.source || data.originalimage?.source || null,
            categories: categories.slice(0, 5), // Limit to 5 categories
            pageUrl: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodedTitle}`,
        };
    } catch (error) {
        console.error(`Error fetching article details for "${title}":`, error);
        return null;
    }
}

/**
 * Fetches categories for a Wikipedia article
 */
async function getArticleCategories(title: string): Promise<string[]> {
    try {
        const response = await fetch(
            `${WIKI_ACTION_API}?action=query&titles=${encodeURIComponent(title)}&prop=categories&cllimit=10&clshow=!hidden&format=json&origin=*`
        );

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        const categories = pages[pageId]?.categories || [];

        return categories.map((cat: { title: string }) =>
            cat.title.replace('Category:', '')
        );
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

/**
 * Search Wikipedia for autocomplete suggestions
 */
export async function searchArticles(query: string): Promise<WikiSearchResult[]> {
    if (!query || query.length < 2) {
        return [];
    }

    try {
        const response = await fetch(
            `${WIKI_ACTION_API}?action=opensearch&search=${encodeURIComponent(query)}&limit=8&namespace=0&format=json&origin=*`
        );

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const [, titles, descriptions] = await response.json();

        return titles.map((title: string, index: number) => ({
            title,
            description: descriptions[index] || undefined,
        }));
    } catch (error) {
        console.error('Error searching articles:', error);
        return [];
    }
}

/**
 * Check if a guess matches the target title (fuzzy matching)
 */
export function checkAnswer(guess: string, correctTitle: string): boolean {
    // Normalize both strings
    const normalizedGuess = normalizeTitle(guess);
    const normalizedCorrect = normalizeTitle(correctTitle);

    // Exact match
    if (normalizedGuess === normalizedCorrect) {
        return true;
    }

    // Check if guess is contained in correct or vice versa
    // (handles cases like "Albert Einstein" vs "Einstein")
    if (normalizedCorrect.includes(normalizedGuess) || normalizedGuess.includes(normalizedCorrect)) {
        // Only count if at least 60% of the longer string matches
        const longer = Math.max(normalizedGuess.length, normalizedCorrect.length);
        const shorter = Math.min(normalizedGuess.length, normalizedCorrect.length);
        if (shorter / longer >= 0.6) {
            return true;
        }
    }

    // Calculate Levenshtein distance for typo tolerance
    const distance = levenshteinDistance(normalizedGuess, normalizedCorrect);
    const maxLength = Math.max(normalizedGuess.length, normalizedCorrect.length);
    const similarity = 1 - (distance / maxLength);

    // Accept if 85% similar (allows for minor typos)
    return similarity >= 0.85;
}

/**
 * Normalize a title for comparison
 */
function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ')     // Normalize whitespace
        .trim();
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Redact answer words from excerpt to prevent giving away the answer
 * This is more aggressive to ensure the answer isn't revealed
 */
export function redactExcerpt(excerpt: string, title: string): string {
    let redacted = excerpt;

    // First, redact the full title (case insensitive)
    const fullTitleRegex = new RegExp(escapeRegex(title), 'gi');
    redacted = redacted.replace(fullTitleRegex, (match) => '█'.repeat(match.length));

    // Get individual words from title (excluding common words)
    const commonWords = new Set(['the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'and', 'or', 'is', 'was', 'are', 'were', 'be', 'been', 'being']);
    const titleWords = title
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(/\s+/)
        .filter(word => word.length > 2 && !commonWords.has(word));

    // Redact each title word and common variations
    titleWords.forEach(word => {
        // Match the word, its possessive, and plural forms
        const variations = [
            word,           // exact
            word + 's',     // plural
            word + "'s",    // possessive
            word + 'es',    // plural variant
            word + 'ed',    // past tense
            word + 'ing',   // present participle
        ];

        variations.forEach(variant => {
            const regex = new RegExp(`\\b${escapeRegex(variant)}\\b`, 'gi');
            redacted = redacted.replace(regex, (match) => '█'.repeat(match.length));
        });
    });

    return redacted;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

