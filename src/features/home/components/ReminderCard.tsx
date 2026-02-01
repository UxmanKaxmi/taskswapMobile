// src/shared/components/ReminderCard.tsx

import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ms, vs } from 'react-native-size-matters';
import { format, formatDistanceToNow, isBefore, parseISO } from 'date-fns';

import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import { colors, spacing } from '@shared/theme';
import { ReminderTask } from '../types/home';
import { timeAgo, stripOuterQuotes, toShortName } from '@shared/utils/helperFunctions';
import { cardStyles } from './styles';
import { getTypeVisual } from '@shared/utils/typeVisuals';
import TaskFooter from './TaskFooter';
import { Shadow } from '@shared/components/Shadow';
import { Icon } from '@shared/components/Icons';
import TaskMetaRow from './TaskMetaRow';
import TaskCardGradient from './TaskCardGradient';
import ReminderMessageModal from '@shared/components/Modals/ReminderMessageModal';
import { useAuth } from '@features/Auth/AuthProvider';
import { useAddReminder } from '../hooks/useAddTask';
import { showToast } from '@shared/utils/toast';
import HelperAvatarGroup from './HelperAvatarGroup';
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
  const { emoji } = getTypeVisual(type);

  const [showModal, setShowModal] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const { mutate: addReminder, isPending } = useAddReminder(task.id);
  const reminderExpired = isBefore(new Date(remindAt), new Date());

  const handleSendReminder = (msg: string) => {
    if (!msg.trim()) {
      showToast({
        type: 'error',
        title: 'Oops!',
        message: 'Reminder message cannot be empty.',
      });
      return;
    }

    addReminder(msg, {
      onSuccess: () => {
        setShowModal(false);
        setCustomMessage('');
        showToast({
          type: 'success',
          title: 'Sent 🎉',
          message: 'Your reminder has been sent!',
        });
      },
      onError: (err: any) => {
        showToast({
          type: 'error',
          title: 'Error',
          message: err?.response?.data?.error || 'Failed to send reminder.',
        });
      },
    });
  };

  const getReminderTimeLabel = task => {
    if (!task?.remindAt) return null;

    const now = new Date();
    const remindAt = new Date(task.remindAt);
    const expiresAt = task.expiresAt ? new Date(task.expiresAt) : null;

    // ⏰ Before reminder time
    if (remindAt > now) {
      return `⏰ ${format(remindAt, 'EEE, h:mm a')}`;
    }

    // ⏳ After reminder time, still active
    if (!expiresAt || expiresAt > now) {
      return `⏳ Expired ${formatDistanceToNow(remindAt)} ago`;
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
              onPressPush={() => !isOwner && setShowModal(true)}
              pushCount={task.reminderNoteCount ?? 0}
              hasReminded={hasReminded}
              reminderNoteCount={task.reminderNoteCount ?? 0}
              onSendReminder={() => setShowModal(true)}
              reminderText={reminderText}
              reminderExpired={reminderExpired}
            />
          </View>
        </TouchableOpacity>
      </TaskCardGradient>

      {/* Reminder modal */}
      <ReminderMessageModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSend={handleSendReminder}
        message={customMessage}
        setMessage={setCustomMessage}
        taskName={task.name}
        taskText={task.text}
        isLoading={isPending}
      />
    </Shadow>
  );
}

const styles = StyleSheet.create({
  openQuote: {
    opacity: 0.05,
    transform: [{ rotate: '-15deg' }],
  },
});
