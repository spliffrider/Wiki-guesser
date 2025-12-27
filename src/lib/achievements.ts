// Wiki Guesser - Achievements System

import { getSupabaseClient } from './supabase';
import { awardXP, XP_REWARDS } from './xp';

// Achievement definitions
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    category: 'gameplay' | 'creation' | 'social' | 'milestone';
}

// Alias for backwards compatibility
export type UnlockedAchievement = Achievement;

export const ACHIEVEMENTS: Achievement[] = [
    // Gameplay achievements
    {
        id: 'first_game',
        name: 'First Steps',
        description: 'Play your first game',
        icon: '🎮',
        xpReward: XP_REWARDS.FIRST_GAME,
        category: 'gameplay',
    },
    {
        id: 'ten_games',
        name: 'Getting Started',
        description: 'Play 10 games',
        icon: '🎯',
        xpReward: 100,
        category: 'gameplay',
    },
    {
        id: 'fifty_games',
        name: 'Regular Player',
        description: 'Play 50 games',
        icon: '🏆',
        xpReward: 250,
        category: 'gameplay',
    },
    {
        id: 'hundred_correct',
        name: 'Knowledge Seeker',
        description: 'Get 100 correct answers',
        icon: '🧠',
        xpReward: XP_REWARDS.HUNDRED_CORRECT,
        category: 'gameplay',
    },
    {
        id: 'perfect_game',
        name: 'Perfectionist',
        description: 'Get all answers correct in a game',
        icon: '💯',
        xpReward: 100,
        category: 'gameplay',
    },

    // Creation achievements (primary focus)
    {
        id: 'first_question',
        name: 'Content Creator',
        description: 'Submit your first question',
        icon: '✍️',
        xpReward: XP_REWARDS.FIRST_QUESTION,
        category: 'creation',
    },
    {
        id: 'ten_questions',
        name: 'Question Crafter',
        description: 'Submit 10 questions',
        icon: '📝',
        xpReward: XP_REWARDS.TEN_QUESTIONS,
        category: 'creation',
    },
    {
        id: 'fifty_questions',
        name: 'Prolific Creator',
        description: 'Submit 50 questions',
        icon: '📚',
        xpReward: 500,
        category: 'creation',
    },
    {
        id: 'first_approved',
        name: 'Quality Content',
        description: 'Have a question approved',
        icon: '✅',
        xpReward: 75,
        category: 'creation',
    },
    {
        id: 'first_curated',
        name: 'Premium Creator',
        description: 'Have a question become curated',
        icon: '⭐',
        xpReward: 150,
        category: 'creation',
    },

    // Streak achievements
    {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day login streak',
        icon: '🔥',
        xpReward: 100,
        category: 'milestone',
    },
    {
        id: 'streak_30',
        name: 'Dedicated Player',
        description: 'Maintain a 30-day login streak',
        icon: '🌟',
        xpReward: 300,
        category: 'milestone',
    },

    // Level milestones
    {
        id: 'level_5',
        name: 'Rising Star',
        description: 'Reach Level 5',
        icon: '🌱',
        xpReward: 100,
        category: 'milestone',
    },
    {
        id: 'level_10',
        name: 'Established',
        description: 'Reach Level 10',
        icon: '📚',
        xpReward: XP_REWARDS.LEVEL_10,
        category: 'milestone',
    },
    {
        id: 'level_20',
        name: 'Wiki Expert',
        description: 'Reach Level 20',
        icon: '🎓',
        xpReward: 400,
        category: 'milestone',
    },
    {
        id: 'level_30',
        name: 'Wiki Master',
        description: 'Reach Level 30',
        icon: '🧙',
        xpReward: 500,
        category: 'milestone',
    },
];

/**
 * Check and unlock an achievement if not already unlocked
 */
export async function checkAndUnlockAchievement(
    userId: string,
    achievementId: string
): Promise<{ unlocked: boolean; achievement?: Achievement }> {
    const supabase = getSupabaseClient();

    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) {
        console.warn(`[achievements] Unknown achievement: ${achievementId}`);
        return { unlocked: false };
    }

    try {
        // Check if already unlocked
        const { data: existing } = await supabase
            .from('user_achievements')
            .select('id')
            .eq('user_id', userId)
            .eq('achievement_id', achievementId)
            .single();

        if (existing) {
            return { unlocked: false }; // Already has it
        }

        // Unlock the achievement
        const { error } = await supabase
            .from('user_achievements')
            .insert({
                user_id: userId,
                achievement_id: achievementId,
            });

        if (error) {
            console.error('[achievements] Failed to unlock:', error);
            return { unlocked: false };
        }

        // Award XP for the achievement
        await awardXP(userId, achievement.xpReward, `Achievement: ${achievement.name}`);

        console.log(`[achievements] Unlocked ${achievement.name} for ${userId}`);
        return { unlocked: true, achievement };
    } catch (err) {
        console.error('[achievements] Error:', err);
        return { unlocked: false };
    }
}

/**
 * Get all achievements for a user
 */
export async function getUserAchievements(userId: string): Promise<{
    unlocked: Achievement[];
    locked: Achievement[];
}> {
    const supabase = getSupabaseClient();

    const { data: unlockedIds } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);

    const unlockedSet = new Set((unlockedIds || []).map(a => a.achievement_id));

    const unlocked: Achievement[] = [];
    const locked: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
        if (unlockedSet.has(achievement.id)) {
            unlocked.push(achievement);
        } else {
            locked.push(achievement);
        }
    }

    return { unlocked, locked };
}

/**
 * Check gameplay-related achievements based on profile stats
 */
export async function checkGameplayAchievements(userId: string): Promise<Achievement[]> {
    const supabase = getSupabaseClient();
    const newlyUnlocked: Achievement[] = [];

    // Get user stats
    const { data: profile } = await supabase
        .from('profiles')
        .select('games_played, correct_answers, xp')
        .eq('id', userId)
        .single();

    if (!profile) return newlyUnlocked;

    // Check games played achievements
    if (profile.games_played >= 1) {
        const result = await checkAndUnlockAchievement(userId, 'first_game');
        if (result.unlocked && result.achievement) newlyUnlocked.push(result.achievement);
    }
    if (profile.games_played >= 10) {
        const result = await checkAndUnlockAchievement(userId, 'ten_games');
        if (result.unlocked && result.achievement) newlyUnlocked.push(result.achievement);
    }
    if (profile.games_played >= 50) {
        const result = await checkAndUnlockAchievement(userId, 'fifty_games');
        if (result.unlocked && result.achievement) newlyUnlocked.push(result.achievement);
    }

    // Check correct answers
    if (profile.correct_answers >= 100) {
        const result = await checkAndUnlockAchievement(userId, 'hundred_correct');
        if (result.unlocked && result.achievement) newlyUnlocked.push(result.achievement);
    }

    return newlyUnlocked;
}

/**
 * Check question creation achievements
 */
export async function checkCreationAchievements(userId: string): Promise<Achievement[]> {
    const supabase = getSupabaseClient();
    const newlyUnlocked: Achievement[] = [];

    // Count user's submitted questions
    const { count: submittedCount } = await supabase
        .from('user_submitted_questions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (submittedCount && submittedCount >= 1) {
        const result = await checkAndUnlockAchievement(userId, 'first_question');
        if (result.unlocked && result.achievement) newlyUnlocked.push(result.achievement);
    }
    if (submittedCount && submittedCount >= 10) {
        const result = await checkAndUnlockAchievement(userId, 'ten_questions');
        if (result.unlocked && result.achievement) newlyUnlocked.push(result.achievement);
    }
    if (submittedCount && submittedCount >= 50) {
        const result = await checkAndUnlockAchievement(userId, 'fifty_questions');
        if (result.unlocked && result.achievement) newlyUnlocked.push(result.achievement);
    }

    // Count approved questions
    const { count: approvedCount } = await supabase
        .from('user_submitted_questions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'approved');

    if (approvedCount && approvedCount >= 1) {
        const result = await checkAndUnlockAchievement(userId, 'first_approved');
        if (result.unlocked && result.achievement) newlyUnlocked.push(result.achievement);
    }

    // Count curated questions
    const { count: curatedCount } = await supabase
        .from('user_submitted_questions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'curated');

    if (curatedCount && curatedCount >= 1) {
        const result = await checkAndUnlockAchievement(userId, 'first_curated');
        if (result.unlocked && result.achievement) newlyUnlocked.push(result.achievement);
    }

    return newlyUnlocked;
}

// ============================================
// Backwards-compatible functions for useSaveGame.ts
// ============================================

interface GameStats {
    correctCount: number;
    totalRounds: number;
    fastestAnswerMs: number | null;
    longestStreak: number;
}

interface ProfileStats {
    gamesPlayed: number;
    totalScore: number;
    longestStreak: number;
    xp: number;
}

/**
 * Backwards-compatible function for useSaveGame.ts
 * Checks and unlocks achievements based on game + profile stats
 */
export async function checkAndUnlockAchievements(
    userId: string,
    gameStats: GameStats,
    profileStats: ProfileStats
): Promise<string[]> {
    const unlockedIds: string[] = [];

    // Check games played
    if (profileStats.gamesPlayed >= 1) {
        const result = await checkAndUnlockAchievement(userId, 'first_game');
        if (result.unlocked) unlockedIds.push('first_game');
    }
    if (profileStats.gamesPlayed >= 10) {
        const result = await checkAndUnlockAchievement(userId, 'ten_games');
        if (result.unlocked) unlockedIds.push('ten_games');
    }
    if (profileStats.gamesPlayed >= 50) {
        const result = await checkAndUnlockAchievement(userId, 'fifty_games');
        if (result.unlocked) unlockedIds.push('fifty_games');
    }

    // Check perfect game
    if (gameStats.correctCount === gameStats.totalRounds && gameStats.totalRounds > 0) {
        const result = await checkAndUnlockAchievement(userId, 'perfect_game');
        if (result.unlocked) unlockedIds.push('perfect_game');
    }

    return unlockedIds;
}

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
    return ACHIEVEMENTS.find(a => a.id === id);
}

