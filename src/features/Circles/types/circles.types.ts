import type { FeelingValue } from '@shared/utils/feelings';
import type { Goal } from '@features/Goals/types/goals';

// Wire contract mirrors the backend circle DTOs (new endpoints, so the wire
// noun is "circle"/"goalText"; member tasks keep the existing task contract).

export type CircleStatus = 'active' | 'complete' | 'dissolved';
export type CircleMemberState = 'active' | 'left' | 'done';

export type CircleSummary = {
  id: string;
  goalText: string;
  status: CircleStatus;
  createdAt: string;
};

export type CircleCardMember = {
  userId: string;
  name: string;
  avatar: string;
  state: Extract<CircleMemberState, 'active' | 'done'>;
  taskId: string | null;
  taskCreatedAt: string | null;
  feeling: string | null;
  hasUpdate: boolean;
};

// One feed card per circle; `kind` discriminates it from Goal items in the
// mixed home feed list.
export type CircleFeedCard = {
  kind: 'circle';
  id: string;
  goalText: string;
  status: CircleStatus;
  createdAt: string;
  totalPushes: number;
  latestActivityAt: string;
  // Members with updates in the last 24h — the card's activity signal.
  recentUpdateCount: number;
  members: CircleCardMember[];
};

export type CircleLaneUpdate = {
  text: string;
  createdAt: string;
  // Reactions ride the update's beat via the existing cheer machinery.
  beatId: string | null;
  cheerCount: number;
  viewerHasCheered: boolean;
};

export type CircleLane = {
  memberId: string;
  userId: string;
  name: string;
  avatar: string;
  state: Extract<CircleMemberState, 'active' | 'done'>;
  joinedAt: string;
  doneAt: string | null;
  taskId: string | null;
  taskCreatedAt: string | null;
  feeling: string | null;
  completed: boolean;
  pushCount: number;
  hasPushed: boolean;
  viewerHasNudged: boolean;
  latestUpdate: CircleLaneUpdate | null;
};

// The circle's shared activity feed: positive events only, newest first.
export type CircleActivityEvent = {
  id: string;
  kind: 'created' | 'joined' | 'update' | 'push' | 'done' | 'complete';
  at: string;
  name: string;
  avatar: string;
  // Actor id so the timeline can render "You" and gate cheer affordances.
  userId?: string;
  text?: string;
  targetName?: string;
  // Cheerable events ride the cheer machinery: updates carry their update
  // beat, done wins carry the task's post beat. Absent otherwise.
  beatId?: string;
  cheerCount?: number;
  viewerHasCheered?: boolean;
  latestCheer?: { name: string; text: string } | null;
};

export type CircleDetail = {
  id: string;
  goalText: string;
  status: CircleStatus;
  createdAt: string;
  completedAt: string | null;
  memberCount: number;
  doneCount: number;
  totalPushes: number;
  hasOpenSeats: boolean;
  viewer: {
    isMember: boolean;
    state: CircleMemberState | null;
  };
  lanes: CircleLane[];
  activity: CircleActivityEvent[];
};

export type CircleInvitePreview = {
  goalText: string;
  state: 'open' | 'expired' | 'full' | 'closed';
  memberCount: number;
  members: { name: string; avatar: string }[];
  expiresAt: string;
};

export type CreateCirclePayload = {
  goalText: string;
  feeling?: FeelingValue;
  // Friends already on PushMeUp — they get an in-app invite notification
  // that deep-links to the join screen.
  inviteUserIds?: string[];
};

export type CreateCircleResponse = {
  circle: CircleSummary;
  task: Goal;
  inviteLink: string;
  inviteExpiresAt: string;
};

export type CircleInviteResponse = {
  inviteLink: string;
  inviteExpiresAt: string;
};

export type JoinCirclePayload = {
  feeling?: FeelingValue;
};

export type JoinCircleResponse = {
  circle: CircleSummary;
  member: { id: string; circleId: string; userId: string; state: CircleMemberState };
  task: Goal | null;
  alreadyMember: boolean;
};

export type PushAllResponse = {
  pushed: string[];
};
