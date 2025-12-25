// =============================================================================
// UGC (User-Generated Content) System Types
// Wiki Guesser - Phase 1: TypeScript Types
// =============================================================================

import { QuestionCategory } from './index';

// -----------------------------------------------------------------------------
// Enums (matching PostgreSQL enums)
// -----------------------------------------------------------------------------

export type QuestionStatus = 'pending' | 'approved' | 'rejected' | 'curated';

export type VoteType = 'up' | 'down';

export type RewardType =
    | 'question_approved'
    | 'question_curated'
    | 'vote_bonus'
    | 'achievement'
    | 'upvote_received'
    | 'curated_game_spent';

// -----------------------------------------------------------------------------
// Database Row Types
// -----------------------------------------------------------------------------

export interface UserSubmittedQuestion {
    id: string;
    user_id: string | null; // NULL for anonymous curated questions
    category: QuestionCategory;
    question_data: QuestionData;
    status: QuestionStatus;
    submitted_at: string;
    reviewed_at: string | null;
    reviewed_by: string | null;
    admin_notes: string | null;
    upvotes: number;
    downvotes: number;
    created_at: string;
    updated_at: string;
}

export interface AnonymousSubmittedQuestion {
    id: string;
    category: QuestionCategory;
    question_data: QuestionData;
    submitted_at: string;
    submitter_ip: string | null;
    spam_score: number;
    created_at: string;
}

export interface QuestionVote {
    id: string;
    user_id: string;
    question_id: string;
    vote_type: VoteType;
    created_at: string;
}

export interface UserReward {
    id: string;
    user_id: string;
    reward_type: RewardType;
    points_earned: number;
    source_question_id: string | null;
    description: string | null;
    created_at: string;
}

export interface AppConfig {
    key: string;
    value: unknown;
    description: string | null;
    updatedAt: string;
    updatedBy: string | null;
}

// -----------------------------------------------------------------------------
// Category-Specific Question Data (JSONB structure)
// -----------------------------------------------------------------------------

export interface WikiWhatQuestionData {
    title: string;
    excerpt: string;
    imageUrl?: string;
    wrongOptions: string[];
    topic: string;
}

export interface WikiOrFictionQuestionData {
    statement: string;
    isTrue: boolean;
    explanation: string;
    topic: string;
    source?: string;
}

export interface OddWikiOutQuestionData {
    items: string[];
    impostorIndex: number;
    connection: string;
    topic: string;
}

export interface WhenInWikiQuestionData {
    event: string;
    correctYear: number;
    yearOptions: number[];
    topic: string;
}

export interface WikiLinksQuestionData {
    titles: string[];
    connection: string;
    connectionOptions: string[];
    topic: string;
}

export type QuestionData =
    | WikiWhatQuestionData
    | WikiOrFictionQuestionData
    | OddWikiOutQuestionData
    | WhenInWikiQuestionData
    | WikiLinksQuestionData;

// -----------------------------------------------------------------------------
// View Types
// -----------------------------------------------------------------------------

export interface PendingQuestionView {
    id: string;
    category: QuestionCategory;
    question_data: QuestionData;
    submitted_at: string;
    upvotes: number;
    downvotes: number;
    submitter_username: string;
    submitter_id: string;
}

export interface AllPendingQuestionView {
    id: string;
    category: QuestionCategory;
    question_data: QuestionData;
    submitted_at: string;
    source: 'authenticated' | 'anonymous';
    submitter_username: string; // 'Anonymous' for anonymous
    submitter_id: string | null; // NULL for anonymous
    spam_score: number;
}

export interface CurationCandidateView {
    id: string;
    category: QuestionCategory;
    question_data: QuestionData;
    upvotes: number;
    downvotes: number;
    net_votes: number;
    submitted_at: string;
    submitter_username: string;
    approved_at: string | null; // Added this as likely needed
}

// -----------------------------------------------------------------------------
// API Request/Response Types
// -----------------------------------------------------------------------------

export interface SubmitQuestionRequest {
    category: QuestionCategory;
    questionData: QuestionData;
}

export interface SubmitQuestionResponse {
    id: string;
    status: 'pending';
}

export interface VoteRequest {
    questionId: string;
    voteType: VoteType;
}

export interface AdminReviewRequest {
    questionId: string;
    action: 'approve' | 'reject';
    notes?: string;
}

export interface UserRewardSummary {
    totalPoints: number;
    questionsSubmitted: number;
    questionsApproved: number;
    questionsCurated: number;
    recentRewards: UserReward[];
}

// -----------------------------------------------------------------------------
// Config Keys (for type safety)
// -----------------------------------------------------------------------------

export type AppConfigKey =
    | 'curation_threshold'
    | 'points_for_approved'
    | 'points_for_curated'
    | 'points_for_voting'
    | 'points_per_upvote'
    | 'curated_game_cost';

// -----------------------------------------------------------------------------
// Helper function types
// -----------------------------------------------------------------------------

export interface AwardPointsParams {
    userId: string;
    rewardType: RewardType;
    points: number;
    sourceQuestionId?: string;
    description?: string;
}
