import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import { getFirstName, stripOuterQuotes } from '@shared/utils/helperFunctions';
import { impactTypeVisuals } from '@shared/utils/typeVisuals';
import { haptics } from '@shared/utils/haptics';
import { useAuth } from '@features/Auth/AuthProvider';

import { AppStackParamList } from '@navigation/types/navigation';
import { HomeSummaryResponse, Task } from '../types/home';
import { ms, vs } from 'react-native-size-matters';

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
};

type CardTone = {
  background: string;
  titleColor: string;
  iconColor: string;
  leadingBg: string;
};

type CardConfig = {
  key: string;
  title: string;
  body: string;
  tone: CardTone;
  leadingIcon: { set: 'fa6' | 'ion'; name: string; iconStyle?: 'solid' | 'regular' };
  fingerprint: string;
  task?: Task | null;
  onPress?: () => void;
};

type HomeSummaryCardKey = 'success-story' | 'needs-push' | 'update-progress' | 'advice-request';
type HomeSummaryCardState = 'unseen' | 'seen' | 'acted_on' | 'dismissed' | 'expired';
type PersistedHomeSummaryCard = {
  state: HomeSummaryCardState;
  fingerprint: string;
  updatedAt: number;
};
type PersistedHomeSummaryCardMap = Partial<Record<HomeSummaryCardKey, PersistedHomeSummaryCard>>;
type DismissAnimation = {
  opacity: Animated.Value;
  translateY: Animated.Value;
  scale: Animated.Value;
};
type DismissAnimationMap = Record<string, DismissAnimation>;

const CARD_GAP = ms(14);
const CARD_WIDTH = ms(310);
const CARD_STATE_STORAGE_PREFIX = 'home-summary-card-state:v1';
const HOME_SUMMARY_CARD_KEYS: HomeSummaryCardKey[] = [
  'success-story',
  'needs-push',
  'update-progress',
  'advice-request',
];

const TONES = {
  success: {
    background: colors.primary,
    titleColor: colors.onPrimary,
    iconColor: colors.primary,
    leadingBg: colors.card,
  },
  push: {
    background: colors.motivationBgDark,
    titleColor: colors.onPrimary,
    iconColor: colors.motivationBgDark,
    leadingBg: colors.card,
  },
  progress: {
    background: colors.motivationBgHardest,
    titleColor: colors.onPrimary,
    iconColor: colors.motivationBgHardest,
    leadingBg: colors.card,
  },
  advice: {
    background: colors.adviceBg,
    titleColor: colors.adviceBgHardest,
    iconColor: colors.adviceBgHardest,
    leadingBg: colors.card,
  },
  firstTask: {
    background: colors.primary,
    titleColor: colors.onPrimary,
    iconColor: colors.primary,
    leadingBg: colors.card,
  },
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
}: Props) {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const cardWidth = CARD_WIDTH;
  const scrollRef = useRef<ScrollView | null>(null);
  const scrollOffsetRef = useRef(0);
  const currentIndexRef = useRef(0);
  const isDraggingRef = useRef(false);
  const autoScrollTimerRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);
  const dismissAnimationRefs = useRef<DismissAnimationMap>({});
  const [dismissingKeys, setDismissingKeys] = React.useState<string[]>([]);
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
  const cards = useMemo(
    () =>
      isGuestMode
        ? buildGuestCards(navigation)
        : buildCards({
            summary,
            tasks: tasks ?? [],
            currentUserId,
            onPressTask,
            onCreateFirstPushPress: handleCreateFirstPushPress,
          }),
    [
      currentUserId,
      handleCreateFirstPushPress,
      isGuestMode,
      navigation,
      onPressTask,
      summary,
      tasks,
    ],
  );
  const [persistedCards, setPersistedCards] = React.useState<PersistedHomeSummaryCardMap | null>(
    null,
  );
  const revealedFingerprintsRef = useRef<Record<string, string>>({});
  const cardStride = cardWidth + CARD_GAP;

  useEffect(() => {
    let cancelled = false;

    setPersistedCards(null);

    if (!currentUserId?.trim() || isGuestMode) {
      setPersistedCards({});
      return () => {
        cancelled = true;
      };
    }

    const userScope = currentUserId.trim();

    void (async () => {
      const entries = await Promise.all(
        HOME_SUMMARY_CARD_KEYS.map(async cardKey => {
          const stored = await readCardState(userScope, cardKey);
          return [cardKey, stored] as const;
        }),
      );

      if (cancelled) return;

      setPersistedCards(prev => ({
        ...Object.fromEntries(entries),
        ...(prev ?? {}),
      }));
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUserId, isGuestMode]);

  const visibleCards = useMemo(() => {
    if (!isGuestMode && persistedCards === null) {
      return [];
    }

    return cards.filter(card => {
      const stored = persistedCards?.[card.key as HomeSummaryCardKey];

      if (!stored) return true;
      if (stored.fingerprint !== card.fingerprint) return true;

      return stored.state === 'unseen';
    });
  }, [cards, persistedCards]);

  useEffect(() => {
    onHasVisibleCardsChange?.(visibleCards.length > 0);
  }, [onHasVisibleCardsChange, visibleCards.length]);

  useEffect(() => {
    visibleCards.forEach(card => {
      if (dismissingKeys.includes(card.key)) {
        return;
      }

      const alreadyRevealedFingerprint = revealedFingerprintsRef.current[card.key];
      if (alreadyRevealedFingerprint === card.fingerprint) {
        return;
      }

      const anim = getDismissAnimationValues(dismissAnimationRefs, card.key);

      if (card.key === 'create-first-push') {
        anim.opacity.setValue(1);
        anim.translateY.setValue(0);
        anim.scale.setValue(1);
        revealedFingerprintsRef.current[card.key] = card.fingerprint;
        return;
      }

      anim.opacity.setValue(0);
      anim.translateY.setValue(10);
      anim.scale.setValue(0.98);

      revealedFingerprintsRef.current[card.key] = card.fingerprint;

      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(anim.scale, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [dismissingKeys, visibleCards]);

  const handleCardPress = useCallback(
    (card: CardConfig) => {
      if (card.key === 'create-first-push') {
        card.onPress?.();
        return;
      }

      const nextState: PersistedHomeSummaryCard = {
        state: 'dismissed',
        fingerprint: card.fingerprint,
        updatedAt: Date.now(),
      };

      const isGuestCard = card.key.startsWith('guest_');

      if (isGuestCard) {
        card.onPress?.();
        return;
      }

      if (dismissingKeys.includes(card.key)) {
        return;
      }

      const anim = getDismissAnimationValues(dismissAnimationRefs, card.key);
      setDismissingKeys(prev => (prev.includes(card.key) ? prev : [...prev, card.key]));

      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: -6,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(anim.scale, {
          toValue: 0.96,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (!finished) return;

        setPersistedCards(prev => ({
          ...(prev ?? {}),
          [card.key as HomeSummaryCardKey]: nextState,
        }));

        if (currentUserId?.trim()) {
          void saveCardState(currentUserId.trim(), card.key as HomeSummaryCardKey, nextState);
        }

        setDismissingKeys(prev => prev.filter(key => key !== card.key));
        card.onPress?.();
      });
    },
    [currentUserId, dismissingKeys],
  );

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
        snapToInterval={cardWidth + CARD_GAP}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={styles.carouselContent}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      >
        {visibleCards.map((card, index) => (
          <Animated.View
            key={card.key}
            style={[
              styles.cardShell,
              {
                width: cardWidth,
                minWidth: cardWidth,
                maxWidth: cardWidth,
                flexGrow: 0,
                flexShrink: 0,
              },
              index === visibleCards.length - 1 && styles.lastCardShell,
              getDismissAnimationStyle(dismissAnimationRefs, card.key) as any,
            ]}
          >
            <MinimalCard
              width={cardWidth}
              title={card.title}
              body={card.body}
              tone={card.tone}
              leadingIcon={card.leadingIcon}
              onPress={() => handleCardPress(card)}
            />
          </Animated.View>
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
}: {
  summary?: HomeSummaryResponse | null;
  tasks: Task[];
  currentUserId: string | null;
  onPressTask?: (task: Task) => void;
  onCreateFirstPushPress: () => void;
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
  const pushTask = selectMotivationTask(tasks, currentUserId);
  const progressTask = selectProgressTask(tasks, currentUserId);
  const adviceTask = selectAdviceTask(tasks, currentUserId);

  const successCard = successStoryKey
    ? ({
        key: 'success-story',
        title: buildSuccessStoryTitle(summary),
        body: buildSuccessStoryBody(summary),
        tone: TONES.success,
        leadingIcon: { set: 'fa6', name: 'circle-check', iconStyle: 'solid' },
        fingerprint: buildSuccessStoryFingerprint(summary),
        task: successTask,
        onPress: successTask ? () => onPressTask?.(successTask) : undefined,
      } satisfies CardConfig)
    : null;

  const firstTaskCard =
    trimmedCurrentUserId && !hasCreatedAnyTask
      ? ({
          key: 'create-first-push',
          title: 'Create your first push',
          body: 'Share a goal and let friends back you up.',
          tone: TONES.firstTask,
          leadingIcon: { set: 'fa6', name: 'circle-plus', iconStyle: 'solid' },
          fingerprint: 'create-first-push:v1',
          onPress: onCreateFirstPushPress,
        } satisfies CardConfig)
      : null;

  return [
    firstTaskCard,
    successCard,
    pushTask
      ? {
          key: 'needs-push',
          title: buildPushTitle(pushTask),
          body: buildPushBody(pushTask),
          tone: TONES.push,
          leadingIcon: { set: 'fa6', name: 'person-running', iconStyle: 'solid' },
          fingerprint: buildTaskFingerprint(pushTask),
          task: pushTask,
          onPress: () => onPressTask?.(pushTask),
        }
      : null,
    progressTask
      ? {
          key: 'update-progress',
          title: buildProgressTitle(progressTask),
          body: buildProgressBody(progressTask),
          tone: TONES.progress,
          leadingIcon: { set: 'fa6', name: 'bullseye', iconStyle: 'solid' },
          fingerprint: buildTaskFingerprint(progressTask),
          task: progressTask,
          onPress: () => onPressTask?.(progressTask),
        }
      : null,
    adviceTask
      ? {
          key: 'advice-request',
          title: buildAdviceTitle(adviceTask),
          body: buildAdviceBody(adviceTask),
          tone: TONES.advice,
          leadingIcon: impactTypeVisuals.advice.icon,
          fingerprint: buildTaskFingerprint(adviceTask),
          task: adviceTask,
          onPress: () => onPressTask?.(adviceTask),
        }
      : null,
  ].filter(Boolean) as CardConfig[];
}

function buildGuestCards(navigation: NavigationProp<AppStackParamList>): CardConfig[] {
  const guestCards = [
    {
      key: 'guest_motivation',
      title: 'Need a boost to move forward?',
      body: 'Share a goal and let friends back you up.',
      tone: {
        background: colors.motivationBg,
        titleColor: colors.motivationBgHardest,
        iconColor: colors.motivationBgHardest,
        leadingBg: colors.card,
      },
      leadingIcon: { set: 'fa6', name: 'person-running', iconStyle: 'solid' },
      authCopy: {
        title: 'Log in to send a push',
        subtitle: 'Invite friends to back your goal and keep you moving.',
        cta: 'Log In to Push',
      },
    },
    {
      key: 'guest_advice',
      title: 'Stuck on something?',
      body: 'Ask people you trust for a fresh perspective.',
      tone: {
        background: colors.adviceBg,
        titleColor: colors.adviceBgHardest,
        iconColor: colors.adviceBgHardest,
        leadingBg: colors.card,
      },
      leadingIcon: impactTypeVisuals.advice.icon,
      authCopy: {
        title: 'Log in to ask for advice',
        subtitle: 'Get a thoughtful response when you are stuck.',
        cta: 'Log In to Ask',
      },
    },
    {
      key: 'guest_accountability',
      title: 'Keep momentum with support',
      body: 'Check in and let friends keep you on track.',
      tone: {
        background: colors.decisionBg,
        titleColor: colors.decisionBgHardest,
        iconColor: colors.decisionBgHardest,
        leadingBg: colors.card,
      },
      leadingIcon: { set: 'fa6', name: 'arrow-trend-up', iconStyle: 'solid' },
      authCopy: {
        title: 'Keep momentum with support',
        subtitle: 'Share updates and keep your momentum visible.',
        cta: 'Log In to Stay Accountable',
      },
    },
  ] as const;

  return guestCards.map(card => ({
    key: card.key,
    title: card.title,
    body: card.body,
    tone: card.tone,
    leadingIcon: card.leadingIcon,
    fingerprint: card.key,
    onPress: () => {
      navigation.navigate('AuthIntro', {
        authContext: card.key,
        authCopy: card.authCopy,
      });
    },
  }));
}

function getDismissAnimationValues(refs: React.MutableRefObject<DismissAnimationMap>, key: string) {
  if (!refs.current[key]) {
    refs.current[key] = {
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(10),
      scale: new Animated.Value(0.98),
    };
  }

  return refs.current[key];
}

function getDismissAnimationStyle(refs: React.MutableRefObject<DismissAnimationMap>, key: string) {
  const anim = getDismissAnimationValues(refs, key);
  return {
    opacity: anim.opacity,
    transform: [{ translateY: anim.translateY }, { scale: anim.scale }],
  };
}

function buildSuccessStoryTitle(summary?: HomeSummaryResponse | null) {
  if (summary?.successStory) {
    return summary.successStory.title;
  }

  if (summary?.heroModule) {
    return summary.heroModule.title;
  }

  if (summary?.featuredStory) {
    const firstName = getFirstName(summary.featuredStory.ownerName);
    return `Your push helped ${firstName} go to the gym`;
  }

  return 'No success story yet';
}

function buildSuccessStoryBody(summary?: HomeSummaryResponse | null) {
  if (summary?.successStory) {
    return summary.successStory.body;
  }

  if (summary?.heroModule) {
    return summary.heroModule.body;
  }

  if (summary?.featuredStory) {
    return `You pushed ${getFirstName(summary.featuredStory.ownerName)} last week`;
  }

  return 'We will surface a success story here when there is one to show.';
}

function buildPushTitle(task: Task | null) {
  if (!task) return 'Needs your push today';
  return `${getFirstName(task.name)} needs a push today`;
}

function buildPushBody(task: Task | null) {
  if (!task) return 'A new push request will show up here.';
  return stripOuterQuotes(task.text);
}

function buildProgressTitle(task: Extract<Task, { type: 'motivation' }> | null) {
  if (!task) return 'Update your progress';
  return 'Update your progress';
}

function buildProgressBody(task: Extract<Task, { type: 'motivation' }> | null) {
  if (!task) return 'Keep your goal moving.';
  const count = task.pushCount ?? 0;

  if (count <= 0) {
    return 'No one has pushed you yet.';
  }

  if (count === 1) {
    return '1 friend pushed you.';
  }

  return `${count} friends pushed you.`;
}

function buildAdviceTitle(task: Task | null) {
  if (!task) return 'Advice request waiting on you';
  return 'Advice request waiting on you';
}

function buildAdviceBody(task: Task | null) {
  if (!task) return 'A thoughtful request will show up here.';
  return 'Tap to read and respond.';
}

function selectMotivationTask(tasks: Task[], currentUserId: string | null) {
  const motivationTasks = tasks.filter(
    (task): task is Extract<Task, { type: 'motivation' }> =>
      task.type === 'motivation' && !task.completed && !task.completedAt,
  );

  const otherUserTasks = motivationTasks.filter(task => task.userId !== currentUserId);

  if (!otherUserTasks.length) return null;

  return otherUserTasks.find(task => !task.hasPushed) ?? null;
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

function selectAdviceTask(tasks: Task[], currentUserId: string | null) {
  const adviceTasks = tasks.filter(
    (task): task is Extract<Task, { type: 'advice' }> => task.type === 'advice',
  );

  if (!adviceTasks.length) return null;

  return adviceTasks.find(task => task.userId !== currentUserId && !task.hasAdvised) ?? null;
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

async function readCardState(userId: string, cardKey: HomeSummaryCardKey) {
  const raw = await AsyncStorage.getItem(getCardStateStorageKey(userId, cardKey));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PersistedHomeSummaryCard;
  } catch {
    return null;
  }
}

async function saveCardState(
  userId: string,
  cardKey: HomeSummaryCardKey,
  state: PersistedHomeSummaryCard,
) {
  await AsyncStorage.setItem(getCardStateStorageKey(userId, cardKey), JSON.stringify(state));
}

function getCardStateStorageKey(userId: string, cardKey: HomeSummaryCardKey) {
  return `${CARD_STATE_STORAGE_PREFIX}:${userId}:${cardKey}`;
}

function MinimalCard({
  width,
  title,
  body,
  tone,
  leadingIcon,
  onPress,
}: {
  width: number;
  title: string;
  body: string;
  tone: CardTone;
  leadingIcon: { set: 'ion' | 'fa6'; name: string; iconStyle?: 'solid' | 'regular' };
  onPress?: () => void;
}) {
  const content = (
    <View style={[styles.card, { width, backgroundColor: tone.background }]}>
      <View style={[styles.iconCircle, { backgroundColor: tone.leadingBg }]}>
        <Icon
          set={leadingIcon.set}
          name={leadingIcon.name as any}
          iconStyle={leadingIcon.iconStyle}
          size={18}
          color={tone.iconColor}
        />
      </View>

      <View style={styles.textBlock}>
        <TextElement
          variant="headline"
          weight="700"
          style={[styles.title, { color: tone.titleColor }]}
        >
          {title}
        </TextElement>
        <TextElement
          variant="bodySmall"
          numberOfLines={2}
          style={[styles.body, { color: tone.titleColor }]}
        >
          {body}
        </TextElement>
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
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  carouselContent: {
    paddingHorizontal: spacing.md,
    gap: CARD_GAP,
  },
  cardShell: {
    marginRight: 0,
    flexGrow: 0,
    flexShrink: 0,
  },
  lastCardShell: {
    marginEnd: spacing.lg,
  },
  card: {
    minHeight: vs(58),
    borderRadius: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    width: '100%',
    flexGrow: 0,
    flexShrink: 0,
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.55)',
    flexShrink: 0,
    marginLeft: spacing.md,
  },
  title: {
    marginHorizontal: spacing.md,
    fontSize: ms(14),
    textAlign: 'left',
    lineHeight: ms(22),
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  body: {
    marginHorizontal: spacing.md,
    fontSize: ms(11),
    textAlign: 'left',
    lineHeight: ms(16),
    paddingBottom: vs(2),
  },
});
