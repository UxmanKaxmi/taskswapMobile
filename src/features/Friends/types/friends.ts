import { TaskHelper } from '@features/Home/types/home';
import { TaskType } from '@features/Tasks/types/tasks';

export interface SearchResultFriend {
  id: string;
  photo: string;
  name: string;
  email: string;
  isFollowing: boolean;
}

type Props = {
  type: 'followers' | 'following';
  searchQuery?: string;
};

export interface FriendTask {
  id: string;
  text: string;
  type: TaskType;
  createdAt: string;
  completed: boolean;
  remindAt?: string;
  deliverAt?: string;
  options?: string[];
  helpers: TaskHelper[];
}

export interface FriendSummary {
  id: string;
  name: string;
  photo?: string;
}
export interface FriendProfile {
  tasksDone: number;
  dayStreak: number;
  taskSuccessRate: number;
  id: string;
  name: string;
  email: string;
  photo?: string;
  bio: string | null;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  recentTasks: FriendTask[];
  mutualFriends: FriendSummary[];
}
