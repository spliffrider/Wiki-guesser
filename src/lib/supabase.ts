// Wiki Guesser - Supabase Client

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
    console.log('WikiGuesser Supabase Init:', {
        urlProvided: !!supabaseUrl,
        urlValue: supabaseUrl?.substring(0, 15) + '...',
        keyProvided: !!supabaseAnonKey
    });
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Singleton client for client-side usage
let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
    if (!browserClient) {
        browserClient = createClient();
    }
    return browserClient;
}

/**
 * Robust fetch helper that bypasses the potentially hanging Supabase JS client
 * for simple SELECT operations.
 */
export async function supabaseFetch<T>(table: string, query: string = 'select=*&order=created_at.desc'): Promise<T[] | null> {
    const url = `${supabaseUrl}/rest/v1/${table}?${query}`;
    const headers = {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            console.error(`[supabaseFetch] HTTP Error ${response.status} for ${table}`);
            return null;
        }
        return await response.json();
    } catch (err) {
        console.error(`[supabaseFetch] Network Error for ${table}:`, err);
        return null;
    }
}

