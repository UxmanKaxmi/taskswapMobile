import { buildRoute } from '@shared/api/apiRoutes';
import { api } from '@shared/api/axios';
import { UserProfile } from '../types/myProfile.types';
import { useQuery } from '@tanstack/react-query';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { getMe } from '../api/MyProfileAPI';
import { useAuth } from '@features/Auth/AuthProvider';
import { useIsFocused } from '@react-navigation/native';

export function useMyProfileData() {
  const { user } = useAuth();
  const isFocused = useIsFocused();

  return useQuery<UserProfile>({
    queryKey: buildQueryKey.myProfile(),
    queryFn: getMe,
    enabled: !!user && isFocused, // 🔥 Runs ONLY when logged in and focused
  });
}

// import { useQuery } from '@tanstack/react-query';
// import { buildQueryKey, QueryKeys } from '@shared/constants/queryKeys';
// import { getAllNotifications } from '../api/NotificationApi';
// import { useIsFocused } from '@react-navigation/native';
// import { useAuth } from '@features/Auth/AuthProvider';

// export function useNotifications() {
//   const { user } = useAuth();
//   const isFocused = useIsFocused();

//   return useQuery({
//     queryKey: buildQueryKey.notifications(),
//     queryFn: getAllNotifications,
//     enabled: !!user && isFocused, // 🔥 Runs ONLY when logged in and focused
//   });
// }
