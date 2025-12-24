// Wiki Guesser - Supabase Question Fetchers
// Fetches curated questions from Supabase tables

import { getSupabaseClient } from './supabase';
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

const QUERY_TIMEOUT_MS = 5000; // 5 second timeout

/**
 * Fetch random "Odd Wiki Out" questions from Supabase.
 * Falls back to empty array on error.
 * @param count Number of questions to fetch
 * @returns Array of OddWikiOutData
 */
export async function getRandomOddWikiOutFromDB(count: number): Promise<OddWikiOutData[]> {
    if (typeof window === 'undefined') return [];

    const fetchQuestions = async (): Promise<OddWikiOutData[]> => {
        const supabase = getSupabaseClient();
        const limit = count * 3;

        // 1. Fetch from main table
        const { data: mainData, error: mainError } = await supabase
            .from('odd_wiki_out_questions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (mainError) console.error('[supabaseQuestions] Error fetching main odd_wiki_out:', mainError.message);

        // 2. Fetch from curated UGC
        const { data: ugcData, error: ugcError } = await supabase
            .from('user_submitted_questions')
            .select('*')
            .eq('status', 'curated')
            .eq('category', 'odd_wiki_out')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (ugcError) console.error('[supabaseQuestions] Error fetching UGC odd_wiki_out:', ugcError.message);

        // 3. Map and Combine
        const mainMapped = (mainData || []).map((row: OddWikiOutRow) => ({
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
        const supabase = getSupabaseClient();
        const limit = count * 3;

        // 1. Fetch from main table
        const { data: mainData, error: mainError } = await supabase
            .from('when_in_wiki_questions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (mainError) console.error('[supabaseQuestions] Error fetching main when_in_wiki:', mainError.message);

        // 2. Fetch from curated UGC
        const { data: ugcData, error: ugcError } = await supabase
            .from('user_submitted_questions')
            .select('*')
            .eq('status', 'curated')
            .eq('category', 'when_in_wiki')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (ugcError) console.error('[supabaseQuestions] Error fetching UGC when_in_wiki:', ugcError.message);

        // 3. Map and Combine
        const mainMapped = (mainData || []).map((row: WhenInWikiRow) => ({
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
        const supabase = getSupabaseClient();
        const limit = count * 3;

        // 1. Fetch from main table
        const { data: mainData, error: mainError } = await supabase
            .from('wiki_or_fiction_questions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (mainError) console.error('[supabaseQuestions] Error fetching main wiki_or_fiction:', mainError.message);

        // 2. Fetch from curated UGC
        const { data: ugcData, error: ugcError } = await supabase
            .from('user_submitted_questions')
            .select('*')
            .eq('status', 'curated')
            .eq('category', 'wiki_or_fiction')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (ugcError) console.error('[supabaseQuestions] Error fetching UGC wiki_or_fiction:', ugcError.message);

        // 3. Map and Combine
        const mainMapped = (mainData || []).map((row: WikiOrFictionRow) => ({
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
        const supabase = getSupabaseClient();
        const limit = count * 3;

        // 1. Fetch from main table
        const { data: mainData, error: mainError } = await supabase
            .from('wiki_links_questions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (mainError) console.error('[supabaseQuestions] Error fetching main wiki_links:', mainError.message);

        // 2. Fetch from curated UGC
        const { data: ugcData, error: ugcError } = await supabase
            .from('user_submitted_questions')
            .select('*')
            .eq('status', 'curated')
            .eq('category', 'wiki_links')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (ugcError) console.error('[supabaseQuestions] Error fetching UGC wiki_links:', ugcError.message);

        // 3. Map and Combine
        const mainMapped = (mainData || []).map((row: WikiLinksRow) => ({
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
        const supabase = getSupabaseClient();
        const limit = count * 3;

        // 1. Fetch from main table
        const { data: mainData, error: mainError } = await supabase
            .from('wiki_what_questions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (mainError) console.error('[supabaseQuestions] Error fetching main wiki_what:', mainError.message);

        // 2. Fetch from curated UGC
        const { data: ugcData, error: ugcError } = await supabase
            .from('user_submitted_questions')
            .select('*')
            .eq('status', 'curated')
            .eq('category', 'wiki_what')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (ugcError) console.error('[supabaseQuestions] Error fetching UGC wiki_what:', ugcError.message);

        // 3. Map and Combine
        const mainMapped = (mainData || []).map((row: WikiWhatRow) => ({
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
