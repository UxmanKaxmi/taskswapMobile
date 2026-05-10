/* global jest, describe, beforeEach, it, expect */

import { buildRoute } from '@shared/api/apiRoutes';
import { api } from '@shared/api/axios';

import { getHomeSummaryAPI, normalizeHomeSummaryResponse } from './api';

jest.mock('@shared/api/axios', () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockedGet = api.get as jest.Mock;

describe('home summary api', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('normalizes the summary payload and preserves featuredStory', () => {
    const raw = {
      summaryCounts: {
        peopleNeedYourPushToday: 4,
        replyWaitingCount: 2,
      },
      heroModule: {
        type: 'success_story',
        title: 'Big turnaround',
        body: 'The team moved fast and shipped well.',
        entity: {
          type: 'task',
          taskId: 'task-1',
          taskText: 'Ship the homepage refresh',
          ownerId: 'user-1',
          ownerName: 'Alex Doe',
          ownerPhoto: null,
        },
        timestamps: {
          contributedAt: '2026-04-20T10:00:00.000Z',
          resultAt: '2026-04-21T10:00:00.000Z',
        },
      },
      peopleNeedYourPushToday: 9,
      replyWaitingCount: 8,
      featuredStory: {
        type: 'motivation-success',
        taskId: 'task-legacy',
        taskText: 'Legacy task',
        ownerId: 'user-legacy',
        ownerName: 'Legacy Owner',
        ownerPhoto: null,
        pushedAt: null,
        completedAt: null,
      },
    };

    expect(normalizeHomeSummaryResponse(raw)).toEqual({
      summaryCounts: {
        peopleNeedYourPushToday: 4,
        replyWaitingCount: 2,
      },
      heroModule: raw.heroModule,
      peopleNeedYourPushToday: 4,
      replyWaitingCount: 2,
      featuredStory: raw.featuredStory,
    });
  });

  it('falls back to top-level counts when summaryCounts is missing', () => {
    const normalized = normalizeHomeSummaryResponse({
      peopleNeedYourPushToday: 6,
      replyWaitingCount: 1,
      heroModule: null,
      featuredStory: null,
    });

    expect(normalized.summaryCounts).toEqual({
      peopleNeedYourPushToday: 6,
      replyWaitingCount: 1,
    });
    expect(normalized.peopleNeedYourPushToday).toBe(6);
    expect(normalized.replyWaitingCount).toBe(1);
    expect(normalized.heroModule).toBeNull();
    expect(normalized.featuredStory).toBeNull();
  });

  it('requests the home summary with the utc offset parameter', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        summaryCounts: {
          peopleNeedYourPushToday: 3,
          replyWaitingCount: 5,
        },
        heroModule: null,
        featuredStory: null,
      },
    });

    const result = await getHomeSummaryAPI(330);

    expect(mockedGet).toHaveBeenCalledWith(buildRoute.homeSummary(), {
      params: {
        utcOffsetMinutes: 330,
      },
    });
    expect(result.summaryCounts).toEqual({
      peopleNeedYourPushToday: 3,
      replyWaitingCount: 5,
    });
  });
});
