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

// ✅ The app is motivation-only; the server may still return legacy types.
export type GoalType = 'motivation';

export enum GoalTypeEnum {
  Motivation = 'motivation',
}

// ✅ Full Goal object (received from API)
export type Goal = {
  completedAt?: string | null;
  completed?: boolean;
  id: string;
  text: string;
  type: GoalType;
  createdAt: string;
  userId: string;
  deliverAt?: string;
  avatar?: string;
  name?: string;
  feeling?: FeelingValue;
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
  pushHistory?: GoalPushEvent[];
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
    deliverAt?: string | null;
    avatar?: string;
    name?: string;
    helpers?: string[]; // ✅ unified name with backend
  }>;
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
