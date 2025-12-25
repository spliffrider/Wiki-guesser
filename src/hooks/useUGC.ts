// Wiki Guesser - UGC (User Generated Content) Hook
'use client';

import { useState, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
    UserSubmittedQuestion,
    SubmitQuestionRequest,
    UserRewardSummary,
    VoteRequest,
    AdminReviewRequest,
    VoteType,
    QuestionStatus,
    PendingQuestionView,
    CurationCandidateView
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
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('[useUGC] Error fetching summary:', err);
            setError(message);
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

            // Check for creator achievements
            // Get updated question count
            const { count } = await supabase
                .from('user_submitted_questions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (count) {
                // Import dynamically to avoid circular dependency
                const { checkCreatorAchievements } = await import('@/lib/achievements');
                await checkCreatorAchievements(user.id, count);
            }

            return { data, error: null };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('[useUGC] Error submitting question:', err);
            setError(message);
            return { error: message };
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch questions for voting (approved candidates)
    const getQuestionsForVoting = useCallback(async (): Promise<CurationCandidateView[]> => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('curation_candidates_view')
                .select('*')
                .limit(20);

            if (error) throw error;
            return data || [];
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('[useUGC] Error fetching voting questions:', err);
            setError(message);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    // Fetch questions for moderation (admin only)
    const getQuestionsForModeration = useCallback(async (): Promise<PendingQuestionView[]> => {
        if (!user) return [];
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('pending_questions_view')
                .select('*')
                .order('submitted_at', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('[useUGC] Error fetching moderation questions:', err);
            setError(message);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [user, supabase]);

    // Vote on a question
    const voteOnQuestion = async (request: VoteRequest) => {
        if (!user) return { error: 'Not authenticated' };
        try {
            // We don't set loading here to allow optimistic UI in the component
            const { error } = await supabase
                .from('question_votes')
                .insert({
                    user_id: user.id,
                    question_id: request.questionId,
                    vote_type: request.voteType
                });

            if (error) {
                // Handle duplicate vote gracefully
                if (error.code === '23505') { // Unique violation
                    return { error: 'You have already voted on this question.' };
                }
                throw error;
            }

            return { error: null };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('[useUGC] Error voting:', err);
            return { error: message };
        }
    };

    // Admin: Review a question
    const reviewQuestion = async (request: AdminReviewRequest) => {
        if (!user) return { error: 'Not authenticated' };
        try {
            setIsLoading(true);

            let error;
            if (request.action === 'approve') {
                const { error: rpcError } = await supabase.rpc('approve_question', {
                    p_question_id: request.questionId,
                    p_admin_id: user.id,
                    p_notes: request.notes
                });
                error = rpcError;
            } else {
                const { error: rpcError } = await supabase.rpc('reject_question', {
                    p_question_id: request.questionId,
                    p_admin_id: user.id,
                    p_notes: request.notes
                });
                error = rpcError;
            }

            if (error) throw error;
            return { error: null };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('[useUGC] Error reviewing question:', err);
            return { error: message };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        fetchUserSummary,
        submitQuestion,
        getQuestionsForVoting,
        getQuestionsForModeration,
        voteOnQuestion,
        reviewQuestion
    };
}
