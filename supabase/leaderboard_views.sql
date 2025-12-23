-- Wiki Guesser - Leaderboard Views
-- Run this in Supabase SQL Editor

-- All-time leaderboard (top players by total score)
-- Using security_invoker to respect RLS policies
DROP VIEW IF EXISTS leaderboard_alltime;
CREATE VIEW leaderboard_alltime 
WITH (security_invoker = true) AS
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
DROP VIEW IF EXISTS leaderboard_daily;
CREATE VIEW leaderboard_daily 
WITH (security_invoker = true) AS
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
DROP VIEW IF EXISTS leaderboard_weekly;
CREATE VIEW leaderboard_weekly 
WITH (security_invoker = true) AS
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

-- Grant SELECT on the views to authenticated and anon roles
GRANT SELECT ON leaderboard_alltime TO authenticated, anon;
GRANT SELECT ON leaderboard_daily TO authenticated, anon;
GRANT SELECT ON leaderboard_weekly TO authenticated, anon;
