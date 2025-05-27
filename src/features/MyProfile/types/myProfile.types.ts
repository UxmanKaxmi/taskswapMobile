export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photo?: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  taskSuccessRate: number; // 0–100 percentage
  tasksDone: number;
  dayStreak: number;
}
