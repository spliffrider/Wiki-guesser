-- Wiki Guesser - Leveling System Migration
-- Run this in Supabase SQL Editor

-- Add XP column to profiles (level is calculated from XP)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;

-- Initialize XP from existing total_score for current users
UPDATE profiles SET xp = total_score WHERE xp = 0 AND total_score > 0;
