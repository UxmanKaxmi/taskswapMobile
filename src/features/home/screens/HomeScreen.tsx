import React, { useState, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTasksQuery } from '@features/Tasks/hooks/useTasksQuery';
import { Task, TaskType } from '@features/Tasks/types/tasks';

import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import ListView from '@shared/components/ListView/ListView';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import HeadingText from '@shared/components/HeadingText';
import AnimatedBottomButton from '@shared/components/Buttons/AnimatedBottomButton';
import { Layout } from '@shared/components/Layout';
import { Height } from '@shared/components/Spacing';
import { spacing, typography } from '@shared/theme';
import { AppStackParamList } from 'navigation/navigation';

import ReminderCard from '../components/ReminderCard';
import DecisionCard from '../components/DecisionCard';
import { AdviceTask, DecisionTask, MotivationTask, ReminderTask } from '../types/home';
import { vs } from 'react-native-size-matters';
import { showToast } from '@shared/utils/toast';
import MotivationCard from '../components/MotivationCard';
import AdviceCard from '../components/AdviceCard';
import NotificationTester from '@features/debug/NotificationTester';

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [filter, setFilter] = useState<TaskType | 'all'>('all');
  const { data: allTasks = [], isLoading, isError, error, refetch } = useTasksQuery();
  // const { user, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const tasks = useMemo(() => {
    if (filter === 'all') return allTasks;
    return allTasks.filter(task => task.type === filter);
  }, [allTasks, filter]);

  const navigateToDetails = (task: any) => {
    navigation.navigate('TaskDetail', { task });
  };

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

  const renderTaskNew = ({ item }: { item: Task }) => {
    switch (item.type) {
      case 'decision':
        return (
          <DecisionCard
            key={item.id}
            task={item as any}
            onPressCard={navigateToDetails}
            onPressSuggest={t => console.log('Suggest for', t.id)}
            onPressView={t => console.log('View for', t.id)}
          />
        );
      case 'reminder':
        return (
          <ReminderCard
            onRemind={() => {}}
            key={item.id}
            task={item as any}
            onPressCard={navigateToDetails}
            onPressSuggest={t => console.log('Suggest for', t.id)}
            onPressView={t => console.log('View for', t.id)}
          />
        );
      case 'motivation':
        return (
          <MotivationCard
            key={item.id}
            task={item as any}
            onPressCard={navigateToDetails}
            onPressSuggest={t => console.log('Suggest for', t.id)}
            onPressView={t => console.log('View for', t.id)}
          />
        );
      case 'advice':
        return (
          <AdviceCard
            key={item.id}
            task={item as any}
            onPressCard={navigateToDetails}
            onPressSuggest={t => console.log('Suggest for', t.id)}
            onPressView={t => console.log('View for', t.id)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout allowPadding={false}>
      <Height size={15} />
      <HeadingText level={1}>Your Tasks</HeadingText>
      <View style={styles.filters}>
        <ListView
          scrollViewProps={{
            horizontal: true,
            showsHorizontalScrollIndicator: false,
            contentContainerStyle: { marginLeft: 20 },
          }}
        >
          {(['all', 'reminder', 'decision', 'motivation', 'advice'] as const).map(t => (
            <OutlineButton
              key={t}
              type={filter === t ? 'alt' : 'default'}
              style={styles.tagsButton}
              textStyle={styles.tagsText}
              title={t.charAt(0).toUpperCase() + t.slice(1)}
              onPress={() => setFilter(t)}
            />
          ))}
        </ListView>
      </View>

      <ListView
        data={tasks}
        renderItem={renderTaskNew}
        flatListProps={{
          keyExtractor: item => item.id,
          ListEmptyComponent: (
            <View style={{ flex: 1, alignItems: 'flex-start', marginLeft: 20 }}>
              <Height size={20} />
              <TextElement variant="body" color="muted">
                {isLoading ? 'Loading tasks...' : 'No tasks found.'}
              </TextElement>
            </View>
          ),
          ListFooterComponent: <View style={{ backgroundColor: 'red' }} />,
          ItemSeparatorComponent: () => <View style={styles.borderSeparator} />,
        }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      {/* <AnimatedBottomButton
        title="Add Task"
        onPress={() => signOut()}
        // onPress={() => navigation.navigate('FindFriendsScreen')}
        style={styles.addButton}
        visible={true}
      /> */}
    </Layout>
  );
}

const styles = StyleSheet.create({
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
