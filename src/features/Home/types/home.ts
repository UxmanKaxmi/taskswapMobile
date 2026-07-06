import type { FeelingValue } from '@shared/utils/feelings';
import type { AvatarUser, GoalBeat } from '@features/Goals/types/goals';

// ---------------------------------------------
// ✅ Define all task types strictly
// ---------------------------------------------
export type GoalType = 'reminder' | 'decision' | 'motivation' | 'advice';
export type TabKey = 'all' | 'motivation' | 'advice' | 'decision' | 'reminder';

export type HelperUser = {
  id: string;
  name: string;
  photo?: string;
};

export type GoalHelper = HelperUser;

export type Voter = {
  id: string;
  name: string;
  photo?: string;
};

export type ProgressUpdate = {
  id?: string;
  text: string;
  createdAt: string;
};

export type GoalPushEvent = {
  id?: string;
  createdAt?: string;
  pushedAt?: string;
  message?: string | null;
  user?: {
    id: string;
    name: string;
    photo?: string | null;
  };
};

// ---------------------------------------------
// ✅ Shared fields for all tasks
// ---------------------------------------------

export type BaseGoal = {
  id: string;
  text: string;
  type: GoalType;
  createdAt: string;

  userId: string;
  avatar?: string;
  name: string;
  isAnonymous?: boolean;
  avatarColor?: string; // server-provided for anonymous goals
  feeling?: FeelingValue;

  helpers: HelperUser[];

  // 🔥 Backend counts (added in your API)
  commentsCount: number;
  reminderNoteCount: number;
  voteCount: number;
  viewCount: number;

  pushCount: number;
  hasPushed: boolean;
  hasAdvised?: boolean;
  progressUpdates?: ProgressUpdate[];
  beats?: GoalBeat[];
  cheerTotal?: number;
  distinctCheererCount?: number;
  sampleCheerers?: AvatarUser[];
  mostCheeredBeatId?: string | null;
  pushHistory?: GoalPushEvent[];

  // 🔥 Extra state
  hasReminded: boolean;

  // Voting info (optional — only decision type truly uses it)
  votes?: Record<
    string,
    {
      count: number;
      preview: Voter[];
    }
  >;

  votedOption?: string | null;
};

// ---------------------------------------------
// ✅ Specific task types
// ---------------------------------------------

export type ReminderGoal = BaseGoal & {
  type: 'reminder';
  remindAt: string;
  completed: boolean;
  completedAt?: string | null;
};

export type DecisionGoal = BaseGoal & {
  type: 'decision';
  options: string[];
  votes: Record<
    string,
    {
      count: number;
      preview: Voter[];
    }
  >;
  hasVoted?: boolean;
  votedOption?: string | null;
};

export type MotivationGoal = BaseGoal & {
  type: 'motivation';
  deliverAt?: string;
  completed?: boolean;
  completedAt?: string | null;
};

export type AdviceGoal = BaseGoal & {
  type: 'advice';
};

// ---------------------------------------------
// ✅ Union of all tasks
// ---------------------------------------------
export type Goal = ReminderGoal | DecisionGoal | MotivationGoal | AdviceGoal;

// ---------------------------------------------
// ✅ Reminder Notes
// ---------------------------------------------
export interface ReminderNoteDTO {
  id: string;
  taskId: string;
  senderId: string;
  isSenderCurrentUser?: boolean;
  message: string;
  createdAt: string;
  senderName: string;
  senderPhoto?: string | null;
}

export type TimeFilter = 'latest' | 'today' | 'thisWeek' | 'thisMonth' | 'allTime';

export type FeedFilter = {
  time?: TimeFilter;
  types: GoalType[];
};

export type HomeSummaryCounts = {
  peopleNeedYourPushToday: number;
  replyWaitingCount: number;
};

export type HomeCompactStatus = {
  streakDay: number;
  pushedTodayCount: number;
};

export type HomeHeroModuleEntity = {
  type: 'task';
  taskId: string;
  taskText: string;
  ownerId: string;
  ownerName: string;
  ownerPhoto: string | null;
};

export type HomeSuccessStoryHeroModule = {
  type: 'success_story';
  title: string;
  body: string;
  entity: HomeHeroModuleEntity;
  timestamps: {
    contributedAt: string;
    resultAt: string;
  };
};

export type HomeSuccessStory = HomeSuccessStoryHeroModule & {
  id?: string;
  ctaLabel?: string;
};

export type HomeHeroModule = HomeSuccessStoryHeroModule;

export type HomeFeaturedStory = {
  type: 'motivation-success';
  taskId: string;
  taskText: string;
  ownerId: string;
  ownerName: string;
  ownerPhoto: string | null;
  pushedAt: string | null;
  completedAt: string | null;
};

export type HomeYourGoal = {
  taskId: string;
  text: string;
  pushCount: number;
  createdAt: string;
  progressCount: number;
};

export type HomeSummaryResponse = {
  yourGoal: HomeYourGoal | null;
  summaryCounts: HomeSummaryCounts;
  compactStatus: HomeCompactStatus;
  modules?: HomeSummaryModules | null;
  successStory: HomeSuccessStory | null;
  heroModule: HomeHeroModule | null;
  peopleNeedYourPushToday: number;
  replyWaitingCount: number;
  featuredStory: HomeFeaturedStory | null;
};

export type HomeSummaryModules = {
  successStory?: HomeSuccessStory | null;
  needsYourPush?: unknown;
  updateProgress?: unknown;
  adviceRequestWaitingOnYou?: unknown;
};

export type HomeSummaryApiResponse = Partial<HomeSummaryResponse> & {
  summaryCounts?: Partial<HomeSummaryCounts> | null;
  modules?: HomeSummaryModules | null;
  successStory?: HomeSuccessStory | null;
  heroModule?: HomeHeroModule | null;
  featuredStory?: HomeFeaturedStory | null;
  ctaLabel?: string;
};
