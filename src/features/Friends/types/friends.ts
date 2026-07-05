import { GoalHelper } from '@features/Home/types/home';
import { GoalType } from '@features/Goals/types/goals';

export interface SearchResultFriend {
  id: string;
  photo: string;
  name: string;
  email: string;
  isFollowing: boolean;
}

export interface FriendGoal {
  id: string;
  text: string;
  type: GoalType;
  createdAt: string;
  completed: boolean;
  remindAt?: string;
  deliverAt?: string;
  options?: string[];
  helpers: GoalHelper[];
}

export interface FriendSummary {
  id: string;
  name: string;
  photo?: string;
}
export interface FriendProfile {
  tasksDone: number;
  dayStreak: number;
  pushesGiven?: number;
  taskSuccessRate: number;
  id: string;
  name: string;
  username?: string | null;
  photo?: string;
  bio: string | null;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  recentTasks: FriendGoal[];
  mutualFriends: FriendSummary[];
}
