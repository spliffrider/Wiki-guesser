// Wiki Guesser - useRatings Hook
// Handles submission of question ratings to Supabase

'use client';

import { useState } from 'react';
import { QuestionRating } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';

export function useRatings() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitRatings = async (ratings: QuestionRating[]) => {
        if (ratings.length === 0) {
            return { success: true, error: null };
        }

        setIsLoading(true);
        setError(null);

        try {
            const supabase = getSupabaseClient();

            // Map ratings to database format
            const records = ratings.map(r => ({
                question_id: r.question_id,
                category: r.category,
                rating_value: r.rating_value,
                user_id: user?.id || null  // NULL for anonymous ratings
            }));

            const { error: insertError } = await supabase
                .from('question_ratings')
                .insert(records);

            if (insertError) {
                throw insertError;
            }

            return { success: true, error: null };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to submit ratings';
            console.error('[useRatings] Error:', err);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        submitRatings,
        isLoading,
        error
    };
}
