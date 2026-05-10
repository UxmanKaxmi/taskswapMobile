import { api } from '@shared/api/axios';
import {
  HomeSummaryApiResponse,
  HomeSummaryCounts,
  HomeSummaryResponse,
  ReminderNoteDTO,
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
  const successStory =
    response.successStory ??
    response.modules?.successStory ??
    (isSuccessStoryModule(response) ? response : null);
  const heroModule = response.heroModule ?? successStory ?? null;

  return {
    summaryCounts,
    modules: response.modules ?? null,
    successStory,
    heroModule,
    peopleNeedYourPushToday: summaryCounts.peopleNeedYourPushToday,
    replyWaitingCount: summaryCounts.replyWaitingCount,
    featuredStory: response.featuredStory ?? null,
  };
}

export async function sendReminderNoteAPI(taskId: string, message: string) {
  const res = await api.post<ReminderNoteDTO>(buildRoute.sendReminder(taskId), {
    message,
  });
  return res.data;
}

export async function getRemindersByTaskAPI(taskId: string) {
  console.log('[🔄 API CALL] Fetching task by ID:', taskId); // ✅ Add this
  const res = await api.get<ReminderNoteDTO[]>(buildRoute.getReminders(taskId));
  return res.data;
}

export async function getTaskByIdAPI(taskId: string) {
  const res = await api.get(buildRoute.task(taskId));
  return res.data;
}

export async function getHomeSummaryAPI(utcOffsetMinutes = getLocalUtcOffsetMinutes()) {
  console.log('[HOME_SUMMARY_API] fetching', { utcOffsetMinutes });
  const res = await api.get<HomeSummaryApiResponse>(buildRoute.homeSummary(), {
    params: {
      utcOffsetMinutes,
    },
  });

  const normalized = normalizeHomeSummaryResponse(res.data);
  console.log('[HOME_SUMMARY_API] success', res.data);
  console.log('[HOME_SUMMARY_API] normalized', {
    moduleSuccessStoryTitle: normalized.modules?.successStory?.title ?? null,
    successStoryTitle: normalized.successStory?.title ?? null,
    heroModuleTitle: normalized.heroModule?.title ?? null,
    peopleNeedYourPushToday: normalized.peopleNeedYourPushToday,
    replyWaitingCount: normalized.replyWaitingCount,
  });

  return normalized;
}
