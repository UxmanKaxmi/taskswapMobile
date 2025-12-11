import { useQuery } from '@tanstack/react-query';
import { getFeed } from '../api/getFeed.api';

export function useFeed() {
  return useQuery({
    queryKey: ['Feed'],
    queryFn: getFeed,
  });
}
