import { buildRoute } from '@shared/api/apiRoutes';
import { api } from '@shared/api/axios';
import { UserProfile } from '../types/myProfile.types';
import { useQuery } from '@tanstack/react-query';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { getMe } from '../api/MyProfileAPI';

export const useMyProfileData = () =>
  useQuery<UserProfile>({
    queryKey: buildQueryKey.myProfile(),
    queryFn: getMe,
  });
