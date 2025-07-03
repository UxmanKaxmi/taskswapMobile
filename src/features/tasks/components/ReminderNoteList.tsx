import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { timeAgo } from '@shared/utils/helperFunctions';
import { spacing } from '@shared/theme';
import { useRemindersForTask } from '@features/Home/hooks/useRemindersForTask';
import Avatar from '@shared/components/Avatar/Avatar';
import { ms } from 'react-native-size-matters';
import Icon from '@shared/components/Icons/Icon';
import Ripple from '@shared/components/Buttons/Ripple';

type Props = {
  taskId: string;
  onPressFriendProfile: (friendId: string) => void;
};

export default function ReminderNoteList({ taskId, onPressFriendProfile }: Props) {
  const { data: reminders, isLoading, isError } = useRemindersForTask(taskId);

  if (isLoading) {
    return <TextElement color="muted">Loading reminders...</TextElement>;
  }

  if (isError) {
    return <TextElement color="error">Failed to load reminders.</TextElement>;
  }

  if (!reminders || reminders.length === 0) {
    return <TextElement color="muted">No reminders yet.</TextElement>;
  }

  return (
    <View style={styles.container}>
      {reminders.map((reminder, index) => (
        <View
          key={reminder.id}
          style={[
            styles.item,
            { backgroundColor: index % 2 === 0 ? '#EAF2FF' : '#E8F8F2' }, // alternate light colors
          ]}
        >
          <View style={styles.header}>
            <Ripple onPress={() => onPressFriendProfile(reminder.senderId)}>
              <Avatar
                uri={reminder.senderPhoto ?? ''}
                fallback={reminder.senderName?.[0] ?? '?'}
                size={34}
              />
            </Ripple>
            <View style={styles.headerText}>
              <TextElement style={styles.senderName} variant="subtitle" weight="500">
                {reminder.senderName ?? 'Someone'}
              </TextElement>
              <TextElement variant="caption" color="muted" style={styles.senderTime}>
                {timeAgo(reminder.createdAt)}
              </TextElement>
            </View>
          </View>
          <View style={styles.messageRow}>
            <TextElement variant="body" style={styles.message}>
              {reminder.message}
            </TextElement>
            {/* <View style={styles.likeRow}>
              <Icon set="ion" name="thumbs-up" size={16} color="#444" />
              <TextElement style={styles.likeCount}>3</TextElement>
            </View> */}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  item: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: 8,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  message: {
    fontSize: ms(14),
    flex: 1,
  },
  senderName: {
    fontSize: ms(14),
    lineHeight: ms(16),
  },
  senderTime: {
    fontSize: ms(12),
    lineHeight: ms(16),
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  likeCount: {
    marginLeft: 4,
    fontSize: ms(12),
    color: '#444',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: spacing.sm,
  },
});
