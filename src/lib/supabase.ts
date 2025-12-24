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

