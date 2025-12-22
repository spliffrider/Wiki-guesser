// Wiki Guesser - Supabase Question Fetchers
// Fetches curated questions from Supabase tables

import { getSupabaseClient } from './supabase';
import {
    OddWikiOutData,
    WhenInWikiData,
    WikiOrFictionData,
    WikiLinksData,
} from '@/types';

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
 * Fetch random "Odd Wiki Out" questions from Supabase.
 * Falls back to empty array on error.
 * @param count Number of questions to fetch
 * @returns Array of OddWikiOutData
 */
export async function getRandomOddWikiOutFromDB(count: number): Promise<OddWikiOutData[]> {
    // Skip Supabase calls during SSR
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const supabase = getSupabaseClient();

        // Fetch more than needed, then shuffle and slice for true randomness
        const { data, error } = await supabase
            .from('odd_wiki_out_questions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(count * 3);

        if (error) {
            console.error('[supabaseQuestions] Error fetching odd_wiki_out:', error.message);
            return [];
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Shuffle and map to interface
        const shuffled = shuffleArray(data as OddWikiOutRow[]).slice(0, count);
        return shuffled.map((row) => ({
            items: row.items,
            impostorIndex: row.impostor_index,
            connection: row.connection,
            topic: row.topic || '',
        }));
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

    try {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('when_in_wiki_questions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(count * 3);

        if (error) {
            console.error('[supabaseQuestions] Error fetching when_in_wiki:', error.message);
            return [];
        }

        if (!data || data.length === 0) {
            return [];
        }

        const shuffled = shuffleArray(data as WhenInWikiRow[]).slice(0, count);
        return shuffled.map((row) => ({
            event: row.event,
            correctYear: row.correct_year,
            yearOptions: row.year_options,
            topic: row.topic || '',
        }));
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

    try {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('wiki_or_fiction_questions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(count * 3);

        if (error) {
            console.error('[supabaseQuestions] Error fetching wiki_or_fiction:', error.message);
            return [];
        }

        if (!data || data.length === 0) {
            return [];
        }

        const shuffled = shuffleArray(data as WikiOrFictionRow[]).slice(0, count);
        return shuffled.map((row) => ({
            statement: row.statement,
            isTrue: row.is_true,
            explanation: row.explanation,
            topic: row.topic || '',
            source: row.wikipedia_url,
        }));
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

    try {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('wiki_links_questions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(count * 3);

        if (error) {
            console.error('[supabaseQuestions] Error fetching wiki_links:', error.message);
            return [];
        }

        if (!data || data.length === 0) {
            return [];
        }

        const shuffled = shuffleArray(data as WikiLinksRow[]).slice(0, count);
        return shuffled.map((row) => ({
            titles: row.titles,
            connection: row.connection,
            connectionOptions: row.connection_options,
            topic: row.topic || '',
        }));
    } catch (err) {
        console.error('[supabaseQuestions] Unexpected error in getRandomWikiLinksFromDB:', err);
        return [];
    }
}
