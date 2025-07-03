// src/features/tasks/screens/TaskDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from 'navigation/navigation';
import { useTheme } from '@shared/theme/useTheme';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import { deleteTask } from '../api/taskApi';
import { Layout } from '@shared/components/Layout';
import Row from '@shared/components/Layout/Row';
import ReminderNoteList from '../components/ReminderNoteList';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import {
  capitalizeFirstLetter,
  formatAbsolute,
  formatReminderTime,
  timeAgo,
} from '@shared/utils/helperFunctions';
import TaskDetailHeading from '../components/TaskDetailHeading';
import { cardStyles } from '@features/Home/components/styles';
import Avatar from '@shared/components/Avatar/Avatar';
import TypeTag from '@shared/components/TypeTag/TypeTag';
import { Height } from '@shared/components/Spacing';
import { getTypeVisual } from '@shared/utils/typeVisuals';
import Column from '@shared/components/Layout/Column';
import HelperAvatarGroup from '@features/Home/components/HelperAvatarGroup';
import { ms } from 'react-native-size-matters';
import HelpersRow from '../components/HelpersRow';
import { formatDistanceToNow, parseISO, set } from 'date-fns';
import CompletionStatus from '../components/CompletionStatus';
import { useAuth } from '@features/Auth/authProvider';
import { showToast } from '@shared/utils/toast';
import { useCompleteTask } from '@features/Home/hooks/useCompleteTask';
import { queryClient } from '@lib/react-query/client';
import { buildQueryKey } from '@shared/constants/queryKeys';
import { openFriendsProfile } from '@navigation/navigationUtils';
import VoteProgressBar from '@features/Home/components/VoteProgressBar';
import { colors } from '@shared/theme';
import StackedVoteBar from '../components/StackedVoteBar';
import AppLoader from '@shared/components/Loader/Loader';

export default function TaskDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'TaskDetail'>) {
  const { task } = route.params;
  const { colors, spacing } = useTheme();
  const { emoji } = getTypeVisual(task.type);
  const { user } = useAuth();
  const isOwner = task.userId === user?.id;
  const [isCompleted, setCompleted] = useState(task.completed);
  const { mutate: completeTask, isPending } = useCompleteTask();
  const [isLoading, setIsLoading] = useState(false);
  const votedOption = task.votedOption;
  const totalVotes = Object.values(task.votes || {}).reduce((a, b) => a + (b.count || 0), 0);
  const [option1, option2] = task.options || [];
  const vote1 = task.votes?.[option1] || 0;
  const vote2 = task.votes?.[option2] || 0;

  // const percent1 = totalVotes > 0 ? (vote1 / totalVotes) * 100 : 50;
  // const percent2 = totalVotes > 0 ? (vote2 / totalVotes) * 100 : 50;

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsLoading(true);
          try {
            await deleteTask(task.id).finally(() => {
              setIsLoading(false);
            });
            navigation.goBack();
          } catch (err) {
            console.error('[DELETE_TASK_ERROR]', err);
            Alert.alert('Error', 'Failed to delete task');
          }
        },
      },
    ]);
  };

  useEffect(() => {
    setCompleted(task.completed);
  }, [task.completed]);

  const handleMarkDone = () => {
    completeTask(task.id, {
      onSuccess: val => {
        setCompleted(true);
        queryClient.invalidateQueries({ queryKey: buildQueryKey.taskById(task.id) });

        showToast({
          type: 'success',
          title: 'Success',
          message: `Task marked as done!`,
        });
      },
      onError: () => {
        showToast({
          type: 'error',
          title: 'Error',
          message: `Failed to mark task as done!`,
        });
      },
    });
  };
  return isLoading ? (
    <AppLoader visible />
  ) : (
    <Layout allowPadding>
      <AppHeader title="Task Details" />

      <Row justify="space-between" style={cardStyles.cardHeader}>
        <Pressable onPress={() => { }}>
          <Row>
            <Avatar uri={task.avatar} />
            <View>
              <TextElement variant="subtitle" style={cardStyles.name}>
                {task.name}
              </TextElement>
              <TextElement variant="caption" style={cardStyles.timeAgo} color="muted">
                {timeAgo(task.createdAt)}
              </TextElement>
            </View>
          </Row>
        </Pressable>
        <TypeTag type={task.type} />
      </Row>

      <View style={cardStyles.messageRow}>
        <TextElement variant="title">
          {emoji} {task.text}
        </TextElement>
      </View>

      {task.type === 'reminder' && (
        <>
          <Height size={12} />

          <TextElement variant="caption" style={styles.reminderTimeKey}>
            Reminder Time
          </TextElement>

          <TextElement variant="subtitle" weight="500" style={styles.reminderTimeValue}>
            {task.remindAt ? formatReminderTime(task.remindAt) : 'No reminder set'}
          </TextElement>
          <TextElement color="muted" variant="subtitle" style={styles.detailFromNow}>
            ⏳{' '}
            {task.remindAt &&
              formatDistanceToNow(parseISO(task.remindAt), {
                addSuffix: true,
              })}
          </TextElement>
        </>
      )}
      <Height size={12} />

      {task.type === 'decision' && task.options?.length === 2 && (
        <StackedVoteBar
          option1={task.options[0]}
          option2={task.options[1]}
          percent1={
            totalVotes > 0 ? ((task.votes?.[task.options[0]]?.count ?? 0) / totalVotes) * 100 : 50
          }
          percent2={
            totalVotes > 0 ? ((task.votes?.[task.options[1]]?.count ?? 0) / totalVotes) * 100 : 50
          }
          vote1={task.votes?.[task.options[0]]?.count ?? 0}
          vote2={task.votes?.[task.options[1]]?.count ?? 0}
          voters1={task.votes?.[task.options[0]]?.preview ?? []}
          voters2={task.votes?.[task.options[1]]?.preview ?? []}
          votedOption={task.votedOption}
        />
      )}

      {task.helpers && task.helpers.length > 0 && (
        <View style={{}}>
          <TextElement variant="caption" weight="500" style={styles.reminderTimeKey}>
            Helpers
          </TextElement>
          <HelpersRow
            maxVisible={3}
            helpers={task.helpers as any}
            onPressAvatar={helper => {
              openFriendsProfile(navigation, helper.id);
            }}
          />
        </View>
      )}
      <Height size={12} />

      <Row justify="space-between">
        {/* {task?.completed && (
          <Column gap={-1}>
            <TextElement variant="caption" weight="500" style={styles.reminderTimeKey}>
              Completed at
            </TextElement>
            <TextElement variant="subtitle" weight="600" style={styles.reminderTimeValue}>
              {task.completedAt ? formatReminderTime(task.completedAt) : 'No reminder set'}
            </TextElement>
          </Column>
        )} */}
        <Column gap={-1} style={{ marginEnd: 10 }}>
          <TextElement variant="caption" weight="500" style={styles.reminderTimeKey}>
            Status
          </TextElement>
          <CompletionStatus completed={task?.completed} />
        </Column>
      </Row>
      <Height size={25} />
      {task.type === 'reminder' && (
        <>
          <TextElement variant="subtitle" weight="500" style={{}}>
            Friendly Reminders
          </TextElement>
          <ReminderNoteList
            onPressFriendProfile={friendId => openFriendsProfile(navigation, friendId)}
            taskId={task.id}
          />
        </>
      )}

      {/* Action buttons */}
      {isOwner && isCompleted && (
        <Row style={{}}>
          <OutlineButton
            title="Edit"
            onPress={() => navigation.navigate('AddTask', { task })}
            style={{ flex: 1, marginRight: spacing.sm }}
          />
        </Row>
      )}

      {isOwner && !isCompleted && (
        <Row style={{}}>
          <PrimaryButton
            title="Mark as Done"
            onPress={() => handleMarkDone()}
            style={{ flex: 1, marginRight: spacing.sm }}
          />
        </Row>
      )}
      <Row style={{}}>
        <PrimaryButton
          title="Delete"
          onPress={() => handleDelete()}
          style={{ flex: 1, marginRight: spacing.sm, backgroundColor: colors.error }}
        />
      </Row>
    </Layout>
  );
}

const styles = StyleSheet.create({
  reminderTimeKey: { fontSize: ms(12), color: colors.muted },
  detailFromNow: { fontSize: ms(11) },
  reminderTimeValue: { fontSize: ms(16) },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
});
