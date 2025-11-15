// features/Invite/types/invite.ts
export type ReferralStats = {
  totalInvites: number;
  joined: number;
  rewardsEarned: number;
  pendingRewards?: number;
};

export type ReferralLinkResponse = {
  link: string;
  refCode: string;
  stats: ReferralStats;
  share?: { message?: string; title?: string };
};

export type Channel = 'sms' | 'whatsapp' | 'email' | undefined;
