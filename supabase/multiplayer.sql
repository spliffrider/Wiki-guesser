-- Wiki Guesser - Multiplayer Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- GAME ROOMS
-- ============================================

CREATE TABLE IF NOT EXISTS game_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- 6-char join code (e.g., "ABC123")
    host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'lobby' CHECK (status IN ('lobby', 'playing', 'finished')),
    current_round INTEGER DEFAULT 0,
    total_rounds INTEGER DEFAULT 5,
    time_per_round INTEGER DEFAULT 30, -- seconds
    max_players INTEGER DEFAULT 8,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ
);

-- Index for quick code lookups
CREATE INDEX IF NOT EXISTS idx_game_rooms_code ON game_rooms(code);
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);

-- ============================================
-- ROOM PLAYERS
-- ============================================

CREATE TABLE IF NOT EXISTS room_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    is_ready BOOLEAN DEFAULT false,
    is_host BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_players_room ON room_players(room_id);

-- ============================================
-- ROOM QUESTIONS (pre-fetched for sync)
-- ============================================

CREATE TABLE IF NOT EXISTS room_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    topic_title TEXT NOT NULL,
    topic_excerpt TEXT,
    topic_image_url TEXT,
    topic_page_url TEXT,
    options JSONB NOT NULL, -- ["Option A", "Option B", "Option C", "Option D"]
    correct_answer TEXT NOT NULL,
    UNIQUE(room_id, round_number)
);

CREATE INDEX IF NOT EXISTS idx_room_questions_room ON room_questions(room_id);

-- ============================================
-- ROOM ANSWERS
-- ============================================

CREATE TABLE IF NOT EXISTS room_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    answer TEXT,
    is_correct BOOLEAN DEFAULT false,
    time_ms INTEGER, -- milliseconds to answer
    points_earned INTEGER DEFAULT 0,
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, user_id, round_number)
);

CREATE INDEX IF NOT EXISTS idx_room_answers_room_round ON room_answers(room_id, round_number);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_answers ENABLE ROW LEVEL SECURITY;

-- Game rooms: Anyone can view, authenticated can create
CREATE POLICY "Anyone can view game rooms" ON game_rooms
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create rooms" ON game_rooms
    FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update their rooms" ON game_rooms
    FOR UPDATE USING (auth.uid() = host_id);

-- Room players: Anyone can view, authenticated can join
CREATE POLICY "Anyone can view room players" ON room_players
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join rooms" ON room_players
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Players can update their own status" ON room_players
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Players can leave rooms" ON room_players
    FOR DELETE USING (auth.uid() = user_id);

-- Room questions: Players in room can view
CREATE POLICY "Room players can view questions" ON room_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM room_players 
            WHERE room_players.room_id = room_questions.room_id 
            AND room_players.user_id = auth.uid()
        )
    );

CREATE POLICY "Host can insert questions" ON room_questions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM game_rooms 
            WHERE game_rooms.id = room_questions.room_id 
            AND game_rooms.host_id = auth.uid()
        )
    );

-- Room answers: Players can view all, submit their own
CREATE POLICY "Room players can view answers" ON room_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM room_players 
            WHERE room_players.room_id = room_answers.room_id 
            AND room_players.user_id = auth.uid()
        )
    );

CREATE POLICY "Players can submit their own answers" ON room_answers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for multiplayer tables
ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE room_answers;
