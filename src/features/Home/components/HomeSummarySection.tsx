import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import { getFirstName, stripOuterQuotes } from '@shared/utils/helperFunctions';
import { haptics } from '@shared/utils/haptics';
import { useAuth } from '@features/Auth/AuthProvider';

import { AppStackParamList } from '@navigation/types/navigation';
import { HomeSummaryResponse, Task } from '../types/home';
import { ms, vs } from 'react-native-size-matters';
import { differenceInCalendarDays, isValid, parseISO } from 'date-fns';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';

type Props = {
  summary?: HomeSummaryResponse | null;
  tasks?: Task[];
  currentUserId?: string | null;
  isGuestMode?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onPressTask?: (task: Task) => void;
  onHasVisibleCardsChange?: (hasVisibleCards: boolean) => void;
  includeCardKeys?: readonly HomeSummaryCardKey[];
  /** Testing: render every card type (with fallback copy) and ignore dismiss state. */
  previewAllCards?: boolean;
};

type CardTone = {
  background: string;
  titleColor: string;
  bodyColor?: string;
  eyebrowColor?: string;
  iconColor: string;
  leadingBg: string;
};

type CardConfig = {
  key: string;
  eyebrow: string;
  title: string;
  body: string;
  /** Trailing count block (e.g. "15 pushes"), hero-card style. */
  metric?: { value: string; label: string } | null;
  /** Trailing icon on the right (used when there's no metric). */
  trailingIcon?: { set: 'fa6' | 'ion'; name: string; iconStyle?: 'solid' | 'regular' } | null;
  tone: CardTone;
  leadingIcon: { set: 'fa6' | 'ion'; name: string; iconStyle?: 'solid' | 'regular' };
  fingerprint: string;
  task?: Task | null;
  onPress?: () => void;
};

export type HomeSummaryCardKey =
  | 'create-first-push'
  | 'your-goal'
  | 'success-story'
  | 'needs-push'
  | 'update-progress';

const CARD_GAP = ms(20);
const CARD_WIDTH = WINDOW_WIDTH - spacing.lg * 2;
const CARD_WIDTH_SINGLE = WINDOW_WIDTH - spacing.lg * 2;

const CARD_HEIGHT = ms(86);
const HOME_SUMMARY_CARD_KEYS: HomeSummaryCardKey[] = [
  'create-first-push',
  'your-goal',
  'success-story',
  'needs-push',
  'update-progress',
];

// Single dark tone shared by every summary card, mirroring HomeHeroCard:
// ink background, white title, muted-white body, yellow icon chip.
const DARK_TONE: CardTone = {
  background: colors.onboardingInk,
  titleColor: colors.onPrimary,
  bodyColor: 'rgba(255,255,255,0.76)',
  eyebrowColor: colors.onboardingPush,
  iconColor: colors.onboardingInk,
  leadingBg: colors.onboardingPush,
};

const TONES = {
  success: DARK_TONE,
  push: DARK_TONE,
  progress: DARK_TONE,
  advice: DARK_TONE,
  firstTask: DARK_TONE,
} satisfies Record<string, CardTone>;

export default function HomeSummarySection({
  summary,
  tasks,
  currentUserId = null,
  isGuestMode = false,
  isLoading: _isLoading = false,
  isError: _isError = false,
  onRetry: _onRetry,
  onPressTask,
  onHasVisibleCardsChange,
  includeCardKeys = HOME_SUMMARY_CARD_KEYS,
  previewAllCards = false,
}: Props) {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const cardWidth = CARD_WIDTH;
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollOffsetRef = useRef(0);
  const currentIndexRef = useRef(0);
  const isDraggingRef = useRef(false);
  const autoScrollTimerRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);
  const { user } = useAuth();
  const handleCreateFirstPushPress = useCallback(() => {
    if (!user) {
      navigation.navigate('AuthIntro', {
        redirectTo: 'AddTask',
      });
      return;
    }

    const parentNavigation = navigation.getParent();
    if (parentNavigation) {
      parentNavigation.navigate('AddTask' as never);
    } else {
      navigation.navigate('AddTask' as never);
    }

    haptics.selection();
  }, [navigation, user]);
  const cards = useMemo(() => {
    const nextCards = isGuestMode
      ? buildGuestCards(navigation)
      : buildCards({
          summary,
          tasks: tasks ?? [],
          currentUserId,
          onPressTask,
          onCreateFirstPushPress: handleCreateFirstPushPress,
          previewAllCards,
        });

    return nextCards.filter(card => includeCardKeys.includes(card.key as HomeSummaryCardKey));
  }, [
    currentUserId,
    handleCreateFirstPushPress,
    includeCardKeys,
    isGuestMode,
    navigation,
    onPressTask,
    previewAllCards,
    summary,
    tasks,
  ]);
  const cardStride = cardWidth + CARD_GAP;

  // Always show the built cards — tapping a card no longer dismisses it, so the
  // carousel is never empty as long as there's a card to build.
  const visibleCards = cards;

  useEffect(() => {
    onHasVisibleCardsChange?.(visibleCards.length > 0);
  }, [onHasVisibleCardsChange, visibleCards.length]);

  // Tapping a card just triggers its action; cards are no longer dismissed so
  // there's always a summary card present.
  const handleCardPress = useCallback((card: CardConfig) => {
    card.onPress?.();
  }, []);

  const scheduleNextSlide = useCallback(
    function scheduleNextSlide() {
      if (autoScrollTimerRef.current) {
        globalThis.clearTimeout(autoScrollTimerRef.current);
        autoScrollTimerRef.current = null;
      }

      if (visibleCards.length <= 1) {
        return;
      }

      autoScrollTimerRef.current = globalThis.setTimeout(() => {
        if (isDraggingRef.current || visibleCards.length <= 1) {
          scheduleNextSlide();
          return;
        }

        const nextIndex = (currentIndexRef.current + 1) % visibleCards.length;
        currentIndexRef.current = nextIndex;
        scrollOffsetRef.current = nextIndex * cardStride;

        scrollRef.current?.scrollTo({
          x: scrollOffsetRef.current,
          animated: true,
        });

        scheduleNextSlide();
      }, 3000);
    },
    [cardStride, visibleCards.length],
  );

  useEffect(() => {
    if (visibleCards.length <= 1) {
      return undefined;
    }

    scrollOffsetRef.current = 0;
    currentIndexRef.current = 0;
    scrollRef.current?.scrollTo({ x: 0, animated: false });
    scheduleNextSlide();

    return () => {
      if (autoScrollTimerRef.current) {
        globalThis.clearTimeout(autoScrollTimerRef.current);
        autoScrollTimerRef.current = null;
      }
    };
  }, [scheduleNextSlide, visibleCards.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.x;
  };

  const handleScrollBeginDrag = () => {
    isDraggingRef.current = true;
    if (autoScrollTimerRef.current) {
      globalThis.clearTimeout(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.x;
    currentIndexRef.current = Math.round(scrollOffsetRef.current / cardStride);
    isDraggingRef.current = false;
    scheduleNextSlide();
  };

  if (visibleCards.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={isGuestMode ? CARD_WIDTH_SINGLE + CARD_GAP : CARD_WIDTH + CARD_GAP}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={styles.carouselContent}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        bounces={false}
        scrollEnabled={visibleCards.length > 1}
      >
        {visibleCards.map(card => (
          <View
            key={card.key}
            style={[
              styles.cardShell,
              {
                width: isGuestMode ? CARD_WIDTH_SINGLE : CARD_WIDTH,
                minWidth: isGuestMode ? CARD_WIDTH_SINGLE : CARD_WIDTH,
                maxWidth: isGuestMode ? CARD_WIDTH_SINGLE : CARD_WIDTH,
                flexGrow: 0,
                flexShrink: 0,
              },
            ]}
          >
            <MinimalCard
              width={isGuestMode ? CARD_WIDTH_SINGLE : CARD_WIDTH}
              eyebrow={card.eyebrow}
              title={card.title}
              body={card.body}
              metric={card.metric}
              trailingIcon={card.trailingIcon}
              tone={card.tone}
              onPress={() => handleCardPress(card)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function buildCards({
  summary,
  tasks,
  currentUserId,
  onPressTask,
  onCreateFirstPushPress,
  previewAllCards = false,
}: {
  summary?: HomeSummaryResponse | null;
  tasks: Task[];
  currentUserId: string | null;
  onPressTask?: (task: Task) => void;
  onCreateFirstPushPress: () => void;
  previewAllCards?: boolean;
}): CardConfig[] {
  const trimmedCurrentUserId = currentUserId?.trim() ?? '';
  const hasCreatedAnyTask = tasks.some(task => task.userId === trimmedCurrentUserId);
  const successStoryKey =
    summary?.successStory?.id?.trim() ??
    summary?.heroModule?.entity.taskId?.trim() ??
    summary?.featuredStory?.taskId?.trim() ??
    '';
  const successTask = findTaskById(
    tasks,
    summary?.successStory?.entity.taskId ??
      summary?.heroModule?.entity.taskId ??
      summary?.featuredStory?.taskId ??
      null,
  );
  const goalTask = selectGoalTask(tasks, currentUserId);
  const pushTask = selectMotivationTask(tasks, currentUserId);
  const progressTask = selectProgressTask(tasks, currentUserId);

  // Prefer the server-authoritative goal from the summary (always up to date
  // after posting); fall back to the feed-derived own task.
  const summaryGoal = summary?.yourGoal ?? null;
  const goalText = summaryGoal
    ? stripOuterQuotes(summaryGoal.text)
    : goalTask
      ? stripOuterQuotes(goalTask.text)
      : 'Your goal shows up here';
  const goalPushCount = summaryGoal?.pushCount ?? goalTask?.pushCount ?? 0;
  const goalDay = summaryGoal
    ? getGoalDayNumber(summaryGoal.createdAt, summaryGoal.progressCount)
    : getTaskDayNumber(goalTask);
  const goalForPress: Task | null =
    goalTask ??
    (summaryGoal
      ? ({ id: summaryGoal.taskId, type: 'motivation', text: summaryGoal.text } as unknown as Task)
      : null);
  const goalFingerprint = summaryGoal
    ? `your-goal:${summaryGoal.taskId}:${summaryGoal.pushCount}:${summaryGoal.progressCount}`
    : goalTask
      ? buildTaskFingerprint(goalTask)
      : 'your-goal:placeholder';

  const goalCard =
    summaryGoal || goalTask || previewAllCards
      ? ({
          key: 'your-goal',
          eyebrow: `YOUR GOAL · DAY ${goalDay}`,
          title: goalText,
          body: '',
          metric: buildPushMetric(goalPushCount),
          tone: TONES.success,
          leadingIcon: { set: 'fa6', name: 'flag-checkered', iconStyle: 'solid' },
          fingerprint: goalFingerprint,
          task: goalForPress,
          onPress: goalForPress ? () => onPressTask?.(goalForPress) : undefined,
        } satisfies CardConfig)
      : null;

  const successCard =
    successStoryKey || previewAllCards
      ? ({
          key: 'success-story',
          eyebrow: 'SUCCESS STORY',
          title: buildSuccessStoryTitle(summary),
          body: '',
          trailingIcon: { set: 'fa6', name: 'trophy', iconStyle: 'solid' },
          tone: TONES.success,
          leadingIcon: { set: 'fa6', name: 'circle-check', iconStyle: 'solid' },
          fingerprint: buildSuccessStoryFingerprint(summary),
          task: successTask,
          onPress: successTask ? () => onPressTask?.(successTask) : undefined,
        } satisfies CardConfig)
      : null;

  // Data-driven cards — only present when there's something real to show.
  const dataCards = [
    goalCard,
    successCard,
    pushTask || previewAllCards
      ? ({
          key: 'needs-push',
          eyebrow: `NEEDS A PUSH${pushTask ? ` · ${getFirstName(pushTask.name)}` : ''}`,
          title: buildPushBody(pushTask),
          body: '',
          metric: buildPushMetric(pushTask?.pushCount ?? 0),
          tone: TONES.push,
          leadingIcon: { set: 'fa6', name: 'person-running', iconStyle: 'solid' },
          fingerprint: buildTaskFingerprint(pushTask),
          task: pushTask,
          onPress: pushTask ? () => onPressTask?.(pushTask) : undefined,
        } satisfies CardConfig)
      : null,
    progressTask || previewAllCards
      ? ({
          key: 'update-progress',
          eyebrow: `YOUR PROGRESS · DAY ${getTaskDayNumber(progressTask)}`,
          title: progressTask ? stripOuterQuotes(progressTask.text) : 'Update your progress',
          body: '',
          metric: buildPushMetric(progressTask?.pushCount ?? 0),
          tone: TONES.progress,
          leadingIcon: { set: 'fa6', name: 'bullseye', iconStyle: 'solid' },
          fingerprint: buildTaskFingerprint(progressTask),
          task: progressTask,
          onPress: progressTask ? () => onPressTask?.(progressTask) : undefined,
        } satisfies CardConfig)
      : null,
  ].filter(Boolean) as CardConfig[];

  // CTA only for brand-new users who haven't created anything yet.
  const firstTaskCard =
    (trimmedCurrentUserId && !hasCreatedAnyTask) || previewAllCards
      ? ({
          key: 'create-first-push',
          eyebrow: 'GET STARTED',
          title: 'Share what you’re trying to finish and get pushed forward.',
          body: '',
          trailingIcon: { set: 'fa6', name: 'circle-plus', iconStyle: 'solid' },
          tone: TONES.firstTask,
          leadingIcon: { set: 'fa6', name: 'circle-plus', iconStyle: 'solid' },
          fingerprint: 'create-first-push:v1',
          onPress: onCreateFirstPushPress,
        } satisfies CardConfig)
      : null;

  return [firstTaskCard, ...dataCards].filter(Boolean) as CardConfig[];
}

function buildGuestCards(navigation: NavigationProp<AppStackParamList>): CardConfig[] {
  // Guests see the same "create your first push" CTA; tapping it routes to login.
  return [
    {
      key: 'create-first-push',
      eyebrow: 'GET STARTED',
      title: 'Share what you’re trying to finish and get pushed forward.',
      body: '',
      trailingIcon: { set: 'fa6', name: 'circle-plus', iconStyle: 'solid' },
      tone: TONES.firstTask,
      leadingIcon: { set: 'fa6', name: 'circle-plus', iconStyle: 'solid' },
      fingerprint: 'create-first-push:guest',
      onPress: () => {
        navigation.navigate('AuthIntro', {
          redirectTo: 'AddTask',
          authContext: 'AddTask',
        });
      },
    },
  ];
}

function buildSuccessStoryTitle(summary?: HomeSummaryResponse | null) {
  const ownerName =
    summary?.successStory?.entity.ownerName ??
    summary?.heroModule?.entity.ownerName ??
    summary?.featuredStory?.ownerName ??
    null;

  if (ownerName) {
    return `Your push helped ${ownerName} finish what they started.`;
  }

  return 'Your push helped someone finish what they started.';
}

function buildPushBody(task: Task | null) {
  if (!task) return 'A new push request will show up here.';
  return stripOuterQuotes(task.text);
}

function buildPushMetric(count: number) {
  return { value: String(count), label: count === 1 ? 'push' : 'pushes' };
}

function selectGoalTask(tasks: Task[], currentUserId: string | null) {
  const ownActiveGoals = tasks.filter(
    (task): task is Extract<Task, { type: 'motivation' }> =>
      task.type === 'motivation' &&
      task.userId === currentUserId &&
      !task.completed &&
      !task.completedAt,
  );

  if (!ownActiveGoals.length) return null;

  return [...ownActiveGoals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
}

function getTaskDayNumber(task: Extract<Task, { type: 'motivation' }> | null) {
  if (!task) return 1;
  return getGoalDayNumber(task.createdAt, task.progressUpdates?.length ?? 0);
}

function getGoalDayNumber(createdAt: string, progressCount: number) {
  if (progressCount > 0) return progressCount + 1;

  const parsed = parseISO(createdAt);
  if (isValid(parsed)) {
    return Math.max(1, differenceInCalendarDays(new Date(), parsed) + 1);
  }

  return 1;
}

function selectMotivationTask(tasks: Task[], currentUserId: string | null) {
  const motivationTasks = tasks.filter(
    (task): task is Extract<Task, { type: 'motivation' }> =>
      task.type === 'motivation' && !task.completed && !task.completedAt,
  );

  const otherUserTasks = motivationTasks.filter(task => task.userId !== currentUserId);

  if (!otherUserTasks.length) return null;

  // Prefer someone you haven't pushed yet, but always fall back to any active
  // goal from another user so a "needs your push" card is always available.
  return otherUserTasks.find(task => !task.hasPushed) ?? otherUserTasks[0];
}

function selectProgressTask(tasks: Task[], currentUserId: string | null) {
  const motivationTasks = tasks.filter(
    (task): task is Extract<Task, { type: 'motivation' }> =>
      task.type === 'motivation' && !task.completed && !task.completedAt,
  );

  const ownTasks = motivationTasks.filter(task => task.userId === currentUserId);

  if (!ownTasks.length) return null;

  return ownTasks.find(task => (task.pushCount ?? 0) > 0) ?? null;
}

function findTaskById(tasks: Task[], taskId: string | null): Task | null {
  if (!taskId) return null;
  return tasks.find(task => task.id === taskId) ?? null;
}

function buildSuccessStoryFingerprint(summary?: HomeSummaryResponse | null) {
  if (summary?.successStory) {
    return [
      summary.successStory.id,
      summary.successStory.title,
      summary.successStory.body,
      summary.successStory.entity.taskId,
      summary.successStory.timestamps.contributedAt,
      summary.successStory.timestamps.resultAt,
    ].join('|');
  }

  if (summary?.heroModule) {
    return [
      summary.heroModule.entity.taskId,
      summary.heroModule.title,
      summary.heroModule.body,
      summary.heroModule.timestamps.contributedAt,
      summary.heroModule.timestamps.resultAt,
    ].join('|');
  }

  if (summary?.featuredStory) {
    return [
      summary.featuredStory.taskId,
      summary.featuredStory.taskText,
      summary.featuredStory.ownerId,
      summary.featuredStory.ownerName,
      summary.featuredStory.pushedAt ?? '',
      summary.featuredStory.completedAt ?? '',
    ].join('|');
  }

  return '';
}

function buildTaskFingerprint(task: Task | null) {
  if (!task) return '';

  return [
    task.id,
    task.type,
    task.text,
    task.createdAt,
    task.userId,
    task.name ?? '',
    task.hasPushed ? '1' : '0',
    String(task.pushCount ?? 0),
    String(task.commentsCount ?? 0),
    String(task.reminderNoteCount ?? 0),
    String(task.voteCount ?? 0),
    String(task.viewCount ?? 0),
    task.hasReminded ? '1' : '0',
    'completedAt' in task
      ? String((task as { completedAt?: string | null }).completedAt ?? '')
      : '',
    'completed' in task ? String((task as { completed?: boolean }).completed ?? '') : '',
    task.votedOption ? String(task.votedOption) : '',
  ].join('|');
}

function MinimalCard({
  width,
  eyebrow,
  title,
  body,
  metric,
  trailingIcon,
  tone,
  onPress,
}: {
  width: number;
  eyebrow?: string;
  title: string;
  body: string;
  metric?: { value: string; label: string } | null;
  trailingIcon?: { set: 'fa6' | 'ion'; name: string; iconStyle?: 'solid' | 'regular' } | null;
  tone: CardTone;
  onPress?: () => void;
}) {
  const content = (
    <View style={[styles.card, { width, backgroundColor: tone.background }]}>
      {eyebrow ? (
        <TextElement style={[styles.eyebrow, { color: tone.eyebrowColor ?? tone.titleColor }]}>
          {eyebrow}
        </TextElement>
      ) : null}

      <View style={styles.bodyRow}>
        <View style={styles.textBlock}>
          <TextElement
            variant="headline"
            weight="700"
            numberOfLines={2}
            style={[styles.title, { color: tone.titleColor }]}
          >
            {title}
          </TextElement>
          {body ? (
            <TextElement
              variant="bodySmall"
              numberOfLines={2}
              style={[styles.body, { color: tone.bodyColor ?? tone.titleColor }]}
            >
              {body}
            </TextElement>
          ) : null}
        </View>

        {metric ? (
          <View style={styles.metricBlock}>
            <TextElement
              style={[styles.metricValue, { color: tone.eyebrowColor ?? tone.titleColor }]}
            >
              {metric.value}
            </TextElement>
            <TextElement style={[styles.metricLabel, { color: tone.bodyColor ?? tone.titleColor }]}>
              {metric.label}
            </TextElement>
          </View>
        ) : trailingIcon ? (
          <View style={styles.trailingIconBlock}>
            <Icon
              set={trailingIcon.set}
              name={trailingIcon.name as any}
              iconStyle={trailingIcon.iconStyle}
              size={26}
              color={tone.eyebrowColor ?? tone.titleColor}
            />
          </View>
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        style={{ width, minWidth: width, maxWidth: width, flexGrow: 0, flexShrink: 0 }}
        onPress={onPress}
        android_ripple={{ color: 'rgba(255,255,255,0.14)' }}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={{ width, minWidth: width, maxWidth: width, flexGrow: 0, flexShrink: 0 }}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Cancel the parent header's horizontal padding so the slider is full-bleed.
    marginHorizontal: -spacing.lg,
    paddingHorizontal: 0,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  carouselContent: {
    // Symmetric leading/trailing inset so the first and last cards both
    // sit clear of the screen edges.
    paddingLeft: ms(22),
    paddingRight: ms(28),
    gap: CARD_GAP,
  },
  cardShell: {
    marginRight: 0,
    flexGrow: 0,
    flexShrink: 0,
  },
  card: {
    height: CARD_HEIGHT,
    paddingVertical: ms(12),
    paddingHorizontal: ms(18),
    borderRadius: ms(20),
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
    width: ms(200),
    flexGrow: 0,
    flexShrink: 0,
  },
  eyebrow: {
    fontSize: ms(10),
    lineHeight: ms(12),
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: vs(6),
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    fontSize: ms(15),
    lineHeight: ms(19),
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'left',
  },
  body: {
    fontSize: ms(12),
    lineHeight: ms(16),
    textAlign: 'left',
    marginTop: vs(4),
  },
  metricBlock: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    minWidth: ms(54),
  },
  trailingIconBlock: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    minWidth: ms(30),
    paddingTop: vs(2),
  },
  metricValue: {
    fontSize: ms(24),
    lineHeight: ms(24),
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  metricLabel: {
    fontSize: ms(10),
    lineHeight: ms(12),
    // marginTop: vs(2),
    fontWeight: '500',
  },
});
