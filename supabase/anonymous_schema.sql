-- =============================================================================
-- Anonymous Question Submission System Schema
-- Wiki Guesser - Anonymous Creator Hub Questions
-- Created: 2025-12-25
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ANONYMOUS_SUBMITTED_QUESTIONS TABLE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.anonymous_submitted_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category question_category NOT NULL,
    
    -- Flexible JSONB for category-specific question data
    -- Same structure as user_submitted_questions.question_data
    question_data JSONB NOT NULL,
    
    -- Timestamps
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Optional spam prevention fields (for future use)
    submitter_ip TEXT,
    spam_score INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for anonymous_submitted_questions
CREATE INDEX idx_asq_category ON public.anonymous_submitted_questions(category);
CREATE INDEX idx_asq_submitted_at ON public.anonymous_submitted_questions(submitted_at DESC);
CREATE INDEX idx_asq_spam_score ON public.anonymous_submitted_questions(spam_score DESC);

-- -----------------------------------------------------------------------------
-- 2. UNIFIED VIEW FOR ADMIN (Authenticated + Anonymous Pending)
-- -----------------------------------------------------------------------------

-- View: All pending questions (both authenticated and anonymous)
CREATE OR REPLACE VIEW public.all_pending_questions_view 
WITH (security_invoker = true) AS
SELECT 
    usq.id,
    usq.category,
    usq.question_data,
    usq.submitted_at,
    'authenticated' AS source,
    p.username AS submitter_username,
    p.id AS submitter_id,
    0 AS spam_score
FROM public.user_submitted_questions usq
JOIN public.profiles p ON usq.user_id = p.id
WHERE usq.status = 'pending'

UNION ALL

SELECT 
    asq.id,
    asq.category,
    asq.question_data,
    asq.submitted_at,
    'anonymous' AS source,
    'Anonymous' AS submitter_username,
    NULL AS submitter_id,
    asq.spam_score
FROM public.anonymous_submitted_questions asq

ORDER BY submitted_at ASC;

-- -----------------------------------------------------------------------------
-- 3. FUNCTIONS FOR ANONYMOUS QUESTION APPROVAL/REJECTION
-- -----------------------------------------------------------------------------

-- Function: Approve an anonymous question and migrate to curated
-- This will move the question to user_submitted_questions with curated status
CREATE OR REPLACE FUNCTION public.approve_anonymous_question(
    p_question_id UUID,
    p_admin_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_question RECORD;
    v_new_id UUID;
BEGIN
    -- Get the anonymous question
    SELECT * INTO v_question
    FROM public.anonymous_submitted_questions
    WHERE id = p_question_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Insert into user_submitted_questions with curated status
    -- Note: user_id is NULL for anonymous questions
    INSERT INTO public.user_submitted_questions (
        user_id,
        category,
        question_data,
        status,
        reviewed_at,
        reviewed_by,
        admin_notes,
        submitted_at
    ) VALUES (
        NULL, -- Anonymous submissions have no user_id
        v_question.category,
        v_question.question_data,
        'curated', -- Skip voting, go straight to curated
        NOW(),
        p_admin_id,
        p_notes,
        v_question.submitted_at
    ) RETURNING id INTO v_new_id;
    
    -- Delete from anonymous table
    DELETE FROM public.anonymous_submitted_questions
    WHERE id = p_question_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function: Reject an anonymous question and delete it
CREATE OR REPLACE FUNCTION public.reject_anonymous_question(
    p_question_id UUID,
    p_admin_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Simply delete the anonymous question
    -- We could log rejection reasons in a separate audit table if needed
    DELETE FROM public.anonymous_submitted_questions
    WHERE id = p_question_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- -----------------------------------------------------------------------------
-- 4. MODIFY USER_SUBMITTED_QUESTIONS TO ALLOW NULL user_id
-- -----------------------------------------------------------------------------

-- Make user_id column nullable to support anonymous questions
ALTER TABLE public.user_submitted_questions 
ALTER COLUMN user_id DROP NOT NULL;

-- Add a check constraint to ensure either user_id exists OR status is curated
-- (curated anonymous questions can have NULL user_id)
ALTER TABLE public.user_submitted_questions
ADD CONSTRAINT check_user_or_curated 
CHECK (user_id IS NOT NULL OR status = 'curated');

-- -----------------------------------------------------------------------------
-- 5. RLS POLICIES
-- -----------------------------------------------------------------------------

-- Enable RLS on anonymous table
ALTER TABLE public.anonymous_submitted_questions ENABLE ROW LEVEL SECURITY;

-- Anonymous users can insert (submit questions)
CREATE POLICY "Anonymous users can submit questions" ON public.anonymous_submitted_questions
    FOR INSERT WITH CHECK (TRUE);

-- Only admins can view anonymous submissions
CREATE POLICY "Admins can view anonymous questions" ON public.anonymous_submitted_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Only admins can delete anonymous submissions (through rejection function)
CREATE POLICY "Admins can delete anonymous questions" ON public.anonymous_submitted_questions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Update existing RLS policy on user_submitted_questions to allow NULL user_id for curated
-- Drop the old policy and recreate it
DROP POLICY IF EXISTS "Authenticated users can submit questions" ON public.user_submitted_questions;

CREATE POLICY "Authenticated users can submit questions" ON public.user_submitted_questions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        OR (user_id IS NULL AND status = 'curated')
    );

-- Update the SELECT policy to allow viewing curated anonymous questions
DROP POLICY IF EXISTS "Everyone can view approved/curated questions" ON public.user_submitted_questions;

CREATE POLICY "Everyone can view approved/curated questions" ON public.user_submitted_questions
    FOR SELECT USING (
        status IN ('approved', 'curated')
        OR auth.uid() = user_id
    );

-- -----------------------------------------------------------------------------
-- 6. GRANTS
-- -----------------------------------------------------------------------------

-- Grant access to anonymous users
GRANT SELECT, INSERT ON public.anonymous_submitted_questions TO anon;

-- Grant access to authenticated users
GRANT SELECT, DELETE ON public.anonymous_submitted_questions TO authenticated;

-- Grant access to view
GRANT SELECT ON public.all_pending_questions_view TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.approve_anonymous_question TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_anonymous_question TO authenticated;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
