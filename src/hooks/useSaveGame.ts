// Wiki Guesser - Reusable hook for saving game scores

'use client';

import { useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { saveGame, getUserProfile } from '@/lib/database';
import { checkAndUnlockAchievements, getAchievementById } from '@/lib/achievements';
import { Difficulty } from '@/types';

export interface NewAchievement {
    id: string;
    name: string;
    icon: string;
}

export function useSaveGame() {
    const { user, refreshProfile } = useAuth();
    const [newAchievements, setNewAchievements] = useState<NewAchievement[]>([]);

    const saveGameIfLoggedIn = useCallback(async (
        difficulty: Difficulty,
        totalScore: number,
        roundsPlayed: number,
        correctCount: number,
        longestStreak: number,
        fastestAnswerMs: number | null = null
    ): Promise<boolean> => {
        if (!user) {
            // Guest user - don't save
            return false;
        }

        const { error } = await saveGame(
            user.id,
            difficulty,
            totalScore,
            roundsPlayed,
            correctCount,
            longestStreak
        );

        if (error) {
            console.error('Failed to save game:', error);
            return false;
        }

        // Refresh profile to get updated stats
        if (refreshProfile) {
            await refreshProfile();
        }

        // Get updated profile stats for achievement checking
        const updatedProfile = await getUserProfile(user.id);

        if (updatedProfile) {
            // Check for new achievements
            const unlockedIds = await checkAndUnlockAchievements(
                user.id,
                {
                    correctCount,
                    totalRounds: roundsPlayed,
                    fastestAnswerMs,
                    longestStreak,
                },
                {
                    gamesPlayed: updatedProfile.games_played,
                    totalScore: updatedProfile.total_score,
                    longestStreak: updatedProfile.longest_streak,
                }
            );

            // Map unlocked IDs to achievement details
            const newlyUnlocked = unlockedIds
                .map(id => {
                    const achievement = getAchievementById(id);
                    return achievement ? { id, name: achievement.name, icon: achievement.icon } : null;
                })
                .filter((a): a is NewAchievement => a !== null);

            if (newlyUnlocked.length > 0) {
                setNewAchievements(newlyUnlocked);
            }
        }

        return true;
    }, [user, refreshProfile]);

    const clearNewAchievements = useCallback(() => {
        setNewAchievements([]);
    }, []);

    return {
        saveGameIfLoggedIn,
        isLoggedIn: !!user,
        newAchievements,
        clearNewAchievements
    };
}

