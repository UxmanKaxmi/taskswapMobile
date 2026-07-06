import type { FeelingValue } from '@shared/utils/feelings';

export type AvatarUser = {
  id: string;
  name?: string;
  photo?: string | null;
  avatar?: string | null;
};

export type CheerPreset = {
  key: string;
  text: string;
};

export type BeatCheerState = {
  beatId: string;
  isLatest: boolean;
  isCheeringOpen: boolean;
  cheerCount: number;
  distinctCheererCount?: number;
  sampleCheerers: AvatarUser[];
  callerHasCheered: boolean;
  callerCheer?: {
    presetKey: string;
    presetText: string;
    createdAt: string;
  };
  isMostCheered: boolean;
};

export type GoalBeat = BeatCheerState & {
  id?: string;
  taskId?: string;
  type: 'post' | 'update';
  updateId?: string | null;
  text?: string | null;
  createdAt: string;
};

// ✅ Define all possible task types
export type GoalType = 'reminder' | 'decision' | 'motivation' | 'advice';

export enum GoalTypeEnum {
  Reminder = 'reminder',
  Decision = 'decision',
  Advice = 'advice',
  Motivation = 'motivation',
}

// ✅ Full Goal object (received from API)
export type Goal = {
  votedOption?: any;
  completedAt?: string | null;
  completed?: boolean;
  id: string;
  text: string;
  type: GoalType;
  createdAt: string;
  userId: string;
  remindAt?: string; // for reminder tasks
  options?: string[]; // for decision tasks
  deliverAt?: string; // for motivation tasks
  avatar?: string;
  name?: string;
  isAnonymous?: boolean;
  avatarColor?: string; // server-provided for anonymous goals
  feeling?: FeelingValue;
  hasAdvised?: boolean;
  hasVoted?: boolean;
  voteCount?: number;
  helpers?: Array<
    string | { id: string; name?: string; photo?: string | null; avatar?: string | null }
  >;
  progressUpdates?: ProgressUpdate[];
  beats?: GoalBeat[];
  cheerTotal?: number;
  distinctCheererCount?: number;
  sampleCheerers?: AvatarUser[];
  mostCheeredBeatId?: string | null;
  pushCount?: number;
  hasPushed?: boolean;
  viewCount?: number;
  commentsCount?: number;
  reminderNoteCount?: number;
  hasReminded?: boolean;
  pushHistory?: GoalPushEvent[];
  votes?: {
    [option: string]: {
      count: number;
      preview: Voter[];
    };
  };
};

export type ProgressUpdate = {
  id?: string;
  text: string;
  createdAt: string;
};

// ✅ Payload used for task creation
export interface GoalPayload {
  text: string;
  type: GoalType;
  feeling?: FeelingValue;
  remindAt?: string;
  options?: string[];
  deliverAt?: string;
  avatar?: string;
  name?: string;
  helpers?: string[]; // ✅ unified name with backend
}

// ✅ Payload used for task updates (partial and flexible)
export interface UpdateGoalInput {
  id: string;
  data: Partial<{
    text: string;
    type: GoalType;
    remindAt?: string;
    options?: string[];
    deliverAt?: string | null;
    avatar?: string;
    name?: string;
    helpers?: string[]; // ✅ unified name with backend
  }>;
}

export type Voter = {
  id: string;
  name: string;
  photo?: string;
};

// comment.ts
export type GoalComment = {
  id: string;
  taskId: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  user: { id: string; name: string; photo?: string };

  // 👍 likes
  likesCount: number; // total hearts
  likedByMe: boolean; // current user liked?
};

// For toggling like
export interface ToggleCommentLikePayload {
  commentId: string;
  like: boolean; // true = like, false = unlike
}

export type GoalPush = {
  pushCount: number;
  hasPushed: boolean;
  pushedAt?: string | null;
  createdAt?: string | null;
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
