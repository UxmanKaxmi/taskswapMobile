import { api, CustomAxiosRequestConfig } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import {
  FeatureFlags,
  FeatureFlagsResponse,
  normalizeFeatureFlags,
} from '@shared/featureFlags/types';

type FeatureFlagsPayload = FeatureFlagsResponse | FeatureFlags;

export async function fetchFeatureFlags(): Promise<FeatureFlags> {
  const res = await api.get<FeatureFlagsPayload>(buildRoute.featureFlags(), {
    skipToast: true,
  } as CustomAxiosRequestConfig);

  const data = res.data as FeatureFlagsPayload | undefined;
  const raw = data && 'features' in data ? data.features : data;

  return normalizeFeatureFlags(raw ?? null);
}
