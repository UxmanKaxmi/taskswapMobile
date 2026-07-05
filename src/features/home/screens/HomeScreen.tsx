import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  LayoutChangeEvent,
  ListRenderItem,
  Pressable,
  RefreshControl,
  Platform,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { ms, vs } from 'react-native-size-matters';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import TextElement from '@shared/components/TextElement/TextElement';
import { Layout } from '@shared/components/Layout';
import { Height } from '@shared/components/Spacing';
import { colors, platformShadow, spacing } from '@shared/theme';
import { AppStackParamList } from '@navigation/types/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@shared/constants/queryKeys';
import { useTasksQuery } from '@features/Tasks/hooks/useTasksQuery';
import { Task, TaskTypeEnum } from '@features/Tasks/types/tasks';
import { MotivationTask } from '../types/home';
import { showToast, showPushToast } from '@shared/utils/toast';
import MotivationCard from '../components/MotivationCard';
import DecisionCard from '../components/DecisionCard';
import ReminderCard from '../components/ReminderCard';
import AdviceCard from '../components/AdviceCard';
import HorizontalFilterTabs, { type FeedSortKey } from '../components/HorizontalFilterTabs';
import { useAuth } from '@features/Auth/AuthProvider';
import { navigateToTaskDetails, useCheckAuthThenNavigate } from '@navigation/types/navigationUtils';
import { LaunchModalHost } from '@features/LaunchModals';
import { haptics } from '@shared/utils/haptics';
import Ripple from '@shared/components/Buttons/Ripple';
import HomeHeader from '../components/HomeHeader';
import HomeSummarySection, { type HomeSummaryCardKey } from '../components/HomeSummarySection';
import { useHomeSummary } from '../hooks/useHomeSummary';
import { isDEV } from '@shared/utils/constants';
import Icon from '@shared/components/Icons/Icon';
import { useSecondaryProfileMenuItems } from '@features/MyProfile/hooks/useSecondaryProfileMenuItems';

const MIN_REFRESH_LOADER_MS = 450;
const HERO_SUMMARY_CARD_KEYS: readonly HomeSummaryCardKey[] = [
  'create-first-push',
  'your-goal',
  'success-story',
  'needs-push',
  'update-progress',
];

// Testing flag: when true, renders every summary card (with placeholder copy)
// and ignores dismiss state. Off in production.
const PREVIEW_ALL_SUMMARY_CARDS = false;
const SUMMARY_CARD_FALLBACK_HEIGHT = vs(116);
const IS_ANDROID = Platform.OS === 'android';
const FEED_SORT_LABELS: Record<FeedSortKey, string> = {
  all: 'All',
  needs_push: 'Needs a push',
  new: 'New',
  almost_there: 'Almost there',
};

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const checkAuthThenNavigate = useCheckAuthThenNavigate();
  const queryClient = useQueryClient();
  const listRef = useRef<FlatList<Task>>(null);
  const [feedSort, setFeedSort] = useState<FeedSortKey>('all');
  const secondaryItems = useSecondaryProfileMenuItems();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useTasksQuery(feedSort);
  const {
    data: homeSummary,
    isLoading: isHomeSummaryLoading,
    isError: isHomeSummaryError,
    refetch: refetchHomeSummary,
  } = useHomeSummary();
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const isGuestMode = !user;
  // Dev tools are only ever available in development builds.
  const canSeeDevTools = isDEV;

  const [refreshing, setRefreshing] = useState(false);
  const [hasSummaryCards, setHasSummaryCards] = useState(true);
  const [fixedHeaderHeight, setFixedHeaderHeight] = useState(0);
  const [feedTabsHeight, setFeedTabsHeight] = useState(0);
  const [isFeedSortChanging, setIsFeedSortChanging] = useState(false);
  const [summaryCardHeight, setSummaryCardHeight] = useState(0);

  // --- Collapsing summary card, tied to scroll position ---
  // The card shrinks/fades in proportion to how far the feed has scrolled, and
  // re-expands as you scroll back up.
  const scrollY = useSharedValue(0);
  const cardHeight = useSharedValue(0);
  // Mirrors `feedBtnVisible` on the UI thread so the scroll handler only pushes
  // a state update when the at-top/scrolled boundary is actually crossed.
  const feedBtnVisibleSV = useSharedValue(true);
  const [feedBtnVisible, setFeedBtnVisible] = useState(true);

  const onFixedHeaderLayout = useCallback((e: LayoutChangeEvent) => {
    const h = Math.ceil(e.nativeEvent.layout.height);
    setFixedHeaderHeight(prev => (Math.abs(prev - h) <= 1 ? prev : h));
  }, []);

  const onFeedTabsLayout = useCallback((e: LayoutChangeEvent) => {
    const h = Math.ceil(e.nativeEvent.layout.height);
    setFeedTabsHeight(prev => (Math.abs(prev - h) <= 1 ? prev : h));
  }, []);

  const onCardLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const h = Math.ceil(e.nativeEvent.layout.height);
      if (h <= 50) return; // ignore tiny transient measurements while data loads

      // Track the CURRENT card height (not the max) so the rendered slot height
      // and the list's top spacer always agree — otherwise the absolute header
      // overlays the feed and leaves an inconsistent gap across devices.
      if (Math.abs(h - cardHeight.value) > 1) {
        cardHeight.value = h;
      }

      setSummaryCardHeight(prev => (Math.abs(prev - h) <= 1 ? prev : h));
    },
    [cardHeight],
  );

  const headerSpacerHeight = useMemo(
    () =>
      fixedHeaderHeight + (hasSummaryCards ? summaryCardHeight : 0) + feedTabsHeight + spacing.sm,
    [feedTabsHeight, fixedHeaderHeight, hasSummaryCards, summaryCardHeight],
  );

  const listContentStyle = useMemo(
    () => [styles.listContent, { paddingTop: headerSpacerHeight }],
    [headerSpacerHeight],
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: e => {
      scrollY.value = Math.max(0, e.contentOffset.y);
      const atTop = scrollY.value <= 8;
      if (feedBtnVisibleSV.value !== atTop) {
        feedBtnVisibleSV.value = atTop;
        runOnJS(setFeedBtnVisible)(atTop);
      }
    },
  });

  const summarySlotCollapseStyle = useAnimatedStyle<ViewStyle>(() => {
    if (!hasSummaryCards) {
      return { height: 0, opacity: 0 };
    }

    const measuredHeight = cardHeight.value || SUMMARY_CARD_FALLBACK_HEIGHT;
    const range = [0, measuredHeight];

    return {
      height: interpolate(scrollY.value, range, [measuredHeight, 0], Extrapolation.CLAMP),
      opacity: interpolate(scrollY.value, range, [1, 0], Extrapolation.CLAMP),
    };
  });

  const summaryCardVisualStyle = useAnimatedStyle<ViewStyle>(() => {
    if (!hasSummaryCards) {
      const transform: ViewStyle['transform'] = [{ translateY: -8 }, { scale: 0.985 }];
      return { opacity: 0, transform };
    }

    const measuredHeight = cardHeight.value || SUMMARY_CARD_FALLBACK_HEIGHT;
    const range = [0, measuredHeight];
    const transform: ViewStyle['transform'] = [
      { translateY: interpolate(scrollY.value, range, [0, -10], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, range, [1, 0.985], Extrapolation.CLAMP) },
    ];

    return {
      opacity: interpolate(scrollY.value, range, [1, 0], Extrapolation.CLAMP),
      transform,
    };
  });

  const compactSummaryStyle = useAnimatedStyle<ViewStyle>(() => {
    if (!hasSummaryCards) {
      const transform: ViewStyle['transform'] = [{ translateX: 12 }, { scale: 0.88 }];
      return { opacity: 0, transform };
    }

    const measuredHeight = cardHeight.value || SUMMARY_CARD_FALLBACK_HEIGHT;
    const range = [measuredHeight * 0.35, measuredHeight * 0.9];
    const transform: ViewStyle['transform'] = [
      { translateX: interpolate(scrollY.value, range, [12, 0], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, range, [0.88, 1], Extrapolation.CLAMP) },
    ];

    return {
      opacity: interpolate(scrollY.value, range, [0, 1], Extrapolation.CLAMP),
      transform,
    };
  });

  // Header divider/elevation fades in once the feed is scrolled.
  const headerElevationStyle = useAnimatedStyle(() => {
    const p = interpolate(scrollY.value, [0, 24], [0, 1], Extrapolation.CLAMP);

    if (IS_ANDROID) {
      return {
        boxShadow: `0px 3px 6px rgba(0, 0, 0, ${0.08 * p})`,
        elevation: 0,
      };
    }

    return { shadowOpacity: 0.08 * p };
  });

  const headerDividerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 24], [0, 1], Extrapolation.CLAMP),
  }));

  // Feed-options button is only present at the top of the feed; it fades out as
  // soon as the user starts scrolling down.
  const feedButtonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 20], [1, 0], Extrapolation.CLAMP),
  }));

  const flattenedTasks = useMemo(() => {
    const all = data?.pages.flatMap(page => page.data) ?? [];
    // Pages can overlap (e.g. a newly created task shifts pagination), producing
    // the same task id twice. Dedupe so the FlatList keys stay unique.
    const seen = new Set<string>();
    return all.filter(task => {
      if (seen.has(task.id)) return false;
      seen.add(task.id);
      return true;
    });
  }, [data]);

  const compactGoalDay = homeSummary?.compactStatus.streakDay ?? 0;
  const compactPushCount = homeSummary?.compactStatus.pushedTodayCount ?? 0;

  // Show every task in the feed, including the viewer's own goals. (Your newest
  // goal also appears in the "YOUR GOAL" summary card above the list.)
  const feedTasks = flattenedTasks;

  const showFeedSortLoading =
    isFeedSortChanging && isFetching && !refreshing && !isFetchingNextPage;

  useEffect(() => {
    if (!isFetching) {
      setIsFeedSortChanging(false);
    }
  }, [isFetching]);

  // The feed-sort loading row only exists while loading; reset its measured
  // height when it unmounts so the header spacer doesn't reserve phantom space
  // (which otherwise leaves a gap above the feed after changing the sort).
  useEffect(() => {
    if (!showFeedSortLoading && feedTabsHeight !== 0) {
      setFeedTabsHeight(0);
    }
  }, [showFeedSortLoading, feedTabsHeight]);

  const handleFeedSortChange = useCallback(
    (nextSort: FeedSortKey) => {
      if (nextSort === feedSort) return;

      haptics.selection();
      setIsFeedSortChanging(true);
      setFeedSort(nextSort);
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    },
    [feedSort],
  );

  const handleRefresh = useCallback(async () => {
    const startedAt = Date.now();

    try {
      haptics.selection();
      setRefreshing(true);
      // Per-task push state is cached separately (useTaskPushes) and takes
      // precedence over the feed's task.pushCount, so refetching the feed alone
      // leaves stale push counts. Invalidate the push caches too so cards pick up
      // pushes made by other users.
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Push] });
      // home-summary is auth-only; skip it for guests to avoid a 401 -> forced sign-out.
      await Promise.all([refetch(), ...(isGuestMode ? [] : [refetchHomeSummary()])]);
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_REFRESH_LOADER_MS) {
        await new Promise(resolve => setTimeout(resolve, MIN_REFRESH_LOADER_MS - elapsed));
      }
      setRefreshing(false);
    }
  }, [refetch, refetchHomeSummary, isGuestMode, queryClient]);

  useFocusEffect(
    useCallback(() => {
      refetch();
      // home-summary is auth-only; skip it for guests to avoid a 401 -> forced sign-out.
      if (!isGuestMode) refetchHomeSummary();
    }, [refetch, refetchHomeSummary, isGuestMode]),
  );

  useEffect(() => {
    if (!isError) return;

    showToast({
      type: 'error',
      title: 'Failed to load tasks',
      message: 'Please check your connection or try again later.',
    });
    console.error('[TASK_FETCH_ERROR]', error);
  }, [error, isError]);

  const onPressTask = useCallback(
    (task: Task) => {
      navigateToTaskDetails(navigation, task);
    },
    [navigation],
  );

  const onPressAddMotivation = useCallback(() => {
    if (!checkAuthThenNavigate('AddTask')) return;
    haptics.selection();
  }, [checkAuthThenNavigate]);

  const onPressCompactSummary = useCallback(() => {
    if (isGuestMode) {
      onPressAddMotivation();
      return;
    }

    haptics.selection();
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [isGuestMode, onPressAddMotivation]);

  const handleOpenDevMenu = useCallback(() => {
    if (!secondaryItems.length) return;

    Alert.alert('Developer Tools', undefined, [
      {
        text: 'Show example toast',
        onPress: () => {
          haptics.selection();
          showPushToast({
            pusherName: 'You',
            message: 'just pushed Dynamo G forward',
          });
        },
      },
      {
        text: 'Open debug screen',
        onPress: () => {
          haptics.selection();
          navigation.navigate('MainDebugScreen');
        },
      },
      ...secondaryItems.map(item => ({
        text: item.label,
        style: item.destructive ? ('destructive' as const) : ('default' as const),
        onPress: () => {
          haptics.selection();
          item.onPress();
        },
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  }, [navigation, secondaryItems]);

  const keyExtractor = useCallback((item: Task) => item.id, []);

  const onNoopTaskAction = useCallback((_task: Task) => {}, []);

  const handleShareMotivation = useCallback((_task: MotivationTask) => {}, []);

  const onSuggestAdvice = useCallback(
    (task: Task) => {
      checkAuthThenNavigate(
        'TaskDetail',
        {
          taskId: task.id,
          openAdviceComposer: true,
        },
        {
          authContext: 'Advice',
        },
      );
    },
    [checkAuthThenNavigate],
  );

  const renderTaskNew = useCallback<ListRenderItem<Task>>(
    ({ item }) => {
      switch (item.type) {
        case TaskTypeEnum.Decision:
          return <DecisionCard task={item as any} onPressCard={onPressTask as any} />;
        case TaskTypeEnum.Reminder:
          return <ReminderCard task={item as any} onPressCard={onPressTask as any} />;
        case TaskTypeEnum.Motivation:
          return (
            <MotivationCard
              task={item as MotivationTask}
              onPressCard={onPressTask as any}
              onPressSuggest={onNoopTaskAction as any}
              onPressView={onNoopTaskAction as any}
              onPressShare={handleShareMotivation}
            />
          );
        case TaskTypeEnum.Advice:
          return (
            <AdviceCard
              task={item as any}
              onPressCard={onPressTask as any}
              onPressSuggest={onSuggestAdvice as any}
              onPressView={onNoopTaskAction as any}
            />
          );
        default:
          return null;
      }
    },
    [handleShareMotivation, onNoopTaskAction, onPressTask, onSuggestAdvice],
  );

  return (
    <Layout
      allowPaddingHorizontal={false}
      allowPaddingVertical={false}
      useSafeArea={false}
      backgroundColor={colors.onboardingPaper}
      style={styles.layout}
    >
      <Animated.View style={[styles.headerRegion, headerElevationStyle]}>
        <View onLayout={onFixedHeaderLayout} style={styles.fixedHeader}>
          <HomeHeader
            rightAccessory={
              <View style={styles.headerRightRow}>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={onPressCompactSummary}
                  style={styles.compactSummaryPressable}
                >
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.compactSummaryBadge,
                      compactSummaryStyle,
                      {
                        minWidth: !isGuestMode ? ms(172) : ms(120),
                      },
                    ]}
                  >
                    {!isGuestMode ? (
                      <>
                        <TextElement style={styles.compactSummaryText}>
                          DAY {compactGoalDay}
                        </TextElement>
                        <View style={styles.compactSummaryDivider} />
                        <TextElement style={styles.compactSummaryText}>
                          {compactPushCount} pushed today
                        </TextElement>
                      </>
                    ) : (
                      <TextElement style={styles.compactSummaryText}>GET A PUSH</TextElement>
                    )}
                  </Animated.View>
                </Pressable>
                <View style={styles.headerActions}>
                  <Animated.View
                    pointerEvents={feedBtnVisible ? 'auto' : 'none'}
                    style={[styles.feedButtonInline, feedButtonStyle]}
                  >
                    <HorizontalFilterTabs
                      iconOnly
                      value={feedSort}
                      onChange={handleFeedSortChange}
                    />
                  </Animated.View>
                  {canSeeDevTools && (
                    <Ripple hitSlop={8} onPress={handleOpenDevMenu} style={styles.devDotsButton}>
                      <Icon
                        set="ion"
                        name="ellipsis-vertical"
                        size={vs(12)}
                        color={colors.onboardingInk}
                      />
                    </Ripple>
                  )}
                </View>
              </View>
            }
          />
        </View>

        <Animated.View style={[styles.collapseWrap, summarySlotCollapseStyle]}>
          <Animated.View onLayout={onCardLayout} style={[styles.cardInner, summaryCardVisualStyle]}>
            <HomeSummarySection
              summary={homeSummary}
              tasks={flattenedTasks as any}
              currentUserId={currentUserId}
              isGuestMode={isGuestMode}
              isLoading={isHomeSummaryLoading}
              isError={isHomeSummaryError}
              onRetry={refetchHomeSummary}
              onPressTask={onPressTask as any}
              includeCardKeys={HERO_SUMMARY_CARD_KEYS}
              previewAllCards={PREVIEW_ALL_SUMMARY_CARDS}
              onHasVisibleCardsChange={setHasSummaryCards}
            />
          </Animated.View>
        </Animated.View>

        {showFeedSortLoading ? (
          <View onLayout={onFeedTabsLayout} style={styles.feedTabsWrap}>
            <TextElement style={styles.feedTabsLoading}>
              Loading {FEED_SORT_LABELS[feedSort]}...
            </TextElement>
          </View>
        ) : null}

        <Animated.View style={[styles.headerDivider, headerDividerStyle]} />
      </Animated.View>

      <AnimatedFlatList
        ref={listRef as any}
        style={styles.list}
        data={feedTasks}
        renderItem={renderTaskNew as any}
        keyExtractor={keyExtractor as any}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Height size={20} />
            <TextElement variant="body" color="placeHolder">
              {isLoading ? 'Loading tasks...' : 'No tasks found.'}
            </TextElement>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.placeHolder}
            colors={[colors.placeHolder]}
            progressViewOffset={headerSpacerHeight + vs(16)}
          />
        }
        contentContainerStyle={listContentStyle}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={IS_ANDROID}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

      <LaunchModalHost
        ctx={{
          screen: 'HOME',
          isLoggedIn: !!user,
          userId: user?.id ?? null,
        }}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  layout: {
    backgroundColor: colors.onboardingPaper,
  },
  headerRegion: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.onboardingPaper,
    paddingBottom: spacing.sm,
    zIndex: 2,
    // Shadow opacity is animated in on scroll (see headerElevationStyle).
    ...platformShadow({
      color: '#000',
      opacity: 0,
      radius: 6,
      offset: { width: 0, height: 3 },
    }),
  },
  headerDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.onboardingLine,
  },
  fixedHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  headerRightRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: ms(0),
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(0),
    marginLeft: ms(0),
  },
  feedButtonInline: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  devDotsButton: {
    // width: ms(30),
    // height: ms(30),
    borderRadius: ms(15),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.onboardingPaper,
    borderWidth: 1,
    borderColor: colors.onboardingLine,
    bottom: -10,
    position: 'absolute',
  },
  compactSummaryPressable: {
    borderRadius: ms(999),
  },
  compactSummaryBadge: {
    minWidth: ms(172),
    paddingHorizontal: ms(13),
    paddingVertical: vs(6),
    borderRadius: ms(999),
    backgroundColor: colors.onboardingInk,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: ms(8),
  },
  compactSummaryDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 210, 63, 0.72)',
  },
  compactSummaryText: {
    color: colors.onboardingPush,
    fontSize: ms(11),
    lineHeight: ms(13),
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    alignSelf: 'center',
  },
  list: {
    flex: 1,
  },
  collapseWrap: {
    // Only this lightweight shell changes height; the expensive carousel inside
    // is absolutely positioned and uses transform/opacity for smoother scroll.
    overflow: 'hidden',
  },
  cardInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  feedTabsWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  feedTabsLoading: {
    marginTop: vs(6),
    color: colors.onboardingMuted,
    fontSize: ms(12),
    lineHeight: ms(15),
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: vs(120),
  },
  emptyContainer: {
    paddingHorizontal: spacing.lg,
    alignItems: 'flex-start',
  },
});
