// src/shared/components/ReminderCard.tsx

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import { colors, spacing, typography } from '@shared/theme';
import { ReminderTask } from '../types/home';
import { timeAgo } from '@shared/utils/helperFunctions';
import TypeTag from '@shared/components/TypeTag/TypeTag';
import { cardStyles } from './styles';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import { useCompleteTask } from '../hooks/useCompleteTask';
import { showToast } from '@shared/utils/toast';
import { useInCompleteTask } from '../hooks/useInCompleteTask';
import Icon from '@shared/components/Icons/Icon';
import { Width } from '@shared/components/Spacing';
import ReminderMessageModal from '@shared/components/Modals/ReminderMessageModal';
import { useAuth } from '@features/Auth/authProvider';
import { useAddReminder } from '../hooks/useAddReminder';
import { getNotificationTypeVisual } from '@shared/utils/getNotificationTypeVisual';
type Props = {
  task: ReminderTask;
  onPressCard: (task: ReminderTask) => void;
  onPressSuggest: (task: ReminderTask) => void;
  onPressView: (task: ReminderTask) => void;
  onRemind: (task: ReminderTask, msg: string) => void;
};

export default function ReminderCard({
  task,
  onPressCard,
  onPressSuggest,
  onPressView,
  onRemind,
}: Props) {
  const { avatar, name = 'John Doe', createdAt, text, type, userId, completed, hasReminded } = task;
  const { user } = useAuth();
  const isOwner = userId === user?.id;

  const [isCompleted, setCompleted] = useState(completed);
  const [showModal, setShowModal] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const { emoji } = getNotificationTypeVisual(type);

  const { mutate: completeTask, isPending } = useCompleteTask();
  const { mutate: incompleteTask, isPending: isIncompletePending } = useInCompleteTask();
  const { mutate: addReminder, isPending: isSendingReminder } = useAddReminder(task.id);
  const handleRemind = () => {
    if (!hasReminded) {
      setShowModal(true);
    }
  };

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

  const handleMarkDone = () => {
    completeTask(task.id, {
      onSuccess: val => {
        setCompleted(true);
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

  const handleMarkUnDone = () => {
    incompleteTask(task.id, {
      onSuccess: val => {
        setCompleted(false);
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

  return (
    <TouchableOpacity
      style={[
        cardStyles.card,
        {
          // backgroundColor: isOwner ? '#F3F4FF' : '#FFFFFF',
          // borderColor: isOwner ? colors.primary : '#E0E0E0',
        },
      ]}
      activeOpacity={0.7}
      onPress={() => onPressCard(task)}
    >
      <Row justify="space-between" style={cardStyles.cardHeader}>
        <Row>
          <Image source={{ uri: avatar }} style={cardStyles.avatar} />
          <View>
            <TextElement variant="subtitle" style={cardStyles.name}>
              {name}
            </TextElement>
            <TextElement variant="caption" style={cardStyles.timeAgo} color="muted">
              {timeAgo(createdAt)}
            </TextElement>
          </View>
        </Row>
        <TypeTag type={type} />
      </Row>
      <View style={cardStyles.messageRow}>
        <TextElement variant="title">
          {emoji} {text}
        </TextElement>
      </View>
      <View style={cardStyles.buttonRow}>
        {isOwner ? (
          isCompleted ? (
            <TextElement
              onPress={handleMarkUnDone}
              variant="caption"
              style={{ color: colors.success }}
            >
              {/* <Icon name="" size={ms(16)} color={colors.success} /> */}
              <Width size={10} />
              Marked Completed
            </TextElement>
          ) : (
            <OutlineButton
              title="Mark as Done"
              style={cardStyles.buttonFull}
              onPress={handleMarkDone}
              isLoading={isPending}
            />
          )
        ) : (
          <OutlineButton
            title="Remind Them"
            disabled={hasReminded}
            style={cardStyles.buttonFull}
            onPress={handleRemind}
          />
        )}
      </View>
      <ReminderMessageModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSend={handleSendReminder}
        message={customMessage}
        setMessage={setCustomMessage}
        taskName={task.name}
        isLoading={isSendingReminder}
        taskText={task.text}
      />
    </TouchableOpacity>
  );
}
