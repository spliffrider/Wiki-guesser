// Wiki Guesser - Supabase Question Fetchers
// Fetches curated questions from Supabase tables

import { getSupabaseClient, supabaseFetch } from './supabase';
import {
    OddWikiOutData,
    WhenInWikiData,
    WikiOrFictionData,
    WikiLinksData,
    WikiTopic,
} from '@/types';
import {
    UserSubmittedQuestion,
    OddWikiOutQuestionData,
    WhenInWikiQuestionData,
    WikiOrFictionQuestionData,
    WikiLinksQuestionData,
    WikiWhatQuestionData,
} from '../types/ugc';

// Database row types (snake_case from Supabase)
interface OddWikiOutRow {
    id: string;
    items: string[];
    impostor_index: number;
    connection: string;
    topic: string | null;
    wikipedia_url: string;
    image_url: string | null;
    created_at: string;
}

interface WhenInWikiRow {
    id: string;
    event: string;
    correct_year: number;
    year_options: number[];
    topic: string | null;
    wikipedia_url: string;
    image_url: string | null;
    created_at: string;
}

interface WikiOrFictionRow {
    id: string;
    statement: string;
    is_true: boolean;
    explanation: string;
    topic: string | null;
    wikipedia_url: string;
    image_url: string | null;
    created_at: string;
}

interface WikiLinksRow {
    id: string;
    titles: string[];
    connection: string;
    connection_options: string[];
    topic: string | null;
    wikipedia_url: string;
    image_url: string | null;
    created_at: string;
}

interface WikiWhatRow {
    id: string;
    title: string;
    excerpt: string;
    image_url: string | null;
    page_url: string;
    wrong_options: string[];
    topic: string | null;
    created_at: string;
}

/**
 * Fisher-Yates shuffle for randomizing results
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Wrap a promise with a timeout to prevent silent hangs
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<T>((resolve) => {
        timeoutId = setTimeout(() => {
            console.warn(`[supabaseQuestions] Query timed out after ${timeoutMs}ms, using fallback`);
            resolve(fallback);
        }, timeoutMs);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId!);
        return result;
    } catch (err) {
        clearTimeout(timeoutId!);
        throw err;
    }
}

const QUERY_TIMEOUT_MS = 15000; // 15 second timeout

/**
 * Fetch random "Odd Wiki Out" questions from Supabase.
 * Falls back to empty array on error.
 * @param count Number of questions to fetch
 * @returns Array of OddWikiOutData
 */
export async function getRandomOddWikiOutFromDB(count: number): Promise<OddWikiOutData[]> {
    if (typeof window === 'undefined') return [];

    const fetchQuestions = async (): Promise<OddWikiOutData[]> => {
        const limit = count * 3;

        // 1. Fetch from main table via direct fetch
        const mainData = await supabaseFetch('odd_wiki_out_questions', `select=*&order=created_at.desc&limit=${limit}`);

        // 2. Fetch from curated UGC via direct fetch
        const ugcData = await supabaseFetch('user_submitted_questions', `status=eq.curated&category=eq.odd_wiki_out&select=*&order=created_at.desc&limit=${limit}`);

        // 3. Map and Combine
        const mainMapped = (mainData as OddWikiOutRow[] || []).map((row: OddWikiOutRow) => ({
            id: `odd_wiki_out_${row.id}`,  // Format for rating system
            items: row.items,
            impostorIndex: row.impostor_index,
            connection: row.connection,
            topic: row.topic || '',
            source: row.wikipedia_url,
        }));

        const ugcMapped = (ugcData || []).map((_row: unknown) => {
            const row = _row as UserSubmittedQuestion;
            // Mapping JSONB question_data to game format
            // In UGC schema, keys are camelCase: items, impostorIndex, connection, topic
            const q = row.question_data as OddWikiOutQuestionData;
            return {
                id: `user_submitted_${row.id}`,  // Format for rating system
                items: q.items,
                impostorIndex: q.impostorIndex,
                connection: q.connection,
                topic: q.topic || '',
                source: `https://en.wikipedia.org/wiki/${encodeURIComponent(q.items?.[0] || '')}`, // Fallback source
                isUGC: true, // Optional flag for UI
                author: row.user_id // Could fetch username if needed
            };
        });

        // 4. Shuffle combined pool
        const combined = [...mainMapped, ...ugcMapped];
        return shuffleArray(combined).slice(0, count);
    };

    try {
        return await withTimeout(fetchQuestions(), QUERY_TIMEOUT_MS, []);
    } catch (err) {
        console.error('[supabaseQuestions] Unexpected error in getRandomOddWikiOutFromDB:', err);
        return [];
    }
}

/**
 * Fetch random "When In Wiki" questions from Supabase.
 * Falls back to empty array on error.
 * @param count Number of questions to fetch
 * @returns Array of WhenInWikiData
 */
export async function getRandomWhenInWikiFromDB(count: number): Promise<WhenInWikiData[]> {
    if (typeof window === 'undefined') return [];

    const fetchQuestions = async (): Promise<WhenInWikiData[]> => {
        const limit = count * 3;

        // 1. Fetch from main table via direct fetch
        const mainData = await supabaseFetch('when_in_wiki_questions', `select=*&order=created_at.desc&limit=${limit}`);

        // 2. Fetch from curated UGC via direct fetch
        const ugcData = await supabaseFetch('user_submitted_questions', `status=eq.curated&category=eq.when_in_wiki&select=*&order=created_at.desc&limit=${limit}`);

        // 3. Map and Combine
        const mainMapped = (mainData as WhenInWikiRow[] || []).map((row: WhenInWikiRow) => ({
            id: `when_in_wiki_${row.id}`,  // Format for rating system
            event: row.event,
            correctYear: row.correct_year,
            yearOptions: row.year_options,
            topic: row.topic || '',
            source: row.wikipedia_url,
        }));

        const ugcMapped = (ugcData || []).map((_row: unknown) => {
            const row = _row as UserSubmittedQuestion;
            const q = row.question_data as WhenInWikiQuestionData;
            return {
                id: `user_submitted_${row.id}`,  // Format for rating system
                event: q.event,
                correctYear: q.correctYear,
                yearOptions: q.yearOptions,
                topic: q.topic || '',
                source: '', // No specific source stored usually for this type in simple form
                isUGC: true
            };
        });

        // 4. Shuffle combined pool
        const combined = [...mainMapped, ...ugcMapped];
        return shuffleArray(combined).slice(0, count);
    };

    try {
        return await withTimeout(fetchQuestions(), QUERY_TIMEOUT_MS, []);
    } catch (err) {
        console.error('[supabaseQuestions] Unexpected error in getRandomWhenInWikiFromDB:', err);
        return [];
    }
}

/**
 * Fetch random "Wiki Or Fiction" questions from Supabase.
 * Falls back to empty array on error.
 * @param count Number of questions to fetch
 * @returns Array of WikiOrFictionData
 */
export async function getRandomWikiOrFictionFromDB(count: number): Promise<WikiOrFictionData[]> {
    if (typeof window === 'undefined') return [];

    const fetchQuestions = async (): Promise<WikiOrFictionData[]> => {
        const limit = count * 3;

        // 1. Fetch from main table via direct fetch
        const mainData = await supabaseFetch('wiki_or_fiction_questions', `select=*&order=created_at.desc&limit=${limit}`);

        // 2. Fetch from curated UGC via direct fetch
        const ugcData = await supabaseFetch('user_submitted_questions', `status=eq.curated&category=eq.wiki_or_fiction&select=*&order=created_at.desc&limit=${limit}`);

        // 3. Map and Combine
        const mainMapped = (mainData as WikiOrFictionRow[] || []).map((row: WikiOrFictionRow) => ({
            id: `wiki_or_fiction_${row.id}`,  // Format for rating system
            statement: row.statement,
            isTrue: row.is_true,
            explanation: row.explanation,
            topic: row.topic || '',
            source: row.wikipedia_url,
        }));

        const ugcMapped = (ugcData || []).map((_row: unknown) => {
            const row = _row as UserSubmittedQuestion;
            const q = row.question_data as WikiOrFictionQuestionData;
            return {
                id: `user_submitted_${row.id}`,  // Format for rating system
                statement: q.statement,
                isTrue: q.isTrue,
                explanation: q.explanation,
                topic: q.topic || '',
                source: q.source || '',
                isUGC: true
            };
        });

        // 4. Shuffle combined pool
        const combined = [...mainMapped, ...ugcMapped];
        return shuffleArray(combined).slice(0, count);
    };

    try {
        return await withTimeout(fetchQuestions(), QUERY_TIMEOUT_MS, []);
    } catch (err) {
        console.error('[supabaseQuestions] Unexpected error in getRandomWikiOrFictionFromDB:', err);
        return [];
    }
}

/**
 * Fetch random "Wiki Links" questions from Supabase.
 * Falls back to empty array on error.
 * @param count Number of questions to fetch
 * @returns Array of WikiLinksData
 */
export async function getRandomWikiLinksFromDB(count: number): Promise<WikiLinksData[]> {
    if (typeof window === 'undefined') return [];

    const fetchQuestions = async (): Promise<WikiLinksData[]> => {
        const limit = count * 3;

        // 1. Fetch from main table via direct fetch
        const mainData = await supabaseFetch('wiki_links_questions', `select=*&order=created_at.desc&limit=${limit}`);

        // 2. Fetch from curated UGC via direct fetch
        const ugcData = await supabaseFetch('user_submitted_questions', `status=eq.curated&category=eq.wiki_links&select=*&order=created_at.desc&limit=${limit}`);

        // 3. Map and Combine
        const mainMapped = (mainData as WikiLinksRow[] || []).map((row: WikiLinksRow) => ({
            id: `wiki_links_${row.id}`,  // Format for rating system
            titles: row.titles,
            connection: row.connection,
            connectionOptions: row.connection_options,
            topic: row.topic || '',
            source: row.wikipedia_url,
        }));

        const ugcMapped = (ugcData || []).map((_row: unknown) => {
            const row = _row as UserSubmittedQuestion;
            const q = row.question_data as WikiLinksQuestionData;
            return {
                id: `user_submitted_${row.id}`,  // Format for rating system
                titles: q.titles,
                connection: q.connection,
                connectionOptions: q.connectionOptions,
                topic: q.topic || '',
                source: '', // Fallback
                isUGC: true
            };
        });

        // 4. Shuffle combined pool
        const combined = [...mainMapped, ...ugcMapped];
        return shuffleArray(combined).slice(0, count);
    };

    try {
        return await withTimeout(fetchQuestions(), QUERY_TIMEOUT_MS, []);
    } catch (err) {
        console.error('[supabaseQuestions] Unexpected error in getRandomWikiLinksFromDB:', err);
        return [];
    }
}

/**
 * Fetch random "Wiki What" questions from Supabase.
 * Returns WikiTopic objects with pre-defined wrong options.
 * Falls back to empty array on error.
 * @param count Number of questions to fetch
 * @returns Array of { topic: WikiTopic, wrongOptions: string[] }
 */
export async function getRandomWikiWhatFromDB(count: number): Promise<Array<{ topic: WikiTopic; wrongOptions: string[] }>> {
    if (typeof window === 'undefined') return [];

    const fetchQuestions = async (): Promise<Array<{ topic: WikiTopic; wrongOptions: string[] }>> => {
        const limit = count * 3;

        // 1. Fetch from main table via direct fetch
        const mainData = await supabaseFetch('wiki_what_questions', `select=*&order=created_at.desc&limit=${limit}`);

        // 2. Fetch from curated UGC via direct fetch
        const ugcData = await supabaseFetch('user_submitted_questions', `status=eq.curated&category=eq.wiki_what&select=*&order=created_at.desc&limit=${limit}`);

        // 3. Map and Combine

        const mainMapped = (mainData as WikiWhatRow[] || []).map((row: WikiWhatRow) => ({
            topic: {
                id: row.id,
                title: row.title,
                excerpt: row.excerpt,
                imageUrl: row.image_url,
                categories: [],
                pageUrl: row.page_url,
            },
            wrongOptions: row.wrong_options,
        }));


        const ugcMapped = (ugcData || []).map((_row: unknown) => {
            const row = _row as UserSubmittedQuestion;
            const q = row.question_data as WikiWhatQuestionData;
            return {
                topic: {
                    id: row.id,
                    title: q.title,
                    excerpt: q.excerpt,
                    imageUrl: q.imageUrl,
                    categories: [],
                    pageUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(q.title || '')}`,
                    isUGC: true
                } as WikiTopic,
                wrongOptions: q.wrongOptions,
            };
        });

        // 4. Shuffle combined pool
        const combined = [...mainMapped, ...ugcMapped];
        return shuffleArray(combined).slice(0, count);
    };

    try {
        return await withTimeout(fetchQuestions(), QUERY_TIMEOUT_MS, []);
    } catch (err) {
        console.error('[supabaseQuestions] Unexpected error in getRandomWikiWhatFromDB:', err);
        return [];
    }
}
