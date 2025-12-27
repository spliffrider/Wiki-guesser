// Wiki Guesser - XP Award System

import { getSupabaseClient } from './supabase';

// XP reward values
export const XP_REWARDS = {
    // Question creation (primary focus)
    QUESTION_SUBMIT: 25,
    QUESTION_APPROVED: 50,
    QUESTION_POPULAR: 25,      // 10+ plays
    QUESTION_HIGHLY_RATED: 50, // 4+ stars
    QUESTION_CURATED: 100,

    // Daily login
    DAILY_LOGIN: 10,
    STREAK_7_DAYS: 50,
    STREAK_30_DAYS: 200,

    // Gameplay
    GAME_PLAYED: 5,
    PERFECT_ROUND: 15,
    MULTIPLAYER_WIN: 25,

    // Achievements (one-time)
    FIRST_GAME: 50,
    FIRST_QUESTION: 100,
    TEN_QUESTIONS: 200,
    HUNDRED_CORRECT: 150,
    LEVEL_10: 250,
} as const;

/**
 * Award XP to a user
 */
export async function awardXP(
    userId: string,
    amount: number,
    reason: string
): Promise<{ success: boolean; newXP: number; error?: string }> {
    const supabase = getSupabaseClient();

    try {
        // Get current XP
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('xp')
            .eq('id', userId)
            .single();

        if (fetchError || !profile) {
            return { success: false, newXP: 0, error: 'Profile not found' };
        }

        const newXP = (profile.xp || 0) + amount;

        // Update XP
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ xp: newXP, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (updateError) {
            return { success: false, newXP: profile.xp || 0, error: updateError.message };
        }

        console.log(`[xp] Awarded ${amount} XP to ${userId} for: ${reason}`);
        return { success: true, newXP };
    } catch (err) {
        console.error('[xp] Error awarding XP:', err);
        return { success: false, newXP: 0, error: 'Failed to award XP' };
    }
}

/**
 * Process daily login and award streak bonuses
 */
export async function processDailyLogin(userId: string): Promise<{
    awarded: boolean;
    xpGained: number;
    currentStreak: number;
    bonusType?: 'daily' | 'streak_7' | 'streak_30';
}> {
    const supabase = getSupabaseClient();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    try {
        // Check existing login record
        const { data: existing } = await supabase
            .from('daily_logins')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!existing) {
            // First login ever
            await supabase.from('daily_logins').insert({
                user_id: userId,
                last_login: today,
                current_streak: 1,
                longest_streak: 1,
                total_logins: 1,
            });

            await awardXP(userId, XP_REWARDS.DAILY_LOGIN, 'First daily login');
            return { awarded: true, xpGained: XP_REWARDS.DAILY_LOGIN, currentStreak: 1, bonusType: 'daily' };
        }

        // Check if already logged in today
        if (existing.last_login === today) {
            return { awarded: false, xpGained: 0, currentStreak: existing.current_streak };
        }

        // Calculate new streak
        const lastLogin = new Date(existing.last_login);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

        let newStreak = 1; // Default: reset streak
        if (daysDiff === 1) {
            // Consecutive day - extend streak
            newStreak = existing.current_streak + 1;
        }

        const newLongest = Math.max(newStreak, existing.longest_streak);

        // Update login record
        await supabase
            .from('daily_logins')
            .update({
                last_login: today,
                current_streak: newStreak,
                longest_streak: newLongest,
                total_logins: existing.total_logins + 1,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

        // Award daily XP
        let totalXP = XP_REWARDS.DAILY_LOGIN;
        let bonusType: 'daily' | 'streak_7' | 'streak_30' = 'daily';

        // Check for streak bonuses
        if (newStreak === 7) {
            totalXP += XP_REWARDS.STREAK_7_DAYS;
            bonusType = 'streak_7';
        } else if (newStreak === 30) {
            totalXP += XP_REWARDS.STREAK_30_DAYS;
            bonusType = 'streak_30';
        }

        await awardXP(userId, totalXP, `Daily login (streak: ${newStreak})`);

        return { awarded: true, xpGained: totalXP, currentStreak: newStreak, bonusType };
    } catch (err) {
        console.error('[xp] Error processing daily login:', err);
        return { awarded: false, xpGained: 0, currentStreak: 0 };
    }
}

/**
 * Get user's current streak info
 */
export async function getStreakInfo(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    lastLogin: string | null;
}> {
    const supabase = getSupabaseClient();

    const { data } = await supabase
        .from('daily_logins')
        .select('current_streak, longest_streak, last_login')
        .eq('user_id', userId)
        .single();

    if (!data) {
        return { currentStreak: 0, longestStreak: 0, lastLogin: null };
    }

    return {
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        lastLogin: data.last_login,
    };
}
