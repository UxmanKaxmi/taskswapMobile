import { api } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import type {
  CircleDetail,
  CircleInvitePreview,
  CircleInviteResponse,
  CreateCirclePayload,
  CreateCircleResponse,
  JoinCirclePayload,
  JoinCircleResponse,
  PushAllResponse,
} from '../types/circles.types';

export async function createCircle(payload: CreateCirclePayload): Promise<CreateCircleResponse> {
  const response = await api.post<CreateCircleResponse>(buildRoute.createCircle(), payload);
  return response.data;
}

export async function getCircle(circleId: string): Promise<CircleDetail> {
  const response = await api.get<CircleDetail>(buildRoute.circle(circleId));
  return response.data;
}

export async function createCircleInvite(circleId: string): Promise<CircleInviteResponse> {
  const response = await api.post<CircleInviteResponse>(buildRoute.circleInvites(circleId), {});
  return response.data;
}

export async function leaveCircle(circleId: string): Promise<void> {
  await api.post(buildRoute.circleLeave(circleId), {});
}

export async function pushAllInCircle(circleId: string): Promise<PushAllResponse> {
  const response = await api.post<PushAllResponse>(buildRoute.circlePushAll(circleId), {});
  return response.data;
}

export async function joinCircleByToken(
  token: string,
  payload: JoinCirclePayload,
): Promise<JoinCircleResponse> {
  const response = await api.post<JoinCircleResponse>(buildRoute.circleInviteJoin(token), payload);
  return response.data;
}

export async function getCircleInvitePreview(token: string): Promise<CircleInvitePreview> {
  const response = await api.get<CircleInvitePreview>(buildRoute.circleInvitePreview(token));
  return response.data;
}
