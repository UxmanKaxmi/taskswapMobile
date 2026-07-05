import { buildRoute } from '@shared/api/apiRoutes';
import { api } from '@shared/api/axios';
import type { BeatCheerState } from '../types/goals';

export type SendCheerPayload = {
  beatId: string;
  presetKey: string;
};

export async function sendCheer({ beatId, presetKey }: SendCheerPayload) {
  const res = await api.post<BeatCheerState>(buildRoute.cheerBeat(beatId), {
    presetKey,
  });
  return res.data;
}
