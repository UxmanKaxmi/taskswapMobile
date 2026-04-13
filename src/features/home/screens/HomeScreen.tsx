import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  ListRenderItem,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useTasksQuery } from '@features/Tasks/hooks/useTasksQuery';
import { Task, TaskTypeEnum } from '@features/Tasks/types/tasks';

import TextElement from '@shared/components/TextElement/TextElement';
import { Layout } from '@shared/components/Layout';
import { Height } from '@shared/components/Spacing';
import { colors, spacing } from '@shared/theme';
import { AppStackParamList } from '@navigation/types/navigation';

import ReminderCard from '../components/ReminderCard';
import DecisionCard from '../components/DecisionCard';
import { FeedFilter, TabKey, MotivationTask } from '../types/home';
import { vs } from 'react-native-size-matters';
import { showToast } from '@shared/utils/toast';
import MotivationCard from '../components/MotivationCard';
import AdviceCard from '../components/AdviceCard';
import { useAuth } from '@features/Auth/AuthProvider';
import { navigateToTaskDetails, useCheckAuthThenNavigate } from '@navigation/types/navigationUtils';
import FilterTasksModal from '@features/Tasks/components/FilterTasksModal';
import { LaunchModalHost } from '@features/LaunchModals';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  interpolateColor,
  Extrapolation,
} from 'react-native-reanimated';
import { haptics } from '@shared/utils/haptics';
import { Greeting } from '@shared/components/Greeting';
import HomeHeader from '../components/HomeHeader';
import HorizontalFilterTabs from '../components/HorizontalFilterTabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isAndroid } from '@shared/utils/constants';
import { useSecondaryProfileMenuItems } from '@features/MyProfile/hooks/useSecondaryProfileMenuItems';

const ALL_TASK_TYPES: TaskTypeEnum[] = [
  TaskTypeEnum.Motivation,
  TaskTypeEnum.Decision,
  TaskTypeEnum.Reminder,
  TaskTypeEnum.Advice,
];
const MIN_REFRESH_LOADER_MS = 450;

const TAB_TO_TYPES: Record<TabKey, TaskTypeEnum[]> = {
  all: ALL_TASK_TYPES,
  motivation: [TaskTypeEnum.Motivation],
  decision: [TaskTypeEnum.Decision],
  reminder: [TaskTypeEnum.Reminder],
  advice: [TaskTypeEnum.Advice],
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTasksQuery();

  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [shareTask, setShareTask] = useState<MotivationTask | null>(null);

  // Animation
  const insets = useSafeAreaInsets();
  const TOP_INSET = insets.top;
  const HEADER_EXPANDED = (isAndroid ? 170 : vs(130)) + TOP_INSET;
  const HEADER_COLLAPSED = (isAndroid ? vs(40) : vs(30)) + TOP_INSET;
  const SCROLL_DISTANCE = HEADER_EXPANDED - HEADER_COLLAPSED;
  const scrollY = useSharedValue(0);
  const refreshProgressOffset = HEADER_EXPANDED + spacing.xs;
  const checkAuthThenNavigate = useCheckAuthThenNavigate();
  const secondaryItems = useSecondaryProfileMenuItems();

  const openDevMenu = useCallback(() => {
    Alert.alert(
      'Developer Tools',
      undefined,
      [
        {
          text: 'Notification Debug Tools',
          style: 'default' as const,
          onPress: () => {
            navigation.navigate('MainDebugScreen');
          },
        },
        ...secondaryItems.map(item => ({
          text: item.label,
          style: item.destructive ? ('destructive' as const) : ('default' as const),
          onPress: () => {
            item.onPress();
          },
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
      { cancelable: true },
    );
  }, [navigation, secondaryItems]);

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [HEADER_EXPANDED, HEADER_COLLAPSED],
      Extrapolation.CLAMP,
    );

    return { height };
  });

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      // Ignore negative pull-to-refresh overscroll to avoid header jitter at top.
      scrollY.value = Math.max(0, event.contentOffset.y);
    },
  });

  const shadowStyle = useAnimatedStyle(() => {
    const progress = interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, 1], Extrapolation.CLAMP);

    if (isAndroid) {
      return {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: interpolateColor(
          progress,
          [0, 1],
          ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.12)'],
        ),
      };
    }

    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      shadowOpacity: progress * 0.12,
    };
  });

  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const [feedFilter, setFeedFilter] = useState<FeedFilter>({
    time: 'latest',
    types: [...ALL_TASK_TYPES],
  });

  const handleRefresh = useCallback(async () => {
    const startedAt = Date.now();
    try {
      haptics.selection();
      setRefreshing(true);
      await refetch();
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_REFRESH_LOADER_MS) {
        await new Promise(resolve => setTimeout(resolve, MIN_REFRESH_LOADER_MS - elapsed));
      }
      setRefreshing(false);
    }
  }, [refetch]);

  const collapsibleContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE * 0.6],
      [1, 0],
      Extrapolation.CLAMP,
    );

    const translateY = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [0, -16],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const flattenedTasks = useMemo(() => data?.pages.flatMap(page => page.data) ?? [], [data]);

  const tasks = useMemo(() => {
    let list = flattenedTasks;

    if (feedFilter.types.length) {
      list = list.filter(task => feedFilter.types.includes(task.type));
    }

    return list;
  }, [flattenedTasks, feedFilter.types]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    if (isError) {
      showToast({
        type: 'error',
        title: 'Failed to load tasks',
        message: 'Please check your connection or try again later.',
      });
      console.error('[TASK_FETCH_ERROR]', error);
    }
  }, [isError]);

  const onPressTask = useCallback(
    (task: Task) => {
      navigateToTaskDetails(navigation, task);
    },
    [navigation],
  );

  const onNoopTaskAction = useCallback((_task: Task) => {}, []);

  const handleShareMotivation = useCallback((task: MotivationTask) => {
    setShareTask(task);
  }, []);

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

  const keyExtractor = useCallback((item: Task) => item.id, []);

  const getItemType = useCallback((item: Task) => item.type, []);

  const listContentStyle = useMemo(
    () => ({
      paddingTop: HEADER_EXPANDED,
      paddingBottom: spacing.lg,
    }),
    [HEADER_EXPANDED],
  );

  const renderTaskNew = useCallback<ListRenderItem<Task>>(
    ({ item }) => {
      switch (item.type) {
        case 'decision':
          return <DecisionCard task={item as any} onPressCard={onPressTask as any} />;
        case 'reminder':
          return <ReminderCard task={item as any} onPressCard={onPressTask as any} />;
        case 'motivation':
          return (
            <MotivationCard
              task={item as MotivationTask}
              onPressCard={onPressTask as any}
              onPressSuggest={onNoopTaskAction as any}
              onPressView={onNoopTaskAction as any}
              onPressShare={handleShareMotivation}
            />
          );
        case 'advice':
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
    [onPressTask, onNoopTaskAction, onSuggestAdvice],
  );

  return (
    <Layout allowPaddingHorizontal={false} useSafeArea={false}>
      <Animated.View style={[styles.header, headerStyle, shadowStyle]}>
        <HomeHeader
          onPressSearch={() => setFilterModalVisible(true)}
          onPressMore={openDevMenu}
        />

        <Animated.View style={collapsibleContentStyle}>
          <Greeting name={user?.name} onPressAction={() => setFilterModalVisible(true)} />

          <HorizontalFilterTabs
            value={activeTab as any}
            onChange={tab => {
              haptics.selection();
              setActiveTab(tab as TabKey);
              setFeedFilter(prev => ({
                ...prev,
                types: TAB_TO_TYPES[tab as TabKey],
              }));
            }}
          />
        </Animated.View>
      </Animated.View>

      <Animated.FlatList
        data={tasks}
        renderItem={renderTaskNew}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        onScroll={onScroll}
        scrollEventThrottle={16}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={isAndroid}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.placeHolder}
            colors={[colors.placeHolder]}
            progressViewOffset={refreshProgressOffset}
          />
        }
        contentContainerStyle={listContentStyle}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Height size={20} />
            <TextElement variant="body" color="placeHolder">
              {isLoading ? 'Loading tasks...' : 'No tasks found.'}
            </TextElement>
          </View>
        }
        ListFooterComponent={() => {
          if (!isFetchingNextPage) {
            return <View style={{ marginBottom: vs(50) }} />;
          }

          return <View style={{ marginBottom: vs(50) }} />;
        }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

      <FilterTasksModal
        visible={filterModalVisible}
        value={feedFilter}
        onClose={() => setFilterModalVisible(false)}
        onApply={value => {
          setFeedFilter(value);
          setFilterModalVisible(false);
        }}
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: 'white',
    paddingBottom: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: 20,
  },
  footerSpinner: {
    marginTop: vs(20),
    marginBottom: vs(20),
    alignItems: 'center',
  },
});
