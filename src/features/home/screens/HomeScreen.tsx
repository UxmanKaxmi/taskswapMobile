import React, { useCallback, useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation, NavigationProp } from '@react-navigation/native';

import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import ListView from '@shared/components/ListView/ListView';
import { getTasks } from '@features/home/api/home';
import { Task } from '@features/home/types/home';
import { TaskType } from '@features/tasks/types/tasks';
import { AppStackParamList } from '@features/tasks/types/navigation';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import HeadingText from '@shared/components/HeadingText';
import { spacing, typography } from '@shared/theme';
import AnimatedBottomButton from '@shared/components/Buttons/AnimatedBottomButton';
import { Layout } from '@shared/components/Layout';
import { vs } from 'react-native-size-matters';
import { Height } from '@shared/components/Spacing';
import Row from '@shared/components/Layout/Row';
import DecisionCard, { DecisionTask } from '../components/DecisionCard';

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskType | 'all'>('all');

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [filter]),
  );

  const fetchTasks = async () => {
    try {
      const all = await getTasks();
      setTasks(filter === 'all' ? all : all.filter(t => t.type === filter));
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  };

  const navigateToDetails = (task: Task) => {
    navigation.navigate('TaskDetail', { task: { ...task, type: task.type as TaskType } });
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity style={styles.taskRow} onPress={() => navigateToDetails(item)}>
      <TextElement variant="body" weight="600">
        {item.text}
      </TextElement>
      <TextElement variant="caption" color="muted">
        Type: {item.type}
      </TextElement>
      {item.type === 'decision' && item.options?.length > 0 && (
        <View style={styles.optionsContainer}>
          {item.options.map(
            (
              opt:
                | string
                | number
                | bigint
                | boolean
                | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
                | Iterable<React.ReactNode>
                | React.ReactPortal
                | Promise<
                    | string
                    | number
                    | bigint
                    | boolean
                    | React.ReactPortal
                    | React.ReactElement<unknown, string | React.JSXElementConstructor<any>>
                    | Iterable<React.ReactNode>
                    | null
                    | undefined
                  >
                | null
                | undefined,
              idx: React.Key | null | undefined,
            ) => (
              <TextElement key={idx} variant="body" color="muted">
                • {opt}
              </TextElement>
            ),
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderTaskNew = ({ item }: { item: DecisionTask }) =>
    item.type === 'decision' && (
      <DecisionCard
        key={item.id}
        task={item}
        onPressCard={t => console.log('Card pressed', t.id)}
        onPressSuggest={t => console.log('Suggest for', t.id)}
        onPressView={t => console.log('View for', t.id)}
      />
    );

  return (
    <View style={styles.container}>
      <Height size={15} />
      <HeadingText level={1}>Your Tasks</HeadingText>
      <View style={styles.filters}>
        <ListView
          scrollViewProps={{
            horizontal: true,
            showsHorizontalScrollIndicator: false,
            contentContainerStyle: {
              marginLeft: 20,
            },
          }}
        >
          <OutlineButton
            type={filter === 'all' ? 'alt' : 'default'}
            style={styles.tagsButton}
            textStyle={styles.tagsText}
            title="All"
            onPress={() => setFilter('all')}
          />

          <OutlineButton
            type={filter === 'reminder' ? 'alt' : 'default'}
            style={styles.tagsButton}
            textStyle={styles.tagsText}
            title="Reminders"
            onPress={() => setFilter('reminder')}
          />
          <OutlineButton
            type={filter === 'decision' ? 'alt' : 'default'}
            style={styles.tagsButton}
            textStyle={styles.tagsText}
            title="Decisions"
            onPress={() => setFilter('decision')}
          />
          <OutlineButton
            type={filter === 'motivation' ? 'alt' : 'default'}
            style={styles.tagsButton}
            textStyle={styles.tagsText}
            title="Motivation"
            onPress={() => setFilter('motivation')}
          />
          <OutlineButton
            type={filter === 'advice' ? 'alt' : 'default'}
            style={styles.tagsButton}
            textStyle={styles.tagsText}
            title="Advice"
            onPress={() => setFilter('advice')}
          />
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
                No tasks found.
              </TextElement>
            </View>
          ),
          ListFooterComponent: <View style={{ marginBottom: vs(60) }} />,
          ItemSeparatorComponent: () => <View style={styles.borderSeparator} />,
        }}
      />

      <AnimatedBottomButton
        title="Add Task"
        onPress={() => navigation.navigate('AddTask')}
        style={styles.addButton}
        visible={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: spacing.md,
    // marginStart: spacing.md,
  },
  taskRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  borderSeparator: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  optionsContainer: { paddingLeft: 16, marginTop: 4 },
  addButton: { marginTop: 16 },
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
