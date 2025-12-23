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
    | 'achievement';

// -----------------------------------------------------------------------------
// Database Row Types
// -----------------------------------------------------------------------------

export interface UserSubmittedQuestion {
    id: string;
    userId: string;
    category: QuestionCategory;
    questionData: QuestionData;
    status: QuestionStatus;
    submittedAt: string;
    reviewedAt: string | null;
    reviewedBy: string | null;
    adminNotes: string | null;
    upvotes: number;
    downvotes: number;
    createdAt: string;
    updatedAt: string;
}

export interface QuestionVote {
    id: string;
    userId: string;
    questionId: string;
    voteType: VoteType;
    createdAt: string;
}

export interface UserReward {
    id: string;
    userId: string;
    rewardType: RewardType;
    pointsEarned: number;
    sourceQuestionId: string | null;
    description: string | null;
    createdAt: string;
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
    questionData: QuestionData;
    submittedAt: string;
    upvotes: number;
    downvotes: number;
    submitterUsername: string;
    submitterId: string;
}

export interface CurationCandidateView {
    id: string;
    category: QuestionCategory;
    questionData: QuestionData;
    upvotes: number;
    downvotes: number;
    netVotes: number;
    submittedAt: string;
    submitterUsername: string;
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
    | 'points_for_voting';

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
