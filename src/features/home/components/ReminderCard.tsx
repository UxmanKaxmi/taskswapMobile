// src/shared/components/ReminderCard.tsx

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ms, vs } from 'react-native-size-matters';
import { format, isBefore } from 'date-fns';

import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import { ReminderTask } from '../types/home';
import { humanizeReminderDate, stripOuterQuotes } from '@shared/utils/helperFunctions';
import { cardStyles } from './styles';
import TaskFooter from './TaskFooter';
import { Shadow } from '@shared/components/Shadow';
import { Icon } from '@shared/components/Icons';
import TaskCardGradient from './TaskCardGradient';
import { useModal } from '@shared/components/ModalProvider';
import { useAuth } from '@features/Auth/AuthProvider';
import { useAddReminder } from '../hooks/useAddTask';
import { showToast } from '@shared/utils/toast';
import TaskHeader from './TaskHeader';
import { TaskTypeEnum } from '@features/Tasks/types/tasks';

type Props = {
  task: ReminderTask;
  onPressCard: (task: ReminderTask) => void;
  onPressShare?: (task: ReminderTask) => void;
};

export default function ReminderCard({ task, onPressCard, onPressShare }: Props) {
  const {
    avatar,
    name = 'John Doe',
    createdAt,
    text,
    type,
    userId,
    remindAt,
    hasReminded,
    helpers,
  } = task;

  const { user } = useAuth();
  const isOwner = userId === user?.id;
  const { openReminderMessageSheet } = useModal();

  const { mutate: addReminder } = useAddReminder(task.id);
  const reminderExpired = isBefore(new Date(remindAt), new Date());

  const openReminderComposer = () => {
    openReminderMessageSheet({
      taskName: task.name || 'Someone',
      taskText: task.text,
      onSend: msg =>
        new Promise<void>((resolve, reject) => {
          addReminder(msg, {
            onSuccess: () => {
              showToast({
                type: 'success',
                title: 'Sent 🎉',
                message: 'Your reminder has been sent!',
              });
              resolve();
            },
            onError: (err: any) => {
              showToast({
                type: 'error',
                title: 'Error',
                message: err?.response?.data?.error || 'Failed to send reminder.',
              });
              reject(err);
            },
          });
        }),
    });
  };

  const getReminderTimeLabel = task => {
    if (!task?.remindAt) return null;

    const now = new Date();
    const remindAt = new Date(task.remindAt);
    const expiresAt = task.expiresAt ? new Date(task.expiresAt) : null;

    // ⏰ Before reminder time
    if (remindAt > now) {
      return humanizeReminderDate(remindAt);
    }

    // ⏳ After reminder time, still active
    if (!expiresAt || expiresAt > now) {
      return `⏳ Expired`;
    }

    // ❌ Fully expired
    return `⏱ Reminder expired`;
  };

  const reminderText = type === TaskTypeEnum.Reminder ? getReminderTimeLabel(task) : null;
  return (
    <Shadow size="tint" style={cardStyles.card}>
      <TaskCardGradient style={cardStyles.gradient} type={type}>
        {/* Decorative quote (same as Motivation) */}
        <View style={{ position: 'absolute', bottom: vs(0), left: 10 }}>
          <Icon
            set="fa6"
            name="bell"
            size={ms(100)}
            color={colors.reminderBgHardest}
            style={styles.openQuote}
          />
        </View>

        <TouchableOpacity
          style={cardStyles.touchable}
          activeOpacity={0.7}
          onPress={() => onPressCard(task)}
        >
          <TaskHeader
            avatar={avatar || ''}
            name={name}
            createdAt={createdAt}
            type={TaskTypeEnum.Reminder}
            helpers={helpers}
          />

          {/* Message */}
          <View style={cardStyles.messageRow}>
            <TextElement variant="title" style={cardStyles.mainText}>
              {stripOuterQuotes(text)}
            </TextElement>
          </View>

          {/* Reminder meta */}
          {/* <TextElement
            variant="caption"
            color="muted"
            style={{ marginTop: spacing.sm, textAlign: 'center' }}
          >
            {reminderText}
          </TextElement> */}

          {/* Footer */}
          <View style={{ marginTop: spacing.md }}>
            <TaskFooter
              commentCount={task.commentsCount ?? 0}
              viewCount={task.viewCount ?? 0}
              shareHandler={() => onPressShare?.(task)}
              taskDetails={task}
              hasPushed={false}
              onPressPush={() => !isOwner && openReminderComposer()}
              pushCount={task.reminderNoteCount ?? 0}
              hasReminded={hasReminded}
              reminderNoteCount={task.reminderNoteCount ?? 0}
              onSendReminder={openReminderComposer}
              reminderText={reminderText}
              reminderExpired={reminderExpired}
            />
          </View>
        </TouchableOpacity>
      </TaskCardGradient>
    </Shadow>
  );
}

const styles = StyleSheet.create({
  openQuote: {
    opacity: 0.05,
    transform: [{ rotate: '-15deg' }],
  },
});
