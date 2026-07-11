import type { FirstTimeHintMap } from '@features/FirstTimeHints/firstTimeHints';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photo?: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  pushesGiven?: number;
  taskSuccessRate: number; // 0–100 percentage
  tasksDone: number;
  dayStreak: number;
  firstTimeHints?: FirstTimeHintMap;
}
