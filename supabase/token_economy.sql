-- =============================================================================
-- Token Economy System
-- Wiki Guesser - Monetization Phase 1
-- Created: 2024-12-26
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ADD CONFIG VALUES
-- -----------------------------------------------------------------------------

INSERT INTO public.app_config (key, value, description) VALUES
    ('points_per_upvote', '2', 'Points awarded to question creator when their question receives an upvote'),
    ('curated_game_cost', '5', 'Points required to play curated questions mode')
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. ADD NEW REWARD TYPE FOR UPVOTES
-- -----------------------------------------------------------------------------

-- First check if the enum value already exists, add if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'upvote_received' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'reward_type')
    ) THEN
        ALTER TYPE reward_type ADD VALUE 'upvote_received';
    END IF;
END$$;

-- Also add 'curated_game_spent' for tracking token spending
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'curated_game_spent' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'reward_type')
    ) THEN
        ALTER TYPE reward_type ADD VALUE 'curated_game_spent';
    END IF;
END$$;

-- -----------------------------------------------------------------------------
-- 3. TRIGGER: Award tokens to question creator on upvote
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.reward_upvote()
RETURNS TRIGGER AS $$
DECLARE
    v_question_creator_id UUID;
    v_points INTEGER;
BEGIN
    -- Only process upvotes
    IF NEW.vote_type != 'up' THEN
        RETURN NEW;
    END IF;
    
    -- Get the question creator
    SELECT user_id INTO v_question_creator_id
    FROM public.user_submitted_questions
    WHERE id = NEW.question_id;
    
    -- Skip if no creator (shouldn't happen, but safety check)
    IF v_question_creator_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Skip if voter is the question creator (no self-vote rewards)
    IF NEW.user_id = v_question_creator_id THEN
        RETURN NEW;
    END IF;
    
    -- Get points per upvote from config
    SELECT (value::text)::integer INTO v_points
    FROM public.app_config
    WHERE key = 'points_per_upvote';
    
    -- Default to 2 if not configured
    v_points := COALESCE(v_points, 2);
    
    -- Award points to the question creator
    INSERT INTO public.user_rewards (user_id, reward_type, points_earned, source_question_id, description)
    VALUES (v_question_creator_id, 'upvote_received', v_points, NEW.question_id, 'Received upvote on question');
    
    -- Note: The existing trigger_update_profile_reward_points will auto-increment
    -- the creator's reward_points in their profile
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create the trigger (drop first if exists to allow re-running)
DROP TRIGGER IF EXISTS trigger_reward_upvote ON public.question_votes;
CREATE TRIGGER trigger_reward_upvote
    AFTER INSERT ON public.question_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.reward_upvote();

-- -----------------------------------------------------------------------------
-- 4. FUNCTION: Spend tokens
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.spend_tokens(
    p_user_id UUID,
    p_amount INTEGER,
    p_reason TEXT DEFAULT 'curated_game'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_balance INTEGER;
BEGIN
    -- Get current balance
    SELECT reward_points INTO v_current_balance
    FROM public.profiles
    WHERE id = p_user_id;
    
    -- Check if user exists
    IF v_current_balance IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user has enough tokens
    IF v_current_balance < p_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Deduct tokens from profile
    UPDATE public.profiles
    SET reward_points = reward_points - p_amount
    WHERE id = p_user_id;
    
    -- Record the spend in user_rewards (negative amount for audit trail)
    INSERT INTO public.user_rewards (user_id, reward_type, points_earned, description)
    VALUES (p_user_id, 'curated_game_spent', -p_amount, p_reason);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- -----------------------------------------------------------------------------
-- 5. FUNCTION: Check if user can afford curated game
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.can_afford_curated_game(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_balance INTEGER;
    v_cost INTEGER;
BEGIN
    -- Get user's balance
    SELECT reward_points INTO v_balance
    FROM public.profiles
    WHERE id = p_user_id;
    
    -- Get cost from config
    SELECT (value::text)::integer INTO v_cost
    FROM public.app_config
    WHERE key = 'curated_game_cost';
    
    v_cost := COALESCE(v_cost, 5);
    
    RETURN COALESCE(v_balance, 0) >= v_cost;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- -----------------------------------------------------------------------------
-- 6. FUNCTION: Get curated game cost (for frontend)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_curated_game_cost()
RETURNS INTEGER AS $$
DECLARE
    v_cost INTEGER;
BEGIN
    SELECT (value::text)::integer INTO v_cost
    FROM public.app_config
    WHERE key = 'curated_game_cost';
    
    RETURN COALESCE(v_cost, 5);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- -----------------------------------------------------------------------------
-- 7. GRANTS
-- -----------------------------------------------------------------------------

GRANT EXECUTE ON FUNCTION public.spend_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_afford_curated_game TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_curated_game_cost TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_curated_game_cost TO anon;
