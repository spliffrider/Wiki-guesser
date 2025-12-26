// Wiki Guesser - Wikipedia API Utility
// Fetches article data from Wikipedia REST API

export interface WikipediaArticle {
    title: string;
    extract: string;
    thumbnail?: string;
    description?: string;
}

/**
 * Extract article title from Wikipedia URL
 * Supports: https://en.wikipedia.org/wiki/Article_Title
 */
function extractTitleFromUrl(url: string): string | null {
    try {
        const urlObj = new URL(url);
        // Check if it's a Wikipedia URL
        if (!urlObj.hostname.includes('wikipedia.org')) {
            return null;
        }
        // Extract title from /wiki/Title path
        const match = urlObj.pathname.match(/\/wiki\/(.+)/);
        if (match) {
            return decodeURIComponent(match[1].replace(/_/g, ' '));
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Fetch article data from Wikipedia API
 * Uses the REST API summary endpoint
 */
export async function fetchWikipediaArticle(url: string): Promise<WikipediaArticle | null> {
    const title = extractTitleFromUrl(url);
    if (!title) {
        throw new Error('Invalid Wikipedia URL. Please use a URL like: https://en.wikipedia.org/wiki/Article_Title');
    }

    // Detect language from URL (default to English)
    const urlObj = new URL(url);
    const langMatch = urlObj.hostname.match(/^(\w+)\.wikipedia\.org/);
    const lang = langMatch ? langMatch[1] : 'en';

    // Use Wikipedia REST API for summary
    const apiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'WikiGuesser/1.0 (Educational Quiz Game)'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Article "${title}" not found on Wikipedia`);
            }
            throw new Error('Failed to fetch article from Wikipedia');
        }

        const data = await response.json();

        return {
            title: data.title,
            extract: data.extract || '',
            thumbnail: data.thumbnail?.source || data.originalimage?.source,
            description: data.description
        };
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to connect to Wikipedia API');
    }
}

/**
 * Check if a string is a valid Wikipedia URL
 */
export function isValidWikipediaUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('wikipedia.org') && urlObj.pathname.startsWith('/wiki/');
    } catch {
        return false;
    }
}

/**
 * Fetch a random Wikipedia article URL
 * Uses the Wikipedia API random list generator
 */
export async function fetchRandomWikipediaUrl(lang: string = 'en'): Promise<string> {
    const apiUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json&origin=*`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch random article');
        }

        const data = await response.json();
        const article = data.query?.random?.[0];

        if (article && article.title) {
            // Encode spaces as underscores for URL
            const encodedTitle = article.title.replace(/ /g, '_');
            // Encode other characters properly
            return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(encodedTitle)}`;
        }

        throw new Error('No random article found');
    } catch (error) {
        console.error('Error fetching random Wikipedia URL:', error);
        throw error;
    }
}
