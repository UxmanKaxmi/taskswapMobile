import { useQuery } from '@tanstack/react-query';
import { useIsFocused } from '@react-navigation/native';

import { useAuth } from '@features/Auth/AuthProvider';
import { buildQueryKey } from '@shared/constants/queryKeys';

import { getHomeSummaryAPI, getLocalUtcOffsetMinutes } from '../api/api';

export function useHomeSummary() {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const utcOffsetMinutes = getLocalUtcOffsetMinutes();

  return useQuery({
    queryKey: buildQueryKey.homeSummary(utcOffsetMinutes),
    queryFn: () => getHomeSummaryAPI(utcOffsetMinutes),
    enabled: !!user && isFocused,
  });
}
