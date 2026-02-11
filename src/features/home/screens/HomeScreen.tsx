import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, RefreshControl, StatusBar } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useTasksQuery } from '@features/Tasks/hooks/useTasksQuery';
import { Task, TaskType, TaskTypeEnum } from '@features/Tasks/types/tasks';

import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import ListView from '@shared/components/ListView/ListView';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import HeadingText from '@shared/components/HeadingText';
import AnimatedBottomButton from '@shared/components/Buttons/AnimatedBottomButton';
import { Layout } from '@shared/components/Layout';
import { Height } from '@shared/components/Spacing';
import { colors, spacing, typography } from '@shared/theme';
import { AppStackParamList } from '@navigation/types/navigation';

import ReminderCard from '../components/ReminderCard';
import DecisionCard from '../components/DecisionCard';
import {
  AdviceTask,
  DecisionTask,
  FeedFilter,
  MotivationTask,
  ReminderTask,
  TabKey,
} from '../types/home';
import { vs } from 'react-native-size-matters';
import { showToast } from '@shared/utils/toast';
import MotivationCard from '../components/MotivationCard';
import AdviceCard from '../components/AdviceCard';
import NotificationTester from '@features/Debug/NotificationTester';
import { useAuth } from '@features/Auth/AuthProvider';
import { navigateToTaskDetails, useCheckAuthThenNavigate } from '@navigation/types/navigationUtils';
import Row from '@shared/components/Layout/Row';
import { Icon } from '@shared/components/Icons';
import Ripple from '@shared/components/Buttons/Ripple';
import FilterTasksModal from '@features/Tasks/components/FilterTasksModal';
import { LaunchModalHost } from '@features/launchModals';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { haptics } from '@shared/utils/haptics';
import { Greeting } from '@shared/components/Greeting';
import HomeHeader from '../components/HomeHeader';
import HorizontalFilterTabs from '../components/HorizontalFilterTabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isAndroid, isIOS } from '@shared/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  const { data: allTasks = [], isLoading, isError, error, refetch } = useTasksQuery();

  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const [filterModalVisible, setFilterModalVisible] = useState(false);

  //Animation
  const insets = useSafeAreaInsets();
  const TOP_INSET = isIOS ? insets.top : 0;
  const HEADER_EXPANDED = isAndroid ? vs(160) : vs(130) + TOP_INSET;
  const HEADER_COLLAPSED = isAndroid ? vs(50) : vs(30) + TOP_INSET;
  const SCROLL_DISTANCE = HEADER_EXPANDED - HEADER_COLLAPSED;
  const scrollY = useSharedValue(0);
  const checkAuthThenNavigate = useCheckAuthThenNavigate();


  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [HEADER_EXPANDED, HEADER_COLLAPSED],
      Extrapolation.CLAMP,
    );

    return { height };
  });

  const greetingStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE * 0.6],
      [1, 0],
      Extrapolation.CLAMP,
    );

    const translateY = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [0, -12],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const shadowStyle = useAnimatedStyle(() => {
    const progress = interpolate(scrollY.value, [0, SCROLL_DISTANCE], [0, 1], Extrapolation.CLAMP);

    if (isAndroid) {
      // ✅ ANDROID: elevation ONLY
      return {
        elevation: progress * 4,
      };
    }

    // ✅ iOS ONLY shadow props
    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      shadowOpacity: progress * 0.12,
    };
  });

  const TAB_TO_TYPES: Record<TabKey, TaskTypeEnum[]> = {
    all: [
      TaskTypeEnum.Motivation,
      TaskTypeEnum.Decision,
      TaskTypeEnum.Reminder,
      TaskTypeEnum.Advice,
    ],
    motivation: [TaskTypeEnum.Motivation],
    decision: [TaskTypeEnum.Decision],
    reminder: [TaskTypeEnum.Reminder],
    advice: [TaskTypeEnum.Advice],
  };

  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const [feedFilter, setFeedFilter] = useState<FeedFilter>({
    time: 'latest',
    types: [
      TaskTypeEnum.Motivation,
      TaskTypeEnum.Decision,
      TaskTypeEnum.Reminder,
      TaskTypeEnum.Advice,
    ],
  });

  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(filterModalVisible ? 180 : 0, {
      duration: 220,
    });
  }, [filterModalVisible]);
  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handleRefresh = async () => {
    try {
      haptics.selection();
      setRefreshing(true);
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

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

  // const tasks = useMemo(() => {
  //   if (filter === 'all') return allTasks;
  //   return allTasks.filter(task => task.type === filter);
  // }, [allTasks, filter]);

  const tasks = useMemo(() => {
    let list = allTasks;

    if (feedFilter.types.length) {
      list = list.filter(task => feedFilter.types.includes(task.type));
    }

    return list;
  }, [allTasks, feedFilter.types]);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBackgroundColor(colors.surface);

      refetch();

      return () => {
        StatusBar.setBackgroundColor(colors.background);
      };
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

  const openFriendsProfileScreen = useCallback(
    (id: string) => {
      if (id === user?.id) {
        // ✅ Navigate to last profile tab instead
        navigation.navigate('Tabs', {
          screen: 'Profile',
        });
      } else {
        navigation.navigate('FriendsProfileScreen', { id });
      }
    },
    [navigation, user?.id],
  );

  const renderTaskNew = ({ item }: { item: Task }) => {
    if (item.id === '2a42981b-782f-4fc6-94dc-2f6f09a32088') {
      console.log('item', item);
    }
    switch (item.type) {
      case 'decision':
        return (
          <DecisionCard
            key={item.id}
            task={item as any}
            onPressCard={() => navigateToTaskDetails(navigation, item)}
            onPressSuggest={t => console.log('onPressProfile', t.id)}
            onPressView={t => console.log('View for', t.id)}
          />
        );
      case 'reminder':
        return (
          <ReminderCard
            onRemind={() => {}}
            key={item.id}
            task={item as any}
            onPressCard={() => navigateToTaskDetails(navigation, item)}
            onPressProfile={t => openFriendsProfileScreen(t.userId)}
            onPressView={t => console.log('View for', t.id)}
          />
        );
      case 'motivation':
        return (
          <MotivationCard
            key={item.id}
            task={item as any}
            onPressCard={() => navigateToTaskDetails(navigation, item)}
            onPressSuggest={t => console.log('Suggest for', t.id)}
            onPressView={t => console.log('View for', t.id)}
          />
        );
      case 'advice':
        return (
          <AdviceCard
            key={item.id}
            task={item as any}
            onPressCard={() => navigateToTaskDetails(navigation, item)}
            onPressSuggest={t => {
              if (
                checkAuthThenNavigate(
                  'TaskDetail',
                  {
                    taskId: t.id,
                    openAdviceComposer: true,
                  },
                  {
                    authContext: 'Advice',
                  },
                )
              ) {
                return;
              }
            }}
            onPressView={t => console.log('View for', t.id)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout allowPaddingHorizontal={false} useSafeArea={false}>
      <Animated.View style={[styles.header, headerStyle, shadowStyle]}>
        <HomeHeader
          filterOpen={filterModalVisible}
          onPressSearch={() => setFilterModalVisible(true)}
          onPressFilter={() => setFilterModalVisible(true)}
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
        keyExtractor={item => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        // refreshing={refreshing}
        // onRefresh={handleRefresh}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.muted} // iOS spinner
            colors={[colors.muted]} // Android spinner
            progressViewOffset={HEADER_EXPANDED} // 🔥 THIS FIXES IT
          />
        }
        contentContainerStyle={{
          paddingTop: HEADER_EXPANDED,
          paddingBottom: spacing.lg,
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: 'flex-start', marginLeft: 20 }}>
            <Height size={20} />
            <TextElement variant="body" color="muted">
              {isLoading ? 'Loading tasks...' : 'No tasks found.'}
            </TextElement>
          </View>
        }
        ListFooterComponent={<View style={{ marginBottom: vs(50) }} />}
        showsVerticalScrollIndicator={false}
      />

      {/* <AnimatedBottomButton
        title="Add Task"
        onPress={() => signOut()}
        // onPress={() => navigation.navigate('FindFriendsScreen')}
        style={styles.addButton}
        visible={true}
      /> */}

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
    backgroundColor: 'white', // or theme background
    // paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  container: {},
  filters: {
    flexDirection: 'row',
  },
  taskRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  borderSeparator: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    marginTop: 16,
  },
  tagsButton: {
    width: 120,
    marginEnd: spacing.sm,
    borderRadius: 50,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  tagsText: {
    fontSize: typography.small,
  },
});
