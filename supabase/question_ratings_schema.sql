-- =============================================================================
-- Question Rating System Schema
-- Wiki Guesser - Post-Game Question Feedback
-- Created: 2025-12-26
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. QUESTION_RATINGS TABLE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.question_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Question identification
    -- Format: "{category}_{row_id}" e.g. "wiki_what_abc-123" or "user_submitted_xyz-456"
    question_id TEXT NOT NULL,
    category question_category NOT NULL,
    
    -- Rating (0-100 scale)
    rating_value INTEGER NOT NULL CHECK (rating_value >= 0 AND rating_value <= 100),
    
    -- Optional user tracking (NULL for anonymous ratings)
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. INDEXES
-- -----------------------------------------------------------------------------

-- Query by question to get all ratings for a specific question
CREATE INDEX idx_qr_question_id ON public.question_ratings(question_id);

-- Filter by category
CREATE INDEX idx_qr_category ON public.question_ratings(category);

-- Track user's rating history (when authenticated)
CREATE INDEX idx_qr_user_id ON public.question_ratings(user_id) WHERE user_id IS NOT NULL;

-- Sort by recency for analytics
CREATE INDEX idx_qr_created_at ON public.question_ratings(created_at DESC);

-- Composite index for category analytics
CREATE INDEX idx_qr_category_created ON public.question_ratings(category, created_at DESC);

-- -----------------------------------------------------------------------------
-- 3. RLS POLICIES
-- -----------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE public.question_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can submit ratings (authenticated or anonymous)
CREATE POLICY "Anyone can submit ratings" ON public.question_ratings
    FOR INSERT WITH CHECK (TRUE);

-- Users can view their own ratings if authenticated
CREATE POLICY "Users can view own ratings" ON public.question_ratings
    FOR SELECT USING (user_id = auth.uid());

-- Admins can view all ratings for analytics
CREATE POLICY "Admins can view all ratings" ON public.question_ratings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- -----------------------------------------------------------------------------
-- 4. GRANTS
-- -----------------------------------------------------------------------------

-- Grant insert to anonymous users
GRANT INSERT ON public.question_ratings TO anon;

-- Grant select/insert to authenticated users
GRANT SELECT, INSERT ON public.question_ratings TO authenticated;

-- -----------------------------------------------------------------------------
-- 5. ANALYTICS VIEW (For Admins)
-- -----------------------------------------------------------------------------

-- Create a view for easy analytics on question ratings
CREATE OR REPLACE VIEW public.question_rating_stats
WITH (security_invoker = true) AS
SELECT 
    category,
    question_id,
    COUNT(*) as rating_count,
    AVG(rating_value)::NUMERIC(5,2) as avg_rating,
    STDDEV(rating_value)::NUMERIC(5,2) as rating_stddev,
    MIN(rating_value) as min_rating,
    MAX(rating_value) as max_rating,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY rating_value) as median_rating,
    MIN(created_at) as first_rated_at,
    MAX(created_at) as last_rated_at
FROM public.question_ratings
GROUP BY category, question_id
ORDER BY avg_rating DESC;

-- Grant view access to admins only
GRANT SELECT ON public.question_rating_stats TO authenticated;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
