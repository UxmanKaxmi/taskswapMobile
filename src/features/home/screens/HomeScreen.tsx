import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useTasksQuery } from '@features/Tasks/hooks/useTasksQuery';
import { Task, TaskType } from '@features/Tasks/types/tasks';

import TextElement from '@shared/components/TextElement/TextElement';
import ListView from '@shared/components/ListView/ListView';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import HeadingText from '@shared/components/HeadingText';
import { Layout } from '@shared/components/Layout';
import { Height } from '@shared/components/Spacing';
import { spacing, typography } from '@shared/theme';
import { AppStackParamList } from '@navigation/types/navigation';
import ReminderCard from '../components/ReminderCard';
import DecisionCard from '../components/DecisionCard';
import MotivationCard from '../components/MotivationCard';
import AdviceCard from '../components/AdviceCard';

import { showToast } from '@shared/utils/toast';
import { useAuth } from '@features/Auth/AuthProvider';
import { navigateToTaskDetails } from '@navigation/types/navigationUtils';
import ViewToggle, { ViewMode } from '../components/ViewToggle';

import { Agenda } from 'react-native-calendars';
import { convertTasksToAgendaItems } from '@shared/utils/helperFunctions';
import AgendaView from '../components/AgendaView';
export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [filter, setFilter] = useState<TaskType | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list'); // 👈 new
  const { data: allTasks = [], isLoading, isError, error, refetch } = useTasksQuery();
  const { user } = useAuth();
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

  const openFriendsProfileScreen = useCallback(
    (id: string) => {
      if (id === user?.id) {
        navigation.navigate('Tabs', { screen: 'Profile' });
      } else {
        navigation.navigate('FriendsProfileScreen', { id });
      }
    },
    [navigation, user?.id],
  );

  const renderTaskNew = ({ item }: { item: Task }) => {
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
            onPressSuggest={t => console.log('Suggest for', t.id)}
            onPressView={t => console.log('View for', t.id)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout allowPadding={false} edgesProp={['top', 'left', 'right']}>
      <Height size={15} />

      {/* Header row: title + view toggle */}
      <View style={styles.headerRow}>
        <HeadingText level={1}>Your Tasks</HeadingText>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </View>

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

      {/* For now it still renders the same list – next step we'll switch on viewMode */}
      <View style={styles.contentWrapper}>
        {viewMode === 'list' ? (
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
              ListFooterComponent: <View />,
              ItemSeparatorComponent: () => <View style={styles.borderSeparator} />,
            }}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        ) : (
          <AgendaView
            tasks={tasks}
            isLoading={isLoading}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            renderItem={renderTaskNew}
          />
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingEnd: spacing.md,
    marginBottom: spacing.md,
  },
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
  contentWrapper: {
    flex: 1,
  },
});
