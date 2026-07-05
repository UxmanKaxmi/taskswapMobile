import { api } from '@shared/api/axios';
import type { CustomAxiosRequestConfig } from '@shared/api/axios';
import {
  HomeCompactStatus,
  HomeSummaryApiResponse,
  HomeSummaryCounts,
  HomeSummaryResponse,
} from '../types/home';
import { buildRoute } from '@shared/api/apiRoutes';

export function getLocalUtcOffsetMinutes() {
  return -new Date().getTimezoneOffset();
}

function isSuccessStoryModule(value: unknown): value is HomeSummaryResponse['successStory'] {
  return (
    !!value && typeof value === 'object' && (value as { type?: string }).type === 'success_story'
  );
}

export function normalizeHomeSummaryResponse(
  response: HomeSummaryApiResponse,
): HomeSummaryResponse {
  const summaryCounts: HomeSummaryCounts = {
    peopleNeedYourPushToday:
      response.summaryCounts?.peopleNeedYourPushToday ?? response.peopleNeedYourPushToday ?? 0,
    replyWaitingCount: response.summaryCounts?.replyWaitingCount ?? response.replyWaitingCount ?? 0,
  };
  const compactStatus: HomeCompactStatus = {
    streakDay: response.compactStatus?.streakDay ?? 0,
    pushedTodayCount: response.compactStatus?.pushedTodayCount ?? 0,
  };
  const successStory =
    response.successStory ??
    response.modules?.successStory ??
    (isSuccessStoryModule(response) ? response : null);
  const heroModule = response.heroModule ?? successStory ?? null;

  return {
    yourGoal: response.yourGoal ?? null,
    summaryCounts,
    compactStatus,
    modules: response.modules ?? null,
    successStory,
    heroModule,
    peopleNeedYourPushToday: summaryCounts.peopleNeedYourPushToday,
    replyWaitingCount: summaryCounts.replyWaitingCount,
    featuredStory: response.featuredStory ?? null,
  };
}

export async function getGoalByIdAPI(taskId: string, config?: CustomAxiosRequestConfig) {
  const res = await api.get(buildRoute.task(taskId), config);
  return res.data;
}

export async function getHomeSummaryAPI(utcOffsetMinutes = getLocalUtcOffsetMinutes()) {
  const res = await api.get<HomeSummaryApiResponse>(buildRoute.homeSummary(), {
    params: {
      utcOffsetMinutes,
    },
  });

  const normalized = normalizeHomeSummaryResponse(res.data);

  return normalized;
}
