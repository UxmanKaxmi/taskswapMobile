import { useQuery } from '@tanstack/react-query';
import { useIsFocused } from '@react-navigation/native';

import { useAuth } from '@features/Auth/AuthProvider';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { getMyImpact } from '../api/MyProfileAPI';
import { ImpactStats } from '../types/impact.types';

/**
 * Private giving-first stats for the "Your impact" screen.
 */
export function useMyImpact() {
  const { user } = useAuth();
  const isFocused = useIsFocused();

  return useQuery<ImpactStats>({
    queryKey: buildQueryKey.myImpact(),
    queryFn: getMyImpact,
    enabled: !!user && isFocused,
  });
}
