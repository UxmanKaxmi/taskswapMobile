// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { followUser } from '../api/userApi';
// import { buildQueryKey } from '@shared/constants/queryKeys';

// export const useFollowUser = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (followingId: string) => followUser(followingId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: buildQueryKey.followers() });
//       queryClient.invalidateQueries({ queryKey: buildQueryKey.following() });
//     },
//   });
// };

//REPLACED WITH TOGGLE_FOLLOW_API
