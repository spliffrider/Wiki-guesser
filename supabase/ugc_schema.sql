-- =============================================================================
-- UGC (User-Generated Content) System Schema
-- Wiki Guesser - Phase 1: Database Schema
-- Created: 2024-12-24
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ENUMS
-- -----------------------------------------------------------------------------

-- Question category enum
CREATE TYPE question_category AS ENUM (
    'wiki_what',
    'odd_wiki_out', 
    'when_in_wiki',
    'wiki_or_fiction',
    'wiki_links'
);

-- Question status enum
CREATE TYPE question_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'curated'
);

-- Vote type enum
CREATE TYPE vote_type AS ENUM (
    'up',
    'down'
);

-- Reward type enum
CREATE TYPE reward_type AS ENUM (
    'question_approved',
    'question_curated',
    'vote_bonus',
    'achievement'
);

-- -----------------------------------------------------------------------------
-- 2. ADD is_admin AND reward_points TO PROFILES (if not exists)
-- -----------------------------------------------------------------------------

-- Add is_admin column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add reward_points column to profiles (cached total for fast reads)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT 0;

-- -----------------------------------------------------------------------------
-- 3. USER_SUBMITTED_QUESTIONS TABLE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_submitted_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category question_category NOT NULL,
    
    -- Flexible JSONB for category-specific question data
    -- wiki_what: { title, excerpt, imageUrl, wrongOptions[], topic }
    -- wiki_or_fiction: { statement, isTrue, explanation, topic, source }
    -- odd_wiki_out: { items[], impostorIndex, connection, topic }
    -- when_in_wiki: { event, correctYear, yearOptions[], topic }
    -- wiki_links: { titles[], connection, connectionOptions[], topic }
    question_data JSONB NOT NULL,
    
    -- Status workflow
    status question_status NOT NULL DEFAULT 'pending',
    
    -- Timestamps
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id),
    
    -- Admin feedback
    admin_notes TEXT,
    
    -- Vote counts (cached for performance)
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for user_submitted_questions
CREATE INDEX idx_usq_user_id ON public.user_submitted_questions(user_id);
CREATE INDEX idx_usq_status ON public.user_submitted_questions(status);
CREATE INDEX idx_usq_category ON public.user_submitted_questions(category);
CREATE INDEX idx_usq_submitted_at ON public.user_submitted_questions(submitted_at DESC);
CREATE INDEX idx_usq_upvotes ON public.user_submitted_questions(upvotes DESC) 
    WHERE status = 'approved';

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_usq_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usq_updated_at
    BEFORE UPDATE ON public.user_submitted_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_usq_updated_at();

-- -----------------------------------------------------------------------------
-- 4. QUESTION_VOTES TABLE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.question_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.user_submitted_questions(id) ON DELETE CASCADE,
    vote_type vote_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one vote per user per question
    CONSTRAINT unique_user_question_vote UNIQUE (user_id, question_id)
);

-- Indexes for question_votes
CREATE INDEX idx_qv_question_id ON public.question_votes(question_id);
CREATE INDEX idx_qv_user_id ON public.question_votes(user_id);

-- Trigger to update vote counts on user_submitted_questions
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 'up' THEN
            UPDATE public.user_submitted_questions 
            SET upvotes = upvotes + 1 
            WHERE id = NEW.question_id;
        ELSE
            UPDATE public.user_submitted_questions 
            SET downvotes = downvotes + 1 
            WHERE id = NEW.question_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'up' THEN
            UPDATE public.user_submitted_questions 
            SET upvotes = GREATEST(upvotes - 1, 0) 
            WHERE id = OLD.question_id;
        ELSE
            UPDATE public.user_submitted_questions 
            SET downvotes = GREATEST(downvotes - 1, 0) 
            WHERE id = OLD.question_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle vote change (e.g., up -> down)
        IF OLD.vote_type = 'up' AND NEW.vote_type = 'down' THEN
            UPDATE public.user_submitted_questions 
            SET upvotes = GREATEST(upvotes - 1, 0), downvotes = downvotes + 1 
            WHERE id = NEW.question_id;
        ELSIF OLD.vote_type = 'down' AND NEW.vote_type = 'up' THEN
            UPDATE public.user_submitted_questions 
            SET upvotes = upvotes + 1, downvotes = GREATEST(downvotes - 1, 0) 
            WHERE id = NEW.question_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER trigger_update_vote_counts
    AFTER INSERT OR UPDATE OR DELETE ON public.question_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_vote_counts();

-- -----------------------------------------------------------------------------
-- 5. USER_REWARDS TABLE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reward_type reward_type NOT NULL,
    points_earned INTEGER NOT NULL,
    source_question_id UUID REFERENCES public.user_submitted_questions(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for user_rewards
CREATE INDEX idx_ur_user_id ON public.user_rewards(user_id);
CREATE INDEX idx_ur_created_at ON public.user_rewards(created_at DESC);

-- Trigger to update cached reward_points on profiles
CREATE OR REPLACE FUNCTION update_profile_reward_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles 
    SET reward_points = reward_points + NEW.points_earned 
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER trigger_update_profile_reward_points
    AFTER INSERT ON public.user_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_reward_points();

-- -----------------------------------------------------------------------------
-- 6. APP_CONFIG TABLE (Admin-tunable settings)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id)
);

-- Insert default configuration values
INSERT INTO public.app_config (key, value, description) VALUES
    ('curation_threshold', '10', 'Minimum net upvotes (upvotes - downvotes) to become curated'),
    ('points_for_approved', '10', 'Points awarded when a question is approved'),
    ('points_for_curated', '50', 'Bonus points when a question becomes curated'),
    ('points_for_voting', '1', 'Points awarded for casting a vote')
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 7. VIEWS
-- -----------------------------------------------------------------------------

-- View: Pending questions for admin review
CREATE OR REPLACE VIEW public.pending_questions_view 
WITH (security_invoker = true) AS
SELECT 
    usq.id,
    usq.category,
    usq.question_data,
    usq.submitted_at,
    usq.upvotes,
    usq.downvotes,
    p.username AS submitter_username,
    p.id AS submitter_id
FROM public.user_submitted_questions usq
JOIN public.profiles p ON usq.user_id = p.id
WHERE usq.status = 'pending'
ORDER BY usq.submitted_at ASC;

-- View: Approved questions eligible for curation
CREATE OR REPLACE VIEW public.curation_candidates_view 
WITH (security_invoker = true) AS
SELECT 
    usq.id,
    usq.category,
    usq.question_data,
    usq.upvotes,
    usq.downvotes,
    (usq.upvotes - usq.downvotes) AS net_votes,
    usq.submitted_at,
    p.username AS submitter_username
FROM public.user_submitted_questions usq
JOIN public.profiles p ON usq.user_id = p.id
WHERE usq.status = 'approved'
  AND (usq.upvotes - usq.downvotes) >= (
      SELECT (value::text)::integer 
      FROM public.app_config 
      WHERE key = 'curation_threshold'
  )
ORDER BY net_votes DESC;

-- -----------------------------------------------------------------------------
-- 8. FUNCTIONS
-- -----------------------------------------------------------------------------

-- Function: Award points to a user
CREATE OR REPLACE FUNCTION public.award_points(
    p_user_id UUID,
    p_reward_type reward_type,
    p_points INTEGER,
    p_source_question_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_reward_id UUID;
BEGIN
    INSERT INTO public.user_rewards (user_id, reward_type, points_earned, source_question_id, description)
    VALUES (p_user_id, p_reward_type, p_points, p_source_question_id, p_description)
    RETURNING id INTO v_reward_id;
    
    RETURN v_reward_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: Approve a question (admin only)
CREATE OR REPLACE FUNCTION public.approve_question(
    p_question_id UUID,
    p_admin_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_points INTEGER;
BEGIN
    -- Get the question submitter
    SELECT user_id INTO v_user_id 
    FROM public.user_submitted_questions 
    WHERE id = p_question_id AND status = 'pending';
    
    IF v_user_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Update question status
    UPDATE public.user_submitted_questions
    SET status = 'approved',
        reviewed_at = NOW(),
        reviewed_by = p_admin_id,
        admin_notes = p_notes
    WHERE id = p_question_id;
    
    -- Get points for approved questions
    SELECT (value::text)::integer INTO v_points
    FROM public.app_config 
    WHERE key = 'points_for_approved';
    
    -- Award points to submitter
    PERFORM public.award_points(
        v_user_id, 
        'question_approved', 
        COALESCE(v_points, 10),
        p_question_id,
        'Question approved by admin'
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: Reject a question (admin only)
CREATE OR REPLACE FUNCTION public.reject_question(
    p_question_id UUID,
    p_admin_id UUID,
    p_notes TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.user_submitted_questions
    SET status = 'rejected',
        reviewed_at = NOW(),
        reviewed_by = p_admin_id,
        admin_notes = p_notes
    WHERE id = p_question_id AND status = 'pending';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: Promote eligible questions to curated status
CREATE OR REPLACE FUNCTION public.promote_to_curated()
RETURNS INTEGER AS $$
DECLARE
    v_threshold INTEGER;
    v_points INTEGER;
    v_count INTEGER := 0;
    v_question RECORD;
BEGIN
    -- Get configuration values
    SELECT (value::text)::integer INTO v_threshold
    FROM public.app_config WHERE key = 'curation_threshold';
    
    SELECT (value::text)::integer INTO v_points
    FROM public.app_config WHERE key = 'points_for_curated';
    
    -- Find and promote eligible questions
    FOR v_question IN 
        SELECT id, user_id 
        FROM public.user_submitted_questions
        WHERE status = 'approved'
          AND (upvotes - downvotes) >= v_threshold
    LOOP
        -- Update to curated
        UPDATE public.user_submitted_questions
        SET status = 'curated'
        WHERE id = v_question.id;
        
        -- Award bonus points
        PERFORM public.award_points(
            v_question.user_id,
            'question_curated',
            COALESCE(v_points, 50),
            v_question.id,
            'Question promoted to curated status'
        );
        
        v_count := v_count + 1;
    END LOOP;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- -----------------------------------------------------------------------------
-- 9. RLS POLICIES
-- -----------------------------------------------------------------------------

-- Enable RLS on all new tables
ALTER TABLE public.user_submitted_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- USER_SUBMITTED_QUESTIONS policies

-- Users can view their own questions (any status)
CREATE POLICY "Users can view own questions" ON public.user_submitted_questions
    FOR SELECT USING (auth.uid() = user_id);

-- Everyone can view approved/curated questions
CREATE POLICY "Everyone can view approved/curated questions" ON public.user_submitted_questions
    FOR SELECT USING (status IN ('approved', 'curated'));

-- Authenticated users can submit questions
CREATE POLICY "Authenticated users can submit questions" ON public.user_submitted_questions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending questions
CREATE POLICY "Users can update own pending questions" ON public.user_submitted_questions
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Users can delete their own pending questions
CREATE POLICY "Users can delete own pending questions" ON public.user_submitted_questions
    FOR DELETE USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all questions
CREATE POLICY "Admins can view all questions" ON public.user_submitted_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Admins can update any question (for approval/rejection)
CREATE POLICY "Admins can update questions" ON public.user_submitted_questions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- QUESTION_VOTES policies

-- Users can view their own votes
CREATE POLICY "Users can view own votes" ON public.question_votes
    FOR SELECT USING (auth.uid() = user_id);

-- Users can vote on approved/curated questions
CREATE POLICY "Users can vote on approved questions" ON public.question_votes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.user_submitted_questions
            WHERE id = question_id AND status IN ('approved', 'curated')
        )
    );

-- Users can update their own vote
CREATE POLICY "Users can update own vote" ON public.question_votes
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own vote
CREATE POLICY "Users can delete own vote" ON public.question_votes
    FOR DELETE USING (auth.uid() = user_id);

-- USER_REWARDS policies

-- Users can view their own rewards
CREATE POLICY "Users can view own rewards" ON public.user_rewards
    FOR SELECT USING (auth.uid() = user_id);

-- Only system (via functions) can insert rewards
-- No direct INSERT policy for users

-- APP_CONFIG policies

-- Everyone can read config
CREATE POLICY "Everyone can read config" ON public.app_config
    FOR SELECT USING (TRUE);

-- Only admins can update config
CREATE POLICY "Admins can update config" ON public.app_config
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- -----------------------------------------------------------------------------
-- 10. GRANTS
-- -----------------------------------------------------------------------------

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_submitted_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_votes TO authenticated;
GRANT SELECT ON public.user_rewards TO authenticated;
GRANT SELECT ON public.app_config TO authenticated;
GRANT SELECT ON public.pending_questions_view TO authenticated;
GRANT SELECT ON public.curation_candidates_view TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.award_points TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_question TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_question TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_to_curated TO authenticated;

-- Grant to anon for public viewing
GRANT SELECT ON public.user_submitted_questions TO anon;
GRANT SELECT ON public.app_config TO anon;
