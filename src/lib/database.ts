// Wiki Guesser - Database Helper Functions

import { getSupabaseClient } from './supabase';
import { Profile, Game } from '@/types/database';
import { Difficulty } from '@/types';

/**
 * Save a completed game to the database
 */
export async function saveGame(
    userId: string,
    difficulty: Difficulty,
    totalScore: number,
    roundsPlayed: number,
    correctCount: number,
    longestStreak: number
): Promise<{ error: Error | null }> {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from('games').insert({
        user_id: userId,
        difficulty,
        total_score: totalScore,
        rounds_played: roundsPlayed,
        correct_count: correctCount,
        longest_streak: longestStreak,
    });

    if (error) {
        console.error('Error saving game:', error);
        return { error: new Error(error.message) };
    }

    return { error: null };
}

/**
 * Get user's game history
 */
export async function getGameHistory(userId: string, limit = 10): Promise<Game[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching game history:', error);
        return [];
    }

    return data || [];
}

/**
 * Get user's profile with stats
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return data;
}

/**
 * Update username
 */
export async function updateUsername(userId: string, username: string): Promise<{ error: Error | null }> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
        .from('profiles')
        .update({ username, updated_at: new Date().toISOString() })
        .eq('id', userId);

    if (error) {
        return { error: new Error(error.message) };
    }

    return { error: null };
}
