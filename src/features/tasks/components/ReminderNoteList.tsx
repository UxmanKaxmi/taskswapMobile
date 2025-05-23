import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { timeAgo } from '@shared/utils/helperFunctions';
import { spacing } from '@shared/theme';
import { useRemindersForTask } from '@features/Home/hooks/useRemindersForTask';

type Props = {
  taskId: string;
};

export default function ReminderNoteList({ taskId }: Props) {
  const { data: reminders, isLoading, isError } = useRemindersForTask(taskId);

  console.log(reminders);

  if (isLoading) {
    return <TextElement>Loading reminders...</TextElement>;
  }

  if (isError) {
    return <TextElement color="error">Failed to load reminders.</TextElement>;
  }

  if (!reminders || reminders.length === 0) {
    return <TextElement>No reminders yet.</TextElement>;
  }

  return (
    <View style={styles.container}>
      {reminders.map(reminder => (
        <View key={reminder.id} style={styles.item}>
          <TextElement variant="subtitle" weight="500">
            {/* {reminder.senderName ?? 'Someone'} */}
            Someone
          </TextElement>
          <TextElement variant="body" style={styles.message}>
            {reminder.message}
          </TextElement>
          <TextElement variant="caption" color="muted">
            {timeAgo(reminder.createdAt)}
          </TextElement>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  item: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: '#F4F6FA',
    borderRadius: 8,
  },
  message: {
    marginTop: 4,
    marginBottom: 4,
  },
});
