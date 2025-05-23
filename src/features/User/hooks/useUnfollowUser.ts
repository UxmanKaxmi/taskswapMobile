// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { unfollowUser } from '../api/userApi';
// import { buildQueryKey } from '@shared/constants/queryKeys';

// export const useUnfollowUser = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (followingId: string) => unfollowUser(followingId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: buildQueryKey.following() });
//       queryClient.invalidateQueries({ queryKey: buildQueryKey.followers() });
//     },
//   });
// };
//REPLACED WITH TOGGLE_FOLLOW_API
