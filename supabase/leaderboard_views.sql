-- Wiki Guesser - Leaderboard Views
-- Run this in Supabase SQL Editor

-- All-time leaderboard (top players by total score)
CREATE OR REPLACE VIEW leaderboard_alltime AS
SELECT 
    p.id,
    p.username,
    p.total_score,
    p.games_played,
    p.correct_answers,
    p.longest_streak
FROM profiles p
WHERE p.username IS NOT NULL
  AND p.games_played > 0
ORDER BY p.total_score DESC
LIMIT 100;

-- Daily leaderboard (best single game today)
CREATE OR REPLACE VIEW leaderboard_daily AS
SELECT 
    p.id,
    p.username,
    g.total_score,
    g.difficulty,
    g.correct_count,
    g.completed_at
FROM games g
JOIN profiles p ON g.user_id = p.id
WHERE g.completed_at >= CURRENT_DATE
  AND p.username IS NOT NULL
ORDER BY g.total_score DESC
LIMIT 50;

-- Weekly leaderboard (total score this week)  
CREATE OR REPLACE VIEW leaderboard_weekly AS
SELECT 
    p.id,
    p.username,
    SUM(g.total_score) as week_score,
    COUNT(*) as games_this_week,
    SUM(g.correct_count) as correct_this_week
FROM games g
JOIN profiles p ON g.user_id = p.id
WHERE g.completed_at >= date_trunc('week', CURRENT_DATE)
  AND p.username IS NOT NULL
GROUP BY p.id, p.username
ORDER BY week_score DESC
LIMIT 50;
