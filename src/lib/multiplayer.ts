// Wiki Guesser - Multiplayer Room Management

import { getSupabaseClient } from './supabase';
import { getRandomTopics } from './wikipedia';

/**
 * Wrap a promise with a timeout to prevent silent hangs
 */
async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number, errorMsg: string): Promise<T> {
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
            console.warn(`[multiplayer] Query timed out after ${timeoutMs}ms`);
            reject(new Error(errorMsg));
        }, timeoutMs);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId!);
        return result;
    } catch (err) {
        clearTimeout(timeoutId!);
        throw err;
    }
}

const QUERY_TIMEOUT_MS = 15000; // 15 second timeout

// Types
export interface GameRoom {
    id: string;
    code: string;
    host_id: string;
    status: 'lobby' | 'playing' | 'finished';
    current_round: number;
    total_rounds: number;
    time_per_round: number;
    max_players: number;
    created_at: string;
    started_at: string | null;
    finished_at: string | null;
}

export interface RoomPlayer {
    id: string;
    room_id: string;
    user_id: string;
    username: string;
    score: number;
    is_ready: boolean;
    is_host: boolean;
    joined_at: string;
}

export interface RoomQuestion {
    id: string;
    room_id: string;
    round_number: number;
    topic_title: string;
    topic_excerpt: string | null;
    topic_image_url: string | null;
    topic_page_url: string | null;
    options: string[];
    correct_answer: string;
}

export interface RoomAnswer {
    id: string;
    room_id: string;
    user_id: string;
    round_number: number;
    answer: string | null;
    is_correct: boolean;
    time_ms: number | null;
    points_earned: number;
    answered_at: string;
}

// Generate unique 6-char room code
function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

/**
 * Create a new game room
 */
export async function createRoom(hostId: string, hostUsername: string): Promise<{ room: GameRoom | null; error: string | null }> {
    const supabase = getSupabaseClient();

    // Generate unique code (retry if collision)
    let code = generateRoomCode();
    let attempts = 0;

    while (attempts < 5) {
        try {
            // Try to create room with timeout
            const { data: room, error } = await withTimeout(
                supabase
                    .from('game_rooms')
                    .insert({ code, host_id: hostId })
                    .select()
                    .single(),
                QUERY_TIMEOUT_MS,
                'Room creation timed out'
            );

            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    code = generateRoomCode();
                    attempts++;
                    continue;
                }
                return { room: null, error: error.message };
            }

            // Add host as player with timeout
            const { error: playerError } = await withTimeout(
                supabase
                    .from('room_players')
                    .insert({
                        room_id: room.id,
                        user_id: hostId,
                        username: hostUsername,
                        is_host: true,
                        is_ready: true,
                    }),
                QUERY_TIMEOUT_MS,
                'Adding host to room timed out'
            );

            if (playerError) {
                // Cleanup room if player insert fails
                await supabase.from('game_rooms').delete().eq('id', room.id);
                return { room: null, error: playerError.message };
            }

            return { room: room as GameRoom, error: null };
        } catch (err) {
            return { room: null, error: err instanceof Error ? err.message : 'Room creation failed' };
        }
    }

    return { room: null, error: 'Could not generate unique room code' };
}

/**
 * Join an existing room by code
 */
export async function joinRoom(
    code: string,
    userId: string,
    username: string
): Promise<{ room: GameRoom | null; error: string | null }> {
    const supabase = getSupabaseClient();

    try {
        // Find room by code with timeout
        const { data: room, error: findError } = await withTimeout(
            supabase
                .from('game_rooms')
                .select('*')
                .eq('code', code.toUpperCase())
                .single(),
            QUERY_TIMEOUT_MS,
            'Room lookup timed out'
        );

        if (findError || !room) {
            return { room: null, error: 'Room not found' };
        }

        if (room.status !== 'lobby') {
            return { room: null, error: 'Game already in progress' };
        }

        // Check player count with timeout
        const { count } = await withTimeout(
            supabase
                .from('room_players')
                .select('*', { count: 'exact', head: true })
                .eq('room_id', room.id),
            QUERY_TIMEOUT_MS,
            'Player count check timed out'
        );

        if (count && count >= room.max_players) {
            return { room: null, error: 'Room is full' };
        }

        // Check if already in room with timeout
        const { data: existing } = await withTimeout(
            supabase
                .from('room_players')
                .select('id')
                .eq('room_id', room.id)
                .eq('user_id', userId)
                .single(),
            QUERY_TIMEOUT_MS,
            'Existing player check timed out'
        );

        if (existing) {
            return { room: room as GameRoom, error: null }; // Already joined
        }

        // Join room with timeout
        const { error: joinError } = await withTimeout(
            supabase
                .from('room_players')
                .insert({
                    room_id: room.id,
                    user_id: userId,
                    username,
                    is_host: false,
                }),
            QUERY_TIMEOUT_MS,
            'Joining room timed out'
        );

        if (joinError) {
            return { room: null, error: joinError.message };
        }

        return { room: room as GameRoom, error: null };
    } catch (err) {
        return { room: null, error: err instanceof Error ? err.message : 'Failed to join room' };
    }
}

/**
 * Leave a room
 */
export async function leaveRoom(roomId: string, userId: string): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase
        .from('room_players')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId);
}

/**
 * Get room by code
 */
export async function getRoomByCode(code: string): Promise<GameRoom | null> {
    const supabase = getSupabaseClient();

    try {
        const { data } = await withTimeout(
            supabase
                .from('game_rooms')
                .select('*')
                .eq('code', code.toUpperCase())
                .single(),
            QUERY_TIMEOUT_MS,
            'Room lookup timed out'
        );

        return data as GameRoom | null;
    } catch (err) {
        console.error('[multiplayer] getRoomByCode error:', err);
        return null;
    }
}

/**
 * Get players in a room
 */
export async function getRoomPlayers(roomId: string): Promise<RoomPlayer[]> {
    const supabase = getSupabaseClient();

    try {
        const { data } = await withTimeout(
            supabase
                .from('room_players')
                .select('*')
                .eq('room_id', roomId)
                .order('score', { ascending: false }),
            QUERY_TIMEOUT_MS,
            'Getting room players timed out'
        );

        return (data || []) as RoomPlayer[];
    } catch (err) {
        console.error('[multiplayer] getRoomPlayers error:', err);
        return [];
    }
}

/**
 * Toggle ready status
 */
export async function toggleReady(roomId: string, userId: string, isReady: boolean): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase
        .from('room_players')
        .update({ is_ready: isReady })
        .eq('room_id', roomId)
        .eq('user_id', userId);
}

/**
 * Start the game (host only) - pre-fetches questions
 */
export async function startGame(roomId: string, hostId: string): Promise<{ success: boolean; error: string | null }> {
    const supabase = getSupabaseClient();

    // Verify host
    const { data: room } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

    if (!room || room.host_id !== hostId) {
        return { success: false, error: 'Only host can start the game' };
    }

    if (room.status !== 'lobby') {
        return { success: false, error: 'Game already started' };
    }

    // Fetch questions for all rounds
    const topics = await getRandomTopics(room.total_rounds * 4); // 4 options per round

    if (topics.length < room.total_rounds * 4) {
        return { success: false, error: 'Could not fetch enough topics' };
    }

    // Create questions for each round
    const questions = [];
    for (let i = 0; i < room.total_rounds; i++) {
        const correctTopic = topics[i * 4];
        const wrongTopics = topics.slice(i * 4 + 1, i * 4 + 4);
        const options = [correctTopic.title, ...wrongTopics.map(t => t.title)];

        // Shuffle options
        for (let j = options.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [options[j], options[k]] = [options[k], options[j]];
        }

        questions.push({
            room_id: roomId,
            round_number: i + 1,
            topic_title: correctTopic.title,
            topic_excerpt: correctTopic.excerpt,
            topic_image_url: correctTopic.imageUrl,
            topic_page_url: correctTopic.pageUrl,
            options,
            correct_answer: correctTopic.title,
        });
    }

    // Insert questions
    const { error: questionsError } = await supabase
        .from('room_questions')
        .insert(questions);

    if (questionsError) {
        return { success: false, error: questionsError.message };
    }

    // Update room status
    const { error: updateError } = await supabase
        .from('game_rooms')
        .update({
            status: 'playing',
            current_round: 1,
            started_at: new Date().toISOString()
        })
        .eq('id', roomId);

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    return { success: true, error: null };
}

/**
 * Get current round question
 */
export async function getCurrentQuestion(roomId: string, roundNumber: number): Promise<RoomQuestion | null> {
    const supabase = getSupabaseClient();

    try {
        const { data } = await withTimeout(
            supabase
                .from('room_questions')
                .select('*')
                .eq('room_id', roomId)
                .eq('round_number', roundNumber)
                .single(),
            QUERY_TIMEOUT_MS,
            'Getting question timed out'
        );

        return data as RoomQuestion | null;
    } catch (err) {
        console.error('[multiplayer] getCurrentQuestion error:', err);
        return null;
    }
}

/**
 * Submit an answer
 */
export async function submitAnswer(
    roomId: string,
    userId: string,
    roundNumber: number,
    answer: string,
    timeMs: number,
    correctAnswer: string
): Promise<{ points: number; isCorrect: boolean }> {
    const supabase = getSupabaseClient();

    const isCorrect = answer === correctAnswer;

    // Calculate points
    let points = 0;
    if (isCorrect) {
        points = 100; // Base points

        // Speed bonus (max 50 points for answering in < 5 seconds)
        const speedBonus = Math.max(0, Math.floor((30000 - timeMs) / 600));
        points += Math.min(speedBonus, 50);

        // Check if first correct answer
        const { count } = await supabase
            .from('room_answers')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', roomId)
            .eq('round_number', roundNumber)
            .eq('is_correct', true);

        if (count === 0) {
            points += 100; // First correct bonus!
        }
    }

    // Insert answer with timeout
    await withTimeout(
        supabase.from('room_answers').insert({
            room_id: roomId,
            user_id: userId,
            round_number: roundNumber,
            answer,
            is_correct: isCorrect,
            time_ms: timeMs,
            points_earned: points,
        }),
        QUERY_TIMEOUT_MS,
        'Submitting answer timed out'
    );

    // Update player score directly
    const { data: playerData } = await supabase
        .from('room_players')
        .select('score')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .single();

    if (playerData) {
        await supabase
            .from('room_players')
            .update({ score: playerData.score + points })
            .eq('room_id', roomId)
            .eq('user_id', userId);
    }

    return { points, isCorrect };
}

/**
 * Advance to next round (host only)
 */
export async function nextRound(roomId: string): Promise<{ finished: boolean }> {
    const supabase = getSupabaseClient();

    const { data: room } = await supabase
        .from('game_rooms')
        .select('current_round, total_rounds')
        .eq('id', roomId)
        .single();

    if (!room) return { finished: true };

    if (room.current_round >= room.total_rounds) {
        // Game over
        await supabase
            .from('game_rooms')
            .update({
                status: 'finished',
                finished_at: new Date().toISOString()
            })
            .eq('id', roomId);

        return { finished: true };
    }

    // Advance round
    await supabase
        .from('game_rooms')
        .update({ current_round: room.current_round + 1 })
        .eq('id', roomId);

    return { finished: false };
}

/**
 * Get round answers for leaderboard
 */
export async function getRoundAnswers(roomId: string, roundNumber: number): Promise<RoomAnswer[]> {
    const supabase = getSupabaseClient();

    const { data } = await supabase
        .from('room_answers')
        .select('*')
        .eq('room_id', roomId)
        .eq('round_number', roundNumber)
        .order('answered_at', { ascending: true });

    return (data || []) as RoomAnswer[];
}
