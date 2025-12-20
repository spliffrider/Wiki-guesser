// Wiki Guesser - Leaderboard API Functions

import { getSupabaseClient } from './supabase';

export interface LeaderboardEntry {
    id: string;
    username: string;
    total_score: number;
    games_played?: number;
    correct_answers?: number;
    longest_streak?: number;
    difficulty?: string;
    correct_count?: number;
    completed_at?: string;
    week_score?: number;
    games_this_week?: number;
    correct_this_week?: number;
}

/**
 * Get all-time leaderboard (top players by total score)
 */
export async function getAllTimeLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, total_score, games_played, correct_answers, longest_streak')
        .not('username', 'is', null)
        .gt('games_played', 0)
        .order('total_score', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching all-time leaderboard:', error);
        return [];
    }

    return data || [];
}

/**
 * Get daily leaderboard (best single game today)
 */
export async function getDailyLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const supabase = getSupabaseClient();

    // Get start of today in UTC
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('games')
        .select(`
            total_score,
            difficulty,
            correct_count,
            completed_at,
            profiles!inner(id, username)
        `)
        .gte('completed_at', today.toISOString())
        .order('total_score', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching daily leaderboard:', error);
        return [];
    }

    // Transform data to flatten the profiles join
    return (data || []).map((entry: Record<string, unknown>) => {
        const profiles = entry.profiles as { id: string; username: string } | null;
        return {
            id: profiles?.id || '',
            username: profiles?.username || 'Anonymous',
            total_score: entry.total_score as number,
            difficulty: entry.difficulty as string,
            correct_count: entry.correct_count as number,
            completed_at: entry.completed_at as string,
        };
    }).filter(entry => entry.username);
}

/**
 * Get weekly leaderboard (total score this week)
 */
export async function getWeeklyLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const supabase = getSupabaseClient();

    // Get start of this week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);

    // Fetch all games this week and aggregate client-side
    // (Supabase doesn't support GROUP BY in the JS client easily)
    const { data, error } = await supabase
        .from('games')
        .select(`
            total_score,
            correct_count,
            user_id,
            profiles!inner(id, username)
        `)
        .gte('completed_at', monday.toISOString());

    if (error) {
        console.error('Error fetching weekly leaderboard:', error);
        return [];
    }

    // Aggregate by user
    const userScores: Record<string, LeaderboardEntry> = {};

    for (const game of data || []) {
        // Handle nested profiles object from Supabase join
        const gameData = game as unknown as {
            total_score: number;
            correct_count: number;
            profiles: { id: string; username: string } | { id: string; username: string }[];
        };
        const profiles = Array.isArray(gameData.profiles) ? gameData.profiles[0] : gameData.profiles;
        const userId = profiles?.id;
        const username = profiles?.username;

        if (!userId || !username) continue;

        if (!userScores[userId]) {
            userScores[userId] = {
                id: userId,
                username: username,
                total_score: 0,
                week_score: 0,
                games_this_week: 0,
                correct_this_week: 0,
            };
        }

        userScores[userId].week_score! += gameData.total_score;
        userScores[userId].games_this_week! += 1;
        userScores[userId].correct_this_week! += gameData.correct_count;
    }

    // Sort by week_score and return top entries
    return Object.values(userScores)
        .sort((a, b) => (b.week_score || 0) - (a.week_score || 0))
        .slice(0, limit);
}

/**
 * Get user's rank on the all-time leaderboard
 */
export async function getUserRank(userId: string): Promise<number | null> {
    const supabase = getSupabaseClient();

    // Get user's score
    const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('total_score')
        .eq('id', userId)
        .single();

    if (userError || !userData) return null;

    // Count how many users have higher scores
    const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('total_score', userData.total_score)
        .not('username', 'is', null);

    if (countError) return null;

    return (count || 0) + 1;
}
