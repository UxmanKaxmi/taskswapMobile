import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showToast } from '@shared/utils/toast';
import { fetchReferralLinkAPI, rotateReferralLinkAPI } from '../api/inviteAPI';
import { ReferralLinkResponse } from '../types/invite';
import { buildQueryKey, QueryKeys } from '@shared/constants/queryKeys';

type Channel = 'sms' | 'whatsapp' | 'email' | undefined;

export function useReferralLink(channel?: Channel) {
  const qc = useQueryClient();

  const query = useQuery<ReferralLinkResponse>({
    queryKey: [...buildQueryKey.referralLink(), channel], // keep channel-specific cache
    queryFn: () => fetchReferralLinkAPI(channel),
    staleTime: 5 * 60 * 1000, // 5m
    retry: 1,
    refetchOnWindowFocus: false,
    // onError: () => {
    //   showToast({ type: 'error', title: 'Could not fetch referral link' });
    // },
    select: data => {
      // normalize safe defaults for UI
      return {
        link: data?.link ?? '',
        refCode: data?.refCode ?? '',
        stats: {
          totalInvites: data?.stats?.totalInvites ?? 0,
          joined: data?.stats?.joined ?? 0,
          rewardsEarned: data?.stats?.rewardsEarned ?? 0,
          pendingRewards: data?.stats?.pendingRewards ?? 0,
        },
        share: {
          message:
            data?.share?.message ?? 'Join me on TaskSwap — manage and share your tasks easily!',
          title: data?.share?.title ?? 'Invite to TaskSwap',
        },
      } as ReferralLinkResponse;
    },
  });

  const rotate = useMutation({
    mutationFn: rotateReferralLinkAPI,
    onSuccess: data => {
      // Update current channel cache immediately
      qc.setQueryData([...buildQueryKey.referralLink(), channel], data);

      // Invalidate ALL channel variants of referral-link
      qc.invalidateQueries({
        predicate: q => Array.isArray(q.queryKey) && q.queryKey[0] === QueryKeys.ReferralLink,
      });

      showToast({ type: 'success', title: 'New referral link generated' });
    },
    onError: () => {
      showToast({ type: 'error', title: 'Failed to regenerate link' });
    },
  });

  // Convenience helpers for UI
  const inviteCount = query.data?.stats?.totalInvites ?? 0;
  const rewards = query.data?.stats?.rewardsEarned ?? 0;
  const sharePayload = query.data
    ? {
        message: `${query.data.share?.message ?? ''} ${query.data.link}`.trim(),
        url: query.data.link,
        title: query.data.share?.title ?? 'Invite to TaskSwap',
      }
    : undefined;

  return {
    ...query, // data, isLoading, error, refetch, etc.
    inviteCount,
    rewards,
    sharePayload, // ready-to-use object for Share.share(...)
    rotateLink: rotate.mutate,
    rotating: rotate.isPending,
  };
}
