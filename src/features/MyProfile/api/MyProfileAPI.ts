import { api } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import { UserProfile } from '../types/myProfile.types';
import type { FeedbackPayload } from '../types/feedback.types';

/**
 * Fetch the current authenticated user's profile.
 */
export async function getMe(): Promise<UserProfile> {
  const response = await api.get<UserProfile>(buildRoute.me());

  return response.data;
}

export async function submitFeedback(payload: FeedbackPayload): Promise<void> {
  await api.post(buildRoute.submitFeedback(), payload);
}

export async function deleteMyAccount(): Promise<void> {
  await api.delete(buildRoute.deleteMe());
}
