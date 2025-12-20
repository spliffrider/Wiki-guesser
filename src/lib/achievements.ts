// Wiki Guesser - Achievements System

import { getSupabaseClient } from './supabase';

// Achievement definitions
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_win', name: 'First Blood', description: 'Get your first correct answer', icon: '🎯' },
    { id: 'perfect_game', name: 'Perfect Game', description: 'Get all 5 answers correct in one game', icon: '⭐' },
    { id: 'speed_demon', name: 'Speed Demon', description: 'Answer correctly in under 5 seconds', icon: '⚡' },
    { id: 'streak_5', name: 'On Fire', description: 'Get a 5-answer streak', icon: '🔥' },
    { id: 'streak_10', name: 'Unstoppable', description: 'Get a 10-answer streak', icon: '🔥🔥' },
    { id: 'games_10', name: 'Regular', description: 'Play 10 games', icon: '🎮' },
    { id: 'games_50', name: 'Dedicated', description: 'Play 50 games', icon: '🏆' },
    { id: 'score_1000', name: 'Rising Star', description: 'Reach 1,000 total points', icon: '💎' },
    { id: 'score_10000', name: 'Champion', description: 'Reach 10,000 total points', icon: '👑' },
];

export interface UnlockedAchievement {
    achievement_id: string;
    unlocked_at: string;
}

/**
 * Get user's unlocked achievements
 */
export async function getUserAchievements(userId: string): Promise<UnlockedAchievement[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching achievements:', error);
        return [];
    }

    return data || [];
}

/**
 * Unlock an achievement for a user
 */
async function unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
        .from('user_achievements')
        .insert({ user_id: userId, achievement_id: achievementId });

    if (error) {
        // Ignore unique constraint errors (already unlocked)
        if (error.code === '23505') return false;
        console.error('Error unlocking achievement:', error);
        return false;
    }

    return true;
}

/**
 * Check and unlock achievements after a game
 * Returns array of newly unlocked achievement IDs
 */
export async function checkAndUnlockAchievements(
    userId: string,
    gameStats: {
        correctCount: number;
        totalRounds: number;
        fastestAnswerMs: number | null;
        longestStreak: number;
    },
    profileStats: {
        gamesPlayed: number;
        totalScore: number;
        longestStreak: number;
    }
): Promise<string[]> {
    const newlyUnlocked: string[] = [];

    // Get already unlocked achievements
    const existing = await getUserAchievements(userId);
    const unlockedIds = new Set(existing.map(a => a.achievement_id));

    // Check each achievement
    const checks: { id: string; condition: boolean }[] = [
        { id: 'first_win', condition: gameStats.correctCount >= 1 },
        { id: 'perfect_game', condition: gameStats.correctCount === gameStats.totalRounds },
        { id: 'speed_demon', condition: gameStats.fastestAnswerMs !== null && gameStats.fastestAnswerMs < 5000 },
        { id: 'streak_5', condition: profileStats.longestStreak >= 5 },
        { id: 'streak_10', condition: profileStats.longestStreak >= 10 },
        { id: 'games_10', condition: profileStats.gamesPlayed >= 10 },
        { id: 'games_50', condition: profileStats.gamesPlayed >= 50 },
        { id: 'score_1000', condition: profileStats.totalScore >= 1000 },
        { id: 'score_10000', condition: profileStats.totalScore >= 10000 },
    ];

    for (const check of checks) {
        if (check.condition && !unlockedIds.has(check.id)) {
            const success = await unlockAchievement(userId, check.id);
            if (success) {
                newlyUnlocked.push(check.id);
            }
        }
    }

    return newlyUnlocked;
}

/**
 * Get achievement details by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
    return ACHIEVEMENTS.find(a => a.id === id);
}
