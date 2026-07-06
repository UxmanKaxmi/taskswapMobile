import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  SectionList,
  ActivityIndicator,
  RefreshControl,
  ViewToken,
  Pressable,
} from 'react-native';
import { format, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { AppStackParamList } from '@navigation/types/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import PageHeader from '@shared/components/PageHeader/PageHeader';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { useNotifications } from '../hooks/useNotifications';
import { useBatchMarkNotificationsAsRead } from '../hooks/useBatchMarkNotificationsAsRead';
import EmptyState from '@features/Empty/EmptyState';
import { NotificationDTO } from '../types/notification.types';
import Row from '@shared/components/Layout/Row';
import { ms, vs } from 'react-native-size-matters';
import AppBorder from '@shared/components/AppBorder/AppBorder';
import NotificationCard from '../components/DefaultNotification';
import { queryClient } from '@lib/react-query/client';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { Height } from '@shared/components/Spacing';
import { getGoalByIdAPI } from '@features/Home/api/api';

export default function NotificationMainScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { data: notifications = [], isLoading, refetch } = useNotifications();
  const { mutate: markBatch } = useBatchMarkNotificationsAsRead();

  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(30);

  const PAGE_SIZE = 30;
  const LOAD_MORE = 20;

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const seenIdsRef = useRef<Set<string>>(new Set());

  const flushSeenIds = () => {
    // console.log('📦', queryClient.getQueryData([QueryKeys.Notification]));
    const ids = Array.from(seenIdsRef.current).filter(Boolean);
    // console.log('📌 Seen IDs:', ids);
    if (ids.length === 0) return;
    // ✅ Optimistically update cache

    queryClient.setQueryData<NotificationDTO[]>(buildQueryKey.notifications(), old => {
      if (!old) return [];

      const updated = old.map(n => (ids.includes(n.id) ? { ...n, read: true } : n));

      return [...updated]; // ✅ return a new array reference to force re-render
    });

    // ✅ Send to server
    markBatch(ids);
    seenIdsRef.current.clear();
  };

  // ✅ useDebouncedCallback from use-debounce
  const debouncedFlush = useDebouncedCallback(flushSeenIds, 1500);

  const handleViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    viewableItems.forEach(viewable => {
      const item = viewable.item as NotificationDTO;
      const batchIds = Array.isArray(item?.metadata?.ids) ? item.metadata.ids : null;
      if (batchIds && batchIds.length) {
        batchIds.forEach((id: string) => {
          if (!seenIdsRef.current.has(id)) seenIdsRef.current.add(id);
        });
        return;
      }
      if (!item.read && !seenIdsRef.current.has(item.id)) {
        seenIdsRef.current.add(item.id);
      }
    });
    debouncedFlush();
  }).current;

  const viewabilityConfig = useRef({
    // Require the row to be mostly visible for a beat before auto-marking read,
    // so quick scrolls past a notification don't silently clear the unread badge.
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 1500,
  }).current;

  useEffect(() => {
    return () => {
      // debouncedFlush.cancel(); // cleanup
    };
  }, []);

  function getTimeGroupLabel(date: string) {
    const d = new Date(date);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    if (isThisWeek(d)) return 'This Week';
    if (isThisYear(d)) return format(d, 'MMMM d');
    return 'Earlier';
  }

  function groupNotifications(notifications: NotificationDTO[]) {
    const grouped: Record<string, NotificationDTO[]> = {};

    notifications.forEach(notification => {
      const group = getTimeGroupLabel(notification.createdAt);
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(notification);
    });

    const sortOrder = ['Today', 'Yesterday', 'This Week', 'Earlier'];

    return Object.entries(grouped)
      .sort(([a], [b]) => {
        const indexA = sortOrder.indexOf(a) !== -1 ? sortOrder.indexOf(a) : sortOrder.length;
        const indexB = sortOrder.indexOf(b) !== -1 ? sortOrder.indexOf(b) : sortOrder.length;
        return indexA - indexB;
      })
      .map(([title, data]) => ({ title, data }));
  }

  const visibleNotifications = useMemo(() => {
    const hiddenNotificationTypes = new Set([
      'task-motivation-unfinished-reminder',
      'task-motivation-help-push-reminder',
    ]);

    const filtered = notifications.filter(n => {
      if (hiddenNotificationTypes.has(n.type)) {
        return false;
      }

      const needsGoalType = [
        'task-helper',
        'taskHelper',
        'task',
        'reminder',
        'decision',
        'decision-done',
        'decisionDone',
        'advice',
        'motivation',
      ].includes(n.type);

      return needsGoalType ? !!n.taskType : true;
    });

    return filtered.slice(0, visibleCount);
  }, [notifications, visibleCount]);
  const sections = useMemo(() => groupNotifications(visibleNotifications), [visibleNotifications]);
  const unreadNotificationIds = notifications
    .filter(notification => !notification.read)
    .map(notification => notification.id);
  const hasUnreadNotifications = unreadNotificationIds.length > 0;

  const handleMarkAllRead = useCallback(() => {
    if (!hasUnreadNotifications) return;

    queryClient.setQueryData<NotificationDTO[]>(buildQueryKey.notifications(), old => {
      if (!old) return [];

      return old.map(notification => ({ ...notification, read: true }));
    });

    markBatch(unreadNotificationIds);
  }, [hasUnreadNotifications, markBatch, unreadNotificationIds]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [notifications.length]);

  const handleLoadMore = useCallback(() => {
    if (visibleCount >= notifications.length) return;
    setVisibleCount(prev => Math.min(prev + LOAD_MORE, notifications.length));
  }, [visibleCount, notifications.length]);

  const prefetchGoalDetail = useCallback((taskId?: string) => {
    if (!taskId) return;
    void queryClient.prefetchQuery({
      queryKey: buildQueryKey.taskById(taskId),
      queryFn: () =>
        getGoalByIdAPI(taskId, {
          skipToast: true,
          skipAuthLogout: true,
        }),
      staleTime: 30_000,
    });
  }, []);

  const openGoalDetail = useCallback(
    (
      taskId?: string,
      highlightCommentId?: string,
      extraParams?: Partial<NonNullable<AppStackParamList['GoalDetail']>>,
    ) => {
      if (!taskId) return;
      prefetchGoalDetail(taskId);
      navigation.navigate('GoalDetail', {
        taskId,
        ...(highlightCommentId ? { highlightCommentId } : {}),
        ...(extraParams ?? {}),
      });
    },
    [navigation, prefetchGoalDetail],
  );

  const openHomeFeed = useCallback(() => {
    navigation.navigate('Tabs', {
      screen: 'Home',
    });
  }, [navigation]);

  const handleNotificationPress = useCallback(
    (item: NotificationDTO) => {
      switch (item.type) {
        case 'follow':
          if (item.sender?.id) {
            navigation.navigate('FriendsProfileScreen', { id: item.sender.id });
          }
          return;

        case 'task-helper':
          if (item.metadata?.taskId) {
            openGoalDetail(item.metadata.taskId);
          }
          return;

        case 'task-advice':
          if (item.metadata?.taskId) {
            openGoalDetail(item.metadata.taskId);
          }
          return;

        case 'commentMention':
          openGoalDetail(item.metadata?.taskId, item.metadata?.commentId);
          return;

        case 'task-motivation-push':
          openGoalDetail(item.metadata?.taskId, item.metadata?.commentId);
          return;
        case 'task-pushed-task-milestone':
          openGoalDetail(item.metadata?.taskId);
          return;
        case 'task-cheer':
        case 'task-motivation-cheer':
          openGoalDetail(item.metadata?.taskId, undefined, {
            scrollTo: 'progress',
            beatId: item.metadata?.beatId,
            highlightBeatId: item.metadata?.beatId,
          });
          return;
        case 'task-motivation-unfinished-reminder':
          openGoalDetail(item.metadata?.taskId, undefined, {
            scrollTo: 'progress',
            openUpdateComposer: true,
          });
          return;
        case 'task-motivation-help-push-reminder':
          openHomeFeed();
          return;
        case 'task-completed':
        case 'task-motivation-progress':
        case 'task-progress-update':
          openGoalDetail(item.metadata?.taskId, undefined, {
            scrollTo: 'progress',
            progressUpdateId: item.metadata?.progressUpdateId,
          });
          return;
        case 'decision-done':
          openGoalDetail(item.metadata?.taskId);
          return;
        case 'reminder':
          openGoalDetail(item.metadata?.taskId);
          return;

        // case 'task-helper':
        // case 'taskHelper':
        // case 'task':
        // case 'reminder':
        // case 'decision-done':
        // case 'decisionDone':
        // case 'decision':
        // case 'advice':
        // case 'motivation':
        //   if (item.metadata?.taskId) {
        //     navigation.navigate('GoalDetail', { taskId: item.metadata.taskId });
        //   }
        //   return;
        // case 'comment':
        // case 'commentMention':
        //   if (item.metadata?.taskId) {
        //     navigation.navigate('GoalDetail', {
        //       taskId: item.metadata.taskId,
        //       highlightCommentId: item.metadata?.commentId,
        //     });
        //   }
        //   return;
        default:
          return;
      }
    },
    [navigation, openHomeFeed, openGoalDetail],
  );

  if (isLoading) {
    return (
      <View style={{ alignSelf: 'center', justifyContent: 'center', flex: 1 }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  // if (!user) {
  //   navigation.navigate('Auth');
  //   return null;
  // }

  return (
    <Layout
      allowPaddingHorizontal={false}
      edgesProp={['top']}
      backgroundColor={colors.onboardingPaper}
    >
      <View style={styles.screen}>
        <PageHeader
          title="Inbox"
          style={styles.header}
          right={
            <Pressable
              onPress={handleMarkAllRead}
              disabled={!hasUnreadNotifications}
              accessibilityRole="button"
              accessibilityLabel="Mark all read"
              style={({ pressed }) => [
                styles.markAllReadButton,
                !hasUnreadNotifications && styles.markAllReadButtonDisabled,
                pressed && hasUnreadNotifications && styles.markAllReadButtonPressed,
              ]}
            >
              <TextElement
                variant="caption"
                weight="600"
                style={[
                  styles.markAllReadText,
                  !hasUnreadNotifications && styles.markAllReadTextDisabled,
                ]}
              >
                Mark all read
              </TextElement>
            </Pressable>
          }
        />

        {sections.length === 0 ? (
          <Row align="center" justify="center" flex>
            <EmptyState title="No notifications" subtitle="You're all caught up!" />
          </Row>
        ) : (
          <SectionList
            showsVerticalScrollIndicator={false}
            sections={sections}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
            stickySectionHeadersEnabled
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            windowSize={7}
            removeClippedSubviews
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeaderContainer}>
                <TextElement variant="subtitle" weight="500" style={styles.sectionHeader}>
                  {title}
                </TextElement>
              </View>
            )}
            ItemSeparatorComponent={() => <AppBorder style={{ marginHorizontal: spacing.lg }} />}
            renderItem={({ item, index, section }) => {
              const isFirst = index === 0;
              const isLast = index === section.data.length - 1;

              return (
                <View
                  style={[
                    styles.rowContainer,
                    isFirst && styles.firstItem,
                    isLast && styles.lastItem,
                  ]}
                >
                  <NotificationCard item={item} onPress={() => handleNotificationPress(item)} />
                </View>
              );
            }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.6}
            ListFooterComponent={
              visibleCount < notifications.length ? (
                <View style={styles.listFooter}>
                  <ActivityIndicator size="small" />
                </View>
              ) : (
                <Height size={vs(60)} />
              )
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
        )}
      </View>
    </Layout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    header: {
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      // paddingTop: spacing.sm,
      // paddingBottom: spacing.md,
    },
    markAllReadButton: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 999,
    },
    markAllReadButtonPressed: {
      opacity: 0.6,
    },
    markAllReadButtonDisabled: {
      opacity: 0.45,
    },
    markAllReadText: {
      color: colors.onboardingMuted,
      letterSpacing: -0.2,
      fontSize: ms(12),
    },
    markAllReadTextDisabled: {
      color: colors.muted,
    },
    sectionHeaderContainer: {
      // paddingVertical: vs(12),
      paddingVertical: spacing.md,
      // marginTop: spacing.lg,
      // paddingHorizontal: spacing.md,
      backgroundColor: colors.onboardingPaper,
    },
    firstItem: {
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      // marginTop: spacing.md,
    },

    lastItem: {
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      // marginBottom: spacing.md,
    },
    sectionHeader: {
      fontSize: ms(16),
      color: colors.text,
      marginLeft: spacing.lg,
    },
    rowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      // paddingHorizontal: spacing.md,
      // paddingVertical: spacing.md,
      marginHorizontal: spacing.lg,
      // marginTop: spacing.md,
      // backgroundColor: '#fff',
      backgroundColor: 'transparent',
      borderRadius: 10,
      overflow: 'hidden',
    },

    listFooter: {
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
  });
