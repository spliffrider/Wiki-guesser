// Wiki Guesser - Database Types

export interface Profile {
    id: string;
    username: string | null;
    avatar_url: string | null;
    total_score: number;
    games_played: number;
    correct_answers: number;
    longest_streak: number;
    created_at: string;
    updated_at: string;
}

export interface Game {
    id: string;
    user_id: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    total_score: number;
    rounds_played: number;
    correct_count: number;
    longest_streak: number;
    completed_at: string;
}

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, 'created_at' | 'updated_at' | 'total_score' | 'games_played' | 'correct_answers' | 'longest_streak'> & {
                    total_score?: number;
                    games_played?: number;
                    correct_answers?: number;
                    longest_streak?: number;
                };
                Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
            };
            games: {
                Row: Game;
                Insert: Omit<Game, 'id' | 'completed_at'>;
                Update: Partial<Omit<Game, 'id' | 'user_id' | 'completed_at'>>;
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
    };
}
