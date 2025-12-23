// Wiki Guesser - UGC (User Generated Content) Hook
'use client';

import { useState, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
    UserSubmittedQuestion,
    SubmitQuestionRequest,
    UserRewardSummary
} from '@/types/ugc';

export function useUGC() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = getSupabaseClient();

    // Fetch user's submission stats and reward summary
    const fetchUserSummary = useCallback(async (): Promise<UserRewardSummary | null> => {
        if (!user) return null;

        try {
            setIsLoading(true);

            // 1. Get total points from profile (cached)
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('reward_points')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;

            // 2. Get counts of submissions by status
            // We use manual queries for now to keep it simple.

            const { count: submittedCount } = await supabase
                .from('user_submitted_questions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            const { count: approvedCount } = await supabase
                .from('user_submitted_questions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'approved');

            const { count: curatedCount } = await supabase
                .from('user_submitted_questions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('status', 'curated');

            // 3. Get recent rewards
            const { data: rewards, error: rewardsError } = await supabase
                .from('user_rewards')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (rewardsError) throw rewardsError;

            return {
                totalPoints: profile?.reward_points || 0,
                questionsSubmitted: submittedCount || 0,
                questionsApproved: (approvedCount || 0) + (curatedCount || 0),
                questionsCurated: curatedCount || 0,
                recentRewards: rewards || []
            };
        } catch (err: any) {
            console.error('[useUGC] Error fetching summary:', err);
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [user, supabase]);

    // Submit a new question
    const submitQuestion = async (request: SubmitQuestionRequest) => {
        if (!user) return { error: 'Not authenticated' };

        try {
            setIsLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('user_submitted_questions')
                .insert({
                    user_id: user.id,
                    category: request.category,
                    question_data: request.questionData,
                    status: 'pending'
                })
                .select()
                .single();

            if (error) throw error;

            return { data, error: null };
        } catch (err: any) {
            console.error('[useUGC] Error submitting question:', err);
            setError(err.message);
            return { error: err.message };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        fetchUserSummary,
        submitQuestion
    };
}
